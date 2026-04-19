import { Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/Sidebar'
import { Canvas } from '@/components/Canvas'
import { BrandFaceView } from '@/components/BrandFaceView'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useGenerations } from '@/hooks/useGenerations'
import { useTranslation } from '@/hooks/useTranslation'

export function WorkspaceLayout() {
  const activeView = useWorkspaceStore((s) => s.activeView)
  const galleryOpen = useWorkspaceStore((s) => s.galleryOpen)
  const setGalleryOpen = useWorkspaceStore((s) => s.setGalleryOpen)

  const { loading } = useGenerations()
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('workspace.canvas.loadingHistory')}</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      {/* Mobile-only top bar — holds the Gallery trigger. Hidden at lg+ so desktop layout is unchanged. */}
      <div className="flex items-center justify-between border-b border-border bg-background px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] lg:hidden">
        <h1 className="text-sm font-bold">{t('app.title')}</h1>
        <Button
          variant="ghost"
          size="default"
          onClick={() => setGalleryOpen(true)}
          data-gallery-trigger="true"
          aria-label={t('workspace.topbar.gallery')}
          className="min-h-10 min-w-10 gap-2 rounded-none"
        >
          <Images className="size-4" />
          <span className="text-sm">{t('workspace.topbar.gallery')}</span>
        </Button>
      </div>

      {/* Primary row: Sidebar (primary on mobile, left column on lg+) + main canvas area (lg+ only, hidden on mobile) */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Canvas/BrandFaceView column — visible on lg+ inline; on mobile these render ONLY via the gallery overlay below. */}
        <div className="hidden flex-1 overflow-hidden lg:flex">
          {activeView === 'workspace' && <Canvas />}
          {activeView === 'brand-face' && <BrandFaceView />}
        </div>
      </div>

      {/* Mobile gallery overlay — full-screen above the sidebar/generator when galleryOpen. Gated lg:hidden so desktop never sees this. */}
      {galleryOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-background lg:hidden">
          {activeView === 'workspace' && <Canvas />}
          {activeView === 'brand-face' && <BrandFaceView />}
        </div>
      )}
    </div>
  )
}
