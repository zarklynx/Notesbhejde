import { useCallback, useEffect, useRef, useState } from 'react'
import { aiFetch } from './aiClient'
import { speechText } from './speechText'

// Audio-reactive mouth movement, not a phoneme model. No per-frame React renders.
export function useMasterjiVoice(stage, choice = '') {
  const [voice, setVoice] = useState({ index: null, state: 'idle' })
  const engine = useRef({ generation: 0, cache: new Map() })
  const stop = useCallback(() => {
    const e = engine.current
    e.generation++; e.controller?.abort(); cancelAnimationFrame(e.frame)
    e.source?.stop(); e.source = null
    stage.current?.style.setProperty('--speech-open', '0')
    setVoice({ index: null, state: 'idle' })
  }, [stage])
  useEffect(() => {
    const e = engine.current
    const hide = () => { if (document.hidden) stop() }
    document.addEventListener('visibilitychange', hide)
    return () => {
      document.removeEventListener('visibilitychange', hide)
      e.generation++; e.controller?.abort(); cancelAnimationFrame(e.frame)
      e.source?.stop(); e.context?.close(); e.cache.clear()
    }
  }, [stop])
  async function play(index, text) {
    if (voice.index === index) { stop(); return }
    stop()
    const e = engine.current, generation = e.generation
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) throw new Error('Audio playback is not supported in this browser.')
      e.context ||= new AudioContext()
      await e.context.resume()
      const clean = speechText(text)
      if (clean.length > 12000) throw new Error('This reply is too long to read aloud. Ask for a shorter version.')
      // Each displayed segment is exactly the text in the currently playing audio.
      const sentences = typeof Intl.Segmenter === 'function'
        ? [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(clean)].map(s => s.segment.trim())
        : clean.match(/[^.!?]+(?:[.!?]+|$)/g) || [clean]
      const chunks = sentences.flatMap(sentence => {
        const parts = []
        let rest = sentence.trim()
        while (rest.length > 1800) {
          const space = rest.lastIndexOf(' ', 1800)
          const end = space > 0 ? space : 1800
          parts.push(rest.slice(0, end)); rest = rest.slice(end).trim()
        }
        if (rest) parts.push(rest)
        return parts
      })
      for (const [chunkIndex, chunk] of chunks.entries()) {
        if (e.generation !== generation) return
        setVoice({ index, state: 'loading', text: chunk })
        const cacheKey = `${choice}:${chunk}`
        let buffer = e.cache.get(cacheKey)
        if (!buffer) {
          e.controller = new AbortController()
          const response = await aiFetch('/api/masterji/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: chunk, voice: choice || undefined }), signal: e.controller.signal })
          if (!response.ok) { const body = await response.json(); throw new Error(body.error || 'Voice unavailable.') }
          buffer = await e.context.decodeAudioData(await response.arrayBuffer())
          if (e.generation !== generation) return
          if (e.cache.size >= 8) e.cache.delete(e.cache.keys().next().value)
          e.cache.set(cacheKey, buffer)
        }
        if (e.generation !== generation) return
        const source = e.context.createBufferSource(), analyser = e.context.createAnalyser()
        analyser.fftSize = 256
        source.buffer = buffer
        // A modest slowdown also slightly lowers pitch with BufferSource playback.
        source.playbackRate.value = .9
        source.connect(analyser); analyser.connect(e.context.destination)
        e.source = source
        const samples = new Uint8Array(analyser.fftSize)
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        let last = 0, smooth = 0
        function animate(time) {
          if (e.generation !== generation) return
          if (time - last > 32) {
            analyser.getByteTimeDomainData(samples)
            const rms = Math.sqrt(samples.reduce((sum, v) => sum + ((v - 128) / 128) ** 2, 0) / samples.length)
            smooth = smooth * .35 + Math.min(1, rms * 7) * .65
            stage.current?.style.setProperty('--speech-open', reduced ? '0' : String(smooth))
            last = time
          }
          e.frame = requestAnimationFrame(animate)
        }
        setVoice({ index, state: 'playing', text: chunk })
        await new Promise(resolve => {
          source.onended = resolve
          // Schedule a natural sentence break on the audio clock, not a UI timer.
          source.start(e.context.currentTime + (chunkIndex ? .3 : 0))
          e.frame = requestAnimationFrame(animate)
        })
        source.disconnect(); analyser.disconnect()
        if (e.generation !== generation) return
        cancelAnimationFrame(e.frame); e.source = null
        stage.current?.style.setProperty('--speech-open', '0')
      }
      if (e.generation === generation) setVoice({ index: null, state: 'idle' })
    } catch (error) {
      if (e.generation === generation && error.name !== 'AbortError') {
        stop(); setVoice({ index: null, state: 'idle', error: error.message })
      }
    }
  }
  return { voice, play, stop }
}
