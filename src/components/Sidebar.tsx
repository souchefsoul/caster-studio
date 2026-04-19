import { LogOut, User } from 'lucide-react'
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
import { DesignCopyPanel } from '@/components/DesignCopyPanel'
import { VideoPanel } from '@/components/VideoPanel'
import { BrandFacePanel } from '@/components/BrandFacePanel'
import type { GenerationMode, ActiveView } from '@/types/workspace'

const GENERATION_MODES: { key: GenerationMode; labelKey: string; enabled: boolean }[] = [
  { key: 'on-model', labelKey: 'workspace.sidebar.onModel', enabled: true },
  { key: 'catalog', labelKey: 'workspace.sidebar.catalog', enabled: true },
  { key: 'colorway', labelKey: 'workspace.sidebar.colorway', enabled: true },
  { key: 'design-copy', labelKey: 'workspace.sidebar.designCopy', enabled: true },
  { key: 'video', labelKey: 'workspace.sidebar.video', enabled: true },
]

const VIEW_TABS: { key: ActiveView; labelKey: string; icon: typeof User }[] = [
  { key: 'brand-face', labelKey: 'workspace.sidebar.brandFaceNav', icon: User },
]

export function Sidebar() {
  const currentMode = useWorkspaceStore((s) => s.currentMode)
  const setCurrentMode = useWorkspaceStore((s) => s.setCurrentMode)
  const activeView = useWorkspaceStore((s) => s.activeView)
  const setActiveView = useWorkspaceStore((s) => s.setActiveView)
  const { user } = useAuth()
  const { t } = useTranslation()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <aside
      className="relative w-full border-r border-border bg-background flex flex-col lg:w-[32rem]"
    >
      {/* Header */}
      <div className="border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <h1 className="text-base font-bold">{t('app.title')}</h1>
      </div>

      {/* Navigation */}
      <div className="border-b border-border px-3 py-3">
        <p className="mb-2 px-1 text-sm font-semibold uppercase text-muted-foreground">
          {t('workspace.sidebar.navigation')}
        </p>
        <nav className="flex flex-col gap-1">
          {/* TOUCH-02 audit: text-base confirmed on mode select — iOS option-label render stays 16px. */}
          <select
            value={activeView === 'workspace' ? currentMode : ''}
            onChange={(e) => setCurrentMode(e.target.value as GenerationMode)}
            className="w-full rounded-none border border-border bg-background px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {activeView !== 'workspace' && <option value="" disabled hidden />}
            {GENERATION_MODES.map((mode) => (
              <option key={mode.key} value={mode.key} disabled={!mode.enabled}>
                {t(mode.labelKey)}
              </option>
            ))}
          </select>

          {/* View tabs: Brand Face, Collections */}
          {VIEW_TABS.map((tab) => (
            <Button
              key={tab.key}
              variant="ghost"
              size="default"
              onClick={() => setActiveView(tab.key)}
              className={`
                justify-start rounded-none text-left text-base gap-2 min-h-10
                ${activeView === tab.key ? 'bg-accent text-accent-foreground' : ''}
              `}
            >
              <tab.icon className="size-4" />
              {t(tab.labelKey)}
            </Button>
          ))}
        </nav>
      </div>

      {/* Prompt & Controls (scrollable) — only shown when in workspace view */}
      {activeView === 'workspace' && (
        <div className="flex-1 overflow-y-auto border-b border-border px-3 py-3 scrollbar-thin">
          <BrandFacePanel />
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
          {currentMode === 'design-copy' && (
            <>
              <DesignCopyPanel />
              <div className="my-3 border-t border-border" />
            </>
          )}
          {currentMode === 'video' && (
            <>
              <VideoPanel />
              <div className="my-3 border-t border-border" />
            </>
          )}
          {currentMode !== 'colorway' && currentMode !== 'video' && currentMode !== 'catalog' && (
            <>
              <p className="mb-2 px-1 text-xs font-semibold uppercase text-muted-foreground">
                {t('workspace.sidebar.prompt')}
              </p>
              <PromptPanel />
              <div className="my-3 border-t border-border" />
            </>
          )}
          {currentMode !== 'video' && (
            <>
              <p className="mb-2 px-1 text-xs font-semibold uppercase text-muted-foreground">
                {t('workspace.sidebar.controls')}
              </p>
              <GenerationControls />
            </>
          )}
        </div>
      )}

      {/* Spacer when not in workspace view */}
      {activeView !== 'workspace' && <div className="flex-1" />}

      {/* Account */}
      <div className="border-t border-border px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
            className="rounded-none min-h-10 min-w-10"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
