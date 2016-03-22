// Static variables for local storage key names
var prefixOauthStorage = "oauthStorage-"; // Prefix for oauth storage keys
var keyAccessToken = "accessToken";
var keyUserID = "userID";

// Static variables for misc data storage
var keyAllItems = "allItems";

// Static variables for server communications
var vendFitHost = "http://192.168.1.109:1234"; //http://tgauch.net:8888";

// Get the current date in yyyy-mm-dd format
var currentDate = function() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; // January is 0

    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }

    return yyyy + '-' + mm + '-' + dd;
}

function storeData(key, strigifiedObj) {
    //console.log("Storing key " + key + ": " + strigifiedObj);
    localStorage.setItem(key, strigifiedObj);
}

function getStoredData(key) {
    //console.log("Getting key " + key + ": " + localStorage.getItem(key));
    return localStorage.getItem(key);
}

function valueStored(key) {
    if (getStoredData(key) === null)
        return false;
    else
        return true;
}

function serverQuery(jsonData, successCallback, errorCallback) {
    // Append the <END> clause to jsonData
    jsonData = jsonData + "<END>";

    // console.log("Posting to " + vendFitHost + "          " + jsonData);

    $.ajax({
        url: vendFitHost,
        type: 'POST',
        dataType: 'json',
        cache: false,
        contentType: 'application/x-www-form-urlencoded',
        data: jsonData, 
        timeout: 10000  // 10 second timeout
    })
    .done(function(data, textStatus, jqXHR) { 
        successCallback(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) { 
        console.log("err: " + textStatus);
        if (errorCallback) {
            errorCallback(textStatus);
        }
    })
}