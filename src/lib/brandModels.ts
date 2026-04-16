import { supabase } from '@/lib/supabase'
import type { BrandModel } from '@/types/workspace'

interface BrandModelRow {
  id: string
  name: string
  face_image_url: string
  is_active: boolean
  created_at: string
}

function mapRow(row: BrandModelRow): BrandModel {
  return {
    id: row.id,
    name: row.name,
    faceImageUrl: row.face_image_url,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export async function fetchBrandModels(userId: string): Promise<BrandModel[]> {
  const { data, error } = await supabase
    .from('brand_models')
    .select('id, name, face_image_url, is_active, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as BrandModelRow[]).map(mapRow)
}

export async function createBrandModel(
  userId: string,
  name: string,
  faceImageUrl: string
): Promise<BrandModel> {
  const { data, error } = await supabase
    .from('brand_models')
    .insert({ user_id: userId, name, face_image_url: faceImageUrl, is_active: false })
    .select('id, name, face_image_url, is_active, created_at')
    .single()

  if (error) throw error
  return mapRow(data as BrandModelRow)
}

export async function setActiveBrandModel(userId: string, modelId: string): Promise<void> {
  // Deactivate all models for user
  const { error: deactivateError } = await supabase
    .from('brand_models')
    .update({ is_active: false })
    .eq('user_id', userId)

  if (deactivateError) throw deactivateError

  // Activate the target model
  const { error: activateError } = await supabase
    .from('brand_models')
    .update({ is_active: true })
    .eq('id', modelId)

  if (activateError) throw activateError
}

export async function deleteBrandModel(modelId: string): Promise<void> {
  const { error } = await supabase
    .from('brand_models')
    .delete()
    .eq('id', modelId)

  if (error) throw error
}
