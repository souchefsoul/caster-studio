import { supabase } from './supabase'
import type { GenerationParams } from '@/types/workspace'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

interface FalImageResult {
  images: Array<{ url: string; width: number; height: number }>
  seed: number
  prompt: string
}

// Map quality to steps multiplier
function qualitySteps(quality: string, baseSteps: number): number {
  switch (quality) {
    case 'draft': return Math.max(1, Math.floor(baseSteps * 0.5))
    case 'high': return Math.min(50, Math.floor(baseSteps * 1.5))
    default: return baseSteps
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
  const steps = qualitySteps(params.quality, params.steps)

  const body = {
    endpoint: params.model,
    input: {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt || undefined,
      num_inference_steps: steps,
      guidance_scale: params.guidance,
      seed: params.seed ?? undefined,
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
