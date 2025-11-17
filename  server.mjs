import 'dotenv/config'
import express from 'express'
import path from 'path'
import fs from 'fs'

const app = express()
const PORT = process.env.PORT || 8787
const OPENAI_KEY = process.env.OPENAI_API_KEY
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini'
const KB_PATH = path.resolve('./rag_data/kb.json')

app.use(express.json({ limit: '1mb' }))
app.use('/public', express.static('public'))
app.use('/rag_data', express.static('rag_data')) // pour servir kb.json au front

// Health
app.get('/api/health', (_req,res)=> res.json({ ok:true }))

// Retourne la KB (si tu veux éviter de l’exposer en statique brut)
app.get('/api/kb', async (_req, res) => {
  try {
    const exists = fs.existsSync(KB_PATH)
    if (!exists) return res.status(404).json({ error:'kb.json introuvable. Lance npm run build:kb' })
    const kb = await fs.promises.readFile(KB_PATH, 'utf8')
    res.setHeader('Content-Type','application/json')
    res.send(kb)
  } catch (e) {
    res.status(500).json({ error:String(e) })
  }
})

// Proxy OpenAI chat (clé gardée côté serveur)
app.post('/api/chat', async (req, res) => {
  try {
    if (!OPENAI_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY manquant (.env)' })
    const { messages, model = CHAT_MODEL, temperature = 0.2 } = req.body || {}
    if (!Array.isArray(messages)) return res.status(400).json({ error:'messages[] requis' })
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({ model, messages, temperature })
    })
    const j = await r.json()
    if (!r.ok) return res.status(r.status).json(j)
    res.json(j)
  } catch (e) {
    res.status(500).json({ error:String(e) })
  }
})

// Page
app.get('/', (_req,res) => {
  res.sendFile(path.resolve('./public/index.html'))
})

app.listen(PORT, () => {
  console.log(`✅ http://localhost:${PORT}`)
  console.log('   Ouvre / (UI) — KB auto via /rag_data/kb.json — IA via /api/chat')
})
