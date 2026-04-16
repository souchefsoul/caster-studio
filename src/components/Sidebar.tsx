import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { signOut } from '@/lib/auth'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PromptPanel } from '@/components/PromptPanel'
import { GenerationControls } from '@/components/GenerationControls'
import { OnModelPanel } from '@/components/OnModelPanel'
import { CatalogPanel } from '@/components/CatalogPanel'
import { ColorwayPanel } from '@/components/ColorwayPanel'
import { BrandFacePanel } from '@/components/BrandFacePanel'
import { CollectionsPanel } from '@/components/CollectionsPanel'
import type { GenerationMode } from '@/types/workspace'

const GENERATION_MODES: { key: GenerationMode; labelKey: string; enabled: boolean }[] = [
  { key: 'on-model', labelKey: 'workspace.sidebar.onModel', enabled: true },
  { key: 'catalog', labelKey: 'workspace.sidebar.catalog', enabled: true },
  { key: 'colorway', labelKey: 'workspace.sidebar.colorway', enabled: true },
  { key: 'design-copy', labelKey: 'workspace.sidebar.designCopy', enabled: false },
  { key: 'text-to-image', labelKey: 'workspace.sidebar.textToImage', enabled: false },
]

export function Sidebar() {
  const sidebarOpen = useWorkspaceStore((s) => s.sidebarOpen)
  const currentMode = useWorkspaceStore((s) => s.currentMode)
  const setCurrentMode = useWorkspaceStore((s) => s.setCurrentMode)
  const { user } = useAuth()
  const { t } = useTranslation()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <aside
      className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-background
        flex flex-col
        lg:static lg:translate-x-0
      `}
    >
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-base font-bold">{t('app.title')}</h1>
      </div>

      {/* Navigation */}
      <div className="border-b border-border px-3 py-3">
        <p className="mb-2 px-1 text-xs font-semibold uppercase text-muted-foreground">
          {t('workspace.sidebar.navigation')}
        </p>
        <nav className="flex flex-col gap-0.5">
          {GENERATION_MODES.map((mode) => (
            <Button
              key={mode.key}
              variant="ghost"
              size="sm"
              disabled={!mode.enabled}
              onClick={() => setCurrentMode(mode.key)}
              className={`
                justify-start rounded-none text-left
                ${currentMode === mode.key ? 'bg-accent text-accent-foreground' : ''}
              `}
            >
              {t(mode.labelKey)}
            </Button>
          ))}
        </nav>
      </div>

      {/* Prompt & Controls (scrollable) */}
      <div className="flex-1 overflow-y-auto border-b border-border px-3 py-3 scrollbar-thin">
        <BrandFacePanel />
        <div className="my-3 border-t border-border" />
        <CollectionsPanel />
        <div className="my-3 border-t border-border" />
        {currentMode === 'on-model' && (
          <>
            <OnModelPanel />
            <div className="my-3 border-t border-border" />
          </>
        )}
        {currentMode === 'catalog' && (
          <>
            <CatalogPanel />
            <div className="my-3 border-t border-border" />
          </>
        )}
        {currentMode === 'colorway' && (
          <>
            <ColorwayPanel />
            <div className="my-3 border-t border-border" />
          </>
        )}
        <p className="mb-2 px-1 text-xs font-semibold uppercase text-muted-foreground">
          {t('workspace.sidebar.prompt')}
        </p>
        <PromptPanel />
        <div className="my-3 border-t border-border" />
        <p className="mb-2 px-1 text-xs font-semibold uppercase text-muted-foreground">
          {t('workspace.sidebar.controls')}
        </p>
        <GenerationControls />
      </div>

      {/* Account */}
      <div className="border-t border-border px-3 py-3">
        <p className="mb-2 px-1 text-xs font-semibold uppercase text-muted-foreground">
          {t('workspace.sidebar.account')}
        </p>
        {user?.email && (
          <p className="mb-2 truncate px-1 text-xs text-muted-foreground">
            {user.email}
          </p>
        )}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            title={t('common.signOut')}
            className="rounded-none"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
