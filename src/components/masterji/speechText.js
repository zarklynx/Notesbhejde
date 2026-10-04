// Strip only list markers, never mathematical subtraction or negative numbers.
export function speechText(text) {
  return text.replace(/^\s*[-*•]\s+/gm, '').replace(/^\s*\d+[.)]\s+/gm, '').replace(/[*#`]/g, '').trim()
}
