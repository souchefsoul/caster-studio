import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ListTodo, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { useBrandModels } from '@/hooks/useBrandModels'
import { useBatchJobs } from '@/hooks/useBatchJobs'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { BATCH_MAX_ITEMS, type BatchQuality, type BatchView } from '@/types/batch'

const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * Supabase throws PostgrestError objects ({ message, code, details, hint }) that
 * don't inherit from Error, so `String(err)` yields "[object Object]". Extract
 * a readable message from the common shapes we actually see.
 */
function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object') {
    const e = err as { message?: unknown; details?: unknown; error_description?: unknown; code?: unknown }
    if (typeof e.message === 'string' && e.message) return e.code ? `${e.message} (${e.code})` : e.message
    if (typeof e.error_description === 'string') return e.error_description
    if (typeof e.details === 'string') return e.details
    try { return JSON.stringify(err) } catch { /* fallthrough */ }
  }
  return String(err)
}

export function BatchPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { models, activeModel, setActive } = useBrandModels()
  const { activeJob, itemsByJob, createBatch, retryItem } = useBatchJobs()
  const params = useWorkspaceStore((s) => s.params)
  const setActiveBrandFaceUrl = useWorkspaceStore((s) => s.setActiveBrandFaceUrl)
  const setQueueDrawerOpen = useWorkspaceStore((s) => s.setQueueDrawerOpen)
  const batchJobs = useWorkspaceStore((s) => s.batchJobs)
  const runningBatches = batchJobs.filter((j) => j.status === 'running').length
  const [facePickerOpen, setFacePickerOpen] = useState(false)

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [prompt, setPrompt] = useState('')
  const [view, setView] = useState<BatchView>('front')
  const [quality, setQuality] = useState<BatchQuality>(params.quality)
  const [aspectRatio, setAspectRatio] = useState(params.aspectRatio || '4:5')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeItems = activeJob ? itemsByJob[activeJob.id] ?? [] : []

  const addFiles = (list: FileList | File[]) => {
    setError(null)
    const incoming = Array.from(list)
    const remaining = BATCH_MAX_ITEMS - files.length
    if (remaining <= 0) {
      setError(t('workspace.batch.maxItemsReached').replace('{max}', String(BATCH_MAX_ITEMS)))
      return
    }
    const accepted: File[] = []
    const newPreviews: string[] = []
    for (const f of incoming.slice(0, remaining)) {
      if (f.size > MAX_FILE_SIZE) {
        setError(t('workspace.onModel.fileTooLarge'))
        continue
      }
      if (!f.type.startsWith('image/')) continue
      accepted.push(f)
      newPreviews.push(URL.createObjectURL(f))
    }
    setFiles((prev) => [...prev, ...accepted])
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeAt = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => {
      const url = prev[i]
      if (url) URL.revokeObjectURL(url)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  const resetForm = () => {
    previews.forEach((p) => URL.revokeObjectURL(p))
    setFiles([])
    setPreviews([])
    setPrompt('')
    setError(null)
  }

  const handleStart = async () => {
    if (!user) return
    if (files.length === 0) {
      setError(t('workspace.batch.noFiles'))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createBatch({
        files,
        prompt,
        view,
        brandFaceUrl: activeModel?.faceImageUrl ?? null,
        aspectRatio,
        quality,
      })
      resetForm()
    } catch (err) {
      console.error('[batch] start failed', err)
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <Link
          to="/"
          className="inline-flex min-h-10 items-center gap-1.5 border border-border bg-background px-2.5 text-xs hover:bg-accent rounded-none"
        >
          <ArrowLeft className="size-4" />
          {t('workspace.batch.back')}
        </Link>
        <h1 className="text-sm font-semibold">{t('workspace.batch.title')}</h1>
        <button
          onClick={() => setQueueDrawerOpen(true)}
          className="relative inline-flex min-h-10 items-center gap-1.5 border border-border bg-background px-2.5 text-xs hover:bg-accent rounded-none"
          aria-label={t('workspace.topbar.queue')}
        >
          <ListTodo className="size-4" />
          {t('workspace.sidebar.queue')}
          {runningBatches > 0 && (
            <span className="ml-1 inline-flex min-w-5 items-center justify-center border border-border bg-accent px-1 py-0.5 text-[10px] font-medium">
              {runningBatches}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-4">
          {/* Brand face */}
          <section className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('workspace.batch.brandFace')}
            </p>
            <div className="flex items-center gap-3 border border-border bg-muted/30 p-3">
              {activeModel ? (
                <>
                  <img
                    src={activeModel.faceImageUrl}
                    alt={activeModel.name}
                    className="size-14 border border-border object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activeModel.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('workspace.batch.brandFaceApplied')}
                    </p>
                  </div>
                </>
              ) : (
                <p className="flex-1 text-sm text-muted-foreground">
                  {t('workspace.batch.noBrandFace')}
                </p>
              )}
              <button
                type="button"
                onClick={() => setFacePickerOpen((v) => !v)}
                disabled={models.length === 0}
                className="inline-flex min-h-10 items-center border border-border bg-background px-2.5 text-xs hover:bg-accent rounded-none disabled:opacity-50"
              >
                {facePickerOpen
                  ? t('workspace.batch.done')
                  : t('workspace.batch.changeBrandFace')}
              </button>
            </div>

            {facePickerOpen && models.length > 0 && (
              <div className="grid grid-cols-4 gap-1 border border-border bg-background p-2 sm:grid-cols-6">
                {models.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={async () => {
                      await setActive(model.id)
                      setActiveBrandFaceUrl(model.faceImageUrl)
                    }}
                    className={`relative aspect-square min-h-20 overflow-hidden border ${
                      model.isActive
                        ? 'border-foreground ring-1 ring-foreground'
                        : 'border-border hover:border-foreground'
                    }`}
                    title={model.name}
                  >
                    <img
                      src={model.faceImageUrl}
                      alt={model.name}
                      className="h-full w-full object-cover"
                    />
                    {model.isActive && (
                      <span className="absolute bottom-0 left-0 right-0 bg-foreground/80 py-px text-center text-[9px] text-background">
                        {t('workspace.brandFace.active')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {facePickerOpen && models.length === 0 && (
              <p className="border border-border bg-background p-2 text-xs text-muted-foreground">
                {t('workspace.brandFace.noModels')}
              </p>
            )}
          </section>

          {/* Products upload */}
          <section className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {t('workspace.batch.products')}
              </p>
              <p className="text-xs text-muted-foreground">
                {files.length} / {BATCH_MAX_ITEMS}
              </p>
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) addFiles(e.dataTransfer.files) }}
              className="grid grid-cols-4 gap-2 sm:grid-cols-6"
            >
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square border border-border bg-muted/50">
                  <img src={src} alt={`Product ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeAt(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-none border border-border bg-background hover:bg-accent"
                    aria-label={t('workspace.batch.removeProduct')}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {files.length < BATCH_MAX_ITEMS && (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 border border-dashed border-border bg-muted/50 hover:border-primary"
                >
                  <Upload className="size-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {t('workspace.batch.addProducts')}
                  </span>
                </button>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = '' }}
              className="hidden"
            />
          </section>

          {/* Prompt */}
          <section className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('workspace.batch.prompt')}
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('workspace.batch.promptPlaceholder')}
              className="w-full rounded-none border border-input bg-background px-2.5 py-2 text-base min-h-[5rem] field-sizing-content resize-none text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
          </section>

          {/* View + quality */}
          <section className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {t('workspace.onModel.viewQuestion')}
              </p>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant={view === 'front' ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => setView('front')}
                  className="rounded-none min-h-10"
                >
                  {t('workspace.onModel.viewFront')}
                </Button>
                <Button
                  variant={view === 'back' ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => setView('back')}
                  className="rounded-none min-h-10"
                >
                  {t('workspace.onModel.viewBack')}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {t('workspace.batch.quality')}
              </p>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as BatchQuality)}
                className="w-full rounded-none border border-border bg-background px-2 py-2 text-base focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="draft">{t('workspace.batch.qualityDraft')}</option>
                <option value="standard">{t('workspace.batch.qualityStandard')}</option>
                <option value="high">{t('workspace.batch.qualityHigh')}</option>
              </select>
            </div>
          </section>

          {/* Aspect ratio */}
          <section className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('workspace.batch.aspectRatio')}
            </p>
            <div className="grid grid-cols-4 gap-1">
              {['1:1', '4:5', '16:9', '9:16'].map((r) => (
                <Button
                  key={r}
                  variant={aspectRatio === r ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => setAspectRatio(r)}
                  className="rounded-none min-h-10"
                >
                  {r}
                </Button>
              ))}
            </div>
          </section>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleStart}
            disabled={submitting || files.length === 0}
            className="min-h-12 rounded-none"
          >
            {submitting
              ? t('workspace.batch.starting')
              : t('workspace.batch.startBatch').replace('{count}', String(files.length))}
          </Button>

          {/* Active batch progress */}
          {activeJob && (
            <section className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {t('workspace.batch.activeProgress')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeJob.completedCount + activeJob.failedCount} / {activeJob.totalCount}
                  {activeJob.failedCount > 0 && (
                    <span className="ml-2 text-destructive">
                      {activeJob.failedCount} {t('workspace.batch.failed')}
                    </span>
                  )}
                </p>
              </div>
              <BatchProgressGrid
                items={activeItems}
                onRetry={(itemId) => retryItem(itemId, activeJob.id)}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

interface BatchProgressGridProps {
  items: Array<import('@/types/batch').BatchJobItem>
  onRetry: (itemId: string) => void
}

function BatchProgressGrid({ items, onRetry }: BatchProgressGridProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {items.map((item) => (
        <div key={item.id} className="relative aspect-square border border-border bg-muted/50">
          <img
            src={item.resultImageUrl ?? item.productImageUrl}
            alt="batch item"
            className="h-full w-full object-cover"
          />
          <span
            className={`absolute left-1 top-1 size-2.5 rounded-full border border-background ${
              item.status === 'completed'
                ? 'bg-green-500'
                : item.status === 'failed'
                  ? 'bg-red-500'
                  : item.status === 'processing'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-muted-foreground/60'
            }`}
            title={item.status}
          />
          {item.status === 'failed' && (
            <button
              onClick={() => onRetry(item.id)}
              className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[10px] text-white hover:text-green-400"
            >
              {t('workspace.batch.retry')}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
