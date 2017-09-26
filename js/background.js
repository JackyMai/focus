// global variables
var workTime = 10;
var main = "";
var showInput = true;
var startVal = "Start";
var loadTimer = false;
var timer = "";
var goal = "";


// when extension installed, open options page at once
chrome.runtime.onInstalled.addListener(function () {
    alert("Focus installed.");
});


// set a new timer
function newTimer() {
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

        // update status
        if (!(workTime - min)) loadTimer = false;

        setTimeout(setTimer, 1000);
    }
    
    // stop naturally
    else { 
        chrome.browserAction.setBadgeText({text: ''});
        timer = "00:00";
        startVal = "Summary";
        main = "Work done";

        // todo: send done notification
    }
}


// force to stop
function stopTimer() {
    chrome.browserAction.setBadgeText({text: ''});

    // todo: send stop notification
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