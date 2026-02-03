import { Search, Filter, Download, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BlogFilters as BlogFiltersType } from '@/hooks/useBlogPagination';
import { Link } from 'react-router-dom';

interface BlogFiltersProps {
  filters: BlogFiltersType;
  onFiltersChange: (filters: Partial<BlogFiltersType>) => void;
  authors?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string }>;
  onExport?: () => void;
  selectedCount?: number;
}

export function BlogFilters({
  filters,
  onFiltersChange,
  authors = [],
  categories = [],
  onExport,
  selectedCount = 0,
}: BlogFiltersProps) {
  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      author: '',
      category: '',
      featured: undefined,
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.status || 
    filters.author || 
    filters.category || 
    filters.featured !== undefined;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts by title, content, or excerpt..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => onFiltersChange({ status: value === 'all' ? '' : value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.author || 'all'}
                onValueChange={(value) => onFiltersChange({ author: value === 'all' ? '' : value })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => onFiltersChange({ category: value === 'all' ? '' : value })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={filters.featured === true}
                  onCheckedChange={(checked) => onFiltersChange({ featured: checked ? true : undefined })}
                />
                <Label htmlFor="featured" className="text-sm">Featured only</Label>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              
              <Button asChild>
                <Link to="/admin/blog/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}