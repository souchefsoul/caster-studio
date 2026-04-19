import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

const MAX_IMAGES = 10
const MAX_FILE_SIZE = 10 * 1024 * 1024

export function OnModelPanel() {
  const productImages = useWorkspaceStore((s) => s.productImages)
  const addProductImage = useWorkspaceStore((s) => s.addProductImage)
  const removeProductImage = useWorkspaceStore((s) => s.removeProductImage)
  const onModelView = useWorkspaceStore((s) => s.onModelView)
  const setOnModelView = useWorkspaceStore((s) => s.setOnModelView)
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const processFiles = (files: FileList | File[]) => {
    setError(null)
    const remaining = MAX_IMAGES - productImages.length
    if (remaining <= 0) {
      setError(t('workspace.onModel.maxImages'))
      return
    }
    const toProcess = Array.from(files).slice(0, remaining)
    for (const file of toProcess) {
      if (file.size > MAX_FILE_SIZE) {
        setError(t('workspace.onModel.fileTooLarge'))
        continue
      }
      const reader = new FileReader()
      reader.onload = () => addProductImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">
          {t('workspace.onModel.images')} ({productImages.length}/{MAX_IMAGES})
        </p>

        <p className="text-xs text-muted-foreground">
          {t('workspace.onModel.hint')}
        </p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="grid grid-cols-3 gap-2"
        >
          {productImages.map((url, i) => (
            <div key={i} className="relative aspect-square min-h-20 min-w-20 border border-border bg-muted/50">
              <img src={url} alt={`Ref ${i + 1}`} className="h-full w-full object-cover" />
              <button
                onClick={() => removeProductImage(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-none border border-border bg-background hover:bg-accent"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}

          {productImages.length < MAX_IMAGES && (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square min-h-20 min-w-20 flex-col items-center justify-center gap-1 border border-dashed border-border bg-muted/50 hover:border-primary"
            >
              <Upload className="size-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                {t('workspace.onModel.addImage')}
              </span>
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="hidden"
        />

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.onModel.viewQuestion')}</p>
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant={onModelView === 'front' ? 'default' : 'outline'}
            size="xs"
            onClick={() => setOnModelView('front')}
            className="rounded-none min-h-10"
          >
            {t('workspace.onModel.viewFront')}
          </Button>
          <Button
            variant={onModelView === 'back' ? 'default' : 'outline'}
            size="xs"
            onClick={() => setOnModelView('back')}
            className="rounded-none min-h-10"
          >
            {t('workspace.onModel.viewBack')}
          </Button>
        </div>
      </div>
    </div>
  )
}
