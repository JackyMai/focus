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