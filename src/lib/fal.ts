import { fal } from '@fal-ai/client'
import type { GenerationParams } from '@/types/workspace'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

fal.config({
  proxyUrl: `${SUPABASE_URL}/functions/v1/fal-proxy`,
})

export interface FalImageResult {
  images: Array<{ url: string; width?: number; height?: number; content_type?: string }>
  description?: string
}

function qualityToResolution(quality: string): '1K' | '2K' | '4K' {
  switch (quality) {
    case 'draft': return '1K'
    case 'high': return '4K'
    default: return '2K'
  }
}

function mapAspectRatio(ratio: string): string {
  switch (ratio) {
    case '5:4': return '5:4'
    case '16:9': return '16:9'
    case '9:16': return '9:16'
    default: return '1:1'
  }
}

// ── Prompt templates ──────────────────────────────────────────────

const PROMPT_TEMPLATES = {
  'on-model': (userPrompt: string, _numGarmentRefs: number, _hasFace: boolean, view: 'front' | 'back' = 'front') => {
    const viewClause = view === 'front'
      ? `The output must show exactly one person from the front so the front of the garment is fully visible`
      : `The output must show exactly one person from behind so the back of the garment is fully visible`
    const extra = userPrompt.trim() ? ` ${userPrompt.trim()}.` : ''
    return (
      `Dress one model in the garments shown in the reference images, ` +
      `preserving exact fabric texture, color, pattern, stitching and design details. ` +
      `${viewClause} — ` +
      `no collage, no split frames, no side-by-side views, do not show front and back together. ` +
      `Professional fashion photography, sharp focus, high-end editorial quality.${extra}`
    )
  },

  'catalog': (userPrompt: string, angle: string, hasBack: boolean) => {
    const imageRef = hasBack
      ? 'Image 1 is the front of the garment, Image 2 is the back of the garment. '
      : 'Image 1 is the garment. '
    const extra = userPrompt.trim() ? ` ${userPrompt.trim()}.` : ''
    return (
      `E-commerce product catalog photograph, ${angle} view.${extra} ` +
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

// ── Upload helper (data URL → fal storage URL) ────────────────────

async function toFalUrl(urlOrDataUrl: string): Promise<string> {
  if (urlOrDataUrl.startsWith('http')) return urlOrDataUrl
  const res = await fetch(urlOrDataUrl)
  const blob = await res.blob()
  const ext = blob.type.split('/')[1] || 'jpg'
  const file = new File([blob], `ref.${ext}`, { type: blob.type || 'image/jpeg' })
  return fal.storage.upload(file)
}

async function toFalUrls(urls: string[]): Promise<string[]> {
  return Promise.all(urls.map(toFalUrl))
}

// ── Generation functions ──────────────────────────────────────────

async function subscribeImage(
  endpoint: string,
  input: Record<string, unknown>
): Promise<FalImageResult> {
  console.log('[fal] subscribe', endpoint, { num_images: input.num_images, image_urls: (input.image_urls as string[] | undefined)?.length })
  const result = await fal.subscribe(endpoint, {
    input,
    logs: false,
  })
  const data = result.data as FalImageResult
  console.log('[fal] result', endpoint, { imageCount: data.images?.length, firstUrl: data.images?.[0]?.url?.slice(0, 80) })
  return data
}

export async function generateImage(params: GenerationParams, numImages = 1): Promise<FalImageResult> {
  return subscribeImage('fal-ai/nano-banana', {
    prompt: PROMPT_TEMPLATES['text-to-image'](params.prompt),
    num_images: numImages,
    aspect_ratio: mapAspectRatio(params.aspectRatio),
    resolution: qualityToResolution(params.quality),
  })
}

export async function generateOnModel(
  params: GenerationParams,
  productImages: string[],
  brandFaceUrl: string | null,
  numImages = 1,
  view: 'front' | 'back' = 'front'
): Promise<FalImageResult> {
  const uploadedRefs = await toFalUrls(productImages)
  if (brandFaceUrl) uploadedRefs.push(await toFalUrl(brandFaceUrl))

  return subscribeImage('fal-ai/nano-banana-pro/edit', {
    prompt: PROMPT_TEMPLATES['on-model'](params.prompt, productImages.length, !!brandFaceUrl, view),
    image_urls: uploadedRefs,
    num_images: numImages,
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
  const imageUrls = [await toFalUrl(frontImageDataUrl)]
  if (backImageDataUrl) imageUrls.push(await toFalUrl(backImageDataUrl))

  return subscribeImage('fal-ai/nano-banana-pro/edit', {
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
  const ref = await toFalUrl(referenceImageDataUrl)
  return subscribeImage('fal-ai/nano-banana-pro/edit', {
    prompt: PROMPT_TEMPLATES['design-copy'](params.prompt, modifications),
    image_urls: [ref],
    num_images: numImages,
    aspect_ratio: mapAspectRatio(params.aspectRatio),
    resolution: qualityToResolution(params.quality),
  })
}

export async function generateColorway(
  params: GenerationParams,
  productImageDataUrl: string,
  color: string,
  numImages = 1
): Promise<FalImageResult> {
  const product = await toFalUrl(productImageDataUrl)
  return subscribeImage('fal-ai/nano-banana-pro/edit', {
    prompt: PROMPT_TEMPLATES['colorway'](params.prompt, color),
    image_urls: [product],
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
  const startUrl = await toFalUrl(opts.imageUrl)
  const result = await fal.subscribe('fal-ai/kling-video/v3/pro/image-to-video', {
    input: {
      prompt: opts.prompt,
      start_image_url: startUrl,
      duration: opts.duration || '5',
      generate_audio: opts.generateAudio ?? true,
      negative_prompt: 'blur, distort, and low quality',
      cfg_scale: 0.5,
    },
    logs: false,
  })
  return result.data as { video: { url: string } }
}
