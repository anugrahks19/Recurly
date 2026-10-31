export function nextPeriod(start, interval, anchorDay = new Date(start).getUTCDate()) {
  const value = new Date(start);
  if (Number.isNaN(value.getTime())) throw new Error('Invalid period start.');
  if (!['monthly','annual'].includes(interval)) throw new Error('Invalid billing interval.');
  const targetMonth=value.getUTCMonth()+(interval==='annual'?12:1);
  const first=new Date(Date.UTC(value.getUTCFullYear(),targetMonth,1));
  const last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
  return new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth(),Math.min(anchorDay,last))).toISOString().slice(0,10);
}
