// Node.js server, running on port 8888 response
// If the request was successful, {"success": true} and a {"data": ...} field will exist,
// otherwise {"success": false"} and a {"message": ...} field will exist.

/*
 JSON. Operation field = resource name, _, operation
 ex)
    {
        operation: "user_update",
        data: {
            access_token: "laksjdlkfajs;d",
            user_id: "klsjdflk"
        }
    }

  ex)
    {
        operation: "user_update",
        data: {
            access_token: "laksjdlkfajs;d"
        }
    }

  ex)
    {
        "operation":"user_create",
        "data":{
            "fitbit_id":..,
            "access_token":...
        }
    }

*/

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

    var userInstance = this;

    // Ensure the user has enough points for the selected item.
    if (this.stepBalance < item.getCost()) {
        alert("Sorry, you do not have enough points to purchase a " + item.getName() + ". Start Walking!");
        return;
    }

    // Otherwise, purchase it
    var purchaseData = {
        operation: 'item_purchase',
        data: {
            fitbit_id: this.userID,
            item_id: item.getId(),
            vending_machine_id: "1"
        }
    };

    serverQuery(JSON.stringify(purchaseData), function(data) {
         if (!data.success) {
            // If success is false, something went wrong
            console.log(data.message);
            alert(data.message);
        } else {
            // Purchase was successful. Run refresh again to update current balance and any stock changes
            //userInstance.refreshData();
            // Update current balance
            userInstance.stepBalance -= item.getCost();

            // TODO if the option to automatically log food is disabled, bring up the add_to_log page. Otherwise, run refreshData again
            // Create a JSON object with the item and step balance
            // Base64-encode the object; yields a url-appending string
            // redirect to add_to_log page with /#... and fragment identifier (base64-encoded object)

            var params = {
                item: item.toJSON(),
                user: userInstance.toJSON()
            };

            params = Base64.encode(JSON.stringify(params));
            // console.log("params: " + params);

            redirect("add_to_log.html#" + params);
            //createAddToLogForm("add-to-log-form", item, this.stepBalance);
        }

    }, function(textStatus) {
        // Error occured communicating with the server
        alert(textStatus);
    });

};

UserContent.prototype.addToFoodLog = function(item) {
    console.log("Running addToFoodLog function for itemID: " + item.getId());

    var userInstance = this;

    // First, we need to get the Unit ID of the item from Fitbit
    var fitbitUnitRequestURL = "https://api.fitbit.com/1/foods/" + item.getId() + ".json";
    
    $.ajax({
        url: fitbitUnitRequestURL,
        type: 'GET',
        dataType: 'json',
        cache: false,
        contentType: 'application/x-www-form-urlencoded',
        beforeSend: function(jqXHR, settings) { 
            jqXHR.setRequestHeader('Authorization','Bearer ' + userInstance.accessToken); 
        }
    })
    .done(function(data, textStatus, jqXHR) { 
        //Parse the data returned for the serving units
        console.log("Returned data: " + JSON.stringify(data));
        console.log("Status code: " + jqXHR.status);
        var unitType = data.food.defaultUnit.id;
        var defaultAmount = data.food.defaultServingSize;

        // Now add the item to the food log
        var fitbitFoodLogRequestURL = "https://api.fitbit.com/1/user/" + userInstance.userID + "/foods/log.json";
        $.ajax({
            url: fitbitFoodLogRequestURL,
            type: 'POST',
            dataType: 'json',
            cache: false,
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            beforeSend: function(jqXHR, settings) { 
                jqXHR.setRequestHeader('Authorization','Bearer ' + userInstance.accessToken); 
            },
            data: {
                foodId: item.getId(),
                mealTypeId: "7",
                unitId: unitType,
                amount: defaultAmount * item.getServings(),
                date: currentDate()
            }
        })
        .done(function(data, textStatus, jqXHR) {
            console.log("Returned data: " + JSON.stringify(data));
            console.log("Status code: " + jqXHR.status);
            redirect("main.html");
        })
        .fail(function(jqXHR, textStatus, errorThrown) { 
            console.log("err: " + JSON.stringify(jqXHR.responseText));
            alert("An error occured while attempting to log item id " + item.getId() + " to the Fitbit food log."); 
            redirect("main.html");
        });
        
    })
    .fail(function(jqXHR, textStatus, errorThrown) { 
        console.log("err: " + JSON.stringify(jqXHR.responseText));
        alert("An error occured while querying Fitbit for the food information."); 
        redirect("main.html");
    });

}
