import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Collection } from '@/types/workspace'
import {
  fetchCollections,
  createCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection,
  fetchCollectionItems,
} from '@/lib/collections'

export function useCollections() {
  const { user } = useAuth()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCollectionId, setActiveCollectionIdState] = useState<string | null>(null)
  const [activeCollectionItemIds, setActiveCollectionItemIds] = useState<string[]>([])

  // Load collections on mount when user is available
  useEffect(() => {
    if (!user) {
      setCollections([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const data = await fetchCollections(user!.id)
        if (!cancelled) setCollections(data)
      } catch {
        console.error('Failed to load collections')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user])

  const create = useCallback(
    async (name: string, description?: string) => {
      if (!user) return
      try {
        const col = await createCollection(user.id, name, description)
        setCollections((prev) => [col, ...prev])
      } catch {
        console.error('Failed to create collection')
      }
    },
    [user],
  )

  const remove = useCallback(
    async (collectionId: string) => {
      try {
        await deleteCollection(collectionId)
        setCollections((prev) => prev.filter((c) => c.id !== collectionId))
        setActiveCollectionIdState((prev) => (prev === collectionId ? null : prev))
        // If we just deleted the active collection, clear items too
        setActiveCollectionItemIds((prev) =>
          activeCollectionId === collectionId ? [] : prev,
        )
      } catch {
        console.error('Failed to delete collection')
      }
    },
    [activeCollectionId],
  )

  const addItem = useCallback(
    async (collectionId: string, generationId: string) => {
      try {
        await addToCollection(collectionId, generationId)
        // Update item count in local state
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId ? { ...c, itemCount: c.itemCount + 1 } : c,
          ),
        )
        // If this is the active collection, add to active items
        if (collectionId === activeCollectionId) {
          setActiveCollectionItemIds((prev) =>
            prev.includes(generationId) ? prev : [...prev, generationId],
          )
        }
      } catch {
        console.error('Failed to add to collection')
      }
    },
    [activeCollectionId],
  )

  const removeItem = useCallback(
    async (collectionId: string, generationId: string) => {
      try {
        await removeFromCollection(collectionId, generationId)
        // Decrement item count in local state
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId
              ? { ...c, itemCount: Math.max(0, c.itemCount - 1) }
              : c,
          ),
        )
        // If this is the active collection, remove from active items
        if (collectionId === activeCollectionId) {
          setActiveCollectionItemIds((prev) =>
            prev.filter((id) => id !== generationId),
          )
        }
      } catch {
        console.error('Failed to remove from collection')
      }
    },
    [activeCollectionId],
  )

  const setActiveCollection = useCallback(
    async (collectionId: string | null) => {
      setActiveCollectionIdState(collectionId)
      if (!collectionId) {
        setActiveCollectionItemIds([])
        return
      }
      try {
        const items = await fetchCollectionItems(collectionId)
        setActiveCollectionItemIds(items)
      } catch {
        console.error('Failed to fetch collection items')
        setActiveCollectionItemIds([])
      }
    },
    [],
  )

  return {
    collections,
    loading,
    activeCollectionId,
    activeCollectionItemIds,
    create,
    remove,
    addItem,
    removeItem,
    setActiveCollection,
  }
}
