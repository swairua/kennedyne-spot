import { useState, useRef, useMemo } from 'react';
import { Upload, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { FolderManager } from './FolderManager';
import { formatFileSize, calculateSavings } from '@/utils/imageOptimization';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MediaLibraryProps {
  onSelectImage?: (url: string, alt: string) => void;
  allowMultipleSelect?: boolean;
  compact?: boolean;
  enableDragToEditor?: boolean;
}

interface SortableImageProps {
  asset: any;
  isEditing: boolean;
  editAlt: string;
  onEditAltChange: (value: string) => void;
  onEditClick: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteClick: () => void;
  onSelect?: () => void;
}

function SortableImage({
  asset,
  isEditing,
  editAlt,
  onEditAltChange,
  onEditClick,
  onSaveEdit,
  onCancelEdit,
  onDeleteClick,
  onSelect,
}: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Set drag data for editor drop
    e.dataTransfer.setData('application/x-media-asset', JSON.stringify({
      url: asset.url,
      alt: asset.alt || '',
      width: asset.width,
      height: asset.height,
      sizes: asset.sizes,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-video bg-muted rounded-lg overflow-hidden border hover:border-primary/50 transition-colors"
    >
      <img
        src={asset.url}
        alt={asset.alt || 'Media asset'}
        className="w-full h-full object-cover cursor-pointer"
        onClick={onSelect}
        draggable={true}
        onDragStart={handleDragStart}
      />

      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded p-1 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onEditClick}
          className="h-7 w-7 p-0"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onDeleteClick}
          className="h-7 w-7 p-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {isEditing && (
        <div className="absolute bottom-0 left-0 right-0 bg-background/95 p-2 flex gap-1">
          <Input
            value={editAlt}
            onChange={(e) => onEditAltChange(e.target.value)}
            placeholder="Alt text..."
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSaveEdit}
            className="h-7 w-7 p-0 shrink-0"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelEdit}
            className="h-7 w-7 p-0 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!isEditing && asset.alt && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-2">
          <p className="text-xs text-foreground truncate">{asset.alt}</p>
          {asset.original_size && asset.optimized_size && (
            <p className="text-xs text-muted-foreground">
              Saved {calculateSavings(asset.original_size, asset.optimized_size)}% • {formatFileSize(asset.optimized_size)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function MediaLibrary({
  onSelectImage,
  allowMultipleSelect = false,
  compact = false,
}: MediaLibraryProps) {
  const { assets, loading, uploading, uploadAssets, deleteAsset, updateAsset, moveToFolder, reorderAssets } = useMediaLibrary();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; url: string } | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { folders, imageCounts } = useMemo(() => {
    const folderSet = new Set<string>();
    const counts: Record<string, number> = { root: 0 };

    assets.forEach((asset) => {
      if (asset.folder) {
        folderSet.add(asset.folder);
        counts[asset.folder] = (counts[asset.folder] || 0) + 1;
      } else {
        counts.root += 1;
      }
    });

    return {
      folders: Array.from(folderSet).sort(),
      imageCounts: counts,
    };
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => asset.folder === currentFolder);
  }, [assets, currentFolder]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await uploadAssets(files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadAssets(files);
    }
  };

  const handleEditClick = (id: string, currentAlt: string | null) => {
    setEditingId(id);
    setEditAlt(currentAlt || '');
  };

  const handleSaveEdit = async (id: string) => {
    await updateAsset(id, { alt: editAlt });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAlt('');
  };

  const handleDeleteClick = (id: string, url: string) => {
    setDeleteConfirm({ id, url });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm) {
      await deleteAsset(deleteConfirm.id, deleteConfirm.url);
      setDeleteConfirm(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredAssets.findIndex((asset) => asset.id === active.id);
      const newIndex = filteredAssets.findIndex((asset) => asset.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(filteredAssets, oldIndex, newIndex);
        const assetIds = reordered.map((asset) => asset.id);
        await reorderAssets(assetIds, 0);
      }
    }
  };

  const handleCreateFolder = async (name: string) => {
    toast.success(`Folder "${name}" created`);
  };

  const handleRenameFolder = async (oldName: string, newName: string) => {
    const folderAssets = assets.filter((a) => a.folder === oldName);
    for (const asset of folderAssets) {
      await updateAsset(asset.id, { folder: newName });
    }
    toast.success(`Folder renamed to "${newName}"`);
  };

  const handleDeleteFolder = async (name: string) => {
    const folderAssets = assets.filter((a) => a.folder === name);
    for (const asset of folderAssets) {
      await updateAsset(asset.id, { folder: null });
    }
    toast.success(`Folder "${name}" deleted`);
    setCurrentFolder(null);
  };

  return (
    <div className={`space-y-4 ${compact ? 'h-[500px]' : 'h-[600px]'} flex flex-col`}>
      <FolderManager
        folders={folders}
        currentFolder={currentFolder}
        onSelectFolder={setCurrentFolder}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
        imageCounts={imageCounts}
      />

      <div
        className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop images here, or click to browse
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Choose Files'}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Max 10MB per image • Auto-optimized to WebP • Multiple sizes generated
          {currentFolder && <span className="block mt-1">Uploading to: {currentFolder}</span>}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredAssets.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {currentFolder ? `No images in "${currentFolder}" folder` : 'No images in library'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload images to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
                {filteredAssets.map((asset) => (
                  <SortableImage
                    key={asset.id}
                    asset={asset}
                    isEditing={editingId === asset.id}
                    editAlt={editAlt}
                    onEditAltChange={setEditAlt}
                    onEditClick={() => handleEditClick(asset.id, asset.alt)}
                    onSaveEdit={() => handleSaveEdit(asset.id)}
                    onCancelEdit={handleCancelEdit}
                    onDeleteClick={() => handleDeleteClick(asset.id, asset.url)}
                    onSelect={onSelectImage ? () => onSelectImage(asset.url, asset.alt || '') : undefined}
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </DndContext>
      </ScrollArea>

      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
