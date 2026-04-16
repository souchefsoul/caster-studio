import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ImageUpload'
import { useBrandModels } from '@/hooks/useBrandModels'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

export function BrandFacePanel() {
  const { models, activeModel, loading, create, remove, setActive } = useBrandModels()
  const setActiveBrandFaceUrl = useWorkspaceStore((s) => s.setActiveBrandFaceUrl)
  const { t } = useTranslation()

  const [view, setView] = useState<'list' | 'create'>('list')
  const [name, setName] = useState('')
  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSetActive = async (model: { id: string; faceImageUrl: string }) => {
    await setActive(model.id)
    setActiveBrandFaceUrl(model.faceImageUrl)
  }

  const handleRemove = async (model: { id: string; isActive: boolean }) => {
    await remove(model.id)
    if (model.isActive) {
      setActiveBrandFaceUrl(null)
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !faceImage) return
    setSaving(true)
    await create(name.trim(), faceImage)
    setName('')
    setFaceImage(null)
    setView('list')
    setSaving(false)
  }

  const handleCancel = () => {
    setName('')
    setFaceImage(null)
    setView('list')
  }

  // Sync active brand face URL on initial load
  // (when activeModel is resolved from DB)
  useEffect(() => {
    if (activeModel) {
      setActiveBrandFaceUrl(activeModel.faceImageUrl)
    }
  }, [activeModel, setActiveBrandFaceUrl])

  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-xs font-semibold uppercase text-muted-foreground">
        {t('workspace.brandFace.title')}
      </p>

      {view === 'list' && (
        <>
          {loading && (
            <p className="px-1 text-xs text-muted-foreground">
              {t('workspace.brandFace.loading')}
            </p>
          )}

          {!loading && models.length === 0 && (
            <p className="px-1 text-xs text-muted-foreground">
              {t('workspace.brandFace.hint')}
            </p>
          )}

          {!loading && models.map((model) => (
            <div
              key={model.id}
              className="flex items-center gap-2 border border-border px-2 py-1"
            >
              <img
                src={model.faceImageUrl}
                alt={model.name}
                className="size-8 border border-border object-cover"
              />
              <span className="flex-1 truncate text-xs">{model.name}</span>
              <button
                type="button"
                onClick={() => handleSetActive(model)}
                className="flex size-4 items-center justify-center border border-border"
                title={t('workspace.brandFace.active')}
              >
                {model.isActive && (
                  <span className="block size-2.5 bg-foreground" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleRemove(model)}
                className="flex size-4 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setView('create')}
            className="w-full rounded-none text-xs"
          >
            {t('workspace.brandFace.add')}
          </Button>
        </>
      )}

      {view === 'create' && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('workspace.brandFace.namePlaceholder')}
            className="border border-border bg-background px-2 py-1 text-sm outline-none focus:border-foreground"
          />
          <ImageUpload
            value={faceImage}
            onChange={setFaceImage}
            label={t('workspace.brandFace.uploadFace')}
          />
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={!name.trim() || !faceImage || saving}
              className="flex-1 rounded-none text-xs"
            >
              {t('workspace.brandFace.save')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex-1 rounded-none text-xs"
            >
              {t('workspace.brandFace.cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
