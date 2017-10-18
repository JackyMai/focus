/*
This file contains the functionality for timing, completing and stopping a work cycle
*/

const MIN_WORK_PERIOD = 1;  // The min period of a work cycle
var WORK_CYCLE_START;  // Default value for the past work cycle
var WORK_CYCLE_END;  // Default value for the past work cycle

// Connect to background
var bg = chrome.extension.getBackgroundPage();

// Check global variables and refresh the window when opening
$(function(){
    refresh(); // Refresh the tool bar
    addWorkCycleToDropDown();

    if (bg.loadTimer) showTimer(); // If the timer is on, show it
});


function refresh() {
    // Change text in toggle button
    $('#cycle-btn').html(bg.toggleVal);

    // Refresh footer toolbar, decide what to show and what to hide
    if (bg.loadTimer) {
        $('#time-input').hide();

        $('#timer').html(bg.timer);
        $('#timer').show();

        $('#goal').html(" / " + bg.workTime + ":00");
        $('#goal').show();

        $('#timer-progress').val(bg.past);
        $('#timer-progress').show();

    } else {
        $('#timer').hide();
        $('#goal').hide();
        $('#timer-progress').hide();

        $('#work-time').val(bg.workTime);
        $('#time-input').show();
    }
}

// When getting work time input, check the value and set a limit
function checkTimeInput () {
    var val = document.getElementById('work-time').value;
    document.getElementById('work-time').value = val >= MIN_WORK_PERIOD ? val : MIN_WORK_PERIOD;
}

// Responses to toggle button
function toggleCycle() {
    var startBtn = document.getElementById('cycle-btn');
    var status = startBtn.innerHTML;

    if (status == "Start") {
        // When the start button is pressed, update the current work cycle to have an start time of now
        WORK_CYCLE_START = (new Date).getTime();
        bg.WORK_CYCLE_START = WORK_CYCLE_START;

        // Change appearance
        bg.toggleVal = "Stop"; // Toggle button appearance
        bg.main = "Working...";
        chrome.browserAction.setBadgeText({text: 'ON'}); //Change the badge

        // Change variables and take action
        bg.workTime = document.getElementById('work-time').value; //Get work time input and send it to background
        bg.loadTimer = true;
        bg.newTimer();
        showTimer();

    } else if (status == "Stop") { // When user click stop button

        // When the stop button is pressed, update the current work cycle to have an end time of now
        WORK_CYCLE_END = (new Date).getTime();
        bg.WORK_CYCLE_END = WORK_CYCLE_END;

        // If the drop down has not been updated to include work cycles then update the drop down.
        addWorkCycleToDropDown();

        // Change appearance
        bg.toggleVal = "Start";
        bg.main = "Work Stoped";

        // Change variables and take action
        bg.loadTimer = false;
        bg.stopTimer();

        pauseAllAudio();
    }

    refresh();
}


// This function is called only when user start a work cycle, close the popup, and open the popup again
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

function attachListeners() {
    document.getElementById('work-time').addEventListener('input', checkTimeInput);
    document.getElementById('cycle-btn').addEventListener('click', toggleCycle);
}

window.addEventListener('load', attachListeners);
