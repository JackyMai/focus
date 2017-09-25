// Initialised variables
var startTime = (new Date).getTime() - 1000 * 60 * 60 * (5/6); // variable representing the start time that websites are recorded from
website_count_dictionary = {}; // dictionary of all the websites visited & their count
var requestValue = 0; // variable keeps track of whether all info has been received, and whether you can load the data onto the pie chart

// Searches chrome history for the websites visited since the start time
var visits = chrome.history.search({
	'text': '',
    'startTime': startTime
}, function(historyItems) { // returns various HistoryItems
	
	// loops through each history item, stores the URL and get's the visits to that URL
	for (var i = 0; i < historyItems.length; ++i) {
	    
		// gets the URL and splits it to just the Domain name
		var url = historyItems[i].url;
	    var url_array = url.split("/");
	    website_count_dictionary[url_array[2]] = 0; // intialises the URL domain name in the dictionary
		
		// creates the callback function for chrome's getVisits() that's performed on each URL
	    var processVisitsWithUrl = function(url) {
	    	return function(visitItems) {
	        	processVisits(url, visitItems);
	      	};
	    };
	    chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
	    requestValue++;
	}
	
	// loads the pie chart if all the requests are complete
   	if (!requestValue){
    	loadPieChart();
   	}
 });

// This function is used by Chrome's getVisits, and increments the number of visits if the time is past the startTime
var processVisits = function(url, visitItems){
	// loops through all the visit items
	for (var i=0; i<visitItems.length; i++){
		// gets the time the URL was visited, and increments the count if it was visited after the startTime
		var visitTime = visitItems[i].visitTime;
		if (visitTime > startTime){
            var url_array = url.split("/"); // get the domain name
            website_count_dictionary[url_array[2]]++;
        }
    }
    
	// decreases the requests count
	if (!--requestValue){
        loadPieChart(); // loads the pie chart if all the requests are complete
    }
}

// This function loads the data onto the piechart
function loadPieChart(){
	
	var sortedList = sortList();
	
	// get the keys and values to use within the chart, by looping through the sorted list
	var keys = [];
	var values = [];
	for (var i = 0; i < sortedList.length; i++) {
		keys.push(sortedList[i][0]);
		values.push(sortedList[i][1]);
	}
	
	// get the chart element and set the values for it
    var ctx = document.getElementById("top-websites-canvas").getContext('2d');
    var chart = new Chart(ctx, {
        type: 'pie', // create a pie chart
        data: { // The data and colour is initialised for the chart
            labels: keys,
            datasets: [{
                label: "My First dataset",
                backgroundColor: ["#6ef79c", "#A8e4f0", "#D6D65C", "#e6b3e6", "#FF6E6E", "#FFAE1A", "#FFF991", "#928EB1", "#F0B892", "#FFD1D1"],
                borderColor: ["#6ef79c", "#A8e4f0", "#D6D65C", "#e6b3e6", "#FF6E6E", "#FFAE1A", "#FFF991", "#928EB1", "#F0B892", "#FFD1D1"],
                data: values
            }]
        },

        // Configuration options go here
        options: {}
    });
}

// This function loops through the dictionary and sorts the list in descending order of the top 10 domains
function sortList(){
	// initialise the dictionary as an array, so it can be sorted
	var sortedList = [];
	for (var key in website_count_dictionary) {
		 sortedList.push([ key, website_count_dictionary[key] ])
	}
	// sort the array, comparing the values and arranging them biggest -> smallest
	sortedList.sort(function(firstValue, secondValue) {
		return secondValue[1] - firstValue[1];
	});
	
	// splice the list to only be top 10, incase more are shown
	if (sortedList.length > 10){
		sortedList = sortedList.splice(0,10);
	}
	
	return sortedList;
}
