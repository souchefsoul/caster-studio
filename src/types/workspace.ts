export type CanvasViewMode = 'single' | 'grid'

export type GenerationMode = 'on-model' | 'catalog' | 'colorway' | 'design-copy' | 'text-to-image'

export type GenerationStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed'

export interface GenerationParams {
  prompt: string
  model: string           // FAL model endpoint
  aspectRatio: string     // '1:1' | '4:3' | '3:4' | '16:9' | '9:16'
  quality: 'draft' | 'standard' | 'high'
  productImageUrl: string | null
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

export interface BrandModel {
  id: string
  name: string
  faceImageUrl: string
  isActive: boolean
  createdAt: string
}

export const DEFAULT_GENERATION_PARAMS: GenerationParams = {
  prompt: '',
  model: 'fal-ai/nano-banana-pro/edit',
  aspectRatio: '1:1',
  quality: 'standard',
  productImageUrl: null,
}
