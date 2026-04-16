import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCollections } from '@/hooks/useCollections'
import { useTranslation } from '@/hooks/useTranslation'

export function CollectionsPanel() {
  const {
    collections,
    loading,
    activeCollectionId,
    create,
    remove,
    setActiveCollection,
  } = useCollections()
  const { t } = useTranslation()

  const [view, setView] = useState<'list' | 'create'>('list')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) return
    await create(name.trim(), description.trim() || undefined)
    setName('')
    setDescription('')
    setView('list')
  }

  if (loading) {
    return (
      <div className="px-1">
        <p className="text-xs text-muted-foreground">
          {t('workspace.brandFace.loading')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-xs font-semibold uppercase text-muted-foreground">
        {t('workspace.collections.title')}
      </p>

      {view === 'list' ? (
        <>
          {/* All button */}
          <Button
            variant={activeCollectionId === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCollection(null)}
            className="w-full justify-start rounded-none text-xs"
          >
            {t('workspace.collections.all')}
          </Button>

          {/* Collection list */}
          {collections.length === 0 ? (
            <p className="px-1 text-xs text-muted-foreground">
              {t('workspace.collections.empty')}
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => setActiveCollection(col.id)}
                  className={`flex cursor-pointer items-center justify-between border border-border px-2 py-1 hover:bg-accent ${
                    activeCollectionId === col.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="truncate text-xs">{col.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {col.itemCount} {t('workspace.collections.items')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(col.id)
                    }}
                    className="shrink-0 p-0.5 text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New collection button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView('create')}
            className="w-full rounded-none text-xs"
          >
            {t('workspace.collections.new')}
          </Button>
        </>
      ) : (
        <>
          {/* Create form */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('workspace.collections.namePlaceholder')}
            className="w-full border border-border bg-background px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none rounded-none"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('workspace.collections.descriptionPlaceholder')}
            className="w-full border border-border bg-background px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none rounded-none"
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
              variant="outline"
              size="sm"
              onClick={() => {
                setName('')
                setDescription('')
                setView('list')
              }}
              className="flex-1 rounded-none text-xs"
            >
              {t('workspace.collections.cancel')}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
