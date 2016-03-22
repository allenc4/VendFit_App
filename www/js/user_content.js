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
    console.log("Running constructor");
    this.userID = getStoredData(prefixOauthStorage + keyUserID);
    this.accessToken = getStoredData(prefixOauthStorage + keyAccessToken);
    this.stepBalance = 0;

    console.log("Done running constructor");
}

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
        // TODO: Parse the data returned, update total steps
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

                        var item = new ItemContent(data.data[i].name, id, data.data[i].cost, data.data[i].stock);
                    
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
            userInstance.refreshData();
        }

    }, function(textStatus) {
        // Error occured communicating with the server
        alert(textStatus);
    });

};
