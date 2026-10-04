import test from 'node:test'
import assert from 'node:assert/strict'
import { speechText } from '../src/components/masterji/speechText.js'

test('speech skips bullet markers and numbered list labels', () => {
  assert.equal(speechText('- First point\n* Second point\n• Third point\n1. Fourth point\n2) Fifth point'), 'First point\nSecond point\nThird point\nFourth point\nFifth point')
})
test('speech preserves subtraction, negative numbers and decimals', () => {
  assert.equal(speechText('5 - 3 = 2\n-4 is negative\n1.5 is a decimal'), '5 - 3 = 2\n-4 is negative\n1.5 is a decimal')
})
