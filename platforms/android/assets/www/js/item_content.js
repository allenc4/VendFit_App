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