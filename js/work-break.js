function toggleCycle() {
    var cycleBtn = document.getElementById('cycle-btn');
    if (cycleBtn.classList.contains('is-loading')) {
        cycleBtn.classList.remove('is-loading');
    } else {
        cycleBtn.classList.add('is-loading');
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
}

window.addEventListener('load', attachListeners);