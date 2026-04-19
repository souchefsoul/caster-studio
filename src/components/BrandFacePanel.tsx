import { useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useBrandModels } from '@/hooks/useBrandModels'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

export function BrandFacePanel() {
  const { models, activeModel, loading, setActive } = useBrandModels()
  const setActiveBrandFaceUrl = useWorkspaceStore((s) => s.setActiveBrandFaceUrl)
  const setActiveView = useWorkspaceStore((s) => s.setActiveView)
  const { t } = useTranslation()

  const [collapsed, setCollapsed] = useState(true)

  const handleSetActive = async (model: { id: string; faceImageUrl: string }) => {
    await setActive(model.id)
    setActiveBrandFaceUrl(model.faceImageUrl)
  }

  // Sync active brand face URL on initial load
  useEffect(() => {
    if (activeModel) {
      setActiveBrandFaceUrl(activeModel.faceImageUrl)
    }
  }, [activeModel, setActiveBrandFaceUrl])

  // Show max 8 models in the grid
  const gridModels = models.slice(0, 8)

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex min-h-10 items-center gap-1 px-1 text-xs font-semibold uppercase text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className={`size-3 transition-transform ${collapsed ? '' : 'rotate-90'}`} />
        {t('workspace.brandFace.title')}
      </button>

      {!collapsed && (
        <>
          {loading && (
            <p className="px-1 text-xs text-muted-foreground">
              {t('workspace.brandFace.loading')}
            </p>
          )}

          {!loading && models.length === 0 && (
            <p className="px-1 text-xs text-muted-foreground">
              {t('workspace.brandFace.noModels')}
            </p>
          )}

          {!loading && gridModels.length > 0 && (
            <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
              {gridModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleSetActive(model)}
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

          {/* View All / Add New → navigate to brand face page */}
          <button
            type="button"
            onClick={() => setActiveView('brand-face')}
            className="w-full min-h-10 border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {t('workspace.brandFace.viewAll')} &rarr;
          </button>
        </>
      )}
    </div>
  )
}
