import { useState } from 'react'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useGenerations } from '@/hooks/useGenerations'
import { generateVideo } from '@/lib/fal'
import { DEFAULT_GENERATION_PARAMS } from '@/types/workspace'

const DURATION_OPTIONS = ['5', '8', '10', '12', '15'] as const
const VIDEO_ASPECT_RATIOS = ['16:9', '9:16', '1:1'] as const

export function VideoPanel() {
  const videoSourceImage = useWorkspaceStore((s) => s.videoSourceImage)
  const setVideoSourceImage = useWorkspaceStore((s) => s.setVideoSourceImage)
  const videoPrompt = useWorkspaceStore((s) => s.videoPrompt)
  const setVideoPrompt = useWorkspaceStore((s) => s.setVideoPrompt)
  const generations = useWorkspaceStore((s) => s.generations)
  const addGeneration = useWorkspaceStore((s) => s.addGeneration)
  const updateGeneration = useWorkspaceStore((s) => s.updateGeneration)
  const setSelectedGenerationId = useWorkspaceStore((s) => s.setSelectedGenerationId)
  const setCanvasViewMode = useWorkspaceStore((s) => s.setCanvasViewMode)
  const { t } = useTranslation()
  const { persistGeneration } = useGenerations()

  const [duration, setDuration] = useState('5')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [generateAudio, setGenerateAudio] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showGallery, setShowGallery] = useState(false)

  const completedGenerations = generations.filter(
    (g) => g.status === 'completed' && g.imageUrl
  )

  const handleSelectFromGallery = (imageUrl: string) => {
    setVideoSourceImage(imageUrl)
    setShowGallery(false)
  }

  const handleGenerate = async () => {
    if (!videoSourceImage) {
      setError(t('workspace.video.noSourceImage'))
      return
    }
    if (!videoPrompt.trim()) {
      setError(t('workspace.video.noPrompt'))
      return
    }
    setError(null)
    setIsGenerating(true)

    const id = crypto.randomUUID()
    const pendingGen = {
      id,
      mode: 'video' as const,
      prompt: videoPrompt.trim(),
      imageUrl: null as string | null,
      thumbnailUrl: videoSourceImage,
      status: 'pending' as const,
      errorMessage: null as string | null,
      params: { ...DEFAULT_GENERATION_PARAMS, prompt: videoPrompt.trim(), aspectRatio },
      createdAt: new Date().toISOString(),
    }
    addGeneration(pendingGen)
    setSelectedGenerationId(id)
    setCanvasViewMode('single')

    try {
      const result = await generateVideo({
        imageUrl: videoSourceImage,
        prompt: videoPrompt.trim(),
        duration,
        aspectRatio,
        generateAudio,
      })
      const videoUrl = result.video.url
      updateGeneration(id, { status: 'completed', imageUrl: videoUrl })
      persistGeneration({ ...pendingGen, status: 'completed', imageUrl: videoUrl })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Video generation failed'
      setError(message)
      updateGeneration(id, { status: 'failed', errorMessage: message })
      persistGeneration({ ...pendingGen, status: 'failed', errorMessage: message })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Source image */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.video.sourceImage')}</p>
        <div data-video-source-upload>
          <ImageUpload
            value={videoSourceImage}
            onChange={setVideoSourceImage}
          />
        </div>
        {completedGenerations.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                const hiddenInput = document.querySelector<HTMLInputElement>(
                  '[data-video-source-upload] input[type="file"]'
                )
                hiddenInput?.click()
              }}
              className="rounded-none min-h-10"
            >
              {t('workspace.video.uploadFromDevice')}
            </Button>
            <Button
              type="button"
              variant={showGallery ? 'default' : 'outline'}
              size="xs"
              onClick={() => setShowGallery(!showGallery)}
              className="rounded-none min-h-10"
            >
              {t('workspace.video.pickFromGallery')}
            </Button>
          </div>
        )}
      </div>

      {/* Gallery picker (expanded state) */}
      {showGallery && completedGenerations.length > 0 && (
        <div className="grid grid-cols-3 gap-1 md:grid-cols-4 max-h-60 overflow-y-auto">
          {completedGenerations.map((gen) => (
            <img
              key={gen.id}
              src={gen.thumbnailUrl ?? gen.imageUrl!}
              alt={gen.prompt}
              onClick={() => handleSelectFromGallery(gen.imageUrl!)}
              className={`aspect-square w-full cursor-pointer object-cover border ${
                videoSourceImage === gen.imageUrl
                  ? 'border-primary'
                  : 'border-border hover:border-primary'
              }`}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {t('workspace.video.hint')}
      </p>

      {/* Video prompt */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.video.prompt')}</p>
        <textarea
          value={videoPrompt}
          onChange={(e) => setVideoPrompt(e.target.value)}
          placeholder={t('workspace.video.promptPlaceholder')}
          rows={3}
          className="w-full resize-none border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded-none"
        />
      </div>

      {/* Duration */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.video.duration')}</p>
        <div className="flex gap-1">
          {DURATION_OPTIONS.map((d) => (
            <Button
              key={d}
              variant={duration === d ? 'default' : 'outline'}
              size="xs"
              onClick={() => setDuration(d)}
              className="flex-1 rounded-none min-h-10"
            >
              {d}s
            </Button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium">{t('workspace.controls.aspectRatio')}</p>
        <div className="flex gap-1">
          {VIDEO_ASPECT_RATIOS.map((ratio) => (
            <Button
              key={ratio}
              variant={aspectRatio === ratio ? 'default' : 'outline'}
              size="xs"
              onClick={() => setAspectRatio(ratio)}
              className="flex-1 rounded-none min-h-10"
            >
              {ratio}
            </Button>
          ))}
        </div>
      </div>

      {/* Audio toggle */}
      <label className="flex items-center gap-2 cursor-pointer min-h-10">
        <input
          type="checkbox"
          checked={generateAudio}
          onChange={(e) => setGenerateAudio(e.target.checked)}
          className="rounded-none"
        />
        <span className="text-xs">{t('workspace.video.audio')}</span>
      </label>

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full rounded-none"
      >
        {isGenerating ? t('workspace.video.generating') : t('workspace.video.generate')}
      </Button>
    </div>
  )
}
