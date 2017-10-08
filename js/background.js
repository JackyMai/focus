// global variables
var workTime = 10;
var main = "";
var showInput = true;
var toggleVal = "Start";
var loadTimer = false;
var timer = "";
var goal = "";

var past = 0;

// set a new timer
function newTimer() {
    //alert("new");
    //max = workTimer*60; // work time in sec
    //document.getElementById('timer-progress').max = max;

    timer = "00:00"; // initialize the timer
    setTimer();
}


function setTimer() {
    if (loadTimer) {
        // handle the time
        var arr = timer.split(":");
        var min = arr[0];
        var sec = arr[1];

        sec++;

        if (sec == 60) {
            sec = "00";
            min++;
            if (min < 10) min = "0" + min;
        } else if (sec < 10) {
            sec = "0" + sec;
        }
        timer = min + ":" + sec;

        // past time in percent
        past = ((parseInt(min)*60 + parseInt(sec)) / (workTime*60))*100;

        // update status
        if (!(workTime - min)) {
            loadTimer = false;

            // Send done notification
            chrome.browserAction.setBadgeText({text: ''});
            chrome.notifications.create({
                type:     'basic',
                iconUrl:  'icon/128.png',
                title:    'Work Done',
                message:  'It\'s time to relax!'});

            toggleVal = "Start";
            main = "Work done";
        }

        setTimeout(setTimer, 1000);
    }
}

function stopTimer() {
    // Send terminated notification
    chrome.browserAction.setBadgeText({text: ''});
    chrome.notifications.create({
        type:     'basic',
        iconUrl:  'icon/128.png',
        title:    'Work Terminated',
        message:  'Open FOCUS to start another work cycle!'});

}


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var audioID = request.audioID;
        var ambientSound = document.getElementById(audioID);
        togglePlay(ambientSound);
        sendResponse({farewell: "Toggled: " + audioID});
    }
)

function togglePlay(ambientSound) {
    if (ambientSound.paused) {
        ambientSound.play();
    } else {
        ambientSound.pause()
    }
}