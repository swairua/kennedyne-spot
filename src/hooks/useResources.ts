import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resourcesRepository } from '@/services/resourcesRepository';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  level?: string;
  duration?: string;
  tags: string[];
  cover_image_url?: string;
  course_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ebook {
  id: string;
  title: string;
  slug: string;
  description?: string;
  author?: string;
  pages?: number;
  tags: string[];
  cover_image_url?: string;
  download_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type?: string;
  topic?: string;
  tags: string[];
  cover_image_url?: string;
  material_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Courses hooks
export const useCourses = (published?: boolean) => {
  return useQuery({
    queryKey: ['courses', published],
    queryFn: () => resourcesRepository.getCourses(published),
  });
};

export const useCourse = (slug: string) => {
  return useQuery({
    queryKey: ['course', slug],
    queryFn: () => resourcesRepository.getCourse(slug),
  });
};

export const useCoursesMutation = () => {
  const queryClient = useQueryClient();

  const createCourse = useMutation({
    mutationFn: (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => 
      resourcesRepository.createCourse(course),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create course: ' + error.message);
    },
  });

  const updateCourse = useMutation({
    mutationFn: ({ id, ...course }: Partial<Course> & { id: string }) => 
      resourcesRepository.updateCourse(id, course),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update course: ' + error.message);
    },
  });

  const deleteCourse = useMutation({
    mutationFn: (id: string) => resourcesRepository.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete course: ' + error.message);
    },
  });

  return { createCourse, updateCourse, deleteCourse };
};

// Ebooks hooks
export const useEbooks = (published?: boolean) => {
  return useQuery({
    queryKey: ['ebooks', published],
    queryFn: () => resourcesRepository.getEbooks(published),
  });
};

export const useEbooksMutation = () => {
  const queryClient = useQueryClient();

  const createEbook = useMutation({
    mutationFn: (ebook: Omit<Ebook, 'id' | 'created_at' | 'updated_at'>) => 
      resourcesRepository.createEbook(ebook),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
      toast.success('E-book created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create e-book: ' + error.message);
    },
  });

  const updateEbook = useMutation({
    mutationFn: ({ id, ...ebook }: Partial<Ebook> & { id: string }) => 
      resourcesRepository.updateEbook(id, ebook),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
      toast.success('E-book updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update e-book: ' + error.message);
    },
  });

  const deleteEbook = useMutation({
    mutationFn: (id: string) => resourcesRepository.deleteEbook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
      toast.success('E-book deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete e-book: ' + error.message);
    },
  });

  return { createEbook, updateEbook, deleteEbook };
};

// Materials hooks
export const useMaterials = (published?: boolean) => {
  return useQuery({
    queryKey: ['materials', published],
    queryFn: () => resourcesRepository.getMaterials(published),
  });
};

export const useMaterialsMutation = () => {
  const queryClient = useQueryClient();

  const createMaterial = useMutation({
    mutationFn: (material: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => 
      resourcesRepository.createMaterial(material),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create material: ' + error.message);
    },
  });

  const updateMaterial = useMutation({
    mutationFn: ({ id, ...material }: Partial<Material> & { id: string }) => 
      resourcesRepository.updateMaterial(id, material),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update material: ' + error.message);
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: (id: string) => resourcesRepository.deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete material: ' + error.message);
    },
  });

  return { createMaterial, updateMaterial, deleteMaterial };
};