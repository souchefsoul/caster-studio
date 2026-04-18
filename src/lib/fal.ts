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
    case '4:5': return '4:5'
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

    // Shared rules from Tam Katalog recipe (Represent/Zara luxury e-commerce feel)
    const allProductKeep = `ABSOLUTELY CRITICAL OUTFIT RULE: The model must wear the EXACT uploaded garment as shown in the reference image(s), preserving exact color, print, graphic, texture, fabric, and fit. DO NOT omit, substitute, hide, or alter the garment. USE THE EXACT UPLOADED GARMENT.`
    const ironRule = `ABSOLUTELY CRITICAL GARMENT PRESENTATION: Even if the uploaded reference images show wrinkled, creased, crumpled, or unironed garments, the garments on the model MUST appear PERFECTLY IRONED, FRESHLY PRESSED, SMOOTH and CRISP — as if just steamed by a professional e-commerce studio stylist. NO wrinkles, NO creases, NO crumples, NO folds, NO pressed-in storage lines, NO wavy hems. Fabric must lay completely flat and smooth on the body with only natural clean drape from the oversize fit. This is a luxury editorial catalog — all clothing must look brand-new and perfectly steamed.`
    const sideInfo = hasBack
      ? 'front and back reference provided — use both exactly'
      : 'ONLY front reference provided — the back side must be plain/blank with NO print, NO graphic, NO design, just the base fabric color'
    const studio = `Seamless cool-toned pale blue-grey studio backdrop (around #D9E3EB), very subtle cool cyan-blue undertone, soft gradient from slightly brighter top to cooler bottom. Slightly darker neutral grey floor meeting the backdrop in a soft horizon line at roughly the lower quarter of the frame. Soft even diffused studio lighting from the front, minimal shadow on the wall. Editorial e-commerce fashion photography, high-end catalog quality. Single photo only. Photorealistic 8k.`
    const studioNoFloor = `Seamless cool-toned pale blue-grey studio backdrop (around #D9E3EB) with a subtle cyan-blue undertone, NO floor visible in this crop. Soft even diffused studio lighting. Editorial e-commerce fashion photography, high-end PDP style. Single photo only. Photorealistic 8k.`
    const pb = `${imageRef}IMPORTANT RULE FOR MISSING SIDES: ${sideInfo}.`
    const base = `${allProductKeep} ${pb} ${ironRule}`

    const angleDescriptions: Record<string, string> = {
      'front': `${base} FULL BODY HERO SHOT, model positioned at exact 0 degrees to camera (straight front). MANDATORY SPECIFIC POSE: weight shifted onto the RIGHT LEG creating a subtle S-curve silhouette through the body, left foot placed slightly forward and relaxed, BOTH HANDS TUCKED DEEP INTO THE FRONT POCKETS of the pants (not holding anything, not crossed), both elbows angled gently OUTWARD and AWAY from the torso so the arms form soft triangular shapes, shoulders relaxed. Head turned very slightly to the right, chin relaxed, confident editorial gaze. Head-to-toe entirely inside the frame with ~8% margin above the head and ~5% margin below the feet. ${studio} Medium format 50mm lens, sharp focus.`,

      'back': `${base} FULL BODY BACK SHOT, head to toe. Model turned EXACTLY 180 degrees away from camera, completely facing the backdrop, back of the head visible. Standing straight, arms relaxed at sides slightly away from body forming a soft gap between arm and torso, feet shoulder-width apart. Small margin above head and below feet. Back of the garment fully visible with any back graphic, print or seam clearly shown. ${studio} Medium format 50mm lens, sharp focus.`,

      'side-left': `${base} FULL BODY PURE SIDE PROFILE at exactly 90 degrees to camera, model facing frame RIGHT. Head to toe entirely inside the frame with small top and bottom margins. Standing naturally, front hand (closer to camera) tucked in front pocket, back arm relaxed at side, weight balanced. The silhouette from the side clearly shows the oversize drape, dropped shoulder line, and full body length of the garment. ${studio} Medium format 85mm lens, sharp focus.`,

      'side-right': `${base} FULL BODY PURE SIDE PROFILE at exactly 90 degrees to camera, model facing frame LEFT. Head to toe entirely inside the frame with small top and bottom margins. Standing naturally, front hand (closer to camera) tucked in front pocket, back arm relaxed at side, weight balanced. The silhouette from the side clearly shows the oversize drape, dropped shoulder line, and full body length of the garment. ${studio} Medium format 85mm lens, sharp focus.`,

      '3/4-front': `${base} CLOSE-UP upper body shot with a SLIGHT 15 degree diagonal (model rotated slightly toward his left). Cropped from top of head down to mid-chest / just below the chest print area. Head slightly tilted, gaze directed DOWN and off-camera to the right, mouth slightly parted in a candid editorial moment. One hand visible ENTERING THE FRAME FROM THE BOTTOM LEFT EDGE, fingers relaxed. Fabric texture, shoulder seam, and chest area hyper-sharp. ${studioNoFloor} Medium format 85mm lens, shallow depth of field.`,

      '3/4-back': `${base} UPPER BODY THREE-QUARTER BACK SHOT — NOT a full body. ABSOLUTE MANDATORY CROP RULE: cropped from TOP OF HEAD down to MID-BACK / LOWER-SHOULDER-BLADE level. Everything below mid-back — lower back, hips, legs, feet — is CUT OFF and INVISIBLE. Model rotated approximately 160-170 degrees away from camera with head turned sharply toward his own LEFT SHOULDER so the side profile of the face is visible (jawline, ear, sunglasses). Back of the garment with its back print dominates the frame. ${studioNoFloor} Medium format 85mm lens, sharp focus.`,
    }

    const prompt = angleDescriptions[angle] || `${base} E-commerce product catalog photograph, ${angle} view. Show this exact garment from the ${angle} angle. ${studio}`

    const extra = userPrompt.trim() ? ` ${userPrompt.trim()}.` : ''
    return prompt + extra
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
