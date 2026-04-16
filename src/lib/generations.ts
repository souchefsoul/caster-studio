import { supabase } from '@/lib/supabase'
import type { Generation, GenerationMode, GenerationStatus, GenerationParams } from '@/types/workspace'
import { DEFAULT_GENERATION_PARAMS } from '@/types/workspace'

/**
 * Upsert a generation row to Supabase.
 * Maps frontend Generation type to DB column names.
 */
export async function saveGeneration(userId: string, gen: Generation): Promise<void> {
  const { error } = await supabase.from('generations').upsert({
    id: gen.id,
    user_id: userId,
    mode: gen.mode,
    prompt: gen.prompt,
    parameters: gen.params,
    image_url: gen.imageUrl,
    thumbnail_url: gen.thumbnailUrl,
    status: gen.status,
    error_message: gen.errorMessage,
    created_at: gen.createdAt,
  })

  if (error) {
    console.error('Failed to save generation:', error)
    throw error
  }
}

/**
 * Fetch all generations for a user, ordered by created_at DESC, limit 200.
 * Maps DB rows back to frontend Generation type.
 */
export async function fetchGenerations(userId: string): Promise<Generation[]> {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('Failed to fetch generations:', error)
    throw error
  }

  if (!data) return []

  return data.map(mapRowToGeneration)
}

/**
 * Fetch a single generation by ID.
 * Returns null if not found.
 */
export async function fetchGenerationById(genId: string): Promise<Generation | null> {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('id', genId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    console.error('Failed to fetch generation:', error)
    throw error
  }

  if (!data) return null

  return mapRowToGeneration(data)
}

/**
 * Map a Supabase row to the frontend Generation type.
 */
function mapRowToGeneration(row: Record<string, unknown>): Generation {
  const params = (row.parameters as Partial<GenerationParams>) ?? {}

  return {
    id: row.id as string,
    mode: row.mode as GenerationMode,
    prompt: row.prompt as string,
    imageUrl: (row.image_url as string) ?? null,
    thumbnailUrl: (row.thumbnail_url as string) ?? null,
    status: row.status as GenerationStatus,
    errorMessage: (row.error_message as string) ?? null,
    params: {
      prompt: params.prompt ?? DEFAULT_GENERATION_PARAMS.prompt,
      model: params.model ?? DEFAULT_GENERATION_PARAMS.model,
      aspectRatio: params.aspectRatio ?? DEFAULT_GENERATION_PARAMS.aspectRatio,
      quality: params.quality ?? DEFAULT_GENERATION_PARAMS.quality,
      productImageUrl: params.productImageUrl ?? DEFAULT_GENERATION_PARAMS.productImageUrl,
    },
    createdAt: row.created_at as string,
  }
}
