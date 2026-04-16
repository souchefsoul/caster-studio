import { ImageUpload } from '@/components/ImageUpload'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

const AVAILABLE_ANGLES = [
  { key: 'front', labelKey: 'workspace.onModel.angleFront', prompt: 'front-facing confident pose, looking directly at camera' },
  { key: 'back', labelKey: 'workspace.onModel.angleBack', prompt: 'back view, looking away from camera, showing the back of the garment' },
  { key: '3/4-left', labelKey: 'workspace.onModel.angle34Left', prompt: 'three-quarter view from the left, slight turn showing front and left side' },
  { key: '3/4-right', labelKey: 'workspace.onModel.angle34Right', prompt: 'three-quarter view from the right, slight turn showing front and right side' },
  { key: 'side-left', labelKey: 'workspace.onModel.angleSideLeft', prompt: 'full left side profile view' },
  { key: 'side-right', labelKey: 'workspace.onModel.angleSideRight', prompt: 'full right side profile view' },
] as const

export { AVAILABLE_ANGLES as ON_MODEL_ANGLES }

export function OnModelPanel() {
  const productImageDataUrl = useWorkspaceStore((s) => s.productImageDataUrl)
  const setProductImageDataUrl = useWorkspaceStore((s) => s.setProductImageDataUrl)
  const productImageBackDataUrl = useWorkspaceStore((s) => s.productImageBackDataUrl)
  const setProductImageBackDataUrl = useWorkspaceStore((s) => s.setProductImageBackDataUrl)
  const onModelAngles = useWorkspaceStore((s) => s.onModelAngles)
  const setOnModelAngles = useWorkspaceStore((s) => s.setOnModelAngles)
  const { t } = useTranslation()

  const toggleAngle = (angle: string) => {
    if (onModelAngles.includes(angle)) {
      setOnModelAngles(onModelAngles.filter((a) => a !== angle))
    } else {
      setOnModelAngles([...onModelAngles, angle])
    }
  }

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

      {/* Pose angles */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.onModel.angles')}</p>
        <div className="flex flex-col gap-1">
          {AVAILABLE_ANGLES.map((angle) => (
            <label
              key={angle.key}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={onModelAngles.includes(angle.key)}
                onChange={() => toggleAngle(angle.key)}
                className="rounded-none"
              />
              <span className="text-xs">{t(angle.labelKey)}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('workspace.onModel.anglesHint')}
        </p>
      </div>
    </div>
  )
}
