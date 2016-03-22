var nutrition_link_id = "nutrition-link-";
var nutrition_div_id = "nutrition-div-";
var vend_button_id = "vend-";

// Function to show/hide nutrition information of a particular item
// id: id of the div containing the nutrition information
// link: element instance of the link object which contains the nutrition information id
function toggleNutrition(id, link) {
	console.log("Toggling " + id + " nutrition fact div");

	if ($("#" + id).is(":visible")) {
	  	// Element is visible, so hide it
	  	link.innerHTML = "Show Nutrition Facts";
	    $("#" + id).hide();
  } else {
	  	link.innerHTML = "Hide Nutrition Facts";
	    $("#" + id).show();
  }
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
	div += "<li class=\"list-group-item clearfix\">\n" +
		"<div class=\"row\" id=\"main-product-list-\"" + json.id + ">\n" +
		"<div class=\"col-xs-2 col-sm-2\"\n" +
		"<img class=\"itemImg\" src='' >\n" +
		"</div>\n" +
		"<div class=\"col-xs-8 col-sm-8\">\n" +
		"Name: " + json.name + "<br>\n" +
		"Price: " + json.cost + "<br>\n" +
		"Stock: " + json.stock + "<br><br>\n" +

	    "<a href=\"#/\" id=\"" + nutrition_link_id + json.id + "\">Show Nutrition Facts</a>\n" +
	    "<div id=\"" + nutrition_div_id + json.id + "\" class=\"nutrition-facts\">\n" +
	    "<p>\n" +
	    "Servings: " + json.servings + "<br>\n" +
	    "Calories: " + json.calories + "<br>\n" +
	    "Carbohydrates: " + json.carbs + "<br>\n" +
	    "Saturated Fat: " + json.saturated_fat + "<br>\n" +
	    "Trans Fat: " + json.trans_fat + "<br>\n" +
	    "Sodium: " + json.sodium + "<br>\n" +
	    "Sugar: " + json.sugars + "<br>\n" +
	    "Protein: " + json.protein + "\n" +

		"</p>\n" +
	    "</div>\n" +

	    "</div>\n" +
	    "<div class=\"col-xs-2 col-sm-2\">\n" +
	    "<span class=\"pull-right\">\n" +
	    "<button id=\"" + vend_button_id + json.id + "\" class=\"btn btn-default\">Vend</button>\n" +
	    "</span>\n" +
	    "</div>\n" +
	    "</div>\n" +
	    "</li>\n";

    //console.log("div:     " + div);

    document.getElementById("main-product-list").innerHTML = div;
      
}

// Define ItemContent constructor
var ItemContent = function(name, id, cost, stock) {
    this._name = "";
    this._id = "";
    this._cost = 0;
    this._stock = 0;

    if (name) {
    	this._name = name;
    }
    if (id) {
    	this._id = id;
    }
    if (cost) {
    	this._cost = cost;
    }
    if (stock) {
    	this._stock = stock;
    }

}

// Getters and Setters
ItemContent.prototype.getName = function() {
	return this._name;
};
ItemContent.prototype.setName = function(name) {
	this._name = name;
};

ItemContent.prototype.getId = function() {
	return this._id;
};
ItemContent.prototype.setId = function(id) {
	this._id = id;
};

ItemContent.prototype.getCost = function() {
	return this._cost;
};
ItemContent.prototype.setCost = function(cost) {
	this._cost = cost;
};

ItemContent.prototype.getStock = function() {
	return this._stock;
};
ItemContent.prototype.setStock = function(stock) {
	this._stock = stock;
};

