import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
import test from 'node:test'
import assert from 'node:assert/strict'
test('community watchers share requests, skip unchanged updates and stop on unsubscribe', async () => {
  const source=readFileSync(new URL('./community.js',import.meta.url),'utf8').replace(/^import .*$/gm,'').replace(/export /g,'')
  let requests=0,cleared=0
  const timers=[],visibility=new Set(),responses=[]
  const context={auth:{currentUser:{uid:'student'}},document:{hidden:false,addEventListener:(_,fn)=>visibility.add(fn),removeEventListener:(_,fn)=>visibility.delete(fn)},setInterval:fn=>{timers.push(fn);return timers.length},clearInterval:()=>cleared++,aiFetch:async()=>{requests++;return {ok:true,json:async()=>({items:[{id:'one',createdAt:1}]})}},updateProfile:async()=>{}}
  const api=runInNewContext(`${source}\n({watchItems,watchStats})`,context)
  const tick=()=>new Promise(resolve=>setImmediate(resolve))
  const stopA=api.watchItems('publicChat',items=>responses.push(items))
  const stopB=api.watchItems('publicChat',items=>responses.push(items))
  await tick();assert.equal(requests,1);assert.equal(responses.length,2)
  await timers[0]();assert.equal(responses.length,2,'Unchanged responses should not rerender')
  context.document.hidden=true;await timers[0]();assert.equal(requests,2)
  stopA();assert.equal(cleared,0);stopB();assert.equal(cleared,1);assert.equal(visibility.size,0)
  context.document.hidden=false
  const stats=[];const stopC=api.watchStats(items=>stats.push(items));const stopD=api.watchStats(items=>stats.push(items));await tick()
  assert.equal(requests,3);assert.equal(stats.length,2);stopC();stopD()
})
