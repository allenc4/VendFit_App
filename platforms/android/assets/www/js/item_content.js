// Constructor to create a new item object
var ItemContent = function() {
	this.cost = 0;
	this.name = "";
	this.stock = 0;
}

// Query the master database and return an array of ItemContent objects
function getItems(callback) {
	// If the array is already stored in local storage, retrieve it and return the array
	if (valueStored(keyAllItems))
		return JSON.parse(getStoredData(keyAllItems));

	// Otherwise, the array has not yet been retrieved. Query the master database
	// and get an array of all items and store it to the 
}

// Appends to the containerID div with the product information retrieved from the json response
// from the server. 
// Note: This function appends to the container, so clear the container content before calling 
// this function if desired.
function createItemView(json, containerID) {

	var div = document.getElementById(containerID).innerHTML;

	if (div != "") {
		div += "<hr>\n";
	}
	div += "<li class=\"list-group-item\">\n";
	div += "<div class=\"row\" id=\"main-product-list-\"" + json.id + ">\n";
	div += "<div class=\"col-xs-2 col-sm-2\"\n";
	div += "<img class=\"itemImg\" src='' >\n";
	div += "</div>\n";
    div += "<div class=\"col-xs-6 col-sm-8\">\n";
    div += "Name: " + json.name + "<br>\n";
    div += "Price: " + json.cost + "<br>\n";
    div += "Stock: " + json.stock + "<br><br>\n";
    div += "Show Nutrition Facts\n";
    div += "</div>\n";
    div += "<div class=\"col-xs-2 col-sm-2 pull-right\">\n";
    div += "<button id=\"vend-" + json.id + "\" class=\"btn btn-default\">Vend</button>\n";
    div += "</div>\n";
    div += "</div>\n";
    div += "</li>\n";

    console.log("div:     " + div);

    document.getElementById("main-product-list").innerHTML = div;
      
}