import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ImageUpload'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

const MAX_COLORS = 4

export function ColorwayPanel() {
  const colorwayColors = useWorkspaceStore((s) => s.colorwayColors)
  const setColorwayColors = useWorkspaceStore((s) => s.setColorwayColors)
  const colorwayProductImage = useWorkspaceStore((s) => s.colorwayProductImage)
  const setColorwayProductImage = useWorkspaceStore((s) => s.setColorwayProductImage)
  const { t } = useTranslation()

  const [newColor, setNewColor] = useState('')

  const addColor = () => {
    const trimmed = newColor.trim()
    if (!trimmed) return
    if (colorwayColors.length >= MAX_COLORS) return
    setColorwayColors([...colorwayColors, trimmed])
    setNewColor('')
  }

  const removeColor = (index: number) => {
    if (colorwayColors.length <= 1) return
    setColorwayColors(colorwayColors.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addColor()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Product image */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.colorway.productImage')}</p>
        <ImageUpload
          value={colorwayProductImage}
          onChange={setColorwayProductImage}
        />
      </div>

      {/* Colors */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.colorway.colors')}</p>

        {/* Color list */}
        <div className="flex flex-wrap gap-1">
          {colorwayColors.map((color, index) => (
            <div
              key={index}
              className="flex items-center gap-1 border border-border bg-muted/50 px-2 py-1"
            >
              <span className="text-xs">{color}</span>
              <button
                type="button"
                onClick={() => removeColor(index)}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={colorwayColors.length <= 1}
                aria-label="Remove color"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add color input */}
        {colorwayColors.length < MAX_COLORS && (
          <div className="flex gap-1">
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('workspace.colorway.colorPlaceholder')}
              className="flex-1 rounded-none border border-border bg-background px-2 py-1 text-base min-h-10"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addColor}
              className="rounded-none text-xs px-3 min-h-10"
            >
              {t('workspace.colorway.addColor')}
            </Button>
          </div>
        )}

        {colorwayColors.length >= MAX_COLORS && (
          <p className="text-xs text-muted-foreground">
            {t('workspace.colorway.maxColors')}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('workspace.colorway.hint')}
      </p>
    </div>
  )
}
