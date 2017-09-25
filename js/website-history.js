    var time = (new Date).getTime() - 1000 * 60 * 60 * (5/6);

    website_count_dictionary = {};
    var requestValue = 0;

    var visits = chrome.history.search({
        'text': '',
        'startTime': time
    },
    function(historyItems) {
           // For each history item, get details on all visits.
           for (var i = 0; i < historyItems.length; ++i) {
             var url = historyItems[i].url;
             var url_array = url.split("/");
             website_count_dictionary[url_array[2]] = 0;
             var processVisitsWithUrl = function(url) {
               return function(visitItems) {
                 processVisits(url, visitItems);
               };
             };
             chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
             requestValue++;
           }
           if (!requestValue){
            loadPieChart();
           }
     });

    var processVisits = function(url, visitItems){
        for (var i=0; i<visitItems.length; i++){
            var visitTime = visitItems[i].visitTime;
            // To do: check the time falls within the time frame
            if (visitTime > time){
                var url_array = url.split("/");
                website_count_dictionary[url_array[2]] = website_count_dictionary[url_array[2]] + 1;
            }
        }
        if (!--requestValue){
            loadPieChart();
        }
    };

    $("#top-visited-websites-table").text()

    function loadPieChart(){
		
		var sortedList = [];
		for (var key in website_count_dictionary) {
 			 sortedList.push([ key, website_count_dictionary[key] ])
		}
		sortedList.sort(function(firstValue, secondValue) {
    		return secondValue[1] - firstValue[1];
		});
		
		if (sortedList.length > 10){
			sortedList = sortedList.splice(0,10);
		}
		
		var sortedKeys = [];
		var sortedValues = [];
		for (var i = 0; i < sortedList.length; i++) {
 			sortedKeys.push(sortedList[i][0]);
			sortedValues.push(sortedList[i][1]);
		}

        var ctx = document.getElementById("top-websites-canvas").getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'pie',

            // The data for our dataset
            data: {
                labels: sortedKeys,
                datasets: [{
                    label: "My First dataset",
                    backgroundColor: ["#6ef79c", "#A8e4f0", "#D6D65C", "#e6b3e6", "#FF6E6E", "#FFAE1A", "#FFF991", "#928EB1", "#F0B892", "#FFD1D1"],
                    borderColor: ["#6ef79c", "#A8e4f0", "#D6D65C", "#e6b3e6", "#FF6E6E", "#FFAE1A", "#FFF991", "#928EB1", "#F0B892", "#FFD1D1"],
                    data: sortedValues
                }]
            },

            // Configuration options go here
            options: {}
        });

    }
