import { supabase } from './supabase'
import type { GenerationParams } from '@/types/workspace'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export interface FalImageResult {
  images: Array<{ url: string; width: number; height: number }>
  seed: number
  prompt: string
}

// Map quality to inference steps
function qualitySteps(quality: string): number {
  switch (quality) {
    case 'draft': return 14
    case 'high': return 42
    default: return 28 // standard
  }
}

// Map aspect ratio to pixel dimensions
function aspectToSize(ratio: string): { width: number; height: number } {
  switch (ratio) {
    case '4:3': return { width: 1024, height: 768 }
    case '3:4': return { width: 768, height: 1024 }
    case '16:9': return { width: 1024, height: 576 }
    case '9:16': return { width: 576, height: 1024 }
    default: return { width: 1024, height: 1024 } // 1:1
  }
}

export async function generateImage(params: GenerationParams): Promise<FalImageResult> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const size = aspectToSize(params.aspectRatio)
  const steps = qualitySteps(params.quality)

  const body = {
    endpoint: params.model,
    input: {
      prompt: params.prompt,
      num_inference_steps: steps,
      image_size: size,
    },
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/fal-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Generation failed' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function generateOnModel(
  params: GenerationParams,
  productImageDataUrl: string
): Promise<FalImageResult> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const size = aspectToSize(params.aspectRatio)
  const steps = qualitySteps(params.quality)

  const body = {
    endpoint: 'fal-ai/nano-banana-pro/edit',
    input: {
      prompt: params.prompt,
      image_url: productImageDataUrl,
      num_inference_steps: steps,
      image_size: size,
    },
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/fal-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'On-model generation failed' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function generateCatalog(
  params: GenerationParams,
  productImageDataUrl: string,
  angle: string
): Promise<FalImageResult> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const size = aspectToSize(params.aspectRatio)
  const steps = qualitySteps(params.quality)

  const body = {
    endpoint: 'fal-ai/nano-banana-pro/edit',
    input: {
      prompt: `${params.prompt}, ${angle} view, product photography, consistent lighting`,
      image_url: productImageDataUrl,
      num_inference_steps: steps,
      image_size: size,
    },
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/fal-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Catalog generation failed' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function generateColorway(
  params: GenerationParams,
  productImageDataUrl: string,
  color: string
): Promise<FalImageResult> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const size = aspectToSize(params.aspectRatio)
  const steps = qualitySteps(params.quality)

  const body = {
    endpoint: 'fal-ai/nano-banana-pro/edit',
    input: {
      prompt: `${params.prompt}, in ${color} color, same garment design, product photography`,
      image_url: productImageDataUrl,
      num_inference_steps: steps,
      image_size: size,
    },
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/fal-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Colorway generation failed' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  return response.json()
}
