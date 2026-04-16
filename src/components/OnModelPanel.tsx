import { ImageUpload } from '@/components/ImageUpload'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

export function OnModelPanel() {
  const productImageDataUrl = useWorkspaceStore((s) => s.productImageDataUrl)
  const setProductImageDataUrl = useWorkspaceStore((s) => s.setProductImageDataUrl)
  const productImageBackDataUrl = useWorkspaceStore((s) => s.productImageBackDataUrl)
  const setProductImageBackDataUrl = useWorkspaceStore((s) => s.setProductImageBackDataUrl)
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3">
      {/* Front image */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.onModel.frontImage')}</p>
        <ImageUpload
          value={productImageDataUrl}
          onChange={setProductImageDataUrl}
        />
      </div>

      {/* Back image */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.onModel.backImage')}</p>
        <ImageUpload
          value={productImageBackDataUrl}
          onChange={setProductImageBackDataUrl}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {t('workspace.onModel.uploadHint')}
      </p>
    </div>
  )
}
