import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { createNoteValidator } from "./noteValidator.js";

async function call(body, fetchImpl = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ isMatch: true, score: 91, confidence: "high", reason: "The content covers the described concepts.", matchedTopics: ["Processes"], missingTopics: [], extraTopics: [] }) } }] }) })) {
  const req = Readable.from([JSON.stringify(body)]);
  req.method = "POST";
  let status;
  let result;
  await createNoteValidator({ apiKey: "test", fetchImpl })(req, { writeHead(code) { status = code; }, end(raw) { result = JSON.parse(raw); } });
  return { status, result };
}

const strong = {
  title: "Operating Systems",
  description: "Processes, CPU scheduling and deadlocks",
  content: "An operating system manages hardware. Processes execute programs. CPU scheduling determines which process gets time. Deadlocks occur when processes wait indefinitely for resources.",
};

test("returns a strong structured match", async () => {
  const response = await call(strong);
  assert.equal(response.status, 200);
  assert.equal(response.result.isMatch, true);
  assert.equal(response.result.score, 91);
});

test("returns partial and unrelated model decisions consistently", async () => {
  const partial = await call(strong, async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ isMatch: true, score: 68, confidence: "medium", reason: "Some concepts are covered.", matchedTopics: ["Processes"], missingTopics: ["Deadlocks"], extraTopics: [], }) } }] }) }));
  assert.equal(partial.result.isMatch, false);
  assert.equal(partial.result.score, 68);

  const unrelated = await call(strong, async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ isMatch: false, score: 24, confidence: "high", reason: "The content is about web development.", matchedTopics: [], missingTopics: ["Processes", "Deadlocks"], extraTopics: ["HTML", "CSS"], }) } }] }) }));
  assert.equal(unrelated.result.isMatch, false);
  assert.deepEqual(unrelated.result.extraTopics, ["HTML", "CSS"]);
});

test("rejects missing fields and oversized content", async () => {
  assert.equal((await call({ ...strong, title: "" })).status, 400);
  assert.equal((await call({ ...strong, description: "" })).status, 400);
  assert.equal((await call({ ...strong, content: "" })).status, 400);
  assert.equal((await call({ ...strong, content: "x".repeat(40001) })).status, 413);
});

test("handles malformed model JSON and provider failures", async () => {
  const malformed = await call(strong, async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: "not json" } }] }) }));
  assert.equal(malformed.status, 502);
  const failed = await call(strong, async () => ({ ok: false, status: 500 }));
  assert.equal(failed.status, 502);
});
