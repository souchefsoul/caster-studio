import { create } from 'zustand'
import type { CanvasViewMode, GenerationParams, Generation, GenerationMode, ActiveView } from '@/types/workspace'
import type { BatchJob, BatchJobItem } from '@/types/batch'
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
  removeGenerations: (ids: string[]) => void
  clearFailedGenerations: () => void

  // Multi-select (gallery batch actions)
  selectionMode: boolean
  selectedIds: string[]
  setSelectionMode: (on: boolean) => void
  toggleSelectionMode: () => void
  toggleSelected: (id: string) => void
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void

  // Batch queue (durable, multi-product on-model generations)
  batchJobs: BatchJob[]
  batchItemsByJob: Record<string, BatchJobItem[]>
  batchLoading: boolean
  queueDrawerOpen: boolean
  setBatchJobs: (jobs: BatchJob[]) => void
  upsertBatchJob: (job: BatchJob) => void
  removeBatchJob: (id: string) => void
  setBatchItems: (jobId: string, items: BatchJobItem[]) => void
  upsertBatchItem: (item: BatchJobItem) => void
  removeBatchItem: (jobId: string, itemId: string) => void
  setBatchLoading: (loading: boolean) => void
  setQueueDrawerOpen: (open: boolean) => void
  toggleQueueDrawer: () => void
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
      selectedIds: s.selectedIds.filter((x) => x !== id),
    })),
    removeGenerations: (ids) => set((s) => {
      const remove = new Set(ids)
      return {
        generations: s.generations.filter((g) => !remove.has(g.id)),
        selectedIds: s.selectedIds.filter((x) => !remove.has(x)),
      }
    }),
    clearFailedGenerations: () => set((s) => ({
      generations: s.generations.filter((g) => g.status !== 'failed'),
    })),

    selectionMode: false,
    selectedIds: [],
    setSelectionMode: (on) => set(() => (on ? { selectionMode: true } : { selectionMode: false, selectedIds: [] })),
    toggleSelectionMode: () => set((s) => (s.selectionMode ? { selectionMode: false, selectedIds: [] } : { selectionMode: true })),
    toggleSelected: (id) => set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),
    setSelectedIds: (selectedIds) => set({ selectedIds }),
    clearSelection: () => set({ selectedIds: [] }),

    batchJobs: [],
    batchItemsByJob: {},
    batchLoading: false,
    queueDrawerOpen: false,
    setBatchJobs: (batchJobs) => set({ batchJobs }),
    upsertBatchJob: (job) => set((s) => {
      const i = s.batchJobs.findIndex((j) => j.id === job.id)
      if (i >= 0) {
        const next = s.batchJobs.slice()
        next[i] = job
        return { batchJobs: next }
      }
      return { batchJobs: [job, ...s.batchJobs] }
    }),
    removeBatchJob: (id) => set((s) => {
      const nextItems = { ...s.batchItemsByJob }
      delete nextItems[id]
      return {
        batchJobs: s.batchJobs.filter((j) => j.id !== id),
        batchItemsByJob: nextItems,
      }
    }),
    setBatchItems: (jobId, items) => set((s) => ({
      batchItemsByJob: { ...s.batchItemsByJob, [jobId]: items },
    })),
    upsertBatchItem: (item) => set((s) => {
      const cur = s.batchItemsByJob[item.batchJobId] ?? []
      const i = cur.findIndex((x) => x.id === item.id)
      const next = i >= 0
        ? cur.map((x, idx) => (idx === i ? item : x))
        : [...cur, item].sort((a, b) => a.orderIndex - b.orderIndex)
      return { batchItemsByJob: { ...s.batchItemsByJob, [item.batchJobId]: next } }
    }),
    removeBatchItem: (jobId, itemId) => set((s) => {
      const cur = s.batchItemsByJob[jobId] ?? []
      return { batchItemsByJob: { ...s.batchItemsByJob, [jobId]: cur.filter((x) => x.id !== itemId) } }
    }),
    setBatchLoading: (batchLoading) => set({ batchLoading }),
    setQueueDrawerOpen: (queueDrawerOpen) => set({ queueDrawerOpen }),
    toggleQueueDrawer: () => set((s) => ({ queueDrawerOpen: !s.queueDrawerOpen })),
  }
})
