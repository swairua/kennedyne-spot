import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { ImageInput } from '@/components/ui/image-input';
import { DocumentInput } from '@/components/ui/document-input';
import { toast } from 'sonner';
import { 
  useCourses, useCoursesMutation,
  useEbooks, useEbooksMutation,
  useMaterials, useMaterialsMutation,
  type Course, type Ebook, type Material
} from '@/hooks/useResources';
import { useSiteContent } from '@/hooks/useSiteContent';

type ResourceType = 'courses' | 'ebooks' | 'materials';

interface EditingItem {
  type: ResourceType;
  item?: Course | Ebook | Material;
  isNew: boolean;
}

const LibraryAdminEnhanced = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showMigration, setShowMigration] = useState(false);

  // Fetch data from database
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: ebooks = [], isLoading: ebooksLoading } = useEbooks();
  const { data: materials = [], isLoading: materialsLoading } = useMaterials();

  // Mutations
  const { createCourse, updateCourse, deleteCourse } = useCoursesMutation();
  const { createEbook, updateEbook, deleteEbook } = useEbooksMutation();
  const { createMaterial, updateMaterial, deleteMaterial } = useMaterialsMutation();

  // Local storage data for migration
  const { content } = useSiteContent();

  const [formData, setFormData] = useState<any>({});

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSave = async () => {
    if (!editingItem) return;

    const baseData = {
      title: formData.title || '',
      slug: formData.slug || generateSlug(formData.title || ''),
      description: formData.description || '',
      tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      cover_image_url: formData.cover_image_url || '',
      published: formData.published || false,
    };

    try {
      if (editingItem.type === 'courses') {
        const courseData = {
          ...baseData,
          level: formData.level || '',
          duration: formData.duration || '',
          course_url: formData.course_url || '',
        };

        if (editingItem.isNew) {
          createCourse.mutate(courseData);
        } else {
          updateCourse.mutate({ id: formData.id, ...courseData });
        }
      } else if (editingItem.type === 'ebooks') {
        const ebookData = {
          ...baseData,
          author: formData.author || '',
          pages: formData.pages ? parseInt(formData.pages) : undefined,
          download_url: formData.download_url || '',
        };

        if (editingItem.isNew) {
          createEbook.mutate(ebookData);
        } else {
          updateEbook.mutate({ id: formData.id, ...ebookData });
        }
      } else if (editingItem.type === 'materials') {
        const materialData = {
          ...baseData,
          type: formData.type || '',
          topic: formData.topic || '',
          material_url: formData.material_url || '',
        };

        if (editingItem.isNew) {
          createMaterial.mutate(materialData);
        } else {
          updateMaterial.mutate({ id: formData.id, ...materialData });
        }
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (type: ResourceType, id: string, item?: Course | Ebook | Material) => {
    const hasStorageFile = item && (
      (type === 'ebooks' && 'download_url' in item && item.download_url) ||
      (type === 'materials' && 'material_url' in item && item.material_url)
    );

    const message = hasStorageFile 
      ? 'Are you sure you want to delete this item? This will also delete associated files from storage.'
      : 'Are you sure you want to delete this item?';
    
    if (!confirm(message)) return;

    try {
      if (type === 'courses') {
        deleteCourse.mutate(id);
      } else if (type === 'ebooks') {
        deleteEbook.mutate(id);
      } else if (type === 'materials') {
        deleteMaterial.mutate(id);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openEditDialog = (type: ResourceType, item?: Course | Ebook | Material) => {
    setEditingItem({ type, item, isNew: !item });
    setFormData(item ? { ...item, tags: (item.tags || []).join(', ') } : {});
    setIsDialogOpen(true);
  };

  const migrateLocalContent = async () => {
    if (!content?.resources) {
      toast.error('No local content found to migrate');
      return;
    }

    try {
      // Migrate courses
      for (const course of content.resources.courses || []) {
        const courseData = {
          title: course.title,
          slug: course.slug,
          description: course.description,
          level: course.level,
          duration: (course as any).duration || '',
          tags: course.tags || [],
          cover_image_url: (course as any).coverImageUrl || (course as any).cover_image_url,
          course_url: (course as any).url || (course as any).course_url,
          published: true,
        };
        createCourse.mutate(courseData);
      }

      // Migrate ebooks
      for (const ebook of content.resources.ebooks || []) {
        const ebookData = {
          title: ebook.title,
          slug: ebook.slug,
          description: ebook.description,
          author: ebook.author,
          pages: ebook.pages,
          tags: ebook.tags || [],
          cover_image_url: (ebook as any).coverImageUrl || (ebook as any).cover_image_url,
          download_url: (ebook as any).downloadUrl || (ebook as any).download_url,
          published: true,
        };
        createEbook.mutate(ebookData);
      }

      // Migrate materials
      for (const material of content.resources.materials || []) {
        const materialData = {
          title: material.title,
          slug: material.slug,
          description: material.description,
          type: material.type,
          topic: material.topic,
          tags: material.tags || [],
          cover_image_url: (material as any).coverImageUrl || (material as any).cover_image_url,
          material_url: (material as any).url || (material as any).material_url,
          published: true,
        };
        createMaterial.mutate(materialData);
      }

      toast.success('Local content migrated successfully!');
      setShowMigration(false);
    } catch (error) {
      toast.error('Failed to migrate content');
      console.error('Migration error:', error);
    }
  };

  const filteredItems = (items: any[], type: ResourceType) => {
    return items.filter(item =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderEditForm = () => {
    if (!editingItem) return null;

    const { type } = editingItem;
    const isFileBasedMaterial = type === 'materials' && ['pdf', 'sheet', 'template'].includes(formData.type);

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter title"
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug || ''}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="Auto-generated from title"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags || ''}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="trading, forex, education"
          />
        </div>

        <ImageInput
          label="Cover Image"
          value={formData.cover_image_url || ''}
          onChange={(value) => setFormData({ ...formData, cover_image_url: value })}
          bucketName="resources"
          folderPrefix="images"
        />

        {type === 'courses' && (
          <>
            <div>
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                value={formData.level || ''}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                placeholder="Beginner, Intermediate, Advanced"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="4 weeks, 10 hours"
              />
            </div>
            <div>
              <Label htmlFor="course_url">Course URL</Label>
              <Input
                id="course_url"
                value={formData.course_url || ''}
                onChange={(e) => setFormData({ ...formData, course_url: e.target.value })}
                placeholder="https://example.com/course or leave blank for internal /courses/:slug"
              />
              {formData.course_url && !formData.course_url.startsWith('http') && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ External URLs should start with http:// or https://
                </p>
              )}
            </div>
          </>
        )}

        {type === 'ebooks' && (
          <>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author || ''}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
              />
            </div>
            <div>
              <Label htmlFor="pages">Pages</Label>
              <Input
                id="pages"
                type="number"
                value={formData.pages || ''}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                placeholder="Number of pages"
              />
            </div>
            <DocumentInput
              label="E-book File"
              value={formData.download_url || ''}
              onChange={(value) => setFormData({ ...formData, download_url: value })}
              bucketName="resources"
              folderPrefix="ebooks"
              accept=".pdf,.epub,.mobi"
            />
          </>
        )}

        {type === 'materials' && (
          <>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="pdf, video, article, sheet, template"
              />
            </div>
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={formData.topic || ''}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Risk Management, Technical Analysis"
              />
            </div>
            {isFileBasedMaterial ? (
              <DocumentInput
                label="Material File"
                value={formData.material_url || ''}
                onChange={(value) => setFormData({ ...formData, material_url: value })}
                bucketName="resources"
                folderPrefix="materials"
              />
            ) : (
              <div>
                <Label htmlFor="material_url">Material URL</Label>
                <Input
                  id="material_url"
                  value={formData.material_url || ''}
                  onChange={(e) => setFormData({ ...formData, material_url: e.target.value })}
                  placeholder="https://example.com/material"
                />
                {formData.material_url && !formData.material_url.startsWith('http') && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ External URLs should start with http:// or https://
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={formData.published || false}
            onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
          />
          <Label htmlFor="published">Published</Label>
        </div>
      </div>
    );
  };

  if (coursesLoading || ebooksLoading || materialsLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Library Management
            <div className="flex space-x-2">
              {content?.resources && (
                <Button
                  variant="outline"
                  onClick={() => setShowMigration(!showMigration)}
                  className="text-sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Migrate Local Data
                </Button>
              )}
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your courses, e-books, and materials. Upload files to cloud storage for permanent access.
          </p>
        </CardHeader>
        <CardContent>
          {showMigration && content?.resources && (
            <div className="mb-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <h3 className="font-semibold mb-2">Migrate Local Content</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Found {(content.resources.courses?.length || 0) + (content.resources.ebooks?.length || 0) + (content.resources.materials?.length || 0)} items in local storage. 
                Click below to migrate them to the database.
              </p>
              <div className="flex space-x-2">
                <Button onClick={migrateLocalContent} size="sm">
                  Migrate Now
                </Button>
                <Button variant="outline" onClick={() => setShowMigration(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="courses" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
              <TabsTrigger value="ebooks">E-books ({ebooks.length})</TabsTrigger>
              <TabsTrigger value="materials">Materials ({materials.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Courses</h3>
                <Button onClick={() => openEditDialog('courses')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems(courses, 'courses').map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.level}</TableCell>
                      <TableCell>{course.duration}</TableCell>
                      <TableCell>
                        <Badge variant={course.published ? "default" : "secondary"}>
                          {course.published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {course.published && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              {course.course_url && course.course_url.startsWith('http') ? (
                                <a href={course.course_url} target="_blank" rel="noopener noreferrer">
                                  View
                                </a>
                              ) : (
                                <Link to={`/courses/${course.slug}`}>
                                  View
                                </Link>
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog('courses', course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleDelete('courses', course.id, course)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="ebooks" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">E-books</h3>
                <Button onClick={() => openEditDialog('ebooks')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add E-book
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems(ebooks, 'ebooks').map((ebook) => (
                    <TableRow key={ebook.id}>
                      <TableCell className="font-medium">{ebook.title}</TableCell>
                      <TableCell>{ebook.author}</TableCell>
                      <TableCell>{ebook.pages}</TableCell>
                      <TableCell>
                        <Badge variant={ebook.published ? "default" : "secondary"}>
                          {ebook.published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog('ebooks', ebook)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleDelete('ebooks', ebook.id, ebook)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Materials</h3>
                <Button onClick={() => openEditDialog('materials')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems(materials, 'materials').map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.title}</TableCell>
                      <TableCell>{material.type}</TableCell>
                      <TableCell>{material.topic}</TableCell>
                      <TableCell>
                        <Badge variant={material.published ? "default" : "secondary"}>
                          {material.published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog('materials', material)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleDelete('materials', material.id, material)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.isNew ? 'Add' : 'Edit'} {editingItem?.type?.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          {renderEditForm()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingItem?.isNew ? 'Create' : 'Update'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LibraryAdminEnhanced;