/*
 * Handles Oauth2 authentication
 * 
 * Usage:
 *   $.oauth2Implicit(options, successCallback, errorCallback);
 *	 
 *   param options:
 *        auth_url: '',         // required, authorization url 
 *        client_id: '',        // required, API application id from developer settings
 *        response_type: '',    // required, token for Implicit Grant flow
 *        redirect_uri: '',     // required, where to send the user after the user grants or denies consent
 *        other_params: {}      // optional params object for scope, state, display...
 *    }, function(token, response){
 *          // do something with token and response
 *    }, function(error){
 *          // do something with error
 *    });
 *
*/

(function($) {
    $.oauth2Implicit = function(options, successCallback, errorCallback) {

        // Ensure all required oauth2 parameters for the implicit authorization flow are defined
        var checkOauth2Params = function(options) {
            var missing = "";
            if (!options.auth_url) {
                missing += " auth_url"
            }
            if (!options.client_id) {
                missing += " client_id"
            }
            if (!options.response_type) {
                missing += " response_type"
            }
            if (!options.redirect_uri) {
                missing += " redirect_uri"
            }

            if (missing) {
                var err_msg = "Oauth2 parameters for implicit grant flow are missing:" + missing;
                errorCallback(err_msg, {
                    error: err_msg
                });
                return false;
            } else {
                return true;
            }
        }

        // String prototype to parse and get url params
        String.prototype.getParam = function( str ){
            str = str.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regex = new RegExp( "[\\?&]*"+str+"=([^&#]*)" );	
            var results = regex.exec( this );
            if (results == null ) {
                return "";
            } else {
                return results[1];
            }
        }        
        
        // if params missing return
        if (!checkOauth2Params(options)) {
            return;
        }

        // build oauth login url
        var paramObj = {
            client_id: options.client_id,
            redirect_uri: options.redirect_uri,
            response_type: options.response_type
        };
        // add the other optional parameters to the paramObj
        $.extend(paramObj, options.other_params);
        var login_url = options.auth_url + '?' + $.param(paramObj);

        console.log(login_url);

        // open the Cordova in-app browser with login url
        var loginWindow = window.open(login_url, "_self");
        
        loginWindow.addEventListener('loadstop', function(event) { 
            console.log('load stopped: ' + event.type + ' - ' + event.url); 
            if (event.url.indexOf(options.redirect_uri) != -1) {
                var response = event.url.split("#")[1];
                var access_token = response.split("access_token=")[1];
                var error = response.split("error=")[1];
                // acToken =   gup(url, 'access_token');
                // tokenType = gup(url, 'token_type');
                // expiresIn = gup(url, 'expires_in');

                loginWindow.close();

                if (access_token) {
                    successCallback(access_token, response);
                } else if (error) {
                    errorCallback(error);
                }

                
            }
        } );

        // var pollTimer = window.setInterval(function() {
        //     //console.log('url received: ' + loginWindow.document.URL + ' expected: ' + options.redirect_uri);
            
        // }, 100);

        // // check if redirect url has code, access_token or error 
        // $(loginWindow).on('loadstart', function(e) {
        //     var url = e.originalEvent.url;

        //     // if implicit method check for acces_token/error in url hash fragment
        //     if (options.response_type == "token") {
        //         var access_token = url.split("access_token=")[1];
        //         var error = url.split("error=")[1];
        //         if(access_token || error){
        //             if (access_token) {
        //                 successCallback(access_token, url.split("#")[1]);
        //             } else if(error) {
        //                 errorCallback(error);
        //             }                   
        //         }
        //     }

        //     loginWindow.close();
        // });
    }; 
}(jQuery));