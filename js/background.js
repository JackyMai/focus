// global variables
var workTime = 10;
var main = "";
var showInput = true;
var toggleVal = "Start";
var loadTimer = false;
var timer = "";
var goal = "";

// Variables to keep track of the start and end times of the most recent work cycle
var WORK_CYCLE_START;
var WORK_CYCLE_END;

var updateDropDown = true;

var past = 0;

// set a new timer
function newTimer() {
    //alert("new");
    //max = workTimer*60; // work time in sec
    //document.getElementById('timer-progress').max = max;

    timer = workTime + ":00"; // initialize the timer
    setTimer();
}


function setTimer() {
    if (loadTimer) {
        // handle the time
        var arr = timer.split(":");
        var min = arr[0];
        var sec = arr[1];

        sec--;

        if (sec < 0) {
            sec = "59";
            min--;
            if (min < 10) min = "0" + min;
        } else if (sec < 10) {
            sec = "0" + sec;
        }
        timer = min + ":" + sec;

        // past time in percent

        past = 100 - ((parseInt(min)*60 + parseInt(sec)) / (workTime*60))*100;

        // update status
        if (min == 00 && sec == 00) {
            loadTimer = false;

            WORK_CYCLE_END = (new Date).getTime();

            // Send done notification
            chrome.browserAction.setBadgeText({text: ''});
            chrome.notifications.create({
                type:     'basic',
                iconUrl:  'icon/128.png',
                title:    'Work Done',
                message:  'It\'s time to relax!'});

            toggleVal = "Start";
            main = "Work done";
            chrome.runtime.sendMessage({timerStopped: true});
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

// Add listener to handle all request coming from the popup html in the front-end
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.audioID) {  // Request contains an audio ID
            var audioID = request.audioID;
            var ambientSound = document.getElementById(audioID);

            // Pause and play audio if there is a request for it
            if (request.audioPause) {
                ambientSound.pause();
            } else if (request.audioPause === false) {
                ambientSound.play();
            }

            // Only toggle the play status if the user has clicked it
            if (request.clicked) {
                togglePlay(ambientSound);
            }

            sendResponse({audioID: request.audioID, audioPaused: ambientSound.paused});
        } else if (request.audioVolume || request.audioVolume === 0) {  // Request contains a valid audio volume
            setVolume(request.audioVolume);
        }
    }
)

var ambientSounds = document.getElementsByTagName('audio');

// Change the volume for all ambient sound audios in the background html
function setVolume(volume) {
    for (var i=0; i<ambientSounds.length; i++) {
        ambientSounds[i].volume = volume / 100;
    }
}

// Toggle between play and pause status for the provided audio element
function togglePlay(ambientSound) {
    if (ambientSound.paused) {
        ambientSound.play();
    } else {
        ambientSound.pause()
    }
}