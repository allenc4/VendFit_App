$(document).ready(function() {

	// Extract the fragment identifier using window.location.hash
	// Base64-decode the fragment and evaluate as JSON object
    // console.log("hash: " + window.location.hash);
	var paramObj = JSON.parse(Base64.decode(window.location.hash));
	// console.log(JSON.stringify(paramObj));

	// paramObj contains:
	// {item: serialized JSON of item instance,
	//  user: serialized JSON of user instance}

	var item = ItemContent.fromJSON(paramObj.item);
	var user = UserContent.fromJSON(paramObj.user);
	createAddToLogForm("add-to-log-form", item, user);

});