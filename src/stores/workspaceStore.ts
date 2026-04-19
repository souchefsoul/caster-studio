import { create } from 'zustand'
import type { CanvasViewMode, GenerationParams, Generation, GenerationMode, ActiveView } from '@/types/workspace'
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

function getInitialSidebarOpen(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(min-width: 1024px)').matches
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

  // Gallery overlay (mobile primary-flip — Phase 5.1)
  galleryOpen: boolean
  setGalleryOpen: (open: boolean) => void
  toggleGallery: () => void

  // Active view (workspace / brand-face / collections)
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void

  // Canvas
  canvasViewMode: CanvasViewMode
  setCanvasViewMode: (mode: CanvasViewMode) => void

  // Generation
  currentMode: GenerationMode
  setCurrentMode: (mode: GenerationMode) => void
  params: GenerationParams
  setParams: (params: Partial<GenerationParams>) => void
  resetParams: () => void

  // Product images (on-model mode) — up to 10 reference images
  productImages: string[]
  setProductImages: (urls: string[]) => void
  addProductImage: (url: string) => void
  removeProductImage: (index: number) => void

  // On-model view: which side of the model should be shown
  onModelView: 'front' | 'back'
  setOnModelView: (view: 'front' | 'back') => void

  // Brand face
  activeBrandFaceUrl: string | null
  setActiveBrandFaceUrl: (url: string | null) => void

  // Catalog mode
  catalogAngles: string[]
  setCatalogAngles: (angles: string[]) => void
  catalogProductImage: string | null
  setCatalogProductImage: (url: string | null) => void
  catalogProductBackImage: string | null
  setCatalogProductBackImage: (url: string | null) => void

  // Colorway mode
  colorwayColors: string[]
  setColorwayColors: (colors: string[]) => void
  colorwayProductImage: string | null
  setColorwayProductImage: (url: string | null) => void

  // Design copy mode
  designCopyReferenceImage: string | null
  setDesignCopyReferenceImage: (url: string | null) => void
  designCopyModifications: string
  setDesignCopyModifications: (text: string) => void

  // Video mode
  videoSourceImage: string | null
  setVideoSourceImage: (url: string | null) => void
  videoPrompt: string
  setVideoPrompt: (text: string) => void

  // Generations list
  selectedGenerationId: string | null
  setSelectedGenerationId: (id: string | null) => void
  generations: Generation[]
  setGenerations: (gens: Generation[]) => void
  addGeneration: (gen: Generation) => void
  updateGeneration: (id: string, update: Partial<Generation>) => void
  removeGeneration: (id: string) => void
  clearFailedGenerations: () => void
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

    sidebarOpen: getInitialSidebarOpen(),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

    galleryOpen: false,
    setGalleryOpen: (galleryOpen) => set({ galleryOpen }),
    toggleGallery: () => set((s) => ({ galleryOpen: !s.galleryOpen })),

    activeView: 'workspace',
    setActiveView: (activeView) => set({ activeView }),

    canvasViewMode: 'grid',
    setCanvasViewMode: (canvasViewMode) => set({ canvasViewMode }),

    currentMode: 'on-model',
    setCurrentMode: (currentMode) => set({ currentMode, activeView: 'workspace' }),

    params: { ...DEFAULT_GENERATION_PARAMS },
    setParams: (params) => set((s) => ({ params: { ...s.params, ...params } })),
    resetParams: () => set({ params: { ...DEFAULT_GENERATION_PARAMS } }),

    productImages: [],
    setProductImages: (productImages) => set({ productImages }),
    addProductImage: (url) => set((s) => ({
      productImages: s.productImages.length >= 10 ? s.productImages : [...s.productImages, url],
    })),
    removeProductImage: (index) => set((s) => ({
      productImages: s.productImages.filter((_, i) => i !== index),
    })),

    onModelView: 'front',
    setOnModelView: (onModelView) => set({ onModelView }),

    activeBrandFaceUrl: null,
    setActiveBrandFaceUrl: (activeBrandFaceUrl) => set({ activeBrandFaceUrl }),

    catalogAngles: ['front', 'back', 'side-left', 'side-right'],
    setCatalogAngles: (catalogAngles) => set({ catalogAngles }),
    catalogProductImage: null,
    setCatalogProductImage: (catalogProductImage) => set({ catalogProductImage }),
    catalogProductBackImage: null,
    setCatalogProductBackImage: (catalogProductBackImage) => set({ catalogProductBackImage }),

    colorwayColors: ['Red', 'Blue', 'Green'],
    setColorwayColors: (colorwayColors) => set({ colorwayColors }),
    colorwayProductImage: null,
    setColorwayProductImage: (colorwayProductImage) => set({ colorwayProductImage }),

    designCopyReferenceImage: null,
    setDesignCopyReferenceImage: (designCopyReferenceImage) => set({ designCopyReferenceImage }),
    designCopyModifications: '',
    setDesignCopyModifications: (designCopyModifications) => set({ designCopyModifications }),

    videoSourceImage: null,
    setVideoSourceImage: (videoSourceImage) => set({ videoSourceImage }),
    videoPrompt: '',
    setVideoPrompt: (videoPrompt) => set({ videoPrompt }),

    selectedGenerationId: null,
    setSelectedGenerationId: (selectedGenerationId) => set({ selectedGenerationId }),
    generations: [],
    setGenerations: (generations) => set({ generations }),
    addGeneration: (gen) => set((s) => ({ generations: [gen, ...s.generations] })),
    updateGeneration: (id, update) => set((s) => ({
      generations: s.generations.map((g) => g.id === id ? { ...g, ...update } : g),
    })),
    removeGeneration: (id) => set((s) => ({
      generations: s.generations.filter((g) => g.id !== id),
    })),
    clearFailedGenerations: () => set((s) => ({
      generations: s.generations.filter((g) => g.status !== 'failed'),
    })),
  }
})
