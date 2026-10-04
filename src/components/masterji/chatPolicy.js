// Shared UI/API rules avoid an extra paid classifier request.
export function requestedLanguage(text) {
  if(/\b(?:in|to|speak|use|explain|reply|answer|translate|please)\s+(?:simple\s+)?marathi\b|marathi\s*(?:madhe|madhye|mein|me|please|language)|मराठी(?:त|मध्ये|मधे)?/i.test(text))return 'Marathi'
  if(/\b(?:in|to|speak|use|explain|reply|answer|translate)\s+hindi\b|हिंदी|हिन्दी/i.test(text))return 'Hindi'
  if(/\b(?:in|to|speak|use|explain|reply|answer|translate)\s+english\b/i.test(text))return 'English'
  return null
}
export function chatPlan(text, context = '') {
  const clean = text.trim().toLowerCase().replace(/[!?. ,]+$/g, '')
  const offTopic = /\b(free\s*fire|pubg|fortnite|celebrity gossip|betting tips|dating advice)\b/i.test(text)
  const academic = /\b(algorithm|programming|database|network|design|project|assignment|study|research|case study|explain.*code)\b/i.test(text)
  if(offTopic && !academic && !/\b(free\s*fire|pubg|fortnite|celebrity gossip|betting tips|dating advice)\b/i.test(context))return {reply:requestedLanguage(text)==='Marathi'?'मी मास्टरजी, NotesBhejde वरचा अभ्यास साथी आहे. मी नोट्स समजावून सांगणे, सारांश देणे आणि अभ्यासाचे प्रश्न सोडवणे यासाठी आहे. चला, तुमच्या अभ्यासाकडे वळूया!':'I’m Masterji, your study companion on NotesBhejde—not a general-purpose chatbot. I can explain your notes, summarize topics, and help with study questions. Let’s get back to learning!',effort:'minimal',mode:'off-topic'}
  if (/^(hi|hello|hey|yo|hey there|hello there)( masterji| bro)?$/.test(clean)) return { reply: 'Hi! What are we learning today? I can summarize this note, explain a topic, or quiz you.', effort: 'minimal' }
  if (/^(thanks|thank you|thanks bro|thank you masterji|thx|ty)$/.test(clean)) return { reply: 'You’re welcome! Want to try another question?', effort: 'minimal' }
  if (/^(how are you|how are you doing|what can you do|who are you)$/.test(clean)) return { reply: 'I’m Masterji, your study buddy! Ready to help you understand this note, summarize it, or practice questions.', effort: 'minimal' }
  const complex = /\b(solve|derive|prove|proof|calculate|compare|analy[sz]e|step[- ]by[- ]step|reason through|think carefully|in depth|why|how does|how do|quiz)\b/i.test(text)
  return { effort: complex ? 'medium' : 'minimal' }
}
