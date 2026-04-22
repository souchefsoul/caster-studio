import { Check, CheckSquare, Grid3x3, Maximize2, Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useGenerations } from '@/hooks/useGenerations'
export function Canvas() {
  const canvasViewMode = useWorkspaceStore((s) => s.canvasViewMode)
  const setCanvasViewMode = useWorkspaceStore((s) => s.setCanvasViewMode)
  const generations = useWorkspaceStore((s) => s.generations)
  const selectedGenerationId = useWorkspaceStore((s) => s.selectedGenerationId)
  const setSelectedGenerationId = useWorkspaceStore((s) => s.setSelectedGenerationId)
  const setGalleryOpen = useWorkspaceStore((s) => s.setGalleryOpen)
  const clearFailedGenerations = useWorkspaceStore((s) => s.clearFailedGenerations)
  const setCurrentMode = useWorkspaceStore((s) => s.setCurrentMode)
  const setVideoSourceImage = useWorkspaceStore((s) => s.setVideoSourceImage)
  const selectionMode = useWorkspaceStore((s) => s.selectionMode)
  const selectedIds = useWorkspaceStore((s) => s.selectedIds)
  const setSelectionMode = useWorkspaceStore((s) => s.setSelectionMode)
  const toggleSelectionMode = useWorkspaceStore((s) => s.toggleSelectionMode)
  const toggleSelected = useWorkspaceStore((s) => s.toggleSelected)
  const setSelectedIds = useWorkspaceStore((s) => s.setSelectedIds)
  const { t } = useTranslation()
  const { removeAndDelete, removeAndDeleteMany } = useGenerations()

  const handleDelete = (genId: string) => {
    if (!confirm(t('workspace.canvas.deleteConfirm'))) return
    removeAndDelete(genId)
    if (selectedGenerationId === genId) {
      setSelectedGenerationId(null)
    }
  }

  const handleGoToVideo = (imageUrl: string) => {
    setVideoSourceImage(imageUrl)
    setCurrentMode('video')
  }

  // Find the selected generation, or fall back to the most recent one
  const selectedGen = generations.find((g) => g.id === selectedGenerationId) ?? generations[0] ?? null

  const handleGridClick = (id: string) => {
    if (selectionMode) {
      toggleSelected(id)
      return
    }
    setSelectedGenerationId(id)
    setCanvasViewMode('single')
  }

  // Selection mode is grid-only; entering it snaps the view.
  const enterSelectionMode = () => {
    setCanvasViewMode('grid')
    setSelectionMode(true)
  }

  const selectableIds = generations
    .filter((g) => g.status === 'completed' && g.imageUrl)
    .map((g) => g.id)
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id))
  const selectedSet = new Set(selectedIds)

  const handleToggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : selectableIds)
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    const msg = t('workspace.canvas.deleteSelectedConfirm').replace('{count}', String(selectedIds.length))
    if (!confirm(msg)) return
    const ids = [...selectedIds]
    await removeAndDeleteMany(ids)
    if (selectedGenerationId && ids.includes(selectedGenerationId)) {
      setSelectedGenerationId(null)
    }
    setSelectionMode(false)
  }

  const handleDownloadSelected = async () => {
    const items = generations.filter(
      (g) => selectedSet.has(g.id) && g.status === 'completed' && g.imageUrl
    )
    for (const gen of items) {
      const a = document.createElement('a')
      a.href = gen.imageUrl!
      a.download = `${gen.prompt.slice(0, 30)}.${gen.mode === 'video' ? 'mp4' : 'png'}`
      a.rel = 'noopener'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      a.remove()
      // Small gap so browsers don't coalesce or block multi-file downloads.
      await new Promise((r) => setTimeout(r, 180))
    }
  }

  // Shared button style for toolbar actions
  const toolbarBtn = "ml-1 inline-flex min-h-10 items-center px-2.5 text-xs border border-border bg-background hover:bg-accent rounded-none"

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center gap-1 flex-wrap">
          <Button
            variant={canvasViewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setCanvasViewMode('grid')}
            title={t('workspace.canvas.gridView')}
            className="min-h-10 min-w-10 rounded-none"
            disabled={selectionMode}
          >
            <Grid3x3 className="size-4" />
          </Button>
          <Button
            variant={canvasViewMode === 'single' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setCanvasViewMode('single')}
            title={t('workspace.canvas.singleView')}
            className="min-h-10 min-w-10 rounded-none"
            disabled={selectionMode}
          >
            <Maximize2 className="size-4" />
          </Button>
          {selectableIds.length > 0 && (
            <Button
              variant={selectionMode ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={selectionMode ? toggleSelectionMode : enterSelectionMode}
              title={t('workspace.canvas.select')}
              aria-pressed={selectionMode}
              className="min-h-10 min-w-10 rounded-none"
            >
              <CheckSquare className="size-4" />
            </Button>
          )}
          {generations.length > 0 && !selectionMode && (
            <span className="ml-2 min-w-0 truncate text-xs text-muted-foreground">
              {generations.length} {t('workspace.canvas.generationCount')}
            </span>
          )}
          {selectionMode && (
            <span className="ml-2 min-w-0 truncate text-xs text-muted-foreground">
              {t('workspace.canvas.selectedCount').replace('{count}', String(selectedIds.length))}
            </span>
          )}
          {!selectionMode && generations.some((g) => g.status === 'failed') && (
            <button
              onClick={clearFailedGenerations}
              className="ml-2 inline-flex min-h-10 items-center px-2 text-xs text-destructive border border-border bg-background hover:bg-accent rounded-none"
            >
              {t('workspace.canvas.delete')}
            </button>
          )}

          {/* Selection-mode actions */}
          {selectionMode && (
            <>
              <button
                onClick={handleToggleSelectAll}
                className={toolbarBtn}
                disabled={selectableIds.length === 0}
              >
                {allSelected ? t('workspace.canvas.deselectAll') : t('workspace.canvas.selectAll')}
              </button>
              <button
                onClick={handleDownloadSelected}
                className={toolbarBtn}
                disabled={selectedIds.length === 0}
              >
                {t('workspace.canvas.downloadSelected')}
              </button>
              <button
                onClick={handleDeleteSelected}
                className={`${toolbarBtn} text-destructive`}
                disabled={selectedIds.length === 0}
              >
                {t('workspace.canvas.deleteSelected')}
              </button>
              <button
                onClick={toggleSelectionMode}
                className={toolbarBtn}
              >
                {t('workspace.canvas.cancelSelection')}
              </button>
            </>
          )}

          {/* Single view actions */}
          {!selectionMode && canvasViewMode === 'single' && selectedGen?.status === 'completed' && selectedGen?.imageUrl && (
            <>
              <a
                href={selectedGen.imageUrl}
                download={`${selectedGen.prompt.slice(0, 30)}.${selectedGen.mode === 'video' ? 'mp4' : 'png'}`}
                className={toolbarBtn}
              >
                {t('workspace.canvas.download')}
              </a>

              <button
                onClick={() => handleDelete(selectedGen.id)}
                className={`${toolbarBtn} text-destructive`}
              >
                {t('workspace.canvas.delete')}
              </button>

              {selectedGen.mode !== 'video' && (
                <button
                  onClick={() => handleGoToVideo(selectedGen.imageUrl!)}
                  className={toolbarBtn}
                >
                  {t('workspace.canvas.createVideo')}
                </button>
              )}
            </>
          )}
        </div>

        {/* Close-gallery button — visible below lg only (gallery overlay is mobile-only). */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setGalleryOpen(false)
            // Focus-return to the Gallery trigger in the mobile top bar after the overlay unmounts.
            queueMicrotask(() => {
              const trigger = document.querySelector<HTMLButtonElement>('[data-gallery-trigger="true"]')
              if (trigger) trigger.focus()
            })
          }}
          data-gallery-close="true"
          aria-label={t('workspace.topbar.closeGallery')}
          title={t('workspace.topbar.closeGallery')}
          className="min-h-10 min-w-10 rounded-none lg:hidden"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Content */}
      <div
        className={`flex-1 overflow-y-auto scrollbar-thin ${
          canvasViewMode === 'single' ? 'p-0 lg:p-4' : 'p-4'
        }`}
      >
        {generations.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              {t('workspace.canvas.empty')}
            </p>
          </div>
        ) : canvasViewMode === 'single' && selectedGen ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            {(selectedGen.status === 'pending' || selectedGen.status === 'processing') && (
              <p className="animate-pulse text-sm text-muted-foreground">
                {t('workspace.controls.generating')}
              </p>
            )}
            {selectedGen.status === 'failed' && (
              <p className="text-sm text-destructive">
                {selectedGen.errorMessage || t('workspace.canvas.failed')}
              </p>
            )}
            {selectedGen.status === 'completed' && selectedGen.imageUrl && (
              selectedGen.mode === 'video' ? (
                <video
                  src={selectedGen.imageUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-h-full max-w-full"
                />
              ) : (
                <img
                  src={selectedGen.imageUrl}
                  alt={selectedGen.prompt}
                  className="max-h-full max-w-full object-contain"
                />
              )
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {generations.map((gen) => {
              const isSelected = selectedSet.has(gen.id)
              const selectable = gen.status === 'completed' && !!gen.imageUrl
              return (
              <div
                key={gen.id}
                className={`group relative aspect-square border bg-muted ${
                  selectionMode && isSelected
                    ? 'border-primary ring-2 ring-primary ring-offset-1 ring-offset-background'
                    : 'border-border hover:border-primary'
                }`}
              >
                {gen.status === 'completed' && (gen.thumbnailUrl || gen.imageUrl) ? (
                  <>
                    <img
                      src={gen.thumbnailUrl ?? gen.imageUrl!}
                      alt={gen.prompt}
                      className="h-full w-full cursor-pointer object-cover"
                      onClick={() => handleGridClick(gen.id)}
                    />
                    {gen.mode === 'video' && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-black/60 p-2">
                          <Play className="size-6 fill-white text-white" />
                        </div>
                      </div>
                    )}
                    {/* Selection checkbox overlay */}
                    {selectionMode && selectable && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleSelected(gen.id) }}
                        aria-pressed={isSelected}
                        aria-label={t('workspace.canvas.select')}
                        className={`absolute left-2 top-2 flex size-6 items-center justify-center border ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-white/80 bg-black/40 text-transparent hover:bg-black/60'
                        }`}
                      >
                        <Check className="size-4" />
                      </button>
                    )}
                    {/* Hover overlay with text buttons (hidden in selection mode) */}
                    {!selectionMode && (
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/70 px-2 py-1.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(gen.id) }}
                            className="text-[11px] text-white/80 hover:text-red-400 transition-colors"
                          >
                            {t('workspace.canvas.delete')}
                          </button>
                          {gen.mode !== 'video' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleGoToVideo(gen.imageUrl!) }}
                              className="text-[11px] text-white/80 hover:text-blue-400 transition-colors"
                            >
                              {t('workspace.canvas.createVideo')}
                            </button>
                          )}
                        </div>
                        <a
                          href={gen.imageUrl!}
                          download={`${gen.prompt.slice(0, 30)}.${gen.mode === 'video' ? 'mp4' : 'png'}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-white/80 hover:text-green-400 transition-colors"
                        >
                          {t('workspace.canvas.download')}
                        </a>
                      </div>
                    )}
                  </>
                ) : gen.status === 'failed' ? (
                  <div className="flex h-full flex-col items-center justify-center gap-1 p-2">
                    <p className="text-xs text-destructive">
                      {gen.errorMessage || t('workspace.canvas.failed')}
                    </p>
                    <button
                      onClick={() => handleDelete(gen.id)}
                      className="mt-1 text-[11px] text-destructive hover:text-red-400"
                    >
                      {t('workspace.canvas.delete')}
                    </button>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="animate-pulse text-xs text-muted-foreground">
                      {t('workspace.controls.generating')}
                    </p>
                  </div>
                )}
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
