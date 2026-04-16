import { ImageUpload } from '@/components/ImageUpload'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

export function DesignCopyPanel() {
  const designCopyReferenceImage = useWorkspaceStore((s) => s.designCopyReferenceImage)
  const setDesignCopyReferenceImage = useWorkspaceStore((s) => s.setDesignCopyReferenceImage)
  const designCopyModifications = useWorkspaceStore((s) => s.designCopyModifications)
  const setDesignCopyModifications = useWorkspaceStore((s) => s.setDesignCopyModifications)
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.designCopy.referenceImage')}</p>
        <ImageUpload
          value={designCopyReferenceImage}
          onChange={setDesignCopyReferenceImage}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.designCopy.modifications')}</p>
        <textarea
          rows={3}
          value={designCopyModifications}
          onChange={(e) => setDesignCopyModifications(e.target.value)}
          placeholder={t('workspace.designCopy.modPlaceholder')}
          className="rounded-none border border-input bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none w-full"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {t('workspace.designCopy.hint')}
      </p>
    </div>
  )
}
