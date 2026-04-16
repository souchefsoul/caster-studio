import { ImageUpload } from '@/components/ImageUpload'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

export function OnModelPanel() {
  const productImageDataUrl = useWorkspaceStore((s) => s.productImageDataUrl)
  const setProductImageDataUrl = useWorkspaceStore((s) => s.setProductImageDataUrl)
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium">{t('workspace.onModel.productImage')}</p>
      <ImageUpload
        value={productImageDataUrl}
        onChange={setProductImageDataUrl}
      />
      <p className="text-xs text-muted-foreground">
        {t('workspace.onModel.uploadHint')}
      </p>
    </div>
  )
}
