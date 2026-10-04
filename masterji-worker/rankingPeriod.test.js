import test from 'node:test'
import assert from 'node:assert/strict'
import {rankingPeriod} from './rankingPeriod.js'
test('calendar ranking boundaries and invalid periods',()=>{
  const now=Date.parse('2026-10-04T18:00:00Z')
  assert.equal(rankingPeriod('week',now).day,'2026-09-28')
  assert.equal(rankingPeriod('month',now).day,'2026-10-01')
  assert.equal(rankingPeriod('year',now).day,'2026-01-01')
  assert.equal(rankingPeriod('all',now).start,0)
  assert.equal(rankingPeriod('week',Date.parse('2026-01-01')).day,'2025-12-29')
  assert.throws(()=>rankingPeriod('invalid'),/Invalid ranking period/)
})
