export function rankingPeriod(period = 'all', now = Date.now()) {
  if(!['all','week','month','year'].includes(period)) throw Object.assign(new Error('Invalid ranking period.'),{status:400})
  const start=new Date(now);start.setUTCHours(0,0,0,0)
  if(period==='week')start.setUTCDate(start.getUTCDate()-((start.getUTCDay()+6)%7))
  if(period==='month')start.setUTCDate(1)
  if(period==='year') {start.setUTCMonth(0,1)}
  return {period,start:period==='all'?0:start.getTime(),day:period==='all'?'0000-01-01':start.toISOString().slice(0,10)}
}
