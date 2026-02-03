import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, MoveUp, MoveDown, Download, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { faqs as staticFaqs } from '@/content/faqs';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const FAQ_CATEGORIES = [
  'General',
  'Trading',
  'Education',
  'Platform',
  'Account',
  'Technical',
];

const FAQsManager = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    published: true,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch FAQs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: "Error",
        description: "Question and answer are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const maxOrderIndex = Math.max(...faqs.map(f => f.order_index), 0);
      
      const faqData = {
        ...formData,
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category || null,
        order_index: editingFaq ? editingFaq.order_index : maxOrderIndex + 1,
      };

      if (editingFaq) {
        const { error } = await supabase
          .from('faqs')
          .update(faqData)
          .eq('id', editingFaq.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "FAQ updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([faqData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "FAQ created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchFaqs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to save FAQ",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'none',
      published: faq.published,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });
      fetchFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `FAQ ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });
      fetchFaqs();
    } catch (error) {
      console.error('Error updating FAQ status:', error);
      toast({
        title: "Error",
        description: "Failed to update FAQ status",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    // Work with all FAQs for reordering, not just filtered ones
    const allFaqs = faqs;
    const currentIndex = allFaqs.findIndex(f => f.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= allFaqs.length) return;

    const currentFaq = allFaqs[currentIndex];
    const targetFaq = allFaqs[targetIndex];

    try {
      // Swap order indexes
      await supabase
        .from('faqs')
        .update({ order_index: targetFaq.order_index })
        .eq('id', currentFaq.id);

      await supabase
        .from('faqs')
        .update({ order_index: currentFaq.order_index })
        .eq('id', targetFaq.id);

      fetchFaqs();
    } catch (error) {
      console.error('Error reordering FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to reorder FAQ",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'none',
      published: true,
    });
    setEditingFaq(null);
  };

  const importStaticFaqs = async () => {
    try {
      setLoading(true);
      
      // Normalize category names
      const normalizeCategory = (category: string) => {
        const categoryMap: Record<string, string> = {
          'general': 'General',
          'strategy': 'Strategy',
          'education': 'Education',
          'risk': 'Risk & Legal',
          'support': 'Support'
        };
        return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
      };

      let imported = 0;
      let skipped = 0;

      for (const staticFaq of staticFaqs) {
        // Check if FAQ with same question already exists
        const { data: existing, error: checkError } = await supabase
          .from('faqs')
          .select('id')
          .eq('question', staticFaq.question)
          .maybeSingle();

        if (checkError) {
          throw checkError;
        }

        if (existing) {
          skipped++;
          continue;
        }

        // Get the highest order_index to append new FAQs at the end
        const { data: lastFaq } = await supabase
          .from('faqs')
          .select('order_index')
          .order('order_index', { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextOrderIndex = (lastFaq?.order_index || 0) + 1;

        // Insert new FAQ
        const { error: insertError } = await supabase
          .from('faqs')
          .insert({
            question: staticFaq.question,
            answer: staticFaq.answer,
            category: normalizeCategory(staticFaq.category),
            published: true,
            order_index: nextOrderIndex + imported
          });

        if (insertError) throw insertError;
        imported++;
      }

      await fetchFaqs();
      toast({
        title: "Import Complete",
        description: `${imported} FAQs imported, ${skipped} skipped (already exist)`,
      });
    } catch (error) {
      console.error('Error importing static FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to import FAQs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory ? faq.category === selectedCategory : true;
    const matchesSearch = searchQuery 
      ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(faqs.map(f => f.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">FAQs Manager</h1>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={importStaticFaqs}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Import from Static
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New FAQ
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value === 'none' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {FAQ_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
                <Label htmlFor="published">Published</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingFaq ? 'Update' : 'Create'} FAQ
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category!}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
          <CardDescription>
            {filteredFaqs.length} FAQs {selectedCategory && `in ${selectedCategory}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No FAQs found. Create your first FAQ to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <TableRow key={faq.id}>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="font-medium truncate">{faq.question}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {faq.answer.substring(0, 80)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {faq.category && (
                        <Badge variant="outline">{faq.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={faq.published}
                          onCheckedChange={() => handleTogglePublished(faq.id, faq.published)}
                        />
                        <Badge variant={faq.published ? "default" : "secondary"} className="text-xs">
                          {faq.published ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Draft
                            </>
                          )}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(faq.id, 'up')}
                          disabled={faqs.findIndex(f => f.id === faq.id) === 0}
                          title="Move up"
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(faq.id, 'down')}
                          disabled={faqs.findIndex(f => f.id === faq.id) === faqs.length - 1}
                          title="Move down"
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(faq)}
                          title="Edit FAQ"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Delete FAQ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this FAQ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(faq.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQsManager;