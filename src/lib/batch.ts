import { supabase } from '@/lib/supabase'
import type { BatchJob, BatchJobItem, BatchJobItemStatus, BatchQuality, BatchView } from '@/types/batch'

const UPLOADS_BUCKET = 'uploads'

// ── Row ↔ type mappers ──────────────────────────────────────────────

function mapJobRow(row: Record<string, unknown>): BatchJob {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: (row.name as string | null) ?? null,
    mode: 'on-model',
    prompt: (row.prompt as string) ?? '',
    view: (row.view as BatchView) ?? 'front',
    brandFaceUrl: (row.brand_face_url as string | null) ?? null,
    aspectRatio: (row.aspect_ratio as string) ?? '4:5',
    quality: (row.quality as BatchQuality) ?? 'standard',
    totalCount: (row.total_count as number) ?? 0,
    completedCount: (row.completed_count as number) ?? 0,
    failedCount: (row.failed_count as number) ?? 0,
    status: row.status as BatchJob['status'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapItemRow(row: Record<string, unknown>): BatchJobItem {
  return {
    id: row.id as string,
    batchJobId: row.batch_job_id as string,
    userId: row.user_id as string,
    productImageUrl: row.product_image_url as string,
    orderIndex: (row.order_index as number) ?? 0,
    status: row.status as BatchJobItemStatus,
    falRequestId: (row.fal_request_id as string | null) ?? null,
    resultImageUrl: (row.result_image_url as string | null) ?? null,
    errorMessage: (row.error_message as string | null) ?? null,
    generationId: (row.generation_id as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

// ── Storage upload ──────────────────────────────────────────────────

/**
 * Upload a product file to the `uploads` bucket under the user's batch folder
 * and return the public URL. The upload RLS policy restricts the top-level
 * folder to the authenticated user's id, so the layout is:
 *   uploads/{user_id}/batches/{job_id}/{item_id}.{ext}
 */
export async function uploadBatchProduct(
  userId: string,
  jobId: string,
  itemId: string,
  file: File
): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${userId}/batches/${jobId}/${itemId}.${ext}`
  const { error } = await supabase.storage.from(UPLOADS_BUCKET).upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: true,
  })
  if (error) {
    console.error('[batch] upload failed', error)
    throw error
  }
  const { data } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// ── Job CRUD ───────────────────────────────────────────────────────

export interface CreateBatchJobInput {
  userId: string
  name?: string | null
  prompt: string
  view: BatchView
  brandFaceUrl: string | null
  aspectRatio: string
  quality: BatchQuality
  totalCount: number
}

export async function createBatchJob(input: CreateBatchJobInput): Promise<BatchJob> {
  const { data, error } = await supabase
    .from('batch_jobs')
    .insert({
      user_id: input.userId,
      name: input.name ?? null,
      mode: 'on-model',
      prompt: input.prompt,
      view: input.view,
      brand_face_url: input.brandFaceUrl,
      aspect_ratio: input.aspectRatio,
      quality: input.quality,
      total_count: input.totalCount,
      status: 'running',
    })
    .select('*')
    .single()
  if (error || !data) {
    console.error('[batch] create job failed', error)
    throw error ?? new Error('Failed to create batch job')
  }
  return mapJobRow(data)
}

export async function insertBatchItems(
  jobId: string,
  userId: string,
  items: Array<{ productImageUrl: string; orderIndex: number }>
): Promise<BatchJobItem[]> {
  if (items.length === 0) return []
  const rows = items.map((it) => ({
    batch_job_id: jobId,
    user_id: userId,
    product_image_url: it.productImageUrl,
    order_index: it.orderIndex,
    status: 'queued' as BatchJobItemStatus,
  }))
  const { data, error } = await supabase.from('batch_job_items').insert(rows).select('*')
  if (error || !data) {
    console.error('[batch] insert items failed', error)
    throw error ?? new Error('Failed to insert batch items')
  }
  return data.map(mapItemRow)
}

export async function fetchBatchJobs(userId: string): Promise<BatchJob[]> {
  const { data, error } = await supabase
    .from('batch_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map(mapJobRow)
}

export async function fetchBatchItems(jobId: string): Promise<BatchJobItem[]> {
  const { data, error } = await supabase
    .from('batch_job_items')
    .select('*')
    .eq('batch_job_id', jobId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapItemRow)
}

export async function fetchInFlightItems(userId: string): Promise<BatchJobItem[]> {
  const { data, error } = await supabase
    .from('batch_job_items')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['queued', 'processing'])
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapItemRow)
}

export async function updateBatchItem(
  itemId: string,
  patch: {
    status?: BatchJobItemStatus
    falRequestId?: string | null
    resultImageUrl?: string | null
    errorMessage?: string | null
    generationId?: string | null
  }
): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.status !== undefined) row.status = patch.status
  if (patch.falRequestId !== undefined) row.fal_request_id = patch.falRequestId
  if (patch.resultImageUrl !== undefined) row.result_image_url = patch.resultImageUrl
  if (patch.errorMessage !== undefined) row.error_message = patch.errorMessage
  if (patch.generationId !== undefined) row.generation_id = patch.generationId
  const { error } = await supabase.from('batch_job_items').update(row).eq('id', itemId)
  if (error) {
    console.error('[batch] update item failed', error)
    throw error
  }
}

/**
 * Recompute completed_count / failed_count / status on the job from its items.
 * Called after any item transition to keep the job summary consistent.
 */
export async function recomputeBatchJob(jobId: string): Promise<void> {
  const { data, error } = await supabase
    .from('batch_job_items')
    .select('status')
    .eq('batch_job_id', jobId)
  if (error) {
    console.error('[batch] recompute fetch failed', error)
    return
  }
  const items = data ?? []
  const total = items.length
  const completed = items.filter((i) => i.status === 'completed').length
  const failed = items.filter((i) => i.status === 'failed').length
  const allDone = total > 0 && completed + failed === total
  const status: BatchJob['status'] = allDone
    ? failed === total
      ? 'failed'
      : 'completed'
    : 'running'
  const { error: upErr } = await supabase
    .from('batch_jobs')
    .update({
      completed_count: completed,
      failed_count: failed,
      status,
    })
    .eq('id', jobId)
  if (upErr) console.error('[batch] recompute update failed', upErr)
}

export async function retryBatchItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('batch_job_items')
    .update({
      status: 'queued',
      fal_request_id: null,
      error_message: null,
    })
    .eq('id', itemId)
  if (error) throw error
}

export async function deleteBatchJob(jobId: string): Promise<void> {
  const { error } = await supabase.from('batch_jobs').delete().eq('id', jobId)
  if (error) throw error
}

export { mapJobRow, mapItemRow }
