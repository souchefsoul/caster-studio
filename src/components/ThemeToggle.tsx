import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

export function ThemeToggle() {
  const theme = useWorkspaceStore((s) => s.theme)
  const toggleTheme = useWorkspaceStore((s) => s.toggleTheme)
  const { t } = useTranslation()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      title={t('workspace.theme.toggle')}
      className="rounded-none min-h-10 min-w-10"
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
