import { useState } from 'react';
import { Folder, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface FolderManagerProps {
  folders: string[];
  currentFolder: string | null;
  onSelectFolder: (folder: string | null) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onRenameFolder: (oldName: string, newName: string) => Promise<void>;
  onDeleteFolder: (name: string) => Promise<void>;
  imageCounts: Record<string, number>;
}

export function FolderManager({
  folders,
  currentFolder,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  imageCounts,
}: FolderManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setIsCreating(false);
  };

  const handleRenameFolder = async (oldName: string) => {
    if (!editName.trim() || editName === oldName) {
      setEditingFolder(null);
      return;
    }
    await onRenameFolder(oldName, editName.trim());
    setEditingFolder(null);
  };

  const handleDeleteFolder = async (name: string) => {
    await onDeleteFolder(name);
    setDeleteConfirm(null);
  };

  const startEdit = (name: string) => {
    setEditingFolder(name);
    setEditName(name);
  };

  return (
    <div className="space-y-2 pb-4 border-b">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-foreground">Folders</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsCreating(true)}
          className="h-7 px-2"
        >
          <Plus className="h-3 w-3 mr-1" />
          New
        </Button>
      </div>

      {/* Root folder */}
      <Button
        type="button"
        variant={currentFolder === null ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onSelectFolder(null)}
        className="w-full justify-start h-8"
      >
        <Folder className="h-3 w-3 mr-2" />
        <span className="flex-1 text-left">All Images</span>
        <Badge variant="outline" className="ml-2 h-5">
          {imageCounts['root'] || 0}
        </Badge>
      </Button>

      {/* Create new folder input */}
      {isCreating && (
        <div className="flex items-center gap-1">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name..."
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') setIsCreating(false);
            }}
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCreateFolder}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Folder list */}
      <div className="space-y-1">
        {folders.map((folder) => (
          <div key={folder} className="flex items-center gap-1">
            {editingFolder === folder ? (
              <>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameFolder(folder);
                    if (e.key === 'Escape') setEditingFolder(null);
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRenameFolder(folder)}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingFolder(null)}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant={currentFolder === folder ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onSelectFolder(folder)}
                  className="flex-1 justify-start h-8"
                >
                  <Folder className="h-3 w-3 mr-2" />
                  <span className="flex-1 text-left truncate">{folder}</span>
                  <Badge variant="outline" className="ml-2 h-5">
                    {imageCounts[folder] || 0}
                  </Badge>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(folder)}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(folder)}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the folder "{deleteConfirm}"?
              {imageCounts[deleteConfirm || ''] > 0 && (
                <span className="block mt-2 text-destructive">
                  This folder contains {imageCounts[deleteConfirm || '']} image(s). They will be moved to the root folder.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDeleteFolder(deleteConfirm)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
