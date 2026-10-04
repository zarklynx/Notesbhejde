import test from 'node:test'
import assert from 'node:assert/strict'
import {studentRankings} from './rankings.js'
test('student ranks reflect contributions, preserve ties and exclude unlisted notes',()=>{
  const rows=studentRankings([{ownerId:'a'},{ownerId:'b'},{ownerId:'c'}],[{owner:'a',views:12,favourites:8},{owner:'b',views:2,favourites:1},{owner:'c',views:2,favourites:1},{owner:'missing',views:999}])
  assert.equal(rows[0].id,'a');assert.equal(rows[0].rank,1);assert.equal(rows[0].level,'Rising Scholar')
  assert.equal(rows[1].rank,2);assert.equal(rows[2].rank,2);assert.equal(rows.length,3)
})
test('final standings use average metric ranks rather than contribution points',()=>{
  const rows=studentRankings([{ownerId:'a'},{ownerId:'b'},{ownerId:'c'}],[{owner:'a',views:1,favourites:100},{owner:'b',views:20,favourites:2},{owner:'c',views:10,favourites:3}])
  const a=rows.find(r=>r.id==='a'),b=rows.find(r=>r.id==='b'),c=rows.find(r=>r.id==='c')
  assert.equal(a.favouritesRank,1);assert.equal(a.viewsRank,3);assert.equal(a.averageRank,2)
  assert.equal(b.favouritesRank,3);assert.equal(b.viewsRank,1);assert.equal(b.averageRank,2)
  assert.equal(c.averageRank,2);assert.ok(rows.every(r=>r.rank===1))
})
test('no activity, private notes and unknown owners do not enter standings',()=>{
  const rows=studentRankings([{ownerId:'a'},{ownerId:'b',visibility:'private'},{ownerId:'c'}],[{owner:'b',views:50},{owner:'c',favourites:1},{owner:'unknown',views:999}])
  assert.deepEqual(rows.map(r=>r.id),['c']);assert.equal(rows[0].rank,1)
})
