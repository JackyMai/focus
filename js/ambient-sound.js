var MUTE;
var VOLUME;

/* Ambient Sound Dropdown Item */
function onItemClick(event) {
    var targetID = event.target.closest('a').id;
    toggleAudioStatus(targetID, true);
}

function toggleAudioStatus(targetID, action) {
    chrome.runtime.sendMessage({audioID: targetID, clicked: action}, function(response) {
        updateDropdownItem(response.audioID, response.audioPaused);
    });
}

function updateDropdownItem(targetID, paused) {
    var ambientSound = document.getElementById(targetID);

    if (paused) {
        var icon = ambientSound.getElementsByClassName('fa')[0];
        icon.style.visibility = 'hidden';
        ambientSound.classList.remove('is-active');
    } else {
        var icon = ambientSound.getElementsByClassName('fa')[0];
        icon.style.visibility = 'visible';
        ambientSound.classList.add('is-active');
    }
}

function setAudioStatus(targetID, pause) {
    chrome.runtime.sendMessage({audioID: targetID, audioPause: pause}, function(response) {
        updateDropdownItem(response.audioID, response.audioPaused);
    });
}

function pauseAllAudio() {
    var ambientSounds = document.getElementById('ambient-dropdown').getElementsByClassName('ambient-sound');
    
    for(var i=0; i<ambientSounds.length; i++) {
        var id = ambientSounds[i].id;
        setAudioStatus(id, true);
    }
}

// Randomly toggles the play status of one of the ambient sounds
function onRandomBtnClick(event) {
    var ambientSounds = document.getElementById('ambient-dropdown').getElementsByClassName('ambient-sound');

    pauseAllAudio();
    
    // Randomly choose 2 or 3 ambient sounds
    var max = 3;
    var min = 2;
    var choose = Math.floor(Math.random() * (max - min + 1)) + min;

    // Create list with number in ascending order
    var list = [];
    for (var i=0; i<ambientSounds.length; i++) {
        list.push(i);
    }

    // Randomly shuffle the arary
    for (var i=ambientSounds.length-1; i>=0; i--) {
        var random = Math.floor(Math.random()*(i+1));
        var randomIndex = list[random];

        list[random] = list[i];
        list[i] = randomIndex;
    }

    // Pop the first 2 or 3 element from the list
    for (var i=0; i<choose; i++) {
        var index = list.pop();
        var targetID = ambientSounds[index].id;
        setAudioStatus(targetID, false);
    }
}

/* Mute Button */
function onMuteBtnClick() {
    setMute(!MUTE);
    applyMute();
}

function setMute(mute) {
    var ambientMute = document.getElementById('ambient-mute');

    if (mute) {
        ambientMute.classList.remove('fa-volume-up');
        ambientMute.classList.add('fa-volume-off');

        MUTE = true;
        chrome.storage.local.set({'mute': true});
    } else {
        ambientMute.classList.remove('fa-volume-off')
        ambientMute.classList.add('fa-volume-up');

        MUTE = false;
        chrome.storage.local.set({'mute': false});
    }
}

function applyMute() {
    if (MUTE) {
        $("#ambient-slider").val(0);
        chrome.runtime.sendMessage({audioVolume: 0});
    } else {
        $("#ambient-slider").val(VOLUME);
        chrome.runtime.sendMessage({audioVolume: VOLUME});
    }
}

/* Volume Slider */
function onSliderDrag() {
    if (MUTE) {
        setMute(false);
    }
    
    VOLUME = $("#ambient-slider").val();
    chrome.runtime.sendMessage({audioVolume: VOLUME});
    chrome.storage.local.set({'volume': VOLUME});   // Save volume setting locally
}

/* Initialize */
function refreshAudioStatus() {
    var ambientSounds = document.getElementById('ambient-dropdown').getElementsByClassName('ambient-sound');
    for (var i=0; i<ambientSounds.length; i++) {
        toggleAudioStatus(ambientSounds[i].id, false);
    }
}

function refreshVolumeControls() {
    chrome.storage.local.get(['volume', 'mute'], function(items) {
        // Retrieve volume preference from local storage
        if (items.volume) {
            VOLUME = items.volume;
            $("#ambient-slider").val(VOLUME);
            onSliderDrag();
        }
        
        // Retrieve mute setting from local storage
        if (items.mute) {
            MUTE = true;
        } else {
            MUTE = false;
        }
        setMute(MUTE);
        applyMute();
    });
}

/* Setup */
function attachListeners() {
    document.getElementById('ambient-mute').addEventListener('click', onMuteBtnClick);
    document.getElementById('ambient-slider').addEventListener('input', onSliderDrag);

    var dropdownItems = document.getElementById('ambient-dropdown').getElementsByClassName('ambient-sound');
    for (var i = 0; i < dropdownItems.length; i++) {  // Excludes random button
        dropdownItems[i].addEventListener('click', onItemClick);
    }

    document.getElementById('ambient-random').addEventListener('click', onRandomBtnClick);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.timerStopped) {
            pauseAllAudio();
        }
    }
)

window.addEventListener('load', attachListeners);
refreshAudioStatus();
refreshVolumeControls();
