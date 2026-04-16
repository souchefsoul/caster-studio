import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { fetchGenerations, saveGeneration } from '@/lib/generations'
import type { Generation } from '@/types/workspace'

export function useGenerations() {
  const { user } = useAuth()
  const generations = useWorkspaceStore((s) => s.generations)
  const setGenerations = useWorkspaceStore((s) => s.setGenerations)
  const [loading, setLoading] = useState(false)

  // Load generations from Supabase on mount when user is available
  useEffect(() => {
    if (!user) return

    let cancelled = false
    setLoading(true)

    fetchGenerations(user.id)
      .then((result) => {
        if (!cancelled) {
          setGenerations(result)
        }
      })
      .catch((err) => {
        console.error('Failed to load generation history:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [user, setGenerations])

  // Fire-and-forget persist function
  const persistGeneration = useCallback(
    (gen: Generation) => {
      if (!user) return
      saveGeneration(user.id, gen).catch((err) => {
        console.error('Failed to persist generation:', err)
      })
    },
    [user]
  )

  return { generations, persistGeneration, loading }
}
