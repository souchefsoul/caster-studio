import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

export function PromptPanel() {
  const params = useWorkspaceStore((s) => s.params)
  const setParams = useWorkspaceStore((s) => s.setParams)
  const { t } = useTranslation()
  const [negativeOpen, setNegativeOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      {/* Main Prompt */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">{t('workspace.prompt.label')}</Label>
        <textarea
          rows={4}
          value={params.prompt}
          onChange={(e) => setParams({ prompt: e.target.value })}
          placeholder={t('workspace.prompt.placeholder')}
          className="w-full resize-none rounded-none border border-input bg-background px-2.5 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      {/* Negative Prompt (collapsible) */}
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setNegativeOpen(!negativeOpen)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {negativeOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          {t('workspace.prompt.negative')}
        </button>
        {negativeOpen && (
          <textarea
            rows={2}
            value={params.negativePrompt}
            onChange={(e) => setParams({ negativePrompt: e.target.value })}
            placeholder={t('workspace.prompt.negativePlaceholder')}
            className="w-full resize-none rounded-none border border-input bg-background px-2.5 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        )}
      </div>
    </div>
  )
}
