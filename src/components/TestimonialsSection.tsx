import { Card } from "@/components/ui/card";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";


export function TestimonialsSection() {
  const { content } = useSiteContent();
  const { testimonials } = content;
  const items = testimonials?.items || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // IntersectionObserver for performance-aware auto-play
  useEffect(() => {
    if (!sectionRef.current || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsAutoPlaying(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [items.length]);

  // Auto-rotate testimonials when visible and tab is active
  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return;
    
    // Pause auto-play when tab is hidden to save resources
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsAutoPlaying(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const interval = setInterval(() => {
      if (!document.hidden) {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAutoPlaying, items.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsAutoPlaying(false);
  };

  return (
    <section ref={sectionRef} id="testimonials" className="py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden section-optimize">
      <div className="absolute inset-0 bg-gradient-hero opacity-20"></div>
      
      {/* Forex Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[linear-gradient(rgba(120,119,198,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      <div className="container px-4 relative">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h2 className="fluid-h2 mb-4">
              <span className="text-primary">{testimonials.title}</span>
            </h2>
            <p className="fluid-body text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {testimonials.subtitle}
            </p>
          </header>

          {/* Desktop Grid View */}
          <div className="hidden md:block space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {items.slice(0, 3).map((testimonial, index) => (
                <Card key={index} className="group p-6 border border-border/50 hover:shadow-elevation transition-all duration-500 glass-card hover:-translate-y-1 flex flex-col">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold shadow-button text-sm">
                      {testimonial.initials || testimonial.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground leading-tight">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Quote className="w-5 h-5 text-primary/30 mb-3" />
                  <blockquote className="text-sm text-muted-foreground leading-relaxed italic flex-1">
                    "{testimonial.content}"
                  </blockquote>
                </Card>
              ))}
            </div>
          </div>

          {/* Mobile Carousel View */}
          <div className="md:hidden">
            {items.length > 0 && (
              <div className="relative">
                <Card className="p-6 border border-border/50 glass-card">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold shadow-button text-sm">
                      {items[currentIndex]?.initials || items[currentIndex]?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{items[currentIndex]?.name}</h3>
                      <p className="text-sm text-muted-foreground">{items[currentIndex]?.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: items[currentIndex]?.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Quote className="w-5 h-5 text-primary/30 mb-3" />
                  <blockquote className="text-sm text-muted-foreground leading-relaxed italic">
                    "{items[currentIndex]?.content}"
                  </blockquote>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevTestimonial}
                    className="w-10 h-10 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex gap-2">
                    {items.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentIndex(index);
                          setIsAutoPlaying(false);
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextTestimonial}
                    className="w-10 h-10 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed font-medium">
              {testimonials.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
