import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { aiFetch } from './aiClient'

GlobalWorkerOptions.workerSrc = workerUrl

export async function readPdfText(url, signal, onStatus = () => {}) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error('Could not load this PDF. Please check its download link.')
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.byteLength > 20 * 1024 * 1024) throw new Error('Please use a PDF under 20 MB for this chat.')
  const task = getDocument({ data: bytes, isEvalSupported: false })
  const abort = () => { void task.destroy() }
  signal?.addEventListener('abort', abort, { once: true })
  try {
    signal?.throwIfAborted()
    const pdf = await task.promise
    if (pdf.numPages > 100) throw new Error('Please use a PDF with 100 pages or fewer for this chat.')
    let text = '', scannedPages = 0
    for (let number = 1; number <= pdf.numPages; number++) {
      signal?.throwIfAborted()
      const page = await pdf.getPage(number)
      onStatus(`Reading PDF · page ${number} of ${pdf.numPages}…`)
      const content = await page.getTextContent()
      let pageText = content.items.map(item => item.str ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('')
      if (pageText.trim().length < 20) {
        if (++scannedPages > 10) throw new Error('This PDF needs OCR on more than 10 pages. Please use a shorter PDF.')
        onStatus(`Reading scanned page ${number} · Runware OCR…`)
        signal?.throwIfAborted()
        const initial = page.getViewport({ scale: 1 })
        const viewport = page.getViewport({ scale: Math.min(2, 2000 / Math.max(initial.width, initial.height)) })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height)
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
        const ocrResponse = await aiFetch('/api/masterji/ocr', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
          body: JSON.stringify({ image: canvas.toDataURL('image/jpeg', .9) }),
        })
        const result = await ocrResponse.json()
        if (!ocrResponse.ok) throw new Error(result.error || 'Could not transcribe this PDF page.')
        pageText = result.text === '[no readable text]' ? '' : result.text
        canvas.width = 0; canvas.height = 0
      }
      text += `\n[PDF page ${number}]\n${pageText}`
      page.cleanup()
      if (text.length > 28000) throw new Error('This PDF has too much text for the current chat limit. Please use a shorter PDF.')
    }
    if (text.replace(/\[PDF page \d+\]/g, '').trim().length < 20) throw new Error('No readable text was found, even with OCR. Please use a clearer PDF.')
    return text
  } finally {
    signal?.removeEventListener('abort', abort)
    await task.destroy()
  }
}
