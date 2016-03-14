// When the device is ready, add the user ID and the token to the database

var user_auth_table = 'user_auth';

var auth_params = {
    auth_url: 'https://www.fitbit.com/oauth2/authorize',
    client_id: '227F3Q',
    response_type: 'token',
    redirect_uri: 'http://127.0.0.1:8888/oauth',
    other_params: {
        expires_in: '2592000',
        scope: 'activity'
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
            if (!data.success) {
                // If success is false, the user is most likely not created, so create the user.
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
                        redirect("content.html");
                    }
                }, function (jqXHR) {
                    // Something went wrong communicating with the server
                    alert(JSON.stringify(jqXHR.responseText));
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
                        redirect("content.html");
                    }
                }, function(jqXHR) {
                    // Something went wrong communicating with the server
                    alert(JSON.stringify(jqXHR.responseText));
                });
            }

        }, function(jqXHR) {
            // Error occured communicating with the server
            alert(JSON.stringify(jqXHR.responseText));
        });
    });
}

function loginFail(error) {
    console.log('Error: ' + error);
}

function redirect(page) {
    window.open(page, '_self');
}

// Checks if the token and user ID values are stored in the file system
function tokenExists() {
    return (valueStored(prefixOauthStorage + keyAccessToken) && 
        valueStored(prefixOauthStorage + keyUserID));
}
