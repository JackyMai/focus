    var time = (new Date).getTime() - 1000 * 60 * 60 * (5/6);

    website_count_dictionary = {};

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
           }

            console.log(website_count_dictionary);
     });


    var processVisits = function(url, visitItems){
        for (var i=0; i<visitItems.length; i++){
            var visitTime = visitItems[i].visitTime;
            // To do: check the time falls within the time frame
            if (visitTime > time){
                var url_array = url.split("/");
                console.log(url);
                website_count_dictionary[url_array[2]]++;
            }
        }
    };

//    $("#top-visited-websites-table").text()
