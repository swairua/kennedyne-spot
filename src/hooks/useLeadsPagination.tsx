import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadsFilters {
  search?: string;
  status?: string;
  type?: 'all' | 'mentorship' | 'contact' | 'newsletter' | 'session';
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

const LEADS_PER_PAGE = 20;

export function useLeadsPagination() {
  const [filters, setFilters] = useState<LeadsFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: LEADS_PER_PAGE,
  });
  
  const queryClient = useQueryClient();

  const fetchLeads = useCallback(async ({ queryKey }: { queryKey: any[] }) => {
    const [, { filters, pagination }] = queryKey;
    const { page, pageSize } = pagination;
    const offset = (page - 1) * pageSize;

    // Build queries with proper filtering
    let mentorshipQuery = supabase
      .from('mentorship_applications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    let contactQuery = supabase
      .from('contact_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    let newsletterQuery = supabase
      .from('newsletter_subscriptions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    let sessionQuery = supabase
      .from('session_registrations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filters
    if (filters.search) {
      mentorshipQuery = mentorshipQuery.ilike('name', `%${filters.search}%`);
      contactQuery = contactQuery.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
      newsletterQuery = newsletterQuery.ilike('email', `%${filters.search}%`);
      sessionQuery = sessionQuery.ilike('email', `%${filters.search}%`);
    }

    // Apply status filters
    if (filters.status) {
      mentorshipQuery = mentorshipQuery.eq('status', filters.status);
      contactQuery = contactQuery.eq('status', filters.status);
      newsletterQuery = newsletterQuery.eq('status', filters.status);
      sessionQuery = sessionQuery.eq('status', filters.status);
    }

    // Apply pagination
    mentorshipQuery = mentorshipQuery.range(offset, offset + pageSize - 1);
    contactQuery = contactQuery.range(offset, offset + pageSize - 1);
    newsletterQuery = newsletterQuery.range(offset, offset + pageSize - 1);
    sessionQuery = sessionQuery.range(offset, offset + pageSize - 1);

    const results = await Promise.all([
      mentorshipQuery,
      contactQuery,
      newsletterQuery,
      sessionQuery,
    ]);

    // Transform and combine results
    const transformedResults = {
      mentorship: {
        data: results[0].data?.map(item => ({ ...item, type: 'mentorship' })) || [],
        count: results[0].count || 0,
      },
      contact: {
        data: results[1].data?.map(item => ({ ...item, type: 'contact' })) || [],
        count: results[1].count || 0,
      },
      newsletter: {
        data: results[2].data?.map(item => ({ ...item, type: 'newsletter' })) || [],
        count: results[2].count || 0,
      },
      session: {
        data: results[3].data?.map(item => ({ ...item, type: 'session' })) || [],
        count: results[3].count || 0,
      },
    };

    // Filter by type if specified
    if (filters.type && filters.type !== 'all') {
      const selectedType = transformedResults[filters.type as keyof typeof transformedResults];
      return {
        data: selectedType.data,
        totalCount: selectedType.count,
        pageCount: Math.ceil(selectedType.count / pageSize),
      };
    }

    // Combine all types
    const allData = [
      ...transformedResults.mentorship.data,
      ...transformedResults.contact.data,
      ...transformedResults.newsletter.data,
      ...transformedResults.session.data,
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalCount = Object.values(transformedResults).reduce((sum, result) => sum + result.count, 0);

    return {
      data: allData.slice(0, pageSize),
      totalCount,
      pageCount: Math.ceil(totalCount / pageSize),
      breakdown: {
        mentorship: transformedResults.mentorship.count,
        contact: transformedResults.contact.count,
        newsletter: transformedResults.newsletter.count,
        session: transformedResults.session.count,
      },
    };
  }, []);

  const leadsQuery = useQuery({
    queryKey: ['leads', { filters, pagination }],
    queryFn: fetchLeads,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateFilters = useCallback((newFilters: Partial<LeadsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const invalidateLeads = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  }, [queryClient]);

  return {
    leads: leadsQuery.data?.data || [],
    totalCount: leadsQuery.data?.totalCount || 0,
    pageCount: leadsQuery.data?.pageCount || 0,
    breakdown: leadsQuery.data?.breakdown,
    isLoading: leadsQuery.isLoading,
    error: leadsQuery.error,
    filters,
    pagination,
    updateFilters,
    updatePagination,
    invalidateLeads,
  };
}