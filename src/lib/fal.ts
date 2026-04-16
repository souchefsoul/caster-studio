import { supabase } from './supabase'
import type { GenerationParams } from '@/types/workspace'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export interface FalImageResult {
  images: Array<{ url: string; width: number; height: number; content_type?: string }>
  description?: string
}

// Map quality to resolution
function qualityToResolution(quality: string): '1K' | '2K' | '4K' {
  switch (quality) {
    case 'draft': return '1K'
    case 'high': return '4K'
    default: return '2K' // standard
  }
}

// Map our aspect ratio format to FAL's format
function mapAspectRatio(ratio: string): string {
  switch (ratio) {
    case '5:4': return '5:4'
    case '16:9': return '16:9'
    case '9:16': return '9:16'
    default: return '1:1'
  }
}

// ── Prompt Templates ──────────────────────────────────────────────

const PROMPT_TEMPLATES = {
  'on-model': (userPrompt: string, angle: string, opts: { hasFront: boolean; hasBack: boolean; hasFace: boolean }) => {
    const imageRefs: string[] = []
    if (opts.hasFront && opts.hasBack) {
      imageRefs.push('Image 1 is the front of the garment, Image 2 is the back of the garment.')
    } else if (opts.hasFront) {
      imageRefs.push('Image 1 is the front of the garment.')
    }
    const faceIdx = opts.hasFront && opts.hasBack ? 'third' : 'second'
    const faceRef = opts.hasFace
      ? ` The model must have the exact same face, facial features, and appearance as the person in the ${faceIdx} reference image.`
      : ''
    return (
      `Professional fashion photograph of a single model: ${userPrompt}. ` +
      `${imageRefs.join(' ')}` +
      ` Dress exactly one person in this garment with precise fabric texture, color, pattern, and design reproduction.` +
      `${faceRef} ` +
      `Pose: ${angle}. ` +
      `IMPORTANT: Only one person in the photo, no other people, no split frames, no collage. ` +
      `Single full-body shot, soft diffused lighting, sharp focus, high-end editorial quality.`
    )
  },

  'catalog': (userPrompt: string, angle: string, hasBack: boolean) => {
    const imageRef = hasBack
      ? 'Image 1 is the front of the garment, Image 2 is the back of the garment. '
      : 'Image 1 is the garment. '
    return (
      `E-commerce product catalog photograph: ${userPrompt}, ${angle} view. ` +
      `${imageRef}` +
      `Show this exact garment from the ${angle} angle. ` +
      `Clean white background, even studio lighting with no harsh shadows, ` +
      `color-accurate reproduction, sharp focus on garment details, ` +
      `professional product photography for online store.`
    )
  },

  'colorway': (_userPrompt: string, color: string) =>
    `This exact same garment design in ${color} color. ` +
    `Maintain the identical cut, silhouette, fabric texture, stitching, and draping. ` +
    `Product photography on white background, same lighting and angle as the reference.`,

  'design-copy': (userPrompt: string, modifications: string) =>
    `Maintain the exact visual style, design language, layout, and aesthetic of the reference image. ` +
    `${userPrompt}. ` +
    `Apply these specific modifications: ${modifications}. ` +
    `Professional product photography, preserve all unmentioned design elements exactly.`,

  'text-to-image': (userPrompt: string) =>
    `${userPrompt}. ` +
    `Professional fashion/textile photography quality, studio lighting, sharp focus.`,
}

// ── Helper: authenticated FAL request ─────────────────────────────

async function falRequest(endpoint: string, input: Record<string, unknown>): Promise<FalImageResult> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${SUPABASE_URL}/functions/v1/fal-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint, input }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    console.error('[fal] error response:', response.status, err)
    const message = err.error
      || err.detail?.[0]?.msg
      || (typeof err.detail === 'string' ? err.detail : null)
      || `HTTP ${response.status}`
    throw new Error(message)
  }

  const data = await response.json()
  console.log('[fal] success:', data.images?.length, 'images, first url:', data.images?.[0]?.url?.slice(0, 80))
  return data
}

// ── Generation Functions ──────────────────────────────────────────

export async function generateImage(params: GenerationParams, numImages = 1): Promise<FalImageResult> {
  return falRequest('fal-ai/nano-banana', {
    prompt: PROMPT_TEMPLATES['text-to-image'](params.prompt),
    num_images: numImages,
    aspect_ratio: mapAspectRatio(params.aspectRatio),
    resolution: qualityToResolution(params.quality),
  })
}

export async function generateOnModel(
  params: GenerationParams,
  frontImageDataUrl: string,
  backImageDataUrl: string | null,
  brandFaceUrl: string | null,
  angle: string
): Promise<FalImageResult> {
  const imageUrls: string[] = [frontImageDataUrl]
  if (backImageDataUrl) imageUrls.push(backImageDataUrl)
  if (brandFaceUrl) imageUrls.push(brandFaceUrl)

  return falRequest('fal-ai/nano-banana-pro/edit', {
    prompt: PROMPT_TEMPLATES['on-model'](params.prompt, angle, {
      hasFront: true,
      hasBack: !!backImageDataUrl,
      hasFace: !!brandFaceUrl,
    }),
    image_urls: imageUrls,
    aspect_ratio: mapAspectRatio(params.aspectRatio),
    resolution: qualityToResolution(params.quality),
  })
}

export async function generateCatalog(
  params: GenerationParams,
  frontImageDataUrl: string,
  backImageDataUrl: string | null,
  angle: string,
  numImages = 1
): Promise<FalImageResult> {
  const imageUrls: string[] = [frontImageDataUrl]
  if (backImageDataUrl) imageUrls.push(backImageDataUrl)

  return falRequest('fal-ai/nano-banana-pro/edit', {
    prompt: PROMPT_TEMPLATES['catalog'](params.prompt, angle, !!backImageDataUrl),
    image_urls: imageUrls,
    num_images: numImages,
    aspect_ratio: mapAspectRatio(params.aspectRatio),
    resolution: qualityToResolution(params.quality),
  })
}

export async function generateDesignCopy(
  params: GenerationParams,
  referenceImageDataUrl: string,
  modifications: string,
  numImages = 1
): Promise<FalImageResult> {
  return falRequest('fal-ai/nano-banana-pro/edit', {
    prompt: PROMPT_TEMPLATES['design-copy'](params.prompt, modifications),
    image_urls: [referenceImageDataUrl],
    num_images: numImages,
    aspect_ratio: mapAspectRatio(params.aspectRatio),
    resolution: qualityToResolution(params.quality),
  })
}

export interface VideoGenerationOptions {
  imageUrl: string
  prompt: string
  duration?: string
  aspectRatio?: string
  generateAudio?: boolean
}

export async function generateVideo(opts: VideoGenerationOptions): Promise<{ video: { url: string } }> {
  const result = await falRequest('fal-ai/kling-video/v3/pro/image-to-video', {
    prompt: opts.prompt,
    start_image_url: opts.imageUrl,
    duration: opts.duration || '5',
    generate_audio: opts.generateAudio ?? true,
    negative_prompt: 'blur, distort, and low quality',
    cfg_scale: 0.5,
  })
  return result as unknown as { video: { url: string } }
}

export async function generateColorway(
  params: GenerationParams,
  productImageDataUrl: string,
  color: string,
  numImages = 1
): Promise<FalImageResult> {
  return falRequest('fal-ai/nano-banana-pro/edit', {
    prompt: PROMPT_TEMPLATES['colorway'](params.prompt, color),
    image_urls: [productImageDataUrl],
    num_images: numImages,
    aspect_ratio: mapAspectRatio(params.aspectRatio),
    resolution: qualityToResolution(params.quality),
  })
}
