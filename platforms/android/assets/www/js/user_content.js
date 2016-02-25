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
    this.stepsTotal = 0;
    this.stepsUsed = 0;
    console.log("Done running constructor");
};

// Fitbit API requests to refresh user steps
UserContent.prototype.refreshData = function(successCallback) {

	console.log("Running refreshData function");

    var requestURL = 'https://api.fitbit.com/1/user/' + this.userID +'/activities/date/' + currentDate() + '.json';
    
    console.log("Requested URL: " + requestURL);

	$.ajax({
        url: requestURL,
        type: 'GET',
        dataType: 'json',
        cache: false,
        contentType: 'application/x-www-form-urlencoded',
        beforeSend: function(jqXHR, settings) { 
        	jqXHR.setRequestHeader('Authorization','Bearer ' + this.accessToken); 
        }
    })
    	.done(function(data, textStatus, jqXHR) { 
            // TODO: Parse the data returned, update total steps
          	console.log("Returned data: " + JSON.stringify(data));
          	console.log("Status code: " + jqXHR.status);
            this.stepsTotal = 100; // Replace with actual data
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
};

UserContent.prototype.purchase = function(itemID) {

    console.log("Running purchase function");
    // Ensure the user has enough points for the selected item.
    // Refresh user steps from Fitbit and then continue
    this.refreshData(function() {
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
