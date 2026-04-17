import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { fetchGenerations, saveGeneration, deleteGeneration } from '@/lib/generations'
import type { Generation } from '@/types/workspace'

export function useGenerations() {
  const { user } = useAuth()
  const generations = useWorkspaceStore((s) => s.generations)
  const setGenerations = useWorkspaceStore((s) => s.setGenerations)
  const [loading, setLoading] = useState(false)
  const userId = user?.id

  // Load generations from Supabase once per user. Merges with in-memory
  // state so in-flight pending generations aren't clobbered if this runs again.
  useEffect(() => {
    if (!userId) return

    let cancelled = false
    setLoading(true)

    fetchGenerations(userId)
      .then((result) => {
        if (cancelled) return
        // Merge: keep any in-memory generations not present in DB (pending/just-completed)
        const current = useWorkspaceStore.getState().generations
        const dbIds = new Set(result.map((g) => g.id))
        const localOnly = current.filter((g) => !dbIds.has(g.id))
        setGenerations([...localOnly, ...result])
      })
      .catch((err) => {
        console.error('Failed to load generation history:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [userId, setGenerations])

  // Fire-and-forget persist function
  const persistGeneration = useCallback(
    (gen: Generation) => {
      if (!userId) return
      saveGeneration(userId, gen).catch((err) => {
        console.error('Failed to persist generation:', err)
      })
    },
    [userId]
  )

  const removeGeneration = useWorkspaceStore((s) => s.removeGeneration)

  const removeAndDelete = useCallback(
    async (genId: string) => {
      removeGeneration(genId)
      try {
        await deleteGeneration(genId)
        console.log('[generations] deleted from DB:', genId)
      } catch (err) {
        console.error('[generations] DB delete failed (removed locally):', err)
      }
    },
    [removeGeneration]
  )

  return { generations, persistGeneration, removeAndDelete, loading }
}
