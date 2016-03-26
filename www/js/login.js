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
     $("#userLoginClick").bind("click", fitbitLogin);

     if (valueStored(prefixOauthStorage + keyAccessToken) && valueStored(prefixOauthStorage + keyUserID)) {
        fitbitLogin();
     }
};

function fitbitLogin() {
    console.log('login clicked');
    $.oauth2Implicit(auth_params, loginSuccess, loginFail);
}

function loginSuccess(token, response) {
    console.log('Success. Token: ' + token + '        Response: ' + response);

    // When the device is ready, save the user ID and the token to local storage
    document.addEventListener('deviceready', function() {
        var user_id = response.split("user_id=")[1].split("&")[0];

        storeData(prefixOauthStorage + keyAccessToken, token);
        storeData(prefixOauthStorage + keyUserID, user_id);

        // Check if a user already exists in the master database. If so, update the access token.
        // Otherwise, create the user.
        var userView = {
            operation: 'user_basic',
            data: {
                id: user_id
            }
        };
        serverQuery(JSON.stringify(userView), function(data) {
            if (!data.success || data == null || data.data == null || Object.keys(data.data).length == 0) {
                // If success is false (or data object is empty), the user is most likely not created, so create the user.
                var createUser = {
                    operation: 'user_create',
                    data: {
                        fitbit_id: user_id,
                        access_token: token
                    }
                };

                serverQuery(JSON.stringify(createUser), function(data) {
                    if (!data.success) {
                        // Something went wrong creating the user
                        alert(data.message);
                    } else {
                        // User created successfully, so redirect to the main page
                        redirect("main.html");
                    }
                }, function (textStatus) {
                    // Something went wrong communicating with the server
                    alert(textStatus);
                });
            } else {
                // The user is created, so update the access token
                var userUpdate = {
                    operation: 'user_update',
                    data: {
                        id: user_id,
                        access_token: token
                    }
                };

                serverQuery(JSON.stringify(userUpdate), function(data) {
                    if (!data.success) {
                        // Something went wrong updating the user
                        alert(data.message);
                    } else {
                        // User updated successfully, so redirect to the main page
                        redirect("main.html");
                    }
                }, function (textStatus) {
                    // Something went wrong communicating with the server
                    alert(textStatus);
                });
            }

        }, function (textStatus) {
            // Something went wrong communicating with the server
            alert(textStatus);
        });
    });
}

function loginFail(error) {
    console.log('Error: ' + error);
    alert("Failure logging in: " + error);
}

// Checks if the token and user ID values are stored in the file system
function tokenExists() {
    return (valueStored(prefixOauthStorage + keyAccessToken) && 
        valueStored(prefixOauthStorage + keyUserID));
}
