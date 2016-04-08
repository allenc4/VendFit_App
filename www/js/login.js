// When the device is ready, add the user ID and the token to the database

var user_auth_table = 'user_auth';

var auth_params = {
    auth_url: 'https://www.fitbit.com/oauth2/authorize',
    client_id: '227F3Q',
    response_type: 'token',
    redirect_uri: 'http://127.0.0.1:8888/oauth',
    other_params: {
        expires_in: '2592000',
        scope: 'activity nutrition'
    }
};

document.addEventListener('deviceready', onDeviceReady);

function onDeviceReady() {

     var $loading = $('#fitbitLoading').hide();

     $("#userLoginClick").bind("click", fitbitLogin);

     if (valueStored(prefixOauthStorage + keyAccessToken) && valueStored(prefixOauthStorage + keyUserID)) {
        var userID = getStoredData(prefixOauthStorage + keyUserID);
        var token = getStoredData(prefixOauthStorage + keyAccessToken);

        // Show the loading progress bar and run a simple ajax request to see if access token is still valid
        $loading.show();
        var fitbitRequestURL = 'https://api.fitbit.com/1/user/' + userID +'/activities/steps/date/' + currentDate() + '/1d.json';
    
        console.log("Requested URL: " + fitbitRequestURL + " with token: " + token);

        // Get the total number of steps for the user
        $.ajax({
            url: fitbitRequestURL,
            type: 'GET',
            dataType: 'json',
            cache: false,
            contentType: 'application/x-www-form-urlencoded',
            beforeSend: function(jqXHR, settings) { 
                jqXHR.setRequestHeader('Authorization','Bearer ' + token); 
            }
        })
        .done(function(data, textStatus, jqXHR) { 
            $loading.hide();
            // Parse the data returned, update total steps
            console.log("Returned data: " + JSON.stringify(data));
            console.log("Status code: " + jqXHR.status);
            
            // Authentication token is valid, so proceed to login success
            loginSuccess(token, userID);
        })
        .fail(function(jqXHR, textStatus, errorThrown) { 
            $loading.hide();
            var err = JSON.parse(jqXHR.responseText).errors[0].errorType;

            console.log("err: " + err);
            // TODO - If the response is because of bad authentication token, tell the user
            if (err === "invalid_token") {
                alert("Access token invalid. Please sign in with Fitbit again."); 
            } else {
                alert("Error communicating with Fitbit. " + err);
            }
        });
    }
};

function fitbitLogin() {
    console.log('login clicked');
    $.oauth2Implicit(auth_params, loginSuccess, loginFail);
}

function loginSuccess(token, userID) {
    console.log('Success. User ID: ' + userID + ', token: ' + token);

    // When the device is ready, save the user ID and the token to local storage
    document.addEventListener('deviceready', function() {
        // var user_id = response.split("user_id=")[1].split("&")[0];
        var $loading = $('#fitbitLoading').hide();
        $loading.show();

        storeData(prefixOauthStorage + keyAccessToken, token);
        storeData(prefixOauthStorage + keyUserID, userID);

        // Check if a user already exists in the master database. If so, update the access token.
        // Otherwise, create the user.
        var userView = {
            operation: 'user_basic',
            data: {
                id: userID
            }
        };
        serverQuery(JSON.stringify(userView), function(data) {
            if (!data.success || data == null || data.data == null || Object.keys(data.data).length == 0) {
                // If success is false (or data object is empty), the user is most likely not created, so create the user.
                var createUser = {
                    operation: 'user_create',
                    data: {
                        fitbit_id: userID,
                        access_token: token,
                        timezone_offset: new Date().getTimezoneOffset()
                    }
                };

                serverQuery(JSON.stringify(createUser), function(data) {
                    if (!data.success) {
                        // Something went wrong creating the user
                        $loading.hide();
                        alert(data.message);
                    } else {
                        // User created successfully, so redirect to the main page
                        $loading.hide();
                        redirect("main.html");
                    }
                }, function (textStatus) {
                    // Something went wrong communicating with the server
                    $loading.hide();
                    alert(textStatus);
                });
            } else {
                // The user is created, so update the access token
                var userUpdate = {
                    operation: 'user_update',
                    data: {
                        id: userID,
                        access_token: token,
                        timezone_offset: new Date().getTimezoneOffset()
                    }
                };

                serverQuery(JSON.stringify(userUpdate), function(data) {
                    if (!data.success) {
                        // Something went wrong updating the user
                        $loading.hide();
                        alert(data.message);
                    } else {
                        // User updated successfully, so redirect to the main page
                        $loading.hide();
                        redirect("main.html");
                    }
                }, function (textStatus) {
                    // Something went wrong communicating with the server
                    $loading.hide();
                    alert(textStatus);
                });
            }

        }, function (textStatus) {
            // Something went wrong communicating with the server
            $loading.hide();
            alert(textStatus);
        });
    });
}

function loginFail(error) {
    console.log('Failed to login. ' + error);
    alert("Failure logging in: " + error);
}

// Checks if the token and user ID values are stored in the file system
function tokenExists() {
    return (valueStored(prefixOauthStorage + keyAccessToken) && 
        valueStored(prefixOauthStorage + keyUserID));
}
