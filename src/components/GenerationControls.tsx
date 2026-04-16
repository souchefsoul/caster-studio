import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useGenerations } from '@/hooks/useGenerations'
import { generateImage, generateOnModel, generateCatalog, generateColorway } from '@/lib/fal'

const ASPECT_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16'] as const
const QUALITY_LEVELS = ['draft', 'standard', 'high'] as const

export function GenerationControls() {
  const params = useWorkspaceStore((s) => s.params)
  const setParams = useWorkspaceStore((s) => s.setParams)
  const currentMode = useWorkspaceStore((s) => s.currentMode)
  const productImageDataUrl = useWorkspaceStore((s) => s.productImageDataUrl)
  const catalogAngles = useWorkspaceStore((s) => s.catalogAngles)
  const catalogProductImage = useWorkspaceStore((s) => s.catalogProductImage)
  const colorwayColors = useWorkspaceStore((s) => s.colorwayColors)
  const colorwayProductImage = useWorkspaceStore((s) => s.colorwayProductImage)
  const addGeneration = useWorkspaceStore((s) => s.addGeneration)
  const updateGeneration = useWorkspaceStore((s) => s.updateGeneration)
  const { t } = useTranslation()
  const { persistGeneration } = useGenerations()

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!params.prompt.trim()) {
      setError(t('workspace.controls.promptRequired'))
      return
    }
    if (currentMode === 'on-model' && !productImageDataUrl) {
      setError(t('workspace.onModel.noProductImage'))
      return
    }
    if (currentMode === 'catalog' && !catalogProductImage) {
      setError(t('workspace.catalog.noProductImage'))
      return
    }
    if (currentMode === 'catalog' && catalogAngles.length === 0) {
      setError(t('workspace.catalog.noAngles'))
      return
    }
    if (currentMode === 'colorway' && !colorwayProductImage) {
      setError(t('workspace.colorway.noProductImage'))
      return
    }
    if (currentMode === 'colorway' && colorwayColors.length === 0) {
      setError(t('workspace.colorway.noColors'))
      return
    }
    setError(null)
    setIsGenerating(true)

    const createdAt = new Date().toISOString()
    const genParams = { ...params }

    // Catalog mode: one generation per angle
    if (currentMode === 'catalog' && catalogProductImage) {
      const entries = catalogAngles.map((angle) => {
        const id = crypto.randomUUID()
        const gen = {
          id,
          mode: currentMode,
          prompt: `${params.prompt} (${angle})`,
          imageUrl: null as string | null,
          thumbnailUrl: null as string | null,
          status: 'pending' as const,
          errorMessage: null as string | null,
          params: genParams,
          createdAt,
        }
        addGeneration(gen)
        return { id, angle, gen }
      })

      const results = await Promise.allSettled(
        entries.map(({ angle }) => generateCatalog(genParams, catalogProductImage, angle))
      )

      results.forEach((result, i) => {
        const { id, gen } = entries[i]
        if (result.status === 'fulfilled') {
          const imageUrl = result.value.images[0]?.url ?? null
          updateGeneration(id, { status: 'completed', imageUrl })
          persistGeneration({ ...gen, status: 'completed', imageUrl })
        } else {
          const message = result.reason instanceof Error ? result.reason.message : 'Generation failed'
          updateGeneration(id, { status: 'failed', errorMessage: message })
          persistGeneration({ ...gen, status: 'failed', errorMessage: message })
        }
      })

      setIsGenerating(false)
      return
    }

    // Colorway mode: one generation per color
    if (currentMode === 'colorway' && colorwayProductImage) {
      const entries = colorwayColors.map((color) => {
        const id = crypto.randomUUID()
        const gen = {
          id,
          mode: currentMode,
          prompt: `${params.prompt} (${color})`,
          imageUrl: null as string | null,
          thumbnailUrl: null as string | null,
          status: 'pending' as const,
          errorMessage: null as string | null,
          params: genParams,
          createdAt,
        }
        addGeneration(gen)
        return { id, color, gen }
      })

      const results = await Promise.allSettled(
        entries.map(({ color }) => generateColorway(genParams, colorwayProductImage, color))
      )

      results.forEach((result, i) => {
        const { id, gen } = entries[i]
        if (result.status === 'fulfilled') {
          const imageUrl = result.value.images[0]?.url ?? null
          updateGeneration(id, { status: 'completed', imageUrl })
          persistGeneration({ ...gen, status: 'completed', imageUrl })
        } else {
          const message = result.reason instanceof Error ? result.reason.message : 'Generation failed'
          updateGeneration(id, { status: 'failed', errorMessage: message })
          persistGeneration({ ...gen, status: 'failed', errorMessage: message })
        }
      })

      setIsGenerating(false)
      return
    }

    // Default: on-model or text-to-image
    const id = crypto.randomUUID()
    const baseGen = {
      id,
      mode: currentMode,
      prompt: params.prompt,
      imageUrl: null as string | null,
      thumbnailUrl: null as string | null,
      status: 'pending' as const,
      errorMessage: null as string | null,
      params: genParams,
      createdAt,
    }

    addGeneration(baseGen)

    try {
      const result = currentMode === 'on-model' && productImageDataUrl
        ? await generateOnModel(params, productImageDataUrl)
        : await generateImage(params)
      const imageUrl = result.images[0]?.url ?? null
      updateGeneration(id, {
        status: 'completed',
        imageUrl,
      })
      persistGeneration({ ...baseGen, status: 'completed', imageUrl })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed'
      updateGeneration(id, {
        status: 'failed',
        errorMessage: message,
      })
      persistGeneration({ ...baseGen, status: 'failed', errorMessage: message })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Aspect Ratio */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">{t('workspace.controls.aspectRatio')}</Label>
        <div className="flex gap-1">
          {ASPECT_RATIOS.map((ratio) => (
            <Button
              key={ratio}
              variant={params.aspectRatio === ratio ? 'default' : 'outline'}
              size="xs"
              onClick={() => setParams({ aspectRatio: ratio })}
              className="flex-1 rounded-none"
            >
              {ratio}
            </Button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">{t('workspace.controls.quality')}</Label>
        <div className="flex gap-1">
          {QUALITY_LEVELS.map((level) => (
            <Button
              key={level}
              variant={params.quality === level ? 'default' : 'outline'}
              size="sm"
              onClick={() => setParams({ quality: level })}
              className="flex-1 rounded-none"
            >
              {t(`workspace.controls.quality${level.charAt(0).toUpperCase() + level.slice(1)}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full rounded-none"
      >
        {isGenerating ? t('workspace.controls.generating') : t('workspace.sidebar.generate')}
      </Button>
    </div>
  )
}
