import { supabase } from '@/lib/supabase'
import type { Collection } from '@/types/workspace'

/**
 * Fetch all collections for a user, ordered by created_at DESC.
 * Includes item count for each collection.
 */
export async function fetchCollections(userId: string): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch collections:', error)
    throw error
  }

  if (!data) return []

  // Fetch item counts for each collection
  const collections: Collection[] = []
  for (const row of data) {
    const { count } = await supabase
      .from('collection_items')
      .select('id', { count: 'exact', head: true })
      .eq('collection_id', row.id)

    collections.push({
      id: row.id as string,
      name: row.name as string,
      description: (row.description as string) ?? null,
      itemCount: count ?? 0,
      createdAt: row.created_at as string,
    })
  }

  return collections
}

/**
 * Create a new collection for the user.
 * Returns the created collection with itemCount: 0.
 */
export async function createCollection(
  userId: string,
  name: string,
  description?: string,
): Promise<Collection> {
  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name,
      description: description ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create collection:', error)
    throw error
  }

  return {
    id: data.id as string,
    name: data.name as string,
    description: (data.description as string) ?? null,
    itemCount: 0,
    createdAt: data.created_at as string,
  }
}

/**
 * Delete a collection by ID. CASCADE removes collection_items too.
 */
export async function deleteCollection(collectionId: string): Promise<void> {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId)

  if (error) {
    console.error('Failed to delete collection:', error)
    throw error
  }
}

/**
 * Add a generation to a collection. Uses upsert to handle duplicates gracefully.
 */
export async function addToCollection(
  collectionId: string,
  generationId: string,
): Promise<void> {
  const { error } = await supabase
    .from('collection_items')
    .upsert(
      { collection_id: collectionId, generation_id: generationId },
      { onConflict: 'collection_id,generation_id' },
    )

  if (error) {
    console.error('Failed to add to collection:', error)
    throw error
  }
}

/**
 * Remove a generation from a collection.
 */
export async function removeFromCollection(
  collectionId: string,
  generationId: string,
): Promise<void> {
  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('generation_id', generationId)

  if (error) {
    console.error('Failed to remove from collection:', error)
    throw error
  }
}

/**
 * Fetch all generation IDs in a collection.
 */
export async function fetchCollectionItems(
  collectionId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('collection_items')
    .select('generation_id')
    .eq('collection_id', collectionId)

  if (error) {
    console.error('Failed to fetch collection items:', error)
    throw error
  }

  if (!data) return []

  return data.map((row) => row.generation_id as string)
}
