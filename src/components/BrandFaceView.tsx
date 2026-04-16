import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ImageUpload'
import { useBrandModels } from '@/hooks/useBrandModels'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

export function BrandFaceView() {
  const { models, loading, create, remove, setActive } = useBrandModels()
  const setActiveBrandFaceUrl = useWorkspaceStore((s) => s.setActiveBrandFaceUrl)
  const { t } = useTranslation()

  const [showCreate, setShowCreate] = useState(false)
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
    setShowCreate(false)
    setSaving(false)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <h2 className="text-sm font-semibold">{t('workspace.brandFace.pageTitle')}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreate(true)}
          className="rounded-none gap-1"
        >
          <Plus className="size-3" />
          {t('workspace.brandFace.add')}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {/* Create form */}
        {showCreate && (
          <div className="mb-4 border border-border p-3">
            <div className="flex flex-col gap-2" style={{ maxWidth: 320 }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('workspace.brandFace.namePlaceholder')}
                className="border border-border bg-background px-2 py-1 text-sm outline-none focus:border-foreground rounded-none"
              />
              <ImageUpload
                value={faceImage}
                onChange={setFaceImage}
                label={t('workspace.brandFace.uploadFace')}
              />
              <div className="flex gap-1">
                <Button
                  variant="default"
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
                  onClick={() => { setShowCreate(false); setName(''); setFaceImage(null) }}
                  className="flex-1 rounded-none text-xs"
                >
                  {t('workspace.brandFace.cancel')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <p className="text-sm text-muted-foreground">{t('workspace.brandFace.loading')}</p>
        )}

        {!loading && models.length === 0 && !showCreate && (
          <p className="text-sm text-muted-foreground">{t('workspace.brandFace.hint')}</p>
        )}

        {/* Model grid — each model is a card with face + multiple generated photos */}
        {!loading && models.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {models.map((model) => (
              <div
                key={model.id}
                className={`border p-2 ${
                  model.isActive ? 'border-foreground' : 'border-border'
                }`}
              >
                {/* Face image */}
                <div className="relative aspect-square overflow-hidden border border-border">
                  <img
                    src={model.faceImageUrl}
                    alt={model.name}
                    className="h-full w-full object-cover"
                  />
                  {model.isActive && (
                    <span className="absolute bottom-0 left-0 right-0 bg-foreground/80 py-0.5 text-center text-[10px] font-semibold text-background">
                      {t('workspace.brandFace.active')}
                    </span>
                  )}
                </div>

                {/* Name + actions */}
                <div className="mt-2 flex items-center justify-between gap-1">
                  <span className="truncate text-xs font-medium">{model.name}</span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetActive(model)}
                      className={`border px-1.5 py-0.5 text-[10px] ${
                        model.isActive
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground'
                      }`}
                    >
                      {t('workspace.brandFace.active')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(model)}
                      className="border border-border p-0.5 text-muted-foreground hover:border-destructive hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
