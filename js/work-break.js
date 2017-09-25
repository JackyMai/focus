function toggleCycle() {
    var cycleBtn = document.getElementById('cycle-btn');
    if (cycleBtn.classList.contains('is-loading')) {
        cycleBtn.classList.remove('is-loading');
    } else {
        cycleBtn.classList.add('is-loading');
    }
}

function togglePlay() {
    var rain = document.getElementById('rain-audio');
    if (rain.paused) {
        rain.play();
    } else {
        rain.pause();
    }
}

function attachListeners() {
    document.getElementById('cycle-btn').addEventListener('click', toggleCycle);
    document.getElementById('ambient-rain').addEventListener('click', togglePlay);
}

window.addEventListener('load', attachListeners);