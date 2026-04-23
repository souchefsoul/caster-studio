export type BatchJobStatus = 'running' | 'completed' | 'failed' | 'cancelled'
export type BatchJobItemStatus = 'queued' | 'processing' | 'completed' | 'failed'
export type BatchView = 'front' | 'back'
export type BatchQuality = 'draft' | 'standard' | 'high'

export interface BatchJob {
  id: string
  userId: string
  name: string | null
  mode: 'on-model'
  prompt: string
  view: BatchView
  brandFaceUrl: string | null
  aspectRatio: string
  quality: BatchQuality
  totalCount: number
  completedCount: number
  failedCount: number
  status: BatchJobStatus
  createdAt: string
  updatedAt: string
}

export interface BatchJobItem {
  id: string
  batchJobId: string
  userId: string
  productImageUrl: string
  orderIndex: number
  status: BatchJobItemStatus
  falRequestId: string | null
  resultImageUrl: string | null
  errorMessage: string | null
  generationId: string | null
  createdAt: string
  updatedAt: string
}

export const BATCH_CONCURRENCY = 3
export const BATCH_MAX_ITEMS = 50
export const BATCH_POLL_INTERVAL_MS = 4000
