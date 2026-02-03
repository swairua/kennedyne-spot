import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogFilters {
  search?: string;
  status?: string;
  author?: string;
  category?: string;
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

const POSTS_PER_PAGE = 20;

export function useBlogPagination() {
  const [filters, setFilters] = useState<BlogFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: POSTS_PER_PAGE,
  });
  
  const queryClient = useQueryClient();

  const fetchPosts = useCallback(async ({ queryKey }: { queryKey: any[] }) => {
    const [, { filters, pagination }] = queryKey;
    const { page, pageSize } = pagination;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        post_authors(
          authors(id, name, slug, bio, avatar_url)
        ),
        post_categories(
          categories(id, name, slug, description)
        ),
        post_tags(
          tags(id, name, slug)
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform the data
    const transformedPosts = data?.map(post => ({
      ...post,
      authors: post.post_authors?.map((pa: any) => pa.authors) || [],
      categories: post.post_categories?.map((pc: any) => pc.categories) || [],
      tags: post.post_tags?.map((pt: any) => pt.tags) || [],
    })) || [];

    return {
      data: transformedPosts,
      totalCount: count || 0,
      pageCount: Math.ceil((count || 0) / pageSize),
    };
  }, []);

  const postsQuery = useQuery({
    queryKey: ['blog-posts', { filters, pagination }],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateFilters = useCallback((newFilters: Partial<BlogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const invalidatePosts = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
  }, [queryClient]);

  return {
    posts: postsQuery.data?.data || [],
    totalCount: postsQuery.data?.totalCount || 0,
    pageCount: postsQuery.data?.pageCount || 0,
    isLoading: postsQuery.isLoading,
    error: postsQuery.error,
    filters,
    pagination,
    updateFilters,
    updatePagination,
    invalidatePosts,
  };
}