import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

const AVAILABLE_ANGLES = [
  { key: 'front', labelKey: 'workspace.catalog.angleFront' },
  { key: 'back', labelKey: 'workspace.catalog.angleBack' },
  { key: 'side-left', labelKey: 'workspace.catalog.angleSideLeft' },
  { key: 'side-right', labelKey: 'workspace.catalog.angleSideRight' },
  { key: '3/4-front', labelKey: 'workspace.catalog.angle34Front' },
  { key: '3/4-back', labelKey: 'workspace.catalog.angle34Back' },
] as const

export function CatalogPanel() {
  const catalogAngles = useWorkspaceStore((s) => s.catalogAngles)
  const setCatalogAngles = useWorkspaceStore((s) => s.setCatalogAngles)
  const catalogProductImage = useWorkspaceStore((s) => s.catalogProductImage)
  const setCatalogProductImage = useWorkspaceStore((s) => s.setCatalogProductImage)
  const catalogProductBackImage = useWorkspaceStore((s) => s.catalogProductBackImage)
  const setCatalogProductBackImage = useWorkspaceStore((s) => s.setCatalogProductBackImage)
  const { t } = useTranslation()

  const toggleAngle = (angle: string) => {
    if (catalogAngles.includes(angle)) {
      setCatalogAngles(catalogAngles.filter((a) => a !== angle))
    } else {
      setCatalogAngles([...catalogAngles, angle])
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.catalog.productImage')}</p>
        <ImageUpload
          value={catalogProductImage}
          onChange={setCatalogProductImage}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.catalog.productBackImage')}</p>
        <ImageUpload
          value={catalogProductBackImage}
          onChange={setCatalogProductBackImage}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.catalog.anglesLabel')}</p>
        <div className="grid grid-cols-3 gap-1 md:grid-cols-4">
          {AVAILABLE_ANGLES.map((angle) => (
            <Button
              key={angle.key}
              variant={catalogAngles.includes(angle.key) ? 'default' : 'outline'}
              size="xs"
              onClick={() => toggleAngle(angle.key)}
              className="rounded-none min-h-10"
            >
              {t(angle.labelKey)}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('workspace.catalog.hintGenerated')}
        </p>
      </div>
    </div>
  )
}
