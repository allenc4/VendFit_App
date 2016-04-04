$(document).ready(function() {

	if (valueStored(keyAutoLog)) {
		if (getStoredData(keyAutoLog) === "true") {
			$('#chkAutoLogPurchases').prop('checked', true);
		} else {
			$('#chkAutoLogPurchases').prop('checked', false);
		}
	}
	// Set the listener for auto log preferences changed
	 $('#chkAutoLogPurchases').change(function() {
	 	if (this.checked) {
	 		storeData(keyAutoLog, "true");
	 	} else {
	 		storeData(keyAutoLog, "false");
	 	}
	 });

	 // Set the listener to clear stored preferences
	 $('#btnClearPreferences').on('click', function() {
	 	$('#chkAutoLogPurchases').prop('checked', false);
	 	localStorage.removeItem(keyAutoLog);
	 });

	 setClearPrefsPosition();  
  	$(window).on('resize', setClearPrefsPosition);
});

function setClearPrefsPosition() {
  // Remove the margin-top to start fresh
  $("#btnClearPreferences").css("margin-top", 0);
  
  var windowHeight = $(window).height();
  var footerHeight = $("#btnClearPreferences").offset().top + $("#btnClearPreferences").height() + 75;
  $("#btnClearPreferences").css("margin-top",windowHeight - footerHeight);
}