const MIN_WORK_PERIOD = 10;

// connect to background
var bg = chrome.extension.getBackgroundPage();

// check global variables and refresh the window when opening
$(function(){
    refresh();
    if (bg.loadTimer) showTimer(); // if the timer is on, show it
})

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
        $('#timer').hide();
        $('#goal').hide();
        $('#time-input').show();
        $('#timer-progress').hide();
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
        // change appearance
        bg.toggleVal = "Start";
        bg.main = "Work Stoped"; 

        // change variables and take action
        bg.loadTimer = false;
        bg.stopTimer();
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

function refreshAudioStatus() {
    var ambientSounds = document.getElementById('ambient-dropdown').children;
    for (var i=0; i<ambientSounds.length; i++) {
        updateAudioStatus(ambientSounds[i].id, false);
    }
}

function updateAudioStatus(targetID, action) {
    chrome.runtime.sendMessage({audioID: targetID, clicked: action}, function(response) {
        var ambientSound = document.getElementById(response.audioID);
        if (response.audioPaused) {
            ambientSound.classList.remove('is-active');
        } else {
            ambientSound.classList.add('is-active');
        }
    });
}

function attachListeners() {
    document.getElementById('work-time').addEventListener('input', checkTimeInput);
    document.getElementById('cycle-btn').addEventListener('click', toggleCycle);

    var dropdownItems = document.getElementById('ambient-dropdown').children;
    for (var i = 0; i < dropdownItems.length; i++) {
        var ambientID = dropdownItems[i].id;
        document.getElementById(ambientID).addEventListener('click', togglePlay);
    }
}

window.addEventListener('load', attachListeners);
refreshAudioStatus();