const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
export const beijingTime = (date: Date) => clock.format(date);
export function runtime(now: Date, startedAt: string) {
  const elapsed = Math.max(0, Math.floor((now.getTime() - Date.parse(startedAt)) / 1000));
  return `${Math.floor(elapsed / 86400)} 天 ${Math.floor(elapsed % 86400 / 3600)} 小時 ${Math.floor(elapsed % 3600 / 60)} 分 ${elapsed % 60} 秒`;
}
