// Test isolé — focused_vanguard/g2-reviews-scraper
// Usage: npx tsx scripts/test-scrapers/test-g2.ts
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
const envPath = resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.trim().match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '')
  }
}

async function runApifyTest(actorId: string, input: object) {
  const token = process.env.APIFY_API_TOKEN
  if (!token) { console.error('APIFY_API_TOKEN manquant'); process.exit(1) }

  console.log(`[Test] Démarrage acteur ${actorId}...`)
  console.log('[Test] Input:', JSON.stringify(input, null, 2))

  const startRes = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?token=${token}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }
  )
  if (!startRes.ok) {
    console.error('Erreur démarrage run:', startRes.status, await startRes.text())
    process.exit(1)
  }
  const run = (await startRes.json()).data
  console.log('Run ID:', run.id, '| Dataset:', run.defaultDatasetId)

  let status: string = run.status
  while (status === 'RUNNING' || status === 'READY') {
    await new Promise(r => setTimeout(r, 5000))
    const s = await fetch(`https://api.apify.com/v2/actor-runs/${run.id}?token=${token}`)
    status = (await s.json()).data.status
    console.log('Status:', status)
  }

  const res = await fetch(`https://api.apify.com/v2/datasets/${run.defaultDatasetId}/items?token=${token}&limit=3`)
  const items = await res.json()
  console.log(`\n${Array.isArray(items) ? items.length : '?'} items reçus :`)
  console.log(JSON.stringify(items, null, 2))
}

runApifyTest('focused_vanguard/g2-reviews-scraper', {
  url: 'https://www.g2.com/products/notion/reviews',
  maxReviews: 2,
  maxPages: 1,
}).catch(console.error)
