// Client Apify générique
// Flow : POST run → polling statut → GET dataset items
// Token requis : APIFY_API_TOKEN dans .env.local

const APIFY_BASE = 'https://api.apify.com/v2'
const POLL_INTERVAL_MS = 3000
const DEFAULT_TIMEOUT_MS = 90_000 // 90s max pour économiser les crédits

export interface ApifyRunOptions {
  actorId: string
  input: Record<string, unknown>
  /** Mémoire allouée en MB — minimum 128, défaut 256 pour économiser les crédits */
  memoryMbytes?: number
  /** Timeout du run côté Apify en secondes */
  timeoutSecs?: number
  /** Timeout local de polling en ms */
  maxWaitMs?: number
}

export interface ApifyItem {
  [key: string]: unknown
}

export async function runApifyActor(options: ApifyRunOptions): Promise<ApifyItem[]> {
  const token = process.env.APIFY_API_TOKEN
  if (!token) {
    throw new Error('APIFY_API_TOKEN manquant dans .env.local')
  }

  const {
    actorId,
    input,
    memoryMbytes = 256,
    timeoutSecs = 60,
    maxWaitMs = DEFAULT_TIMEOUT_MS,
  } = options

  // 1. Lancer le run
  const runRes = await fetch(
    `${APIFY_BASE}/acts/${encodeURIComponent(actorId)}/runs?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, memoryMbytes, timeoutSecs }),
      cache: 'no-store',
    }
  )

  if (!runRes.ok) {
    const text = await runRes.text()
    throw new Error(`Apify run HTTP ${runRes.status}: ${text.slice(0, 200)}`)
  }

  const runData = (await runRes.json()) as {
    data: { id: string; defaultDatasetId: string }
  }
  const { id: runId, defaultDatasetId } = runData.data

  // 2. Polling jusqu'à SUCCEEDED ou FAILED
  const deadline = Date.now() + maxWaitMs
  let status = 'RUNNING'

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS)

    const statusRes = await fetch(
      `${APIFY_BASE}/actor-runs/${runId}?token=${token}`,
      { cache: 'no-store' }
    )
    if (!statusRes.ok) continue

    const statusData = (await statusRes.json()) as { data: { status: string } }
    status = statusData.data.status

    if (status === 'SUCCEEDED') break
    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      throw new Error(`Apify run ${status} (runId: ${runId})`)
    }
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`Apify run timeout après ${maxWaitMs}ms (runId: ${runId})`)
  }

  // 3. Récupérer les items du dataset
  const dataRes = await fetch(
    `${APIFY_BASE}/datasets/${defaultDatasetId}/items?token=${token}&clean=true`,
    { cache: 'no-store' }
  )

  if (!dataRes.ok) {
    throw new Error(`Apify dataset HTTP ${dataRes.status}`)
  }

  return (await dataRes.json()) as ApifyItem[]
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
