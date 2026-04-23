import { Link } from 'react-router-dom'
import { ArrowUpRight, Trash2, X } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useBatchJobs } from '@/hooks/useBatchJobs'
import type { BatchJob, BatchJobItem } from '@/types/batch'

export function QueueDrawer() {
  const open = useWorkspaceStore((s) => s.queueDrawerOpen)
  const setOpen = useWorkspaceStore((s) => s.setQueueDrawerOpen)
  const { jobs, itemsByJob, retryItem, deleteJob, loadItems } = useBatchJobs()
  const { t } = useTranslation()

  if (!open) return null

  const visibleJobs = jobs.slice(0, 10)

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-border bg-background shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <h2 className="text-sm font-semibold">{t('workspace.queue.title')}</h2>
          <div className="flex items-center gap-1">
            <Link
              to="/batch"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-10 items-center gap-1.5 border border-border bg-background px-2.5 text-xs hover:bg-accent rounded-none"
            >
              {t('workspace.queue.openBatch')}
              <ArrowUpRight className="size-3" />
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="flex min-h-10 min-w-10 items-center justify-center border border-border bg-background hover:bg-accent rounded-none"
              aria-label={t('workspace.queue.close')}
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {visibleJobs.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6">
              <p className="text-sm text-muted-foreground">{t('workspace.queue.empty')}</p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {visibleJobs.map((job) => (
                <QueueDrawerJobRow
                  key={job.id}
                  job={job}
                  items={itemsByJob[job.id] ?? []}
                  onRetry={(itemId) => retryItem(itemId, job.id)}
                  onDelete={() => deleteJob(job.id)}
                  onExpand={() => loadItems(job.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}

interface RowProps {
  job: BatchJob
  items: BatchJobItem[]
  onRetry: (itemId: string) => void
  onDelete: () => void
  onExpand: () => void
}

function QueueDrawerJobRow({ job, items, onRetry, onDelete, onExpand }: RowProps) {
  const { t } = useTranslation()
  const done = job.completedCount + job.failedCount
  const pct = job.totalCount > 0 ? Math.round((done / job.totalCount) * 100) : 0
  const statusColor =
    job.status === 'completed'
      ? 'bg-green-500'
      : job.status === 'failed'
        ? 'bg-red-500'
        : job.status === 'cancelled'
          ? 'bg-muted-foreground'
          : 'bg-amber-500'

  return (
    <li className="flex flex-col gap-2 border-b border-border px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`size-2.5 rounded-full ${statusColor}`} />
          <p className="truncate text-sm font-medium">
            {job.name ?? t('workspace.queue.unnamedBatch')}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDelete}
            className="flex min-h-9 min-w-9 items-center justify-center border border-border bg-background text-muted-foreground hover:bg-accent hover:text-destructive rounded-none"
            title={t('workspace.queue.deleteJob')}
            aria-label={t('workspace.queue.deleteJob')}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {done} / {job.totalCount}
          {job.failedCount > 0 && (
            <span className="ml-2 text-destructive">
              {job.failedCount} {t('workspace.batch.failed')}
            </span>
          )}
        </span>
        <span>{pct}%</span>
      </div>

      {/* progress bar */}
      <div className="h-1 w-full bg-muted">
        <div
          className={`h-full transition-all ${job.failedCount > 0 && job.completedCount === 0 ? 'bg-destructive' : 'bg-foreground'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* items strip */}
      {items.length > 0 ? (
        <div className="grid grid-cols-6 gap-1 sm:grid-cols-8">
          {items.slice(0, 16).map((item) => (
            <button
              key={item.id}
              onClick={item.status === 'failed' ? () => onRetry(item.id) : undefined}
              className="group relative aspect-square border border-border bg-muted/50"
              title={item.status === 'failed' ? t('workspace.batch.retry') : item.status}
            >
              <img
                src={item.resultImageUrl ?? item.productImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <span
                className={`absolute right-0.5 top-0.5 size-2 rounded-full ${
                  item.status === 'completed'
                    ? 'bg-green-500'
                    : item.status === 'failed'
                      ? 'bg-red-500'
                      : item.status === 'processing'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      ) : (
        job.status === 'running' && (
          <button
            onClick={onExpand}
            className="self-start text-[11px] text-muted-foreground hover:text-foreground"
          >
            {t('workspace.queue.showItems')}
          </button>
        )
      )}
    </li>
  )
}
