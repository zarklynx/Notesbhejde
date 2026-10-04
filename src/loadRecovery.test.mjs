import test from 'node:test'
import assert from 'node:assert/strict'
import {installLoadRecovery} from './loadRecovery.js'
test('stale asset recovery reloads once, then lets error handling show instead of looping',()=>{
  let handler,reloads=0,prevented=0,time=100000
  const values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)}
  const target={addEventListener:(_,fn)=>handler=fn,removeEventListener:()=>{},location:{reload:()=>reloads++}}
  installLoadRecovery(target,storage,()=>time)
  const event={preventDefault:()=>prevented++}
  handler(event);handler(event);assert.equal(reloads,1);assert.equal(prevented,1)
  time+=60001;handler(event);assert.equal(reloads,2)
})
