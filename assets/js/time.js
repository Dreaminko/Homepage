function updateBeijingTime() {
    // 获取当前 UTC 时间
    let now = new Date();
    // 计算北京时间 (UTC+8)
    let beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));

    // 格式化小时、分钟、秒
    let hours = String(beijingTime.getUTCHours()).padStart(2, '0');
    let minutes = String(beijingTime.getUTCMinutes()).padStart(2, '0');
    let seconds = String(beijingTime.getUTCSeconds()).padStart(2, '0');
    // 更新页面上的时间
    document.getElementById('beijingTime').textContent = `${hours}:${minutes}:${seconds}`;
}

// 每秒钟更新一次时间
setInterval(updateBeijingTime, 1000);

// 页面加载时，立即显示一次时间
updateBeijingTime();