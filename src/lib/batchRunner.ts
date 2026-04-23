import { fal } from '@fal-ai/client'
import { supabase } from '@/lib/supabase'
import {
  fetchInFlightItems,
  updateBatchItem,
  recomputeBatchJob,
} from '@/lib/batch'
import {
  PROMPT_TEMPLATES,
  qualityToResolution,
  mapAspectRatio,
  toFalUrl,
  type FalImageResult,
} from '@/lib/fal'
import { BATCH_CONCURRENCY, BATCH_POLL_INTERVAL_MS, type BatchJob, type BatchJobItem } from '@/types/batch'

const ENDPOINT = 'fal-ai/nano-banana-pro/edit'

// ── Module-level singleton state ────────────────────────────────────
// The runner is a single loop shared by the whole app. It picks up any
// in-flight item rows for the signed-in user, submits queued ones (up
// to the concurrency budget), and polls processing ones until terminal.

let running = false
let userId: string | null = null
let kickPending = false
let loopPromise: Promise<void> | null = null

// Items currently being actively worked on by *this tab*. Another tab
// could in theory race with us — for v1 we accept a single active tab.
const handling = new Set<string>()

export function startBatchRunner(uid: string) {
  if (running && userId === uid) return
  running = true
  userId = uid
  if (!loopPromise) loopPromise = loop()
}

export function stopBatchRunner() {
  running = false
  userId = null
  handling.clear()
  loopPromise = null
}

/** Nudge the runner to tick now instead of waiting for the next interval. */
export function kickBatchRunner() {
  kickPending = true
}

async function loop() {
  while (running) {
    try {
      await tick()
    } catch (err) {
      console.error('[batch-runner] tick error', err)
    }
    await sleepOrKick(BATCH_POLL_INTERVAL_MS)
  }
}

function sleepOrKick(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now()
    const id = setInterval(() => {
      if (!running) { clearInterval(id); resolve(); return }
      if (kickPending) { kickPending = false; clearInterval(id); resolve(); return }
      if (Date.now() - start >= ms) { clearInterval(id); resolve() }
    }, 200)
  })
}

async function tick() {
  if (!userId) return

  const items = await fetchInFlightItems(userId)
  const jobIdsTouched = new Set<string>()

  const processing = items.filter((i) => i.status === 'processing' && i.falRequestId)
  const queued = items.filter((i) => i.status === 'queued')

  // Poll every processing item that we aren't already polling locally.
  for (const item of processing) {
    if (handling.has(item.id)) continue
    handling.add(item.id)
    pollItem(item).then(() => jobIdsTouched.add(item.batchJobId)).finally(() => handling.delete(item.id))
  }

  // Submit queued items up to the concurrency budget (across processing + in-flight submits).
  const liveCount = processing.length + Array.from(handling).filter((id) => !processing.find((p) => p.id === id)).length
  const budget = Math.max(0, BATCH_CONCURRENCY - liveCount)
  for (const item of queued.slice(0, budget)) {
    if (handling.has(item.id)) continue
    handling.add(item.id)
    submitItem(item).then(() => jobIdsTouched.add(item.batchJobId)).finally(() => handling.delete(item.id))
  }
}

// ── Individual item lifecycle ───────────────────────────────────────

async function submitItem(item: BatchJobItem) {
  try {
    const job = await fetchParentJob(item.batchJobId)
    if (!job) throw new Error('Parent batch job not found')

    const input = await buildFalInput(job, item)
    console.log('[batch-runner] submit', item.id)
    // Cast: FAL's typed endpoint signatures are narrower than our generic builder;
    // we validated shape in buildFalInput, so this is safe.
    const submission = await fal.queue.submit(ENDPOINT, { input: input as never })
    const requestId = (submission as { request_id?: string }).request_id
    if (!requestId) throw new Error('FAL submit returned no request_id')

    await updateBatchItem(item.id, {
      status: 'processing',
      falRequestId: requestId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[batch-runner] submit failed', item.id, message)
    await updateBatchItem(item.id, {
      status: 'failed',
      errorMessage: message,
    })
    await recomputeBatchJob(item.batchJobId)
  }
}

async function pollItem(item: BatchJobItem) {
  if (!item.falRequestId) return
  try {
    const statusResp = await fal.queue.status(ENDPOINT, {
      requestId: item.falRequestId,
      logs: false,
    })
    const s = (statusResp as { status?: string }).status
    if (s === 'COMPLETED') {
      const result = await fal.queue.result(ENDPOINT, { requestId: item.falRequestId })
      const data = (result as { data?: FalImageResult }).data
      const imageUrl = data?.images?.[0]?.url
      if (!imageUrl) throw new Error('FAL result contained no image url')

      // Persist as a normal generation so it lands in the existing gallery.
      const job = await fetchParentJob(item.batchJobId)
      const generationId = await insertGenerationForItem(item, job, imageUrl)

      await updateBatchItem(item.id, {
        status: 'completed',
        resultImageUrl: imageUrl,
        generationId,
        errorMessage: null,
      })
      await recomputeBatchJob(item.batchJobId)
    } else if (s === 'IN_QUEUE' || s === 'IN_PROGRESS') {
      // still pending — nothing to do, next tick will poll again
    } else {
      // Unknown / terminal non-COMPLETED state treated as failure.
      throw new Error(`FAL reported terminal status: ${s ?? 'unknown'}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[batch-runner] poll failed', item.id, message)
    await updateBatchItem(item.id, {
      status: 'failed',
      errorMessage: message,
    })
    await recomputeBatchJob(item.batchJobId)
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

async function fetchParentJob(jobId: string): Promise<BatchJob | null> {
  const { data, error } = await supabase
    .from('batch_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle()
  if (error || !data) return null
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name ?? null,
    mode: 'on-model',
    prompt: data.prompt ?? '',
    view: data.view,
    brandFaceUrl: data.brand_face_url ?? null,
    aspectRatio: data.aspect_ratio ?? '4:5',
    quality: data.quality ?? 'standard',
    totalCount: data.total_count ?? 0,
    completedCount: data.completed_count ?? 0,
    failedCount: data.failed_count ?? 0,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

async function buildFalInput(job: BatchJob, item: BatchJobItem): Promise<Record<string, unknown>> {
  const productOnFal = await toFalUrl(item.productImageUrl)
  const imageUrls: string[] = [productOnFal]
  if (job.brandFaceUrl) {
    imageUrls.push(await toFalUrl(job.brandFaceUrl))
  }
  return {
    prompt: PROMPT_TEMPLATES['on-model'](job.prompt, 1, !!job.brandFaceUrl, job.view),
    image_urls: imageUrls,
    num_images: 1,
    aspect_ratio: mapAspectRatio(job.aspectRatio),
    resolution: qualityToResolution(job.quality),
  }
}

async function insertGenerationForItem(
  item: BatchJobItem,
  job: BatchJob | null,
  imageUrl: string
): Promise<string | null> {
  const row = {
    user_id: item.userId,
    mode: 'on-model',
    prompt: job?.prompt ?? '',
    parameters: {
      prompt: job?.prompt ?? '',
      model: ENDPOINT,
      aspectRatio: job?.aspectRatio ?? '4:5',
      quality: job?.quality ?? 'standard',
      productImageUrl: item.productImageUrl,
    },
    image_url: imageUrl,
    status: 'completed',
    fal_request_id: item.falRequestId,
  }
  const { data, error } = await supabase.from('generations').insert(row).select('id').single()
  if (error) {
    console.error('[batch-runner] insert generation failed', error)
    return null
  }
  return data?.id ?? null
}
