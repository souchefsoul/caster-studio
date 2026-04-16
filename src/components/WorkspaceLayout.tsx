import { Sidebar } from '@/components/Sidebar'
import { Canvas } from '@/components/Canvas'
import { useWorkspaceStore } from '@/stores/workspaceStore'

export function WorkspaceLayout() {
  const sidebarOpen = useWorkspaceStore((s) => s.sidebarOpen)
  const setSidebarOpen = useWorkspaceStore((s) => s.setSidebarOpen)

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

      <Canvas />
    </div>
  )
}
