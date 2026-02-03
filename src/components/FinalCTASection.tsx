import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";
import { getExternalLinkProps } from "@/constants/links";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function FinalCTASection() {
  const { content } = useSiteContent();
  const { title, subtitle, button, benefits } = content.finalCTA;

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden bg-muted/20 content-visibility-auto">
      <div className="absolute inset-0 bg-gradient-subtle"></div>
      <div className="container px-4 relative">
        <div className="max-w-5xl mx-auto text-center space-y-10 animate-fade-in-up">
          <h2 className="fluid-h1 leading-tight text-shadow-hero">
            {title}
          </h2>

          <p className="fluid-body text-foreground/90 max-w-3xl mx-auto leading-relaxed font-medium">
            {subtitle}
          </p>

          <div className="pt-8">
            <Button
              size="lg"
              variant="hero"
              asChild
              className="mb-6 hover:scale-105 transition-transform duration-300"
            >
              {button.href.startsWith('http') ? (
                <a
                  {...getExternalLinkProps(button.href)}
                  aria-label={button.text}
                >
                  {button.text}
                </a>
              ) : (
                <Link to={button.href} aria-label={button.text}>
                  {button.text}
                </Link>
              )}
            </Button>
          </div>

          <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="rounded-xl bg-black/30 border border-white/20 backdrop-blur-md p-4 md:p-6 text-center shadow-lg hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-3"
                role="button"
                aria-label={benefit}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover text-white shadow-sm">
                  <CheckCircle className="w-4 h-4" />
                </span>
                <span className="text-sm md:text-base font-medium text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
