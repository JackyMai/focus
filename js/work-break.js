var bg = chrome.extension.getBackgroundPage();

$(function(){
    refresh();
})


function refresh() {
    $('#work-time').val(bg.workTime);
    $('#main-interface').html(bg.main);

    $('#cycle-btn').html(bg.startVal);

    if (!bg.loadTimer) $('#time-input').show();
    else $('#time-input').hide();


    if (bg.loadTimer) {
        $('#timer').show();
        $('#goal').show();
    } else {
        $('#timer').hide();
        $('#goal').hide();
    }

    $('#timer').html(bg.timer);
    $('#goal').html("Goal: " + bg.workTime + ":00");
}


function checkTimeInput () {
    var val = document.getElementById('work-time').value;
    document.getElementById('work-time').value = val >= 10 ? val : 10;
}


function toggleCycle() {
    var startBtn = document.getElementById('cycle-btn');
    var status = startBtn.innerHTML;

    if (status == "Start") {
        bg.workTime = document.getElementById('work-time').value;

        bg.startVal = "Stop";// can be changed to any icon
        bg.main = "Working...";// timer
        chrome.browserAction.setBadgeText({text: 'ON'}); //change the icon

        bg.loadTimer = true;
        
        bg.newTimer();
        showTimer();

    } else if (status == "Stop") {
        bg.startVal = "Summary";
        bg.main = "Stoped"; 
        
        bg.loadTimer = false;
        bg.clearTimer();

    } else {
        bg.startVal = "Start";
        bg.main = "Summary Page"; 
    }

    refresh();
}

function showTimer() {
    changeTimer();
}

function changeTimer() {
    if (bg.loadTimer) {
        refresh();
        setTimeout(changeTimer, 1000);
    }
    else {
        bg.startVal = "Summary";
        bg.main = "Work done";
        refresh();
    }
}


function togglePlay(event) {
    var targetID = event.target.id;
    chrome.runtime.sendMessage({audioID: targetID}, function(response) {
        console.log(response.farewell);
    });
}

function attachListeners() {
    document.getElementById('cycle-btn').addEventListener('click', toggleCycle);
    document.getElementById('ambient-storm').addEventListener('click', togglePlay);
    document.getElementById('ambient-birds').addEventListener('click', togglePlay);
    document.getElementById('work-time').addEventListener('input', checkTimeInput);
}

window.addEventListener('load', attachListeners);