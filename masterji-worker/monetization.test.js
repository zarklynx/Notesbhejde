import test from 'node:test'
import assert from 'node:assert/strict'
import {eligibility} from './monetization.js'
test('monetization requires all thresholds, strictly greater than three rating',()=>{
  assert.equal(eligibility({notes:50,likes:5000,averageRating:3,ratingCount:1}).eligible,false)
  assert.equal(eligibility({notes:50,likes:5000,averageRating:3.01,ratingCount:1}).eligible,true)
  for(const state of [{notes:49,likes:5000,averageRating:4,ratingCount:1},{notes:50,likes:4999,averageRating:4,ratingCount:1},{notes:50,likes:5000,averageRating:4,ratingCount:0}])assert.equal(eligibility(state).eligible,false)
})
