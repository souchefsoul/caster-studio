import { useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Canvas } from '@/components/Canvas'
import { BrandFaceView } from '@/components/BrandFaceView'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useGenerations } from '@/hooks/useGenerations'
import { useTranslation } from '@/hooks/useTranslation'

export function WorkspaceLayout() {
  const sidebarOpen = useWorkspaceStore((s) => s.sidebarOpen)
  const setSidebarOpen = useWorkspaceStore((s) => s.setSidebarOpen)
  const activeView = useWorkspaceStore((s) => s.activeView)
  const currentMode = useWorkspaceStore((s) => s.currentMode)

  useEffect(() => {
    // Below lg, navigation (mode switch or view switch) should return the user to the canvas.
    // On lg+ the sidebar is always visible as a fixed column, so this is a no-op.
    if (typeof window === 'undefined') return
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    if (isDesktop) return
    setSidebarOpen(false)
  }, [currentMode, activeView, setSidebarOpen])

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
    </div>
  )
}
