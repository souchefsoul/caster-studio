import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface ImageUploadProps {
  value: string | null
  onChange: (dataUrl: string | null) => void
  label?: string
  accept?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function ImageUpload({
  value,
  onChange,
  label,
  accept = 'image/jpeg,image/png,image/webp',
}: ImageUploadProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = (file: File) => {
    setError(null)
    if (file.size > MAX_FILE_SIZE) {
      setError(t('workspace.onModel.fileTooLarge'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onChange(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleRemove = () => {
    onChange(null)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <p className="text-xs font-medium">{label}</p>}

      {value ? (
        <div className="relative border border-border bg-muted/50 p-2">
          <img
            src={value}
            alt="Uploaded product"
            className="mx-auto max-h-[150px] object-contain"
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleRemove}
            className="absolute right-1 top-1 rounded-none border border-border bg-background"
          >
            <X className="size-3" />
          </Button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2
            border border-dashed bg-muted/50 p-4
            ${dragOver ? 'border-primary bg-muted' : 'border-border'}
          `}
        >
          <Upload className="size-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {t('workspace.onModel.uploadText')}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
