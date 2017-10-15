var MUTE;
var VOLUME;

function togglePlay(event) {
    var targetID = event.target.closest('a').id;
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

function onMuteBtnClick() {
    setMute(!MUTE);

    if (MUTE) {
        $("#ambient-slider").val(0);
        chrome.runtime.sendMessage({audioVolume: 0});
    } else {
        $("#ambient-slider").val(VOLUME);
        chrome.runtime.sendMessage({audioVolume: VOLUME});
    }
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

function onSliderDrag() {
    if (MUTE) {
        setMute(false);
    }
    
    VOLUME = $("#ambient-slider").val();
    chrome.runtime.sendMessage({audioVolume: VOLUME});
    chrome.storage.local.set({'volume': VOLUME});   // Save volume setting locally
}

function attachListeners() {
    document.getElementById('ambient-mute').addEventListener('click', onMuteBtnClick);
    document.getElementById('ambient-slider').addEventListener('input', onSliderDrag);

    var dropdownItems = document.getElementById('ambient-dropdown').getElementsByClassName('ambient-sound');
    for (var i = 0; i < dropdownItems.length; i++) {  // Excludes random button
        dropdownItems[i].addEventListener('click', togglePlay);
    }

    document.getElementById('ambient-random').addEventListener('click', randomPlay);
}

window.addEventListener('load', attachListeners);
refreshAudioStatus();
refreshVolumeControls();
