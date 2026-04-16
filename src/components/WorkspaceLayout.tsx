import { Sidebar } from '@/components/Sidebar'
import { Canvas } from '@/components/Canvas'
import { BrandFaceView } from '@/components/BrandFaceView'
import { CollectionsView } from '@/components/CollectionsView'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useGenerations } from '@/hooks/useGenerations'
import { useTranslation } from '@/hooks/useTranslation'

export function WorkspaceLayout() {
  const sidebarOpen = useWorkspaceStore((s) => s.sidebarOpen)
  const setSidebarOpen = useWorkspaceStore((s) => s.setSidebarOpen)
  const activeView = useWorkspaceStore((s) => s.activeView)
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area — switches based on activeView */}
      {activeView === 'workspace' && <Canvas />}
      {activeView === 'brand-face' && <BrandFaceView />}
      {activeView === 'collections' && <CollectionsView />}
    </div>
  )
}
