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
	div += "<li class=\"list-group-item clearfix\" id=\"list-group-item-\"" + json.id + "\">\n" +
		"<div class=\"row\" id=\"main-product-list-\"" + json.id + ">\n" +
		"<div class=\"col-xs-2 col-sm-2\">\n" +
      "<img class=\"itemImg\" src=\"" + json.pic + "\">\n" +
      "</div>" +
		"<div class=\"col-xs-8 col-sm-8\">\n" +
		"Name: " + json.name + "<br>\n" +
		"Price: " + json.cost + "<br>\n" +
		"Stock: " + json.stock + "<br><br>\n" +

    "<a href=\"#/\" id=\"" + nutrition_link_id + json.id + "\" class=\"nutrition-facts-title\">Show Nutrition Facts</a>\n" +
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
    "<button id=\"" + vend_button_id + json.id + "\" class=\"btn btn-default vend-btn\">Vend</button>\n" +
    "</span>\n" +
    "</div>\n" +
    "</div>\n" +
    "</li>\n";

    //console.log("div:     " + div);

    document.getElementById(containerID).innerHTML = div;
      
}

// Populates the add to log html page with buttons and callbacks
// asking user whether or not to add purchased item to Fitbit log.
// containerID: ID of the div to update with the form information
// item: ItemContent instance with the item that was purchased
// user: UserContent instance of the current user
function createAddToLogForm(containerID, item, user) {
	var div = "<div class=\"row\">\n" +
        	  "<div class=\"col-xs-12 col-sm-9\">\n" +
        	  "<h4>Good choice on the " + item.getName() + "!</h4>\n" +
        	  "</div>\n" +
      		  "</div>\n" +
      
              "<div class=\"row\">\n" +
        	  "<div class=\"col-xs-12 col-sm-9\">\n" +
			  "<img src=\"" + item.getPic() + "\" class=\"vended-purchase-img\">\n" +     
        	  "</div>\n" +
      		  "</div>\n" +
      
      		  "<div class=\"row\">\n" +
         	  "<div class=\"col-xs-12 col-sm-9\">\n" +
           	  "It should be vending shortly!\n" +
           	  "Your new balance is " + user.getStepBalance() + "!\n" +
           	  "</div>\n" +
           	  "</div>\n" +
      
      		  "<br><br>\n" +
      
      		  "<div class=\"row\">\n" +
        	  "<div class=\"col-xs-12 col-sm-9\">\n" +
          	  "Would you like us to add the " + item.getName() + " to your Fitbit food log?\n" +
        	  "</div>\n" +
      		  "</div>\n" +
      
      		  "<br>\n" +
      
      		  "<div class=\"row\">\n" +
        	  "<div class=\"col-xs-6 col-sm-4\">\n" +
          	  "<button type=\"button\" id=\"btn-add-to-log\" class=\"btn btn-success\">Yes Please!</button>\n" +
        	  "</div>\n" +
        	  "<div class=\"col-xs-6 col-sm-4\">\n" +
          	  "<button type=\"button\" id=\"btn-dont-add-to-log\" class=\"btn btn-danger\">Perhaps Not.</button>\n" +
        	  "</div>\n" +
      		  "</div>\n";

	window.onload = init;

  	function init(){
    	document.getElementById(containerID).innerHTML = div;

    	// TODO set event handlers for add-to-log and dont-add-to-log buttons
    	document.getElementById("btn-add-to-log").addEventListener("click", function() {
        console.log("adding to log");
    		  var params = {
              item: item.toJSON(),
              user: user.toJSON(),
              addToLog: true
          };

          params = Base64.encode(JSON.stringify(params));
          // console.log("params: " + params);

          redirect("main.html#" + params);
        }, false);
        document.getElementById("btn-dont-add-to-log").addEventListener("click", function() {
          console.log("not adding to log");
        	var params = {
              item: item.toJSON(),
              user: user.toJSON(),
              addToLog: false
          };

          params = Base64.encode(JSON.stringify(params));
          // console.log("params: " + params);

          redirect("main.html#" + params);
        }, false);
    }

}

// Define ItemContent constructor
var ItemContent = function(name, id, cost, stock, servings, pic) {
    this._name = "";
    this._id = "";
    this._cost = 0;
    this._stock = 0;
    this._servings = 0;
    this._pic = "";

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
    if (servings) {
    	this._servings = servings;
    }
    if (pic) {
    	this._pic = pic;
    }

}

ItemContent.fromJSON = function(json) {
	var data = JSON.parse(json); // Parsing the json string.
    return new ItemContent(data.name, data.id, data.cost, data.stock, data.servings, data.pic);
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

ItemContent.prototype.getServings = function() {
	return this._servings;
};
ItemContent.prototype.setServings = function(servings) {
	this._servings = servings;
};

ItemContent.prototype.getPic = function() {
	return this._pic;
};
ItemContent.prototype.setPic = function(pic) {
	this._pic = pic
};

ItemContent.prototype.toJSON = function() {
	return JSON.stringify({name: this._name, id: this._id, cost: this._cost, stock: this._stock, servings: this._servings, pic: this._pic });
};
