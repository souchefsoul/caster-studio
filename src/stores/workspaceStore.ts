import { create } from 'zustand'
import type { CanvasViewMode, GenerationParams, Generation, GenerationMode } from '@/types/workspace'
import { DEFAULT_GENERATION_PARAMS } from '@/types/workspace'

type Theme = 'light' | 'dark'

const THEME_KEY = 'stivra-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface WorkspaceState {
  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void

  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // Canvas
  canvasViewMode: CanvasViewMode
  setCanvasViewMode: (mode: CanvasViewMode) => void

  // Generation
  currentMode: GenerationMode
  setCurrentMode: (mode: GenerationMode) => void
  params: GenerationParams
  setParams: (params: Partial<GenerationParams>) => void
  resetParams: () => void

  // Generations list (in-memory for now)
  generations: Generation[]
  addGeneration: (gen: Generation) => void
  updateGeneration: (id: string, update: Partial<Generation>) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => {
  // Apply theme on store creation
  const initialTheme = getInitialTheme()
  if (typeof window !== 'undefined') applyTheme(initialTheme)

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      localStorage.setItem(THEME_KEY, theme)
      applyTheme(theme)
      set({ theme })
    },
    toggleTheme: () => set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_KEY, next)
      applyTheme(next)
      return { theme: next }
    }),

    sidebarOpen: true,
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

    canvasViewMode: 'single',
    setCanvasViewMode: (canvasViewMode) => set({ canvasViewMode }),

    currentMode: 'on-model',
    setCurrentMode: (currentMode) => set({ currentMode }),

    params: { ...DEFAULT_GENERATION_PARAMS },
    setParams: (params) => set((s) => ({ params: { ...s.params, ...params } })),
    resetParams: () => set({ params: { ...DEFAULT_GENERATION_PARAMS } }),

    generations: [],
    addGeneration: (gen) => set((s) => ({ generations: [gen, ...s.generations] })),
    updateGeneration: (id, update) => set((s) => ({
      generations: s.generations.map((g) => g.id === id ? { ...g, ...update } : g),
    })),
  }
})
