import test from 'node:test'
import assert from 'node:assert/strict'
import {DatabaseSync} from 'node:sqlite'
import {readFileSync} from 'node:fs'
import {community} from './community.js'

test('creator settings persist, ratings replace rather than duplicate, self-rating denied',async()=>{
  const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('./community.sql',import.meta.url),'utf8'))
  const db={prepare(query){let args=[];return {bind(...values){args=values;return this},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){return sql.prepare(query).run(...args)}}},async batch(statements){for(const statement of statements)await statement.run()}}
  const original=globalThis.fetch
  const docs=Array.from({length:50},(_,i)=>({document:{name:`projects/test/notes/n${i}`,fields:{ownerId:{stringValue:'creator'},visibility:{stringValue:'public'}}}}))
  globalThis.fetch=async url=>Response.json(String(url).endsWith(':runQuery')?docs:{fields:{ownerId:{stringValue:'creator'},visibility:{stringValue:'public'},topic:{stringValue:'Test'}}})
  const invoke=(body,sub='creator')=>community(new Request('https://test/api/community',{method:'POST',body:JSON.stringify(body)}),{VOICE_USAGE:db,FIREBASE_PROJECT_ID:'test'},{sub})
  try{
    sql.prepare('INSERT INTO community_notes VALUES(?,?,?)').run('n0','creator','Notes')
    for(let i=0;i<5000;i++)sql.prepare('INSERT INTO community_likes VALUES(?,?)').run('n0',`reader${i}`)
    assert.equal((await invoke({action:'rate',id:'n0',rating:5})).status,403)
    assert.equal((await invoke({action:'rate',id:'n0',rating:6},'reader')).status,400)
    await invoke({action:'rate',id:'n0',rating:2},'reader')
    await invoke({action:'rate',id:'n0',rating:4},'reader')
    const rated=await invoke({action:'rating',id:'n0'},'reader')
    assert.equal(rated.body.count,1);assert.equal(rated.body.average,4);assert.equal(rated.body.mine,4)
    const enabled=await invoke({action:'setMonetization',enabled:true})
    assert.equal(enabled.status,200);assert.equal(enabled.body.enabled,true)
    assert.equal((await invoke({action:'monetization'})).body.enabled,true)
    sql.exec('DELETE FROM community_likes')
    assert.equal((await invoke({action:'monetization'})).body.enabled,false)
    assert.equal((await invoke({action:'setMonetization',enabled:true,likes:9000})).status,403)
  }finally{globalThis.fetch=original;sql.close()}
})
