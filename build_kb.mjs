import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import pdf from 'pdf-parse'

const OPENAI_KEY = process.env.OPENAI_API_KEY
const EMB_MODEL  = process.env.OPENAI_EMB_MODEL || 'text-embedding-3-small'
const RAG_DIR    = path.resolve('./rag_data')
const KB_PATH    = path.join(RAG_DIR, 'kb.json')

if (!OPENAI_KEY) {
  console.error('OPENAI_API_KEY manquant (.env)')
  process.exit(1)
}

async function listPdfFiles(dir) {
  const names = await fs.promises.readdir(dir)
  return names.filter(n => n.toLowerCase().endsWith('.pdf'))
}

function chunkText(txt, max = 900, overlap = 150) {
  const out = []
  let i = 0
  while (i < txt.length) {
    const end = Math.min(i + max, txt.length)
    const chunk = txt.slice(i, end).trim()
    if (chunk.length > 0) out.push(chunk)
    i = end - overlap
    if (i < 0) i = 0
  }
  return out
}

function l2normalize(vec) {
  const n = Math.sqrt(vec.reduce((s,v)=>s+v*v,0)) || 1
  return vec.map(v=>v/n)
}

async function embedBatch(texts) {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({ model: EMB_MODEL, input: texts })
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`Embeddings HTTP ${r.status}: ${t}`)
  }
  const data = await r.json()
  return data.data.map(d => l2normalize(d.embedding))
}

async function main() {
  await fs.promises.mkdir(RAG_DIR, { recursive: true })
  const pdfs = await listPdfFiles(RAG_DIR)
  if (pdfs.length === 0) {
    console.log('Aucun PDF dans ./rag_data. Mets des .pdf puis relance: npm run build:kb')
    return
  }

  const chunks = []
  for (const fname of pdfs) {
    const fpath = path.join(RAG_DIR, fname)
    const buf = await fs.promises.readFile(fpath)
    const parsed = await pdf(buf)
    const raw = (parsed.text || '')
      .replace(/\r/g,'')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
    const parts = chunkText(raw, 900, 150)
    parts.forEach((t, i) => chunks.push({ id: `${fname}#${i}`, text: t }))
    console.log(`${fname} → ${parts.length} passages`)
  }

  const batchSize = 64
  let allEmb = []
  for (let i=0; i<chunks.length; i+=batchSize) {
    const batch = chunks.slice(i, i+batchSize).map(c=>c.text)
    const emb = await embedBatch(batch)
    allEmb = allEmb.concat(emb)
    console.log(`Embeddings ${Math.min(i+batch.length, chunks.length)}/${chunks.length}`)
  }

  const kb = {
    model: EMB_MODEL,
    dim: allEmb[0]?.length || 1536,
    chunks: chunks.map((c, idx) => ({ id: c.id, text: c.text, embedding: allEmb[idx] }))
  }

  await fs.promises.writeFile(KB_PATH, JSON.stringify(kb))
  console.log(`KB sauvegardée → ${KB_PATH} (${kb.chunks.length} passages)`)
}

main().catch(e => {
  console.error('Erreur build_kb:', e)
  process.exit(1)
})
