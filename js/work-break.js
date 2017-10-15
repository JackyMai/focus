const MIN_WORK_PERIOD = 1;
var WORK_CYCLE_START;  // Default value for the past work cycle
var WORK_CYCLE_END;  // Default value for the past work cycle

// connect to background
var bg = chrome.extension.getBackgroundPage();

// check global variables and refresh the window when opening
$(function(){
    refresh();
    addWorkCycleToDropDown();
    if (bg.loadTimer) showTimer(); // if the timer is on, show it
});


function refresh() {
    // refresh the main view
    $('#work-time').val(bg.workTime);
    $('#main-interface').html(bg.main);
    $('#cycle-btn').html(bg.toggleVal);
    $('#timer-progress').val(bg.past);

    // refresh footer toolbar, decide what to show and what to hide
    if (bg.loadTimer) {
        $('#timer').show();
        $('#goal').show();
        $('#time-input').hide();
        $('#timer').html(bg.timer);
        $('#goal').html(" / " + bg.workTime + ":00");
        $('#timer-progress').show();
    } else {
        // when the cycle is stopped, update the current work cycle to have an end time of now
        if (bg.WORK_CYCLE_START){
            WORK_CYCLE_END = (new Date).getTime();
            bg.WORK_CYCLE_END = WORK_CYCLE_END;
        }
        $('#timer').hide();
        $('#goal').hide();
        $('#time-input').show();
        $('#timer-progress').hide();
        addWorkCycleToDropDown();
    }
}

// when getting work time input, check the value and set a limit
function checkTimeInput () {
    var val = document.getElementById('work-time').value;
    document.getElementById('work-time').value = val >= MIN_WORK_PERIOD ? val : MIN_WORK_PERIOD;
}

// responses to toggle button
function toggleCycle() {
    var startBtn = document.getElementById('cycle-btn');
    var status = startBtn.innerHTML;

    if (status == "Start") {

        // when the start button is pressed, update the current work cycle to have an start time of now
        WORK_CYCLE_START = (new Date).getTime();
        bg.WORK_CYCLE_START = WORK_CYCLE_START;

        // change appearance
        bg.toggleVal = "Stop"; // toggle button appearance, can use any icon
        bg.main = "Working...";
        chrome.browserAction.setBadgeText({text: 'ON'}); //change the badge

        // change variables and take action
        bg.workTime = document.getElementById('work-time').value; //get work time input and send it to background
        bg.loadTimer = true;
        bg.newTimer();
        showTimer();
    } else if (status == "Stop") { // force to stop
        // when the stop button is pressed, update the current work cycle to have an end time of now
        WORK_CYCLE_END = (new Date).getTime();
        bg.WORK_CYCLE_END = WORK_CYCLE_END;

        // If the drop down has not been updated to include work cycles then update the drop down.
        if (bg.updateDropDown){
            addWorkCycleToDropDown();
        }

        // change appearance
        bg.toggleVal = "Start";
        bg.main = "Work Stoped";

        // change variables and take action
        bg.loadTimer = false;
        bg.stopTimer();

        updatePieChartData();
    }

    refresh();
}

function showTimer() {
    changeTimer();
}

function changeTimer() {
    if (bg.loadTimer) {
        refresh();
        setTimeout(changeTimer, 100);
    } else {
        refresh();
    }
}


function togglePlay(event) {
    var targetID = event.target.id;
    updateAudioStatus(targetID, true);
}

// Randomly toggles the play status of one of the ambient sounds
function randomPlay(event) {
    var ambientSounds = document.getElementById('ambient-dropdown').getElementsByClassName('ambient-sound');
    var index = Math.random() * (ambientSounds.length - 1) + 1;
    var targetID = ambientSounds[parseInt(index)].id;
    updateAudioStatus(targetID, true);
}

function refreshAudioStatus() {
    var ambientSounds = document.getElementById('ambient-dropdown').getElementsByClassName('ambient-sound');
    for (var i=0; i<ambientSounds.length; i++) {
        updateAudioStatus(ambientSounds[i].id, false);
    }
}

var MUTE;
var VOLUME;

function refreshVolumeControls() {
    chrome.storage.local.get(['volume', 'mute'], function(items) {
        // Retrieve volume preference from local storage
        if (items.volume) {
            VOLUME = items.volume;
            $("#ambient-slider").val(VOLUME);
            updateVolume();
        }

        // Retrieve mute setting from local storage
        if (items.mute) {
            MUTE = true;
        } else {
            MUTE = false;
        }
        setMute(MUTE);
    });
}

function updateAudioStatus(targetID, action) {
    chrome.runtime.sendMessage({audioID: targetID, clicked: action}, function(response) {
        var ambientSound = document.getElementById(response.audioID);
        if (response.audioPaused) {
            var icon = ambientSound.getElementsByClassName('fa')[0];
            icon.style.visibility = 'hidden';
            ambientSound.classList.remove('is-active');
        } else {
            var icon = ambientSound.getElementsByClassName('fa')[0];
            icon.style.visibility = 'visible';
            ambientSound.classList.add('is-active');
        }
    });
}

function toggleMute() {
    setMute(!MUTE);
}

function setMute(mute) {
    var ambientMute = document.getElementById('ambient-mute');

    if (mute) {
        ambientMute.classList.remove('fa-volume-up');
        ambientMute.classList.add('fa-volume-off');

        MUTE = true;
        chrome.storage.local.set({'mute': true});

        $("#ambient-slider").val(0);
        chrome.runtime.sendMessage({audioVolume: 0});
    } else {
        ambientMute.classList.remove('fa-volume-off')
        ambientMute.classList.add('fa-volume-up');

        MUTE = false;
        chrome.storage.local.set({'mute': false});

        $("#ambient-slider").val(VOLUME);
        chrome.runtime.sendMessage({audioVolume: VOLUME});
    }
}

function updateVolume() {
    VOLUME = $("#ambient-slider").val();
    chrome.runtime.sendMessage({audioVolume: VOLUME});
    chrome.storage.local.set({'volume': VOLUME});   // Save volume setting locally
}

function attachListeners() {
    document.getElementById('work-time').addEventListener('input', checkTimeInput);
    document.getElementById('cycle-btn').addEventListener('click', toggleCycle);

    document.getElementById('ambient-mute').addEventListener('click', toggleMute);
    document.getElementById('ambient-slider').addEventListener('input', updateVolume);

    var dropdownItems = document.getElementById('ambient-dropdown').getElementsByClassName('ambient-sound');
    for (var i = 0; i < dropdownItems.length; i++) {  // Excludes random button
        dropdownItems[i].addEventListener('click', togglePlay);
    }

    document.getElementById('ambient-random').addEventListener('click', randomPlay);
}

window.addEventListener('load', attachListeners);
refreshAudioStatus();
refreshVolumeControls();
