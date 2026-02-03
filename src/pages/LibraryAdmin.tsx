import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ImageInput } from '@/components/ui/image-input';
import { DocumentInput } from '@/components/ui/document-input';
import { getSiteContent, updateSiteContent, type Course, type Ebook, type Material } from '@/content/siteContent';
import { Plus, Search, Edit, Trash2, BookOpen, FileText, GraduationCap } from 'lucide-react';

type ResourceType = 'courses' | 'ebooks' | 'materials';

interface EditingItem {
  type: ResourceType;
  item: Course | Ebook | Material | null;
  isNew: boolean;
}

export default function LibraryAdmin() {
  const [content, setContent] = useState(getSiteContent());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<EditingItem>({ type: 'courses', item: null, isNew: false });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{[key: string]: string}>({});

  const refreshContent = () => {
    setContent(getSiteContent());
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSave = (formData: FormData) => {
    const { type, isNew } = editingItem;
    const now = new Date().toISOString();
    const title = formData.get('title') as string;
    
    const baseItem = {
      id: isNew ? crypto.randomUUID() : (editingItem.item?.id || ''),
      title,
      description: formData.get('description') as string,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
      coverImage: formData.get('coverImage') as string || undefined,
      slug: isNew ? generateSlug(title) : editingItem.item?.slug || generateSlug(title),
      createdAt: isNew ? now : editingItem.item?.createdAt || now,
      updatedAt: now,
    };

    let newItem: Course | Ebook | Material;

    if (type === 'courses') {
      newItem = {
        ...baseItem,
        level: formData.get('level') as 'Beginner' | 'Intermediate' | 'Advanced',
        url: formData.get('url') as string || undefined,
      } as Course;
    } else if (type === 'ebooks') {
      newItem = {
        ...baseItem,
        author: formData.get('author') as string,
        pages: formData.get('pages') ? parseInt(formData.get('pages') as string) : undefined,
        downloadUrl: formData.get('downloadUrl') as string,
      } as Ebook;
    } else {
      newItem = {
        ...baseItem,
        type: formData.get('type') as 'pdf' | 'video' | 'article' | 'sheet' | 'template',
        topic: formData.get('topic') as string,
        level: formData.get('level') as 'Beginner' | 'Intermediate' | 'Advanced',
        url: formData.get('url') as string,
      } as Material;
    }

    const currentResources = content.resources;
    let updatedItems;

    if (isNew) {
      updatedItems = [...currentResources[type], newItem];
    } else {
      updatedItems = currentResources[type].map(item => 
        item.id === newItem.id ? newItem : item
      );
    }

    updateSiteContent({
      resources: {
        ...currentResources,
        [type]: updatedItems,
      },
    });

    refreshContent();
    setIsDialogOpen(false);
    setEditingItem({ type: 'courses', item: null, isNew: false });
    toast({
      title: "Success",
      description: `${type.slice(0, -1)} ${isNew ? 'created' : 'updated'} successfully`,
    });
  };

  const handleDelete = (type: ResourceType, id: string) => {
    const currentResources = content.resources;
    const updatedItems = currentResources[type].filter(item => item.id !== id);

    updateSiteContent({
      resources: {
        ...currentResources,
        [type]: updatedItems,
      },
    });

    refreshContent();
    toast({
      title: "Success",
      description: `${type.slice(0, -1)} deleted successfully`,
    });
  };

  const openEditDialog = (type: ResourceType, item?: Course | Ebook | Material) => {
    setEditingItem({ type, item: item || null, isNew: !item });
    setIsDialogOpen(true);
  };

  const filteredItems = (type: ResourceType) => {
    return content.resources[type].filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderEditForm = () => {
    const { type, item, isNew } = editingItem;

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSave(new FormData(e.currentTarget));
      }}>
        <div className="grid gap-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={item?.title || ''}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={item?.tags?.join(', ') || ''}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={item?.description || ''}
              required
              rows={3}
            />
          </div>

          <ImageInput
            label="Cover Image"
            value={formData.coverImage || item?.coverImage || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, coverImage: value }))}
            placeholder="Upload cover image or enter URL"
            maxSizeText="Max 5MB, recommended: 400x300px"
            aspectRatio="aspect-[4/3]"
            bucketName="blog-images"
          />
          
          <input type="hidden" name="coverImage" value={formData.coverImage || item?.coverImage || ''} />

          {type === 'courses' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Select name="level" defaultValue={(item as Course)?.level || 'Beginner'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">Course URL</Label>
                <Input
                  id="url"
                  name="url"
                  defaultValue={(item as Course)?.url || ''}
                  placeholder="/courses/course-slug"
                />
              </div>
            </div>
          )}

          {type === 'ebooks' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    name="author"
                    defaultValue={(item as Ebook)?.author || ''}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pages">Pages</Label>
                  <Input
                    id="pages"
                    name="pages"
                    type="number"
                    defaultValue={(item as Ebook)?.pages || ''}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <DocumentInput
                  label="Download File"
                  value={(item as Ebook)?.downloadUrl || ''}
                  onChange={(value) => {
                    const input = document.getElementById('downloadUrl') as HTMLInputElement;
                    if (input) input.value = value;
                  }}
                  placeholder="Upload PDF or enter download URL"
                  bucketName="resources"
                  accept=".pdf,.epub,.mobi,.doc,.docx"
                />
                <input type="hidden" id="downloadUrl" name="downloadUrl" defaultValue={(item as Ebook)?.downloadUrl || ''} />
              </div>
            </div>
          )}

          {type === 'materials' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue={(item as Material)?.type || 'pdf'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="sheet">Cheat Sheet</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    name="topic"
                    defaultValue={(item as Material)?.topic || ''}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="level">Level</Label>
                  <Select name="level" defaultValue={(item as Material)?.level || 'Beginner'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <div id="material-url-wrapper">
                  <Label htmlFor="url">Material URL</Label>
                  <Input
                    id="url"
                    name="url"
                    defaultValue={(item as Material)?.url || ''}
                    required
                    placeholder="/materials/material.pdf"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="submit" variant="hero">
            {isNew ? 'Create' : 'Update'} {type.slice(0, -1)}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="container px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Library Manager
          </CardTitle>
          <CardDescription>
            Manage courses, e-books, and learning materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Courses ({content.resources.courses.length})
              </TabsTrigger>
              <TabsTrigger value="ebooks" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                E-books ({content.resources.ebooks.length})
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Materials ({content.resources.materials.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Courses</h3>
                <Button onClick={() => openEditDialog('courses')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems('courses').map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{(course as Course).level}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {course.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {course.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{course.tags.length - 2}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(course.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog('courses', course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{course.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete('courses', course.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                <Button onClick={() => openEditDialog('ebooks')} size="sm">
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
                    <TableHead>Tags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems('ebooks').map((ebook) => (
                    <TableRow key={ebook.id}>
                      <TableCell className="font-medium">{ebook.title}</TableCell>
                      <TableCell>{(ebook as Ebook).author}</TableCell>
                      <TableCell>{(ebook as Ebook).pages || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {ebook.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {ebook.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{ebook.tags.length - 2}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog('ebooks', ebook)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete E-book</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{ebook.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete('ebooks', ebook.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                <Button onClick={() => openEditDialog('materials')} size="sm">
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
                    <TableHead>Level</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems('materials').map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{(material as Material).type}</Badge>
                      </TableCell>
                      <TableCell>{(material as Material).topic}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{(material as Material).level}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog('materials', material)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Material</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{material.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete('materials', material.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
        <DialogContent className="sm:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem.isNew ? 'Add' : 'Edit'} {editingItem.type.slice(0, -1)}
            </DialogTitle>
            <DialogDescription>
              {editingItem.isNew ? 'Create a new' : 'Update the'} {editingItem.type.slice(0, -1)} for the library.
            </DialogDescription>
          </DialogHeader>
          {renderEditForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
}