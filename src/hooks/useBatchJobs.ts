import { useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import {
  createBatchJob,
  deleteBatchJob,
  fetchBatchItems,
  fetchBatchJobs,
  insertBatchItems,
  mapItemRow,
  mapJobRow,
  recomputeBatchJob,
  retryBatchItem,
  uploadBatchProduct,
} from '@/lib/batch'
import {
  kickBatchRunner,
  startBatchRunner,
  stopBatchRunner,
} from '@/lib/batchRunner'
import type { BatchJob, BatchQuality, BatchView } from '@/types/batch'

export interface CreateBatchInput {
  files: File[]
  prompt: string
  view: BatchView
  brandFaceUrl: string | null
  aspectRatio: string
  quality: BatchQuality
  name?: string
}

/**
 * Singleton hook — call this ONCE at the app root (e.g. WorkspaceLayout).
 * Loads the user's batches, subscribes to realtime changes, starts the
 * in-memory runner, and writes everything into the Zustand store. Read
 * sites should use `useBatchJobs()` which just reads from the store.
 */
export function useBatchJobsSync() {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const setBatchJobs = useWorkspaceStore((s) => s.setBatchJobs)
  const setBatchItems = useWorkspaceStore((s) => s.setBatchItems)
  const upsertBatchJob = useWorkspaceStore((s) => s.upsertBatchJob)
  const upsertBatchItem = useWorkspaceStore((s) => s.upsertBatchItem)
  const removeBatchJob = useWorkspaceStore((s) => s.removeBatchJob)
  const removeBatchItem = useWorkspaceStore((s) => s.removeBatchItem)
  const setBatchLoading = useWorkspaceStore((s) => s.setBatchLoading)

  // Initial load + runner start
  useEffect(() => {
    if (!userId) {
      stopBatchRunner()
      setBatchJobs([])
      return
    }
    let cancelled = false
    setBatchLoading(true)

    fetchBatchJobs(userId)
      .then(async (jobList) => {
        if (cancelled) return
        setBatchJobs(jobList)
        // Preload items for any non-terminal job so the drawer renders fully.
        const live = jobList.filter((j) => j.status === 'running')
        await Promise.all(
          live.map(async (j) => {
            const items = await fetchBatchItems(j.id)
            if (!cancelled) setBatchItems(j.id, items)
          })
        )
      })
      .catch((err) => console.error('[useBatchJobsSync] load failed', err))
      .finally(() => { if (!cancelled) setBatchLoading(false) })

    startBatchRunner(userId)

    return () => { cancelled = true }
  }, [userId, setBatchJobs, setBatchItems, setBatchLoading])

  // Stop runner on full unmount
  useEffect(() => () => stopBatchRunner(), [])

  // Realtime subscription
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`batch-jobs-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'batch_jobs', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            upsertBatchJob(mapJobRow(payload.new as Record<string, unknown>))
          } else if (payload.eventType === 'DELETE') {
            const id = (payload.old as { id?: string }).id
            if (id) removeBatchJob(id)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'batch_job_items', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            upsertBatchItem(mapItemRow(payload.new as Record<string, unknown>))
            kickBatchRunner()
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as { id?: string; batch_job_id?: string }
            if (old.id && old.batch_job_id) removeBatchItem(old.batch_job_id, old.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, upsertBatchJob, upsertBatchItem, removeBatchJob, removeBatchItem])
}

/**
 * Consumer hook. Read jobs + items from the store and call actions.
 * Safe to use from multiple components.
 */
export function useBatchJobs() {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const jobs = useWorkspaceStore((s) => s.batchJobs)
  const itemsByJob = useWorkspaceStore((s) => s.batchItemsByJob)
  const loading = useWorkspaceStore((s) => s.batchLoading)
  const setBatchItems = useWorkspaceStore((s) => s.setBatchItems)

  const activeJob = jobs.find((j) => j.status === 'running') ?? null

  const createBatch = useCallback(
    async (input: CreateBatchInput): Promise<BatchJob> => {
      if (!userId) throw new Error('Not signed in')

      const job = await createBatchJob({
        userId,
        name: input.name ?? null,
        prompt: input.prompt,
        view: input.view,
        brandFaceUrl: input.brandFaceUrl,
        aspectRatio: input.aspectRatio,
        quality: input.quality,
        totalCount: input.files.length,
      })

      const withIds = input.files.map((file) => ({ file, itemId: crypto.randomUUID() }))
      const uploaded = await Promise.all(
        withIds.map(async ({ file, itemId }) => {
          const url = await uploadBatchProduct(userId, job.id, itemId, file)
          return { itemId, url }
        })
      )
      await insertBatchItems(
        job.id,
        userId,
        uploaded.map((u, idx) => ({ productImageUrl: u.url, orderIndex: idx }))
      )

      kickBatchRunner()
      return job
    },
    [userId]
  )

  const retryItem = useCallback(async (itemId: string, jobId: string) => {
    await retryBatchItem(itemId)
    await recomputeBatchJob(jobId)
    kickBatchRunner()
  }, [])

  const deleteJob = useCallback(async (jobId: string) => {
    await deleteBatchJob(jobId)
  }, [])

  const loadItems = useCallback(async (jobId: string) => {
    const items = await fetchBatchItems(jobId)
    setBatchItems(jobId, items)
  }, [setBatchItems])

  return {
    jobs,
    itemsByJob,
    activeJob,
    loading,
    createBatch,
    retryItem,
    deleteJob,
    loadItems,
  }
}
