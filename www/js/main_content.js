$(document).ready(function() {
 
 document.addEventListener("deviceready", function() {
   // Check if we have a purchase waiting to be sent to the server
	if (!checkQueue()) {
  		new UserContent().refreshData();
  }

  window.scrollTo(0,0);
 
 }, false);

});

function checkQueue() {
  console.log("main_content.js hash: " + window.location.hash);
  // Check if there is a purchase queue
  // Extract the fragment identifier using window.location.hash
  // Base64-decode the fragment and evaluate as JSON object
  // console.log("hash: " + window.location.hash);

  if (window.location.hash == "") {
    return false;
  }

  var paramObj = JSON.parse(Base64.decode(window.location.hash));
  console.log(JSON.stringify(paramObj));

  if (paramObj == null || Object.keys(paramObj).length < 1) {
    return false;
  }

  // If there is a queue, paramObj contains:
  // {item: serialized JSON of item instance,
  //  user: serialized JSON of user instance,
  //  addToLog: boolean value if we should add the item to the food log}

  var item = ItemContent.fromJSON(paramObj.item);
  var user = UserContent.fromJSON(paramObj.user);

  // Purchase item first from server
  var purchaseData = {
      operation: 'item_purchase',
      data: {
          fitbit_id: user.getUserId(),
          item_id: item.getId(),
          vending_machine_id: "1",
          addToLog: paramObj.addToLog,
          date_updated: currentDate()
      }
  };

  // Show a toast saying the item will be vended soon.
  console.log("addToLog: " + paramObj.addToLog);
  
  if (paramObj.addToLog) {
  	window.plugins.toast.showShortBottom('Your ' + item.getName().toLowerCase() + ' will be vended shortly and added to your Fitbit Account!',
   		function(a) {
        console.log("Toast success");
    }, function(b) {
        console.log("Toast failure");
  	});
  } else {
	window.plugins.toast.showShortBottom('Your ' + item.getName().toLowerCase() + ' will be vended shortly!',
      function(a) {
       console.log("Toast success");
    }, function(b) {
       console.log("Toast failure");
    });
  }

  serverQuery(JSON.stringify(purchaseData), function(data) {
      // Successfully requested from the server, so refresh the main page
      user.refreshData();

  }, function(textStatus) {
      console.log("Error communicating with server. " + textStatus);
      alert(textStatus);
      return false;
  });

  return true;

}