function updateBeijingTime() {
    let now = new Date();

    let beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));

    let hours = String(beijingTime.getUTCHours()).padStart(2, '0');
    let minutes = String(beijingTime.getUTCMinutes()).padStart(2, '0');
    let seconds = String(beijingTime.getUTCSeconds()).padStart(2, '0');

    const beijingTimeSpan = document.getElementById('beijingTime');
    if (beijingTimeSpan) {
        beijingTimeSpan.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

function show_runtime() {
    const startDate = new Date("11/12/2021 11:45:14").getTime(); // Get timestamp (milliseconds)

    const updateDisplay = () => {
        const now = new Date().getTime();
        let diff = now - startDate;

        if (diff < 0) {
            diff = 0;
        }

        const seconds = Math.floor(diff / 1000);
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor(((seconds % (24 * 60 * 60)) % (60 * 60)) / 60);
        const remainingSeconds = seconds % 60;

        const runtimeSpan = document.getElementById("runtime_span");
        if (runtimeSpan) {
            runtimeSpan.innerHTML = `本站已運行: ${days} 天 ${hours} 小時 ${minutes} 分 ${remainingSeconds} 秒`;
        }
    };

    updateDisplay();
}

document.addEventListener('DOMContentLoaded', () => {
    updateBeijingTime();
    setInterval(updateBeijingTime, 1000);
    show_runtime();
    setInterval(show_runtime, 1000);
});