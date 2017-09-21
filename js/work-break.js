function toggleCycle() {
    var cycleBtn = document.getElementById('cycle-btn');
    if (cycleBtn.classList.contains('is-loading')) {
        cycleBtn.classList.remove('is-loading');
    } else {
        cycleBtn.classList.add('is-loading');
    }
}

function attachListeners() {
    document.getElementById('cycle-btn').addEventListener('click', toggleCycle);

}

window.addEventListener('load', attachListeners);