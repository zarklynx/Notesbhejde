import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { createMasterjiHandler } from './server/masterji.js'
import { createOcrHandler } from './server/ocr.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return { plugins: [react(), { name: 'masterji-local-api', configureServer(server) {
    server.middlewares.use('/api/masterji/ocr', createOcrHandler({ apiKey: process.env.RUNWARE_API_KEY || env.RUNWARE_API_KEY }))
    server.middlewares.use('/api/masterji', createMasterjiHandler({ apiKey: process.env.RUNWARE_API_KEY || env.RUNWARE_API_KEY, model: process.env.RUNWARE_MODEL || env.RUNWARE_MODEL }))
  } }] }
})
