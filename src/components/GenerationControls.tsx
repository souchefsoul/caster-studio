import { useState } from 'react'
import { Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'
import { generateImage } from '@/lib/fal'

const ASPECT_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16'] as const
const QUALITY_LEVELS = ['draft', 'standard', 'high'] as const

export function GenerationControls() {
  const params = useWorkspaceStore((s) => s.params)
  const setParams = useWorkspaceStore((s) => s.setParams)
  const currentMode = useWorkspaceStore((s) => s.currentMode)
  const addGeneration = useWorkspaceStore((s) => s.addGeneration)
  const updateGeneration = useWorkspaceStore((s) => s.updateGeneration)
  const { t } = useTranslation()

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!params.prompt.trim()) {
      setError(t('workspace.controls.promptRequired'))
      return
    }
    setError(null)
    setIsGenerating(true)

    const id = crypto.randomUUID()
    addGeneration({
      id,
      mode: currentMode,
      prompt: params.prompt,
      imageUrl: null,
      thumbnailUrl: null,
      status: 'pending',
      errorMessage: null,
      params: { ...params },
      createdAt: new Date().toISOString(),
    })

    try {
      const result = await generateImage(params)
      updateGeneration(id, {
        status: 'completed',
        imageUrl: result.images[0]?.url ?? null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed'
      updateGeneration(id, {
        status: 'failed',
        errorMessage: message,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Steps Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">{t('workspace.controls.steps')}</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{params.steps}</span>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          step={1}
          value={params.steps}
          onChange={(e) => setParams({ steps: Number(e.target.value) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-none bg-input accent-primary"
        />
      </div>

      {/* Guidance Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">{t('workspace.controls.guidance')}</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{params.guidance}</span>
        </div>
        <input
          type="range"
          min={1}
          max={20}
          step={0.5}
          value={params.guidance}
          onChange={(e) => setParams({ guidance: Number(e.target.value) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-none bg-input accent-primary"
        />
      </div>

      {/* Seed */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">{t('workspace.controls.seed')}</Label>
        <div className="flex items-center gap-1.5">
          {params.seed === null ? (
            <div className="flex h-8 flex-1 items-center rounded-none border border-input bg-background px-2.5 text-sm text-muted-foreground">
              {t('workspace.controls.seedRandom')}
            </div>
          ) : (
            <Input
              type="number"
              value={params.seed}
              onChange={(e) => setParams({ seed: e.target.value ? Number(e.target.value) : null })}
              className="flex-1 rounded-none"
            />
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setParams({ seed: params.seed === null ? 42 : null })}
            className="shrink-0 rounded-none"
            title={t('workspace.controls.seedRandom')}
          >
            <Shuffle className="size-4" />
          </Button>
        </div>
      </div>

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
