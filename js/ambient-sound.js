var MUTE;
var VOLUME;

/* Ambient Sound Dropdown Item */
function onItemClick(event) {
    var targetID = event.target.closest('a').id;
    toggleAudioStatus(targetID, true);
}

// Sends a message to the background html to tell it that an action has been performed
// on the ambient sound
function toggleAudioStatus(targetID, action) {
    chrome.runtime.sendMessage({audioID: targetID, clicked: action}, function(response) {
        updateDropdownItem(response.audioID, response.audioPaused);
    });
}

// Update the view in the dropdown based on whether the audio is playing or not
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

// Sends a message to the background html to tell it whether to pause the audio or not
function setAudioStatus(targetID, pause) {
    chrome.runtime.sendMessage({audioID: targetID, audioPause: pause}, function(response) {
        updateDropdownItem(response.audioID, response.audioPaused);
    });
}

// Pause all audio current playing in the dropdown menu
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

// Update the speaker icon in the dropdown menu to reflect the mute status
function setMute(mute) {
    var ambientMute = document.getElementById('ambient-mute');

    if (mute) {
        ambientMute.classList.remove('fa-volume-up');
        ambientMute.classList.add('fa-volume-off');

        MUTE = true;
        chrome.storage.local.set({'mute': true});   // Save preference into local storage
    } else {
        ambientMute.classList.remove('fa-volume-off')
        ambientMute.classList.add('fa-volume-up');

        MUTE = false;
        chrome.storage.local.set({'mute': false});  // Save preference into local storage
    }
}

// Apply the effect of the mute button tell the background html to mute/unmute all audio
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
// Change the volume of the ambient sounds when the volume slider is being dragged
function onSliderDrag() {
    // Unmute when the volume slider is being dragged
    if (MUTE) {
        setMute(false);
    }
    
    VOLUME = $("#ambient-slider").val();
    chrome.runtime.sendMessage({audioVolume: VOLUME});
    chrome.storage.local.set({'volume': VOLUME});   // Save volume setting locally
}

/* Initialize */
// Refreshes the view of the ambient sound items when the user opens the popup html
function refreshAudioStatus() {
    var ambientSounds = document.getElementById('ambient-dropdown').getElementsByClassName('ambient-sound');
    for (var i=0; i<ambientSounds.length; i++) {
        toggleAudioStatus(ambientSounds[i].id, false);
    }
}

// Refreshes the view of the volume control when the user open the popup html
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
// Add listeners for each of the components that will be interacted in the dropdown
// for ambient sound
function attachListeners() {
    document.getElementById('ambient-mute').addEventListener('click', onMuteBtnClick);
    document.getElementById('ambient-slider').addEventListener('input', onSliderDrag);

    var dropdownItems = document.getElementById('ambient-dropdown').getElementsByClassName('ambient-sound');
    for (var i = 0; i < dropdownItems.length; i++) {
        dropdownItems[i].addEventListener('click', onItemClick);
    }

    document.getElementById('ambient-random').addEventListener('click', onRandomBtnClick);
}

// Attach listener for communication between the popup and background html
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // If the timer stops, pause all ambient sounds
        if(request.timerStopped) {
            pauseAllAudio();
        }
    }
)

window.addEventListener('load', attachListeners);
refreshAudioStatus();
refreshVolumeControls();
