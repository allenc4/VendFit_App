$(document).ready(function() {

  // Toggle sidebar menu button
  $('[data-toggle=offcanvas]').click(function() {
    $('.row-offcanvas').toggleClass('active');
  });
 
  $("#nav-home").click(function() {
  	// Show main content page
    selectedNav($(this), "main_content.html");        
  });

  $("#nav-help").click(function() {
    // Show help page
    selectedNav($(this), "main_help.html");
  });

  $("#nav-settings").click(function() {
    // Show settings page
    selectedNav($(this), "main_settings.html");
  });

  $("#logout").click(function() {
    // Remove access token and user id from local storage
    localStorage.clear();

    // // Clear the cache from the webview
    // window.cache.clear(function(status) {
    //   console.log("Clearing cache: " + status);
    // }, function(status) {
    //   console.log("Error clearing cache: " + status);
    // });
    // window.cache.cleartemp();

    // Redirect to login
    redirect("index.html");
  });

  setLogoutPosition();  
  $(window).on('resize', setLogoutPosition);

  // Start off by setting the user-content view of the iframe
  $("#main-content").attr("src", "main_content.html#" + window.location.hash);

});


var navIDs = ["nav-home", "nav-help", "nav-settings"];

function selectedNav(nav, pageSrc) {
	var id = $(nav).attr("id");
  
	$.each( navIDs, function(index) {
	  	var curID = navIDs[index];
	  	if (id === curID) {
	    	console.log("Adding active class to " + curID);
	    	$("#" + curID).addClass("active");
	    } else {
	    	console.log("Removing active class from " + curID);
	    	$("#" + curID).removeClass("active");
	    }
	});

  // Hide the side navbar
  $(".row-offcanvas").toggleClass("active");

  // Populate the iframe source
  $("#main-content").attr("src", pageSrc);
}

function setLogoutPosition() {
  // Remove the margin-top to start fresh
  $("#logout").css("margin-top", 0);
  
  var windowHeight = $(window).height();
  var footerHeight = $("#logout").offset().top + $("#logout").height() + 30;
  $("#logout").css("margin-top",windowHeight - footerHeight);
}