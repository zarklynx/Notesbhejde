// Shared UI/API rules avoid an extra paid classifier request.
export function chatPlan(text) {
  const clean = text.trim().toLowerCase().replace(/[!?. ,]+$/g, '')
  if (/^(hi|hello|hey|yo|hey there|hello there)( masterji| bro)?$/.test(clean)) return { reply: 'Hi! What are we learning today? I can summarize this note, explain a topic, or quiz you.', effort: 'minimal' }
  if (/^(thanks|thank you|thanks bro|thank you masterji|thx|ty)$/.test(clean)) return { reply: 'You’re welcome! Want to try another question?', effort: 'minimal' }
  if (/^(how are you|how are you doing|what can you do|who are you)$/.test(clean)) return { reply: 'I’m Masterji, your study buddy! Ready to help you understand this note, summarize it, or practice questions.', effort: 'minimal' }
  const complex = /\b(solve|derive|prove|proof|calculate|compare|analy[sz]e|step[- ]by[- ]step|reason through|think carefully|in depth|why|how does|how do|quiz)\b/i.test(text)
  return { effort: complex ? 'medium' : 'minimal' }
}
