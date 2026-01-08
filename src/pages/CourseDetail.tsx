import { useParams, Navigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEOHead } from '@/components/SEOHead';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useCourse } from '@/hooks/useResources';
import { createCanonicalUrl } from '@/utils/seoHelpers';
import { useMemo } from 'react';
import { Clock, User, Calendar, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { content } = useSiteContent();
  const { data: dbCourse, isLoading: courseLoading } = useCourse(slug || '');

  const course = useMemo(() => {
    // Use Supabase data first, fallback to local content
    if (dbCourse) {
      return {
        ...dbCourse,
        url: dbCourse.course_url,
        coverImageUrl: dbCourse.cover_image_url
      };
    }
    
    if (!content?.resources?.courses || !slug) return null;
    return content.resources.courses.find(c => c.slug === slug);
  }, [dbCourse, content, slug]);

  const isLoading = courseLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Course Not Found</h1>
            <p className="text-xl text-muted-foreground mb-8">
              The course "{slug}" doesn't exist or hasn't been published yet.
            </p>
            <div className="space-y-4">
              <Button asChild size="lg">
                <Link to="/resources">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Browse All Courses
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Or check back later - this course might be coming soon!
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedCourses = content.resources.courses
    .filter(c => c.id !== course.id && c.level === course.level)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${course.title} - Trading Course`}
        description={course.description}
        canonical={`/courses/${course.slug}`}
        keywords={course.tags.join(', ')}
      />
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          {(course as any).coverImageUrl ? (
            <img 
              src={(course as any).coverImageUrl} 
              alt={course.title}
              className="w-full h-full object-cover"
              
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-foreground/20" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-hero-premium grain-texture" />
        
        <div className="relative container px-4">
          <div className="max-w-4xl mx-auto">
            <Button asChild variant="ghost" className="mb-6 text-white hover:bg-white/10">
              <Link to="/resources">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resources
              </Link>
            </Button>
            
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Course
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                  {course.level}
                </Badge>
              </div>
              
              <h1 className="fluid-h1 text-white">
                {course.title}
              </h1>
              
              <p className="text-xl text-white/90 max-w-3xl">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Created {new Date((course as any).created_at || (course as any).createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Updated {new Date((course as any).updated_at || (course as any).updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="pt-4">
                {course.url ? (
                  <Button asChild size="lg" variant="hero">
                    {typeof course.url === 'string' && course.url.startsWith('/') ? (
                      <Link to={course.url}>
                        Start Course
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Link>
                    ) : (
                      <a href={course.url} target="_blank" rel="noopener noreferrer">
                        Start Course
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    )}
                  </Button>
                ) : (
                  <Button size="lg" disabled>
                    Coming Soon
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Overview</CardTitle>
                    <CardDescription>
                      Everything you need to know about this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Course Level</h3>
                      <Badge variant="outline" className="text-sm">
                        {course.level}
                      </Badge>
                    </div>
                    
                    {course.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Topics Covered</h3>
                        <div className="flex flex-wrap gap-2">
                          {course.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                    <CardDescription>
                      Technical information and requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Difficulty Level</h4>
                        <p className="text-sm text-muted-foreground">{course.level}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Course Type</h4>
                        <p className="text-sm text-muted-foreground">
                          {course.url ? 'External Course' : 'Coming Soon'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Created</h4>
                        <p className="text-sm text-muted-foreground">
                  {new Date((course as any).created_at || (course as any).createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Last Updated</h4>
                        <p className="text-sm text-muted-foreground">
                  {new Date((course as any).updated_at || (course as any).updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="related" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Related Courses</h2>
                  {relatedCourses.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {relatedCourses.map((relatedCourse) => (
                        <Card key={relatedCourse.id} className="group hover:shadow-lg transition-shadow">
                          <CardHeader>
                            {relatedCourse.coverImage && (
                              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                                <img 
                                  src={relatedCourse.coverImage} 
                                  alt={relatedCourse.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            
                            <CardTitle className="text-lg">
                              {relatedCourse.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {relatedCourse.description}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <Badge variant="outline">{relatedCourse.level}</Badge>
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/courses/${relatedCourse.slug}`}>
                                  View Course
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">
                          No related courses found at this level.
                        </p>
                        <Button asChild variant="outline" className="mt-4">
                          <Link to="/resources">
                            Browse All Courses
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
