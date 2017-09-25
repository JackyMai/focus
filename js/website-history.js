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
            loadPieChart(website_count_dictionary);
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
            loadPieChart(website_count_dictionary);
        }
    };

    $("#top-visited-websites-table").text()

    function loadPieChart(website_count_dictionary){

        website_count_dictionary = website_count_dictionary;

        var ctx = document.getElementById("top-websites-canvas").getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'pie',

            // The data for our dataset
            data: {
                labels: Object.keys(website_count_dictionary),
                datasets: [{
                    label: "My First dataset",
                    backgroundColor: ["#6ef79c", "#A8e4f0", "#e6b3e6", "#FF6E6E", "#FFAE1A", "#D6D65C", "#FFF991", "#928EB1", "#F0B892", "#FFD1D1"],
                    borderColor: ["#6ef79c", "#A8e4f0", "#e6b3e6", "#FF6E6E", "#FFAE1A", "#D6D65C", "#FFF991", "#928EB1", "#F0B892", "#FFD1D1"],
                    data: Object.values(website_count_dictionary),
                }]
            },

            // Configuration options go here
            options: {}
        });

    }
