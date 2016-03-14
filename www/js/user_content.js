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

        var fitbitRequestURL = 'https://api.fitbit.com/1/user/' + userID +'/activities/date/' + currentDate() + '.json';
        
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
                stepsTotal = 100; // Replace with actual data
              	alert('got data!'); 

                // If a callback function was specified, call it
                if (successCallback != null && successCallback != undefined) {
                    successCallback();
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) { 
            	console.log("err: " + JSON.stringify(jqXHR.responseText));
            	alert('error!'); 
            });

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
                }
            }, function(jqXHR) {
                // Error occured communicating with the server
                alert(JSON.stringify(jqXHR.responseText));
            });

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