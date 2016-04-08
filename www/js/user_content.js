// Define UserContent constructor
var UserContent = function() {
    this.userID = getStoredData(prefixOauthStorage + keyUserID);
    this.accessToken = getStoredData(prefixOauthStorage + keyAccessToken);
    this.stepBalance = 0;
}

UserContent.fromJSON = function(json) {
    var data = JSON.parse(json); // Parsing the json string.
    var user = new UserContent();
    user.setStepBalance(data.stepBalance);
    return user;
}

UserContent.prototype.getStepBalance = function() {
    return this.stepBalance;
};
UserContent.prototype.setStepBalance = function(balance) {
    this.stepBalance = balance;
};
UserContent.prototype.getUserId = function() {
    return this.userID;
};

UserContent.prototype.toJSON = function() {
    return JSON.stringify({userID: this.userID, accessToken: this.accessToken, stepBalance: this.stepBalance});
};


// Fitbit API requests to refresh user steps
UserContent.prototype.refreshData = function(successCallback) {

	console.log("Running refreshData function");

    // Hold a reference to this
    var userInstance = this;

    // Update available items
    getAvailableItems();

    var fitbitRequestURL = 'https://api.fitbit.com/1/user/' + userInstance.userID +'/activities/steps/date/' + currentDate() + '/1d.json';
    
    console.log("Requested URL: " + fitbitRequestURL + " with token: " + userInstance.accessToken);

    // Get the total number of steps for the user
	$.ajax({
        url: fitbitRequestURL,
        type: 'GET',
        dataType: 'json',
        cache: false,
        contentType: 'application/x-www-form-urlencoded',
        beforeSend: function(jqXHR, settings) { 
        	jqXHR.setRequestHeader('Authorization','Bearer ' + userInstance.accessToken); 
        }
    })
	.done(function(data, textStatus, jqXHR) { 
        // Parse the data returned, update total steps
      	console.log("Returned data: " + JSON.stringify(data));
      	console.log("Status code: " + jqXHR.status);
        
        // Update total step count and current balance
        updateTotalSteps(data["activities-steps"][0].value, data["activities-steps"][0].dateTime);
    })
    .fail(function(jqXHR, textStatus, errorThrown) { 
    	console.log("err: " + JSON.stringify(jqXHR.responseText));
    	alert("An error occured while querying Fitbit for step count."); 
    });

    // Update the VendFit server to update the total steps
    function updateTotalSteps(totalStepCount, updateDate) {
        var userUpdate = {
            operation: 'user_update',
            data: {
                id: userInstance.userID,
                total_steps: totalStepCount,
                date_updated: updateDate
            }
        };
        serverQuery(JSON.stringify(userUpdate), function(data) {
             if (!data.success) {
                // If success is false, something went wrong
                console.log(data.message);
                alert(data.message);
            } else {
                // Updating total steps was successful. Call function to get current available user balance
                console.log(JSON.stringify(data));

                getUserBalance();
            }

        }, function(textStatus) {
            // Error occured communicating with the server
            alert(textStatus);
        });
    };

    // Query the VendFit server to get the current available user balance
    function getUserBalance() {
        var userInfo = {
            operation: 'user_basic',
            data: {
                id: userInstance.userID
            }
        };
        serverQuery(JSON.stringify(userInfo), function(data) {
            console.log(JSON.stringify(data));
            // Update the step balance div with the current balance for the user
            userInstance.stepBalance = data.data.current_balance;
            document.getElementById("step-balance").innerHTML = userInstance.stepBalance;

        }, function(textStatus) {
            // Error occured communicating with the server
            alert(textStatus);
        });
    };


    function getAvailableItems() {
        // Query the VendFit server to get all available items from machine 1
        var items = {
            operation: 'item_all',
            data: {
                id: '1'
            }
        };

        serverQuery(JSON.stringify(items), function(data) {
            if (!data.success) {
                // If success is false, something went wrong
                alert(data.message);
            } else {
                // Retrieving the items was successful, so update the app view
                for (var i = 0; i < data.data.length; i++) {
                    //var item = data.data[i];

                    if (i == 0) {
                        // Empty the container
                        document.getElementById("main-product-list").innerHTML = "";
                    }

                    createItemView(data.data[i], "main-product-list");
                }

                // Add bottom border to the last item in the list
                // var lastItem = document.getElementById("list-group-item-" + data.data[data.data.length - 1].id);
                // lastItem.style.removeAttribute('border-width');
                // lastItem.style.setProperty('border-width', '2px 0px 2px 0px', 'important');

                // Add event handlers for all items - nutrition facts and vend button clicks
                // Note: event handlers must be added AFTER innerHTML is updated since modifying innerHTML removes DOM events
                for (var i = 0; i < data.data.length; i++) {
                    var id = data.data[i].id;
                    (function(id) {
                        console.log("Adding click event listeners to " + id);

                        var item = new ItemContent(data.data[i].name, id, data.data[i].cost, data.data[i].stock, data.data[i].servings, data.data[i].pic);
                    
                        document.getElementById(nutrition_link_id + id).addEventListener("click", function() {
                            toggleNutrition(nutrition_div_id + id, this)
                        }, false);
                        var elem = document.getElementById(nutrition_link_id + id).style.setProperty('color', '#66a95a');
                        document.getElementById(vend_button_id + id).addEventListener("click", function() {
                            userInstance.purchase(item);
                        }, false);
                    })(id)
                    
                }

            }
        }, function(textStatus) {
            // Error occured communicating with the server
            alert(textStatus);
        });
    };

};

UserContent.prototype.purchase = function(item) {

    console.log("Running purchase function for itemID: " + item.getId());

    // Ensure the user has enough points for the selected item.
    if (this.stepBalance < item.getCost()) {
        alert("Sorry, you do not have enough points to purchase a " + item.getName() + ". Start Walking!");
        return;
    }

    // Otherwise, purchase it
    this.stepBalance -= item.getCost();
    
    // If the option to automatically log food is disabled, bring up the add_to_log page. Otherwise, run refreshData again
    // Create a JSON object with the item and step balance
    // Base64-encode the object; yields a url-appending string
    // redirect to add_to_log page with /#... and fragment identifier (base64-encoded object)

    console.log("key stored: " + valueStored(keyAutoLog) + ", value: " + getStoredData(keyAutoLog));

    var params = {
        item: item.toJSON(),
        user: this.toJSON()
    };

    if (getStoredData(keyAutoLog) === "true") {
        console.log("Automatically adding to fitbit diary");
        // Automatically log food is enabled. So add it.
        params.addToLog = true;
        params = Base64.encode(JSON.stringify(params));
        window.location.hash ="#" + params;
        window.location.reload();
        //redirect("main.html#" + params);
    } else {
        console.log("Auto log preference not set, so we must ask...");
        // Preference is not set, so redirect to ask user if they would like to add it
        params = Base64.encode(JSON.stringify(params));
        // console.log("params: " + params);

        redirect("add_to_log.html#" + params);
    }

};


// UserContent.prototype.purchaseAndAdd = function(item, add) {
//     console.log("Running addToFoodLog function for itemID: " + item.getId());

//     var userInstance = this;

//     // Purchase item first from server
//     var purchaseData = {
//         operation: 'item_purchase',
//         data: {
//             fitbit_id: this.userID,
//             item_id: item.getId(),
//             vending_machine_id: "1"
//         }
//     };

//     serverQuery(JSON.stringify(purchaseData), function(data) {
//          if (!data.success) {
//             // If success is false, something went wrong
//             console.log(data.message);
//             alert(data.message);
//             redirect("main.html");
//         } else {
//             // Purchase was successful from the server
//             if (add) {
//                 addToLog();
//             } else {
//                 redirect("main.html");
//             }
//         }
//     }, function(textStatus) {
//         // Error occured communicating with the server
//         alert(textStatus);
//     });


//     function addToLog() {
//         // If the item is water, log as water. Otherwise, log it as food
//         if (item.getName().toLowerCase() === "water") {

//             getUnitsAndAmount(function(unitType, defaultAmount) {

//                 var fitbitWaterURL = "https://api.fitbit.com/1/user/" + userInstance.userID + "/foods/log/water.json"

//                 $.ajax({
//                     url: fitbitWaterURL,
//                     type: 'POST',
//                     dataType: 'json',
//                     cache: false,
//                     contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
//                     beforeSend: function(jqXHR, settings) { 
//                         jqXHR.setRequestHeader('Authorization','Bearer ' + userInstance.accessToken); 
//                     },
//                     data: {
//                         amount: defaultAmount * item.getServings(),
//                         date: currentDate(),
//                         unit: "fl oz"
//                     }
//                 })
//                 .done(function(data, textStatus, jqXHR) {
//                     console.log("Returned data: " + JSON.stringify(data));
//                     console.log("Status code: " + jqXHR.status);

//                     window.plugins.toast.showShortBottom('The ' + item.getName().toLowerCase() + ' will be added to your Fitbit Account shortly!', function(a){
//                         console.log('toast success: ' + a)
//                     }, function(b){
//                         alert('toast error: ' + b)
//                     });

//                     redirect("main.html");
//                 })
//                 .fail(function(jqXHR, textStatus, errorThrown) { 
//                     console.log("err: " + JSON.stringify(jqXHR.responseText));
//                     alert("An error occured while attempting to log item id " + item.getId() + " to the Fitbit food log."); 
//                     redirect("main.html");
//                 });
//             }, function(jqXHR) {
//                 console.log("err: " + JSON.stringify(jqXHR.responseText));
//                 alert("An error occured while querying Fitbit for the food information."); 
//                 redirect("main.html");
//             });
//         } else {
//              // First, we need to get the Unit ID of the item from Fitbit
//             getUnitsAndAmount(function(unitType, defaultAmount) {
//                  // Now add the item to the food log
//                 var fitbitFoodLogRequestURL = "https://api.fitbit.com/1/user/" + userInstance.userID + "/foods/log.json";
//                 $.ajax({
//                     url: fitbitFoodLogRequestURL,
//                     type: 'POST',
//                     dataType: 'json',
//                     cache: false,
//                     contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
//                     beforeSend: function(jqXHR, settings) { 
//                         jqXHR.setRequestHeader('Authorization','Bearer ' + userInstance.accessToken); 
//                     },
//                     data: {
//                         foodId: item.getId(),
//                         mealTypeId: "7",
//                         unitId: unitType,
//                         amount: defaultAmount * item.getServings(),
//                         date: currentDate()
//                     }
//                 })
//                 .done(function(data, textStatus, jqXHR) {
//                     console.log("Returned data: " + JSON.stringify(data));
//                     console.log("Status code: " + jqXHR.status);
//                     redirect("main.html");
//                 })
//                 .fail(function(jqXHR, textStatus, errorThrown) { 
//                     console.log("err: " + JSON.stringify(jqXHR.responseText));
//                     alert("An error occured while attempting to log item id " + item.getId() + " to the Fitbit food log."); 
//                     redirect("main.html");
//                 });
//             }, function(jqXHR) {
//                 console.log("err: " + JSON.stringify(jqXHR.responseText));
//                 alert("An error occured while querying Fitbit for the food information."); 
//                 redirect("main.html");
//             });

//         }
//     } // end inner addToLog function

//     function getUnitsAndAmount(callback, err) {
//         // First, we need to get the Unit ID of the item from Fitbit
//         var fitbitUnitRequestURL = "https://api.fitbit.com/1/foods/" + item.getId() + ".json";
        
//         $.ajax({
//             url: fitbitUnitRequestURL,
//             type: 'GET',
//             dataType: 'json',
//             cache: false,
//             contentType: 'application/x-www-form-urlencoded',
//             beforeSend: function(jqXHR, settings) { 
//                 jqXHR.setRequestHeader('Authorization','Bearer ' + userInstance.accessToken); 
//             }
//         })
//         .done(function(data, textStatus, jqXHR) { 
//             //Parse the data returned for the serving units
//             console.log("Returned data: " + JSON.stringify(data));
//             console.log("Status code: " + jqXHR.status);
//             var unitType = data.food.defaultUnit.id;
//             var defaultAmount = data.food.defaultServingSize;
//             callback(unitType, defaultAmount);
//         })
//         .fail(function(jqXHR, textStatus, errorThrown) {
//             err(jqXHR);
//         });

//     } // end inner getUnitsAndAmount function

// }; // end outer addToFoodLog function