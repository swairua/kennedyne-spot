import { Search, Filter, Download, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LeadsFilters as LeadsFiltersType } from '@/hooks/useLeadsPagination';

interface LeadsFiltersProps {
  filters: LeadsFiltersType;
  onFiltersChange: (filters: Partial<LeadsFiltersType>) => void;
  breakdown?: {
    mentorship: number;
    contact: number;
    newsletter: number;
    session: number;
  };
  onExport?: () => void;
  onBulkArchive?: () => void;
  selectedCount?: number;
}

export function LeadsFilters({
  filters,
  onFiltersChange,
  breakdown,
  onExport,
  onBulkArchive,
  selectedCount = 0,
}: LeadsFiltersProps) {
  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      type: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = filters.search || filters.status || (filters.type && filters.type !== 'all');

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search and Type Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search leads by name, email, or subject..."
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => onFiltersChange({ type: value as any })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lead Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mentorship">Mentorship</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="session">Session</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status and Actions Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => onFiltersChange({ status: value === 'all' ? '' : value })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {selectedCount > 0 && (
                <Button variant="outline" size="sm" onClick={onBulkArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive ({selectedCount})
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Breakdown Stats */}
          {breakdown && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Badge variant="secondary">
                Mentorship: {breakdown.mentorship}
              </Badge>
              <Badge variant="secondary">
                Contact: {breakdown.contact}
              </Badge>
              <Badge variant="secondary">
                Newsletter: {breakdown.newsletter}
              </Badge>
              <Badge variant="secondary">
                Sessions: {breakdown.session}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}