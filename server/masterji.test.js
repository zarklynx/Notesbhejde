import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { createMasterjiHandler } from './masterji.js'
import { chatPlan, requestedLanguage } from '../src/components/masterji/chatPolicy.js'

async function call(options, body, headers = {}) {
  const req = Readable.from([JSON.stringify(body)])
  req.method = 'POST'; req.headers = { host: 'localhost:5173', ...headers }
  let status, result
  await createMasterjiHandler(options)(req, { writeHead(code) { status = code }, end(raw) { result = JSON.parse(raw) } })
  return { status, result }
}
const body = { note: { title: 'Sample', content: 'Cloud computing is on demand.' }, messages: [{ role: 'user', content: 'Summarize these notes' }] }
test('Marathi is selected immediately and persists on follow-up',async()=>{
 assert.equal(requestedLanguage('Explain this in Marathi'),'Marathi')
 assert.equal(requestedLanguage('marathi madhe sang'),'Marathi')
 assert.equal(requestedLanguage('मराठीत समजावून सांगा'),'Marathi')
 const fetchImpl=async(_,options)=>{assert.ok(JSON.parse(options.body).messages.some(m=>m.role==='system' && m.content.includes('Language for this reply: Marathi')));return {ok:true,json:async()=>({choices:[{message:{content:'ही अभ्यासाची संकल्पना आहे.'}}]})}}
 await call({apiKey:'test',fetchImpl},{...body,messages:[{role:'user',content:'Explain in Marathi'}]})
 await call({apiKey:'test',fetchImpl},{...body,messages:[{role:'user',content:'Explain in Marathi'},{role:'assistant',content:'मराठी उत्तर'},{role:'user',content:'Make it shorter'}]})
})
test('off-topic gaming redirects but academic game examples remain allowed',async()=>{
 const response=await call({apiKey:'test',fetchImpl:()=>{throw new Error('Must not use model')}},{...body,messages:[{role:'user',content:'what is freefire'}]})
 assert.equal(response.result.mode,'off-topic');assert.match(response.result.answer,/study companion/)
 assert.equal(chatPlan('Analyze Free Fire network design').reply,undefined)
})
test('returns a clear error without a server key', async () => {
  assert.equal((await call({}, body)).status, 503)
})
test('rejects foreign origins and invalid conversations', async () => {
  assert.equal((await call({ apiKey: 'test' }, body, { origin: 'https://foreign.example' })).status, 403)
  assert.equal((await call({ apiKey: 'test' }, { ...body, messages: [] })).status, 400)
})
test('sends note context and returns the provider answer', async () => {
  const response = await call({ apiKey: 'test', fetchImpl: async (url, options) => {
    assert.equal(url, 'https://api.runware.ai/v1/chat/completions')
    const payload = JSON.parse(options.body)
    assert.equal(payload.model, 'openai:gpt@5-nano')
    assert.ok(payload.messages.some(m => m.role === 'system' && m.content.includes('Do not force every answer into points')))
    assert.ok(payload.messages.some(m => m.role === 'system' && m.content.includes('deeper reasoning does NOT require a longer visible answer')))
    assert.ok(payload.messages.some(m => m.role === 'system' && m.content.includes('Do not add unsolicited quizzes')))
    assert.ok(payload.messages.some(m => m.role === 'user' && m.content.includes(body.note.content)))
    return { ok: true, json: async () => ({ choices: [{ message: { content: 'An on-demand computing service.' } }] }) }
  } }, body)
  assert.equal(response.status, 200)
  assert.equal(response.result.answer, 'An on-demand computing service.')
})
test('handles provider throttling', async () => {
  assert.equal((await call({ apiKey: 'test', fetchImpl: async () => ({ ok: false, status: 429 }) }, body)).status, 429)
})
test('greetings are instant and never call the provider', async () => {
  const response = await call({ apiKey: 'test', fetchImpl: () => { throw new Error('Must not call provider') } }, { ...body, messages: [{ role: 'user', content: 'hi bro!' }] })
  assert.equal(response.status, 200)
  assert.match(response.result.answer, /^Hi!/)
  assert.equal(response.result.mode, 'instant')
})
test('routes simple and complex questions without swallowing mixed greetings', () => {
  assert.equal(chatPlan('Summarize these notes').effort, 'minimal')
  assert.equal(chatPlan('Solve this step by step').effort, 'medium')
  assert.equal(chatPlan('hi, summarize these notes').reply, undefined)
})
test('complex questions request medium reasoning and a larger output budget', async () => {
  const response = await call({ apiKey: 'test', fetchImpl: async (_, options) => {
    const payload = JSON.parse(options.body)
    assert.equal(payload.reasoning_effort, 'medium')
    assert.equal(payload.max_completion_tokens, 5000)
    return { ok: true, json: async () => ({ choices: [{ message: { content: 'Explanation.' } }] }) }
  } }, { ...body, messages: [{ role: 'user', content: 'Why does this work?' }] })
  assert.equal(response.status, 200)
})
test('fast scanned-note answers bypass deeper reasoning', async () => {
  const response = await call({ apiKey: 'test', fetchImpl: async (_, options) => {
    assert.equal(JSON.parse(options.body).reasoning_effort, 'minimal')
    return { ok: true, json: async () => ({ choices: [{ message: { content: 'Quick explanation.' } }] }) }
  } }, { ...body, preferFast: true, messages: [{ role: 'user', content: 'Explain why this works' }] })
  assert.equal(response.status, 200)
})
