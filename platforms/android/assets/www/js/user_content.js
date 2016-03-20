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
    var userID = getStoredData(prefixOauthStorage + keyUserID);
    var accessToken = getStoredData(prefixOauthStorage + keyAccessToken);
    var stepsTotal = 0;
    var stepsUsed = 0;
    console.log("Done running constructor");

    // Fitbit API requests to refresh user steps
    UserContent.prototype.refreshData = function(successCallback) {

    	console.log("Running refreshData function");

        var fitbitRequestURL = 'https://api.fitbit.com/1/user/' + userID +'/activities/steps/date/' + currentDate() + '/1d.json';
        
        console.log("Requested URL: " + fitbitRequestURL);

        // Get the total number of steps for the user
    	$.ajax({
            url: fitbitRequestURL,
            type: 'GET',
            dataType: 'json',
            cache: false,
            contentType: 'application/x-www-form-urlencoded',
            beforeSend: function(jqXHR, settings) { 
            	jqXHR.setRequestHeader('Authorization','Bearer ' + accessToken); 
            }
        })
        	.done(function(data, textStatus, jqXHR) { 
                // TODO: Parse the data returned, update total steps
              	console.log("Returned data: " + JSON.stringify(data));
              	console.log("Status code: " + jqXHR.status);
                
                // Update total step count and current balance
                updateTotalSteps(data[0].value);

                // If a callback function was specified, call it
                // if (successCallback != null && successCallback != undefined) {
                //     successCallback();
                // }
            })
            .fail(function(jqXHR, textStatus, errorThrown) { 
            	console.log("err: " + JSON.stringify(jqXHR.responseText));
            	alert('error!'); 
            });

        // Update the VendFit server to update the total steps
        function updateTotalSteps(totalStepCount) {
            var userUpdate = {
                operation: 'user_update',
                data: {
                    id: userID,
                    total_steps: totalStepCount
                }
            };
            serverQuery(JSON.stringify(userUpdate), function(data) {
                 if (!data.success) {
                    // If success is false, something went wrong
                    alert(data.message);
                } else {
                    // Updating total steps was successful. Call function to get current available user balance
                    getUserBalance();
                }

            }, function(textStatus) {
                // Error occured communicating with the server
                alert(textStatus);
            });
        }

        // Query the VendFit server to get the current available user balance
        function getUserBalance() {
            var userInfo = {
                operation: 'user_basic',
                data: {
                    id: userID
                }
            };
            serverQuery(JSON.stringify(userInfo), function(data) {
                // Update the step balance div with the current balance for the user
                document.getElementById("step-balance").innerHTML = data.current_balance;

            }, function(textStatus) {
                // Error occured communicating with the server
                alert(textStatus);
            });
        }


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
                        console.log(JSON.stringify(data));
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
                                console.log("Adding click event listener to " + id);
                            
                                document.getElementById(nutrition_link_id + id).addEventListener("click", function() {
                                    toggleNutrition(nutrition_div_id + id, this)
                                }, false);
                            })(id)
                            
                        }
                    }
                }, function(textStatus) {
                    // Error occured communicating with the server
                    alert(textStatus);
                });
        }

    };

    UserContent.prototype.purchase = function(itemID) {

        console.log("Running purchase function");
        // Ensure the user has enough points for the selected item.
        // Refresh user steps from Fitbit and then continue
        refreshData(function() {
            $.ajax({
            url: '10.0.1.20',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                "operation": "user_basic",
                "data": {
                    "id": "1"
                }
            }
        })
            .done(function(data, textStatus, jqXHR) { 
                // TODO: Parse the data returned, update total steps
                console.log("Returned data: " + JSON.stringify(data));
                console.log("Status code: " + jqXHR.status);
                alert(JSON.stringify(data));

            })
            .fail(function(jqXHR, textStatus, errorThrown) { 
                console.log("err: " + errorThrown);
                alert('error!'); 
            });

            // When this function is called, Fitbit total steps are updated
            // so check if the user has enough points to purchase the desired item
            // var items = getItems(function() {

            // });


        });

    };

};