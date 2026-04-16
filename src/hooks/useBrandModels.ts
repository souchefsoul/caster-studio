import { useState, useEffect, useCallback } from 'react'
import type { BrandModel } from '@/types/workspace'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchBrandModels,
  createBrandModel,
  setActiveBrandModel,
  deleteBrandModel,
} from '@/lib/brandModels'

export function useBrandModels() {
  const { user } = useAuth()
  const [models, setModels] = useState<BrandModel[]>([])
  const [loading, setLoading] = useState(true)

  const activeModel = models.find((m) => m.isActive) ?? null

  useEffect(() => {
    if (!user) {
      setModels([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    fetchBrandModels(user.id)
      .then((data) => {
        if (!cancelled) setModels(data)
      })
      .catch((err) => {
        console.error('Failed to fetch brand models:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [user])

  const create = useCallback(async (name: string, faceImageUrl: string) => {
    if (!user) return
    try {
      const model = await createBrandModel(user.id, name, faceImageUrl)
      setModels((prev) => [model, ...prev])
    } catch (err) {
      console.error('Failed to create brand model:', err)
    }
  }, [user])

  const remove = useCallback(async (modelId: string) => {
    try {
      await deleteBrandModel(modelId)
      setModels((prev) => prev.filter((m) => m.id !== modelId))
    } catch (err) {
      console.error('Failed to delete brand model:', err)
    }
  }, [])

  const setActive = useCallback(async (modelId: string) => {
    if (!user) return
    try {
      await setActiveBrandModel(user.id, modelId)
      setModels((prev) =>
        prev.map((m) => ({ ...m, isActive: m.id === modelId }))
      )
    } catch (err) {
      console.error('Failed to set active brand model:', err)
    }
  }, [user])

  return { models, activeModel, loading, create, remove, setActive }
}
