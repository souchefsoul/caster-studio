import { Grid3x3, Maximize2, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

export function Canvas() {
  const canvasViewMode = useWorkspaceStore((s) => s.canvasViewMode)
  const setCanvasViewMode = useWorkspaceStore((s) => s.setCanvasViewMode)
  const generations = useWorkspaceStore((s) => s.generations)
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar)
  const { t } = useTranslation()

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
        ) : canvasViewMode === 'single' ? (
          <div className="flex h-full items-center justify-center">
            {generations[0].imageUrl && (
              <img
                src={generations[0].imageUrl}
                alt={generations[0].prompt}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className="aspect-square border border-border bg-muted"
              >
                {gen.thumbnailUrl || gen.imageUrl ? (
                  <img
                    src={gen.thumbnailUrl ?? gen.imageUrl!}
                    alt={gen.prompt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    {gen.status}
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
