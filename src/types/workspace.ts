export type CanvasViewMode = 'single' | 'grid'

export type GenerationMode = 'on-model' | 'catalog' | 'colorway' | 'design-copy' | 'text-to-image'

export type GenerationStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed'

export interface GenerationParams {
  prompt: string
  negativePrompt: string
  model: string           // FAL model endpoint
  steps: number           // 1-50, default 28
  guidance: number        // 1-20, default 7.5
  seed: number | null     // null = random
  aspectRatio: string     // '1:1' | '4:3' | '3:4' | '16:9' | '9:16'
  quality: 'draft' | 'standard' | 'high'
}

export interface Generation {
  id: string
  mode: GenerationMode
  prompt: string
  imageUrl: string | null
  thumbnailUrl: string | null
  status: GenerationStatus
  errorMessage: string | null
  params: GenerationParams
  createdAt: string
}

export const DEFAULT_GENERATION_PARAMS: GenerationParams = {
  prompt: '',
  negativePrompt: '',
  model: 'fal-ai/nano-banana-pro/edit',
  steps: 28,
  guidance: 7.5,
  seed: null,
  aspectRatio: '1:1',
  quality: 'standard',
}
