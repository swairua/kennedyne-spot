import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '@/utils/whatsapp';
import { Mail, Phone, Calendar, User, MessageSquare, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useLeadsPagination } from '@/hooks/useLeadsPagination';
import { LeadsFilters } from '@/components/admin/LeadsFilters';
import { Pagination } from '@/components/admin/Pagination';
import { downloadCSV } from '@/utils/csvExport';

type LeadType = 'mentorship' | 'contact' | 'newsletter' | 'session';

interface BaseLead {
  id: string;
  email: string;
  type: LeadType;
  status: string | null;
  created_at: string;
  admin_notes?: string | null;
  updated_at?: string;
}

interface MentorshipLead extends BaseLead {
  type: 'mentorship';
  name: string;
  phone?: string | null;
  experience: string;
  goals: string;
  availability: string;
}

interface ContactLead extends BaseLead {
  type: 'contact';
  name: string;
  phone?: string | null;
  subject: string;
  message: string;
}

interface NewsletterLead extends BaseLead {
  type: 'newsletter';
  source_url?: string | null;
}

interface SessionLead extends BaseLead {
  type: 'session';
  source_url?: string | null;
}

type Lead = MentorshipLead | ContactLead | NewsletterLead | SessionLead;

export default function AdminLeadsEnhanced() {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const {
    leads,
    totalCount,
    pageCount,
    breakdown,
    isLoading,
    filters,
    pagination,
    updateFilters,
    updatePagination,
    invalidateLeads,
  } = useLeadsPagination();

  // Real-time updates
  useEffect(() => {
    const channels = [
      supabase
        .channel('mentorship_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mentorship_applications' }, invalidateLeads)
        .subscribe(),
      
      supabase
        .channel('contact_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_submissions' }, invalidateLeads)
        .subscribe(),
      
      supabase
        .channel('newsletter_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'newsletter_subscriptions' }, invalidateLeads)
        .subscribe(),
      
      supabase
        .channel('session_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'session_registrations' }, invalidateLeads)
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [invalidateLeads]);

  const updateLeadStatus = async (leadId: string, leadType: LeadType, status: string, notes?: string) => {
    try {
      const tableMap = {
        mentorship: 'mentorship_applications' as const,
        contact: 'contact_submissions' as const,
        newsletter: 'newsletter_subscriptions' as const,
        session: 'session_registrations' as const,
      };

      const tableName = tableMap[leadType];
      const { error } = await supabase
        .from(tableName)
        .update({ status, admin_notes: notes })
        .eq('id', leadId);

      if (error) throw error;

      invalidateLeads();
      toast({
        title: "Updated",
        description: "Lead status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = async () => {
    try {
      setIsExporting(true);
      
      // Get all leads (not just current page)
      const allLeadsQuery = await Promise.all([
        supabase.from('mentorship_applications').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('newsletter_subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('session_registrations').select('*').order('created_at', { ascending: false }),
      ]);

      const allLeads = [
        ...allLeadsQuery[0].data?.map(item => ({ ...item, type: 'mentorship' })) || [],
        ...allLeadsQuery[1].data?.map(item => ({ ...item, type: 'contact' })) || [],
        ...allLeadsQuery[2].data?.map(item => ({ ...item, type: 'newsletter' })) || [],
        ...allLeadsQuery[3].data?.map(item => ({ ...item, type: 'session' })) || [],
      ];

      const exportData = allLeads.map(lead => ({
        type: lead.type,
        name: (lead as any).name || '',
        email: lead.email,
        phone: (lead as any).phone || '',
        status: lead.status || 'new',
        created_date: format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm'),
        subject_experience: (lead as any).subject || (lead as any).experience || '',
        notes: (lead.admin_notes || '').replace(/,/g, ';'),
      }));

      const headers = ['Type', 'Name', 'Email', 'Phone', 'Status', 'Created Date', 'Subject/Experience', 'Notes'];
      downloadCSV(exportData, 'leads-export', headers);

      toast({
        title: "Success",
        description: "Leads exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export leads",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'new':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
      case 'resolved':
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'contacted':
      case 'in_progress':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getName = (lead: Lead): string => {
    if (lead.type === 'mentorship' || lead.type === 'contact') {
      return lead.name;
    }
    return lead.email;
  };

  const getPhone = (lead: Lead): string | null => {
    if (lead.type === 'mentorship' || lead.type === 'contact') {
      return lead.phone || null;
    }
    return null;
  };

  const renderLeadCard = (lead: Lead) => (
    <Card key={lead.id} className="h-fit">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Checkbox
                checked={selectedLeads.includes(lead.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedLeads([...selectedLeads, lead.id]);
                  } else {
                    setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                  }
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-sm truncate">{getName(lead)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <a href={`mailto:${lead.email}`} className="truncate hover:text-blue-600">
                    {lead.email}
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 capitalize">
                {lead.type}
              </Badge>
              <Badge className={`text-xs px-1.5 py-0 h-5 ${getStatusColor(lead.status || 'new')}`}>
                {lead.status || 'new'}
              </Badge>
              <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
                {format(new Date(lead.created_at), 'MMM dd')}
              </span>
            </div>
          </div>

          {/* Contact Info & Type-specific Content */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {getPhone(lead) && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs">{getPhone(lead)}</span>
                </div>
              )}
              
              {lead.type === 'mentorship' && lead.availability && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs">{lead.availability}</span>
                </div>
              )}
            </div>

            <div className="min-w-0 w-full">
              {lead.type === 'mentorship' && (
                <div className="space-y-1">
                  {lead.experience && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Experience: </span>
                      <span className="text-xs whitespace-pre-wrap break-words">{lead.experience}</span>
                    </div>
                  )}
                </div>
              )}

              {lead.type === 'contact' && lead.subject && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Subject: </span>
                  <span className="text-xs whitespace-pre-wrap break-words">{lead.subject}</span>
                </div>
              )}
            </div>
          </div>

          {/* Expandable Details - Default open for full visibility */}
          {(lead.type === 'mentorship' && lead.goals) || (lead.type === 'contact' && lead.message) ? (
            <details className="text-sm group" open>
              <summary className="text-xs font-medium text-primary cursor-pointer hover:text-primary/80 flex items-center gap-1">
                <span className="transition-transform group-open:rotate-90">▶</span>
                {lead.type === 'mentorship' ? 'Goals' : 'Message'}
              </summary>
              <div className="mt-2 p-3 bg-muted/50 rounded-md text-xs max-h-48 overflow-y-auto">
                {lead.type === 'mentorship' && lead.goals && (
                  <span className="whitespace-pre-wrap break-words">{lead.goals}</span>
                )}
                {lead.type === 'contact' && lead.message && (
                  <span className="whitespace-pre-wrap break-words">{lead.message}</span>
                )}
              </div>
            </details>
          ) : null}

          {/* Actions Row */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t">
            <Select 
              value={lead.status || 'new'} 
              onValueChange={(value) => updateLeadStatus(lead.id, lead.type, value)}
            >
              <SelectTrigger className="w-28 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lead.type === 'mentorship' && (
                  <>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </>
                )}
                {lead.type === 'contact' && (
                  <>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </>
                )}
                {(lead.type === 'newsletter' || lead.type === 'session') && (
                  <>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="attended">Attended</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            
            <div className="flex gap-1 flex-shrink-0">
              {lead.type === 'contact' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 px-1.5 text-xs"
                  onClick={() => {
                    const emailSubject = `Re: ${lead.subject}`;
                    const emailBody = `Hi ${lead.name},\n\nThank you for contacting us regarding "${lead.subject}". \n\n[Your response here]\n\nBest regards,\nKenneDyne spot Team`;
                    window.location.href = `mailto:${lead.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                  }}
                >
                  <Mail className="h-3 w-3" />
                  <span className="hidden lg:inline ml-1">Reply</span>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 px-1.5 text-xs"
                onClick={() => {
                  const phone = getPhone(lead);
                  const whatsappUrl = createWhatsAppLink(
                    phone, 
                    WHATSAPP_MESSAGES.adminReply(getName(lead), lead.type)
                  );
                  window.open(whatsappUrl, '_blank');
                }}
                disabled={!getPhone(lead)}
              >
                <MessageSquare className="h-3 w-3" />
                <span className="hidden lg:inline ml-1">WhatsApp</span>
              </Button>
            </div>
          </div>

          {/* Admin Notes */}
          {lead.admin_notes && (
            <div className="pt-2 border-t">
              <span className="text-xs font-medium text-muted-foreground">Notes: </span>
              <span className="text-xs text-muted-foreground">{lead.admin_notes}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Leads Management</h1>
        <Button onClick={invalidateLeads} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <LeadsFilters
        filters={filters}
        onFiltersChange={updateFilters}
        breakdown={breakdown}
        onExport={exportToCSV}
        selectedCount={selectedLeads.length}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Leads ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No leads found matching your filters.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(leads as Lead[]).map(renderLeadCard)}
              </div>
              
              <Pagination
                currentPage={pagination.page}
                totalPages={pageCount}
                pageSize={pagination.pageSize}
                totalItems={totalCount}
                onPageChange={(page) => updatePagination({ page })}
                onPageSizeChange={(pageSize) => updatePagination({ pageSize, page: 1 })}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
