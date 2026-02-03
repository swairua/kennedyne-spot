/**
 * Resources Repository Abstraction
 * Provides a common interface for resource data operations
 * Currently implemented with Supabase, but can be extended for other database providers
 */

import { supabase } from '@/integrations/supabase/client';
import type { Course, Ebook, Material } from '@/hooks/useResources';

export interface ResourcesRepository {
  // Courses
  getCourses(published?: boolean): Promise<Course[]>;
  getCourse(slug: string): Promise<Course | null>;
  createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course>;
  updateCourse(id: string, course: Partial<Course>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;

  // Ebooks  
  getEbooks(published?: boolean): Promise<Ebook[]>;
  createEbook(ebook: Omit<Ebook, 'id' | 'created_at' | 'updated_at'>): Promise<Ebook>;
  updateEbook(id: string, ebook: Partial<Ebook>): Promise<Ebook>;
  deleteEbook(id: string): Promise<void>;

  // Materials
  getMaterials(published?: boolean): Promise<Material[]>;
  createMaterial(material: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<Material>;
  updateMaterial(id: string, material: Partial<Material>): Promise<Material>;
  deleteMaterial(id: string): Promise<void>;
}

class SupabaseResourcesRepository implements ResourcesRepository {
  async getCourses(published?: boolean): Promise<Course[]> {
    let query = supabase.from('courses').select(`
      *,
      title_fr,
      title_es,
      title_de,
      title_ru,
      description_fr,
      description_es,
      description_de,
      description_ru,
      translation_status
    `);
    if (published !== undefined) {
      query = query.eq('published', published);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as Course[];
  }

  async getCourse(slug: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    if (error) throw error;
    return data as Course | null;
  }

  async createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateCourse(id: string, course: Partial<Course>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .update(course)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async getEbooks(published?: boolean): Promise<Ebook[]> {
    let query = supabase.from('ebooks').select(`
      *,
      title_fr,
      title_es,
      title_de,
      title_ru,
      description_fr,
      description_es,
      description_de,
      description_ru,
      translation_status
    `);
    if (published !== undefined) {
      query = query.eq('published', published);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    return data as Ebook[];
  }

  async createEbook(ebook: Omit<Ebook, 'id' | 'created_at' | 'updated_at'>): Promise<Ebook> {
    const { data, error } = await supabase
      .from('ebooks')
      .insert(ebook)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateEbook(id: string, ebook: Partial<Ebook>): Promise<Ebook> {
    const { data, error } = await supabase
      .from('ebooks')
      .update(ebook)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteEbook(id: string): Promise<void> {
    const { error } = await supabase
      .from('ebooks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async getMaterials(published?: boolean): Promise<Material[]> {
    let query = supabase.from('materials').select(`
      *,
      title_fr,
      title_es,
      title_de,
      title_ru,
      description_fr,
      description_es,
      description_de,
      description_ru,
      translation_status
    `);
    if (published !== undefined) {
      query = query.eq('published', published);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    return data as Material[];
  }

  async createMaterial(material: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<Material> {
    const { data, error } = await supabase
      .from('materials')
      .insert(material)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateMaterial(id: string, material: Partial<Material>): Promise<Material> {
    const { data, error } = await supabase
      .from('materials')
      .update(material)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteMaterial(id: string): Promise<void> {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

// Configuration - can be easily switched to other database providers
const createResourcesRepository = (): ResourcesRepository => {
  return new SupabaseResourcesRepository();
};

export const resourcesRepository = createResourcesRepository();