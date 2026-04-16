import { useState } from 'react'
import { ArrowLeft, FolderOpen, Plus, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCollections } from '@/hooks/useCollections'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTranslation } from '@/hooks/useTranslation'

export function CollectionsView() {
  const {
    collections,
    loading,
    activeCollectionId,
    activeCollectionItemIds,
    create,
    setActiveCollection,
  } = useCollections()
  const generations = useWorkspaceStore((s) => s.generations)
  const setSelectedGenerationId = useWorkspaceStore((s) => s.setSelectedGenerationId)
  const setCanvasViewMode = useWorkspaceStore((s) => s.setCanvasViewMode)
  const setActiveView = useWorkspaceStore((s) => s.setActiveView)
  const { t } = useTranslation()

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) return
    await create(name.trim(), description.trim() || undefined)
    setName('')
    setDescription('')
    setShowCreate(false)
  }

  const handleOpenCollection = (collectionId: string) => {
    setActiveCollection(collectionId)
  }

  const handleBack = () => {
    setActiveCollection(null)
  }

  const handleImageClick = (generationId: string) => {
    setSelectedGenerationId(generationId)
    setCanvasViewMode('single')
    setActiveView('workspace')
  }

  // Items in the active collection
  const collectionItems = activeCollectionId
    ? generations.filter((g) => activeCollectionItemIds.includes(g.id))
    : []

  const activeCollection = collections.find((c) => c.id === activeCollectionId)


  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          {activeCollectionId && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleBack}
              className="rounded-none"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <h2 className="text-sm font-semibold">
            {activeCollection ? activeCollection.name : t('workspace.collections.title')}
          </h2>
          {activeCollection && (
            <span className="text-xs text-muted-foreground">
              {activeCollection.itemCount} {t('workspace.collections.items')}
            </span>
          )}
        </div>
        {!activeCollectionId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreate(true)}
            className="rounded-none gap-1"
          >
            <Plus className="size-3" />
            {t('workspace.collections.new')}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {/* Create form */}
        {showCreate && !activeCollectionId && (
          <div className="mb-4 border border-border p-3" style={{ maxWidth: 320 }}>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('workspace.collections.namePlaceholder')}
                className="w-full border border-border bg-background px-2 py-1 text-sm outline-none focus:border-foreground rounded-none"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('workspace.collections.descriptionPlaceholder')}
                className="w-full border border-border bg-background px-2 py-1 text-sm outline-none focus:border-foreground rounded-none"
              />
              <div className="flex gap-1">
                <Button
                  variant="default"
                  size="sm"
                  disabled={!name.trim()}
                  onClick={handleCreate}
                  className="flex-1 rounded-none text-xs"
                >
                  {t('workspace.collections.create')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowCreate(false); setName(''); setDescription('') }}
                  className="flex-1 rounded-none text-xs"
                >
                  {t('workspace.collections.cancel')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <p className="text-sm text-muted-foreground">{t('workspace.brandFace.loading')}</p>
        )}

        {/* Collection folders grid */}
        {!loading && !activeCollectionId && (
          <>
            {collections.length === 0 && !showCreate && (
              <p className="text-sm text-muted-foreground">{t('workspace.collections.empty')}</p>
            )}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {collections.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleOpenCollection(col.id)}
                  className="flex flex-col border border-border hover:border-foreground text-left"
                >
                  {/* Preview area */}
                  <div className="flex aspect-square items-center justify-center bg-muted/50">
                    <FolderOpen className="size-10 text-muted-foreground" />
                  </div>
                  {/* Info */}
                  <div className="border-t border-border px-2 py-1.5">
                    <p className="truncate text-xs font-medium">{col.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {col.itemCount} {t('workspace.collections.items')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Collection items (drill-down) */}
        {!loading && activeCollectionId && (
          <>
            {collectionItems.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('workspace.collections.emptyCollection')}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {collectionItems.map((gen) => (
                <button
                  key={gen.id}
                  type="button"
                  onClick={() => handleImageClick(gen.id)}
                  className="relative aspect-square border border-border bg-muted hover:border-foreground"
                >
                  {gen.status === 'completed' && gen.imageUrl ? (
                    <img
                      src={gen.thumbnailUrl ?? gen.imageUrl}
                      alt={gen.prompt}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Image className="size-6 text-muted-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
