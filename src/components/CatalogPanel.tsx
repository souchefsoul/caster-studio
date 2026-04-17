import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

const AVAILABLE_ANGLES = [
  { key: 'front', label: 'Önden' },
  { key: 'back', label: 'Arkadan' },
  { key: 'side-left', label: 'Sol Yan' },
  { key: 'side-right', label: 'Sağ Yan' },
  { key: '3/4-front', label: '3/4 Ön' },
  { key: '3/4-back', label: '3/4 Arka' },
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
        <p className="text-xs font-medium">Açılar</p>
        <div className="grid grid-cols-4 gap-1">
          {AVAILABLE_ANGLES.map((angle) => (
            <Button
              key={angle.key}
              variant={catalogAngles.includes(angle.key) ? 'default' : 'outline'}
              size="xs"
              onClick={() => toggleAngle(angle.key)}
              className="rounded-none"
            >
              {angle.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Her seçilen açı için bir görsel üretilir.
        </p>
      </div>
    </div>
  )
}
