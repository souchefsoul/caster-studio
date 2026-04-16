import { useState, useRef, useEffect } from 'react'
import { Check, Download, FolderPlus, Grid3x3, Maximize2, Menu, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useCollections } from '@/hooks/useCollections'

export function Canvas() {
  const canvasViewMode = useWorkspaceStore((s) => s.canvasViewMode)
  const setCanvasViewMode = useWorkspaceStore((s) => s.setCanvasViewMode)
  const generations = useWorkspaceStore((s) => s.generations)
  const selectedGenerationId = useWorkspaceStore((s) => s.selectedGenerationId)
  const setSelectedGenerationId = useWorkspaceStore((s) => s.setSelectedGenerationId)
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar)
  const clearFailedGenerations = useWorkspaceStore((s) => s.clearFailedGenerations)
  const { t } = useTranslation()
  const {
    collections,
    activeCollectionId,
    activeCollectionItemIds,
    addItem,
  } = useCollections()

  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCollectionDropdownOpen(false)
      }
    }
    if (collectionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [collectionDropdownOpen])

  // Filter generations by active collection in grid view
  const filteredGenerations = activeCollectionId
    ? generations.filter((g) => activeCollectionItemIds.includes(g.id))
    : generations

  // Find the selected generation, or fall back to the most recent one
  const selectedGen = generations.find((g) => g.id === selectedGenerationId) ?? generations[0] ?? null

  const handleGridClick = (id: string) => {
    setSelectedGenerationId(id)
    setCanvasViewMode('single')
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant={canvasViewMode === 'single' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setCanvasViewMode('single')}
            title={t('workspace.canvas.singleView')}
            className="rounded-none"
          >
            <Maximize2 className="size-4" />
          </Button>
          <Button
            variant={canvasViewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setCanvasViewMode('grid')}
            title={t('workspace.canvas.gridView')}
            className="rounded-none"
          >
            <Grid3x3 className="size-4" />
          </Button>
          <span className="ml-2 text-xs text-muted-foreground">
            {canvasViewMode === 'single'
              ? t('workspace.canvas.singleView')
              : t('workspace.canvas.gridView')}
          </span>
          {generations.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              {canvasViewMode === 'grid' && activeCollectionId
                ? `${filteredGenerations.length} / ${generations.length}`
                : generations.length}{' '}
              {t('workspace.canvas.generationCount')}
            </span>
          )}
          {generations.some((g) => g.status === 'failed') && (
            <button
              onClick={clearFailedGenerations}
              className="ml-2 inline-flex h-7 items-center gap-1 border border-border bg-background px-2 text-xs text-destructive hover:bg-accent rounded-none"
            >
              <Trash2 className="size-3" />
            </button>
          )}
          {canvasViewMode === 'single' && selectedGen?.status === 'completed' && selectedGen?.imageUrl && (
            <>
              <a
                href={selectedGen.imageUrl}
                download={`${selectedGen.prompt.slice(0, 30)}.png`}
                className="ml-2 inline-flex h-7 items-center gap-1 border border-border bg-background px-2 text-xs hover:bg-accent rounded-none"
                title={t('workspace.canvas.download')}
              >
                <Download className="size-4" />
                {t('workspace.canvas.download')}
              </a>
              {/* Add to Collection dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCollectionDropdownOpen((v) => !v)}
                  className="ml-1 inline-flex h-7 items-center gap-1 border border-border bg-background px-2 text-xs hover:bg-accent rounded-none"
                  title={t('workspace.collections.addTo')}
                >
                  <FolderPlus className="size-4" />
                  {t('workspace.collections.addTo')}
                </button>
                {collectionDropdownOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 min-w-48 border border-border bg-background shadow-sm">
                    {collections.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-muted-foreground">
                        {t('workspace.collections.empty')}
                      </p>
                    ) : (
                      collections.map((col) => {
                        const isInCollection = activeCollectionItemIds.includes(selectedGen.id)
                          && activeCollectionId === col.id
                        return (
                          <button
                            key={col.id}
                            onClick={() => {
                              addItem(col.id, selectedGen.id)
                              setCollectionDropdownOpen(false)
                            }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent"
                          >
                            {isInCollection && <Check className="size-3 text-green-500" />}
                            <span className="truncate">{col.name}</span>
                            <span className="ml-auto shrink-0 text-muted-foreground">
                              {col.itemCount}
                            </span>
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Hamburger - visible below lg */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          className="rounded-none lg:hidden"
        >
          <Menu className="size-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
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
              <img
                src={selectedGen.imageUrl}
                alt={selectedGen.prompt}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredGenerations.map((gen) => (
              <div
                key={gen.id}
                onClick={() => handleGridClick(gen.id)}
                className="relative aspect-square cursor-pointer border border-border bg-muted hover:border-primary"
              >
                {/* Status dot */}
                <span
                  className={`absolute right-1 top-1 z-10 size-2 ${
                    gen.status === 'completed'
                      ? 'bg-green-500'
                      : gen.status === 'failed'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`}
                />

                {gen.status === 'completed' && (gen.thumbnailUrl || gen.imageUrl) ? (
                  <img
                    src={gen.thumbnailUrl ?? gen.imageUrl!}
                    alt={gen.prompt}
                    className="h-full w-full object-cover"
                  />
                ) : gen.status === 'failed' ? (
                  <div className="flex h-full flex-col items-center justify-center gap-1 p-2">
                    <p className="text-xs text-destructive">
                      {gen.errorMessage || t('workspace.canvas.failed')}
                    </p>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="animate-pulse text-xs text-muted-foreground">
                      {t('workspace.controls.generating')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
