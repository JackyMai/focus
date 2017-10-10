// Initialised variables
var requestValue = 0; // variable keeps track of whether all info has been received, and whether you can load the data onto the pie chart

// Update the drop down values on first page load
addWorkCycleToDropDown();

// Draw the pie chart on page load
updatePieChartData();

// Function to add the current work cycle value to the drop down options
function addWorkCycleToDropDown(){
    var bg = chrome.extension.getBackgroundPage();
    start = bg.WORK_CYCLE_START;
    end = bg.WORK_CYCLE_END;
    if (start && end){
        bg.updateDropDown = false;
        // update the drop down select to include the past work cycle
        $('#date-drop-down-select').empty();
        $('#date-drop-down-select').append($('<option>', {
            value: 'past-work-cycle',
            text: 'Past Work Cycle'
        }));
        $('#date-drop-down-select').append($('<option>', {
            value: 'past-day',
            text: 'Past Day'
        }));
        $('#date-drop-down-select').append($('<option>', {
            value: 'past-week',
            text: 'Past Week'
        }));
        $('#date-drop-down-select').append($('<option>', {
            value: 'past-month',
            text: 'Past Month'
        }));
        // update the value to be the drop down for the
        // $("#date-drop-down-select").val('past-day');
        updatePieChartData();
    }
}

// function to determine the data from the drop down select and pass into the website history calculation
function updatePieChartData(){

    var selected = $("#date-drop-down-select").find(":selected").val();

    // Update the time range depending on which drop down was selected
    if (selected == "past-work-cycle"){
       var bg = chrome.extension.getBackgroundPage();
       start = bg.WORK_CYCLE_START;
       end = bg.WORK_CYCLE_END;
    } else if (selected == "past-day"){
        start = (new Date).getTime() - 1000 * 60 * 60 * 24;
        end = (new Date).getTime();
    }else if (selected == "past-week"){
        start = (new Date).getTime() - 1000 * 60 * 60 * 24 * 7;;
        end = (new Date).getTime();
    } else {
        start = (new Date).getTime() - 1000 * 60 * 60 * 24 * 30;
        end = (new Date).getTime();
    }
    // Re-calculate the history values
    updateHistory(start, end);

}

// Searches chrome history for the websites visited since the start time
function updateHistory(startTime, endTime){

    website_count_dictionary = {}; // dictionary of all the websites visited & their count
    var visits = chrome.history.search({
        'text': '',
        'startTime': startTime,
        'endTime': endTime
    }, function(historyItems) { // returns various HistoryItems
        console.log(historyItems);
        // loops through each history item, stores the URL and get's the visits to that URL
        for (var i = 0; i < historyItems.length; ++i) {

            // gets the URL and splits it to just the Domain name
            var url = historyItems[i].url;
            var url_array = url.split("/");
            website_count_dictionary[url_array[2]] = 0; // intialises the URL domain name in the dictionary

            // creates the callback function for chrome's getVisits() that's performed on each URL
            var processVisitsWithUrl = function(url) {
                return function(visitItems) {
                    processVisits(url, visitItems, startTime);
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
 }

 var colours = [
   "#5555c1", // dark blue
   "#8585e0", // purple
   "#e6b3e6", // pink
   "#ff80aa", // dark pink
   "#ff9966", // orange
   "#ffd69b", // yellow/ orange
   "#fff19b", // yellow
   "#8be6a7", //  teal
   "#57d598", // dark green
   "#A8e4f0", // light blue
 ]

// This function is used by Chrome's getVisits, and increments the number of visits if the time is past the startTime
var processVisits = function(url, visitItems, startTime){
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

    // check to ensure there is website data to display to the user
    // if not - display no data message to user
	if (sortedList.length <= 0){
	    $('#top-websites-canvas').remove();
        $('#top-visited-websites-graph').append('<div id="no-data-div">  No data to display </div>');
        document.getElementById('js-legend').innerHTML = '';
	}
	// if there is data, then create the pie chart
	else {
        // get the keys and values to use within the chart, by looping through the sorted list
        var keys = [];
        var values = [];
        for (var i = 0; i < sortedList.length; i++) {
        var rank = i + 1;
            keys.push("  " + rank + ": " + sortedList[i][0]);
            values.push(sortedList[i][1]);
        }

        $('#no-data-div').remove();
        $('#top-websites-canvas').remove();
        $('#top-visited-websites-graph').append('<canvas id="top-websites-canvas"></canvas>');

        // get the chart element and set the values for it
        var canvas = document.getElementById("top-websites-canvas");
        var ctx = canvas.getContext('2d');

        var chart = new Chart(ctx, {
            type: 'pie', // create a pie chart
            data: { // The data and colour is initialised for the chart
                labels: keys,
                datasets: [{
                    label: "My First dataset",
                    backgroundColor: colours,
                    borderColor: colours,
                    data: values
                }]
            },
            options: {
              tooltips: {
                bodyFontSize: 20, //TODO: not working because of generateLegend(), but usually sets the font size of the hover text
              },
              legend: {
                display: false
              }
            }
        });

        // generates legend to set to div element
        document.getElementById('js-legend').innerHTML = chart.generateLegend();

    }

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

// Function to update the graph when the drop down changes the date range
$("#date-drop-down-select").change(function() {
    updatePieChartData();
});

