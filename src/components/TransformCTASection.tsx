import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEffect, useRef, useState } from "react";
import { getExternalLinkProps } from "@/constants/links";
import { Link } from "react-router-dom";

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setValue(target);
      setPlayed(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !played) {
          setPlayed(true);
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            setValue(Math.floor(p * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [target, duration, played]);

  return { ref, value };
}

export function TransformCTASection() {
  const { content } = useSiteContent();
  const { title, subtitle, stats, button } = content.transformCTA;

  const parseAnimated = (val: string) => {
    // Animate only pure numeric or numeric+suffix (e.g., "1000+", "95")
    const match = val.match(/^(\d+)(.*)$/);
    if (!match) return { animate: false as const, full: val };
    const num = Number(match[1]);
    const suffix = match[2] ?? "";
    return { animate: true as const, num, suffix };
  };

  return (
    <section className="py-16 lg:py-20 bg-background relative overflow-hidden content-visibility-auto">
      <div className="absolute inset-0 bg-gradient-hero opacity-20 pointer-events-none"></div>
      <div className="container px-4 relative">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <h2 className="fluid-h2 text-foreground">
            {title.includes("Ready to Transform Your Trading?") ? (
              <>
                Ready to Transform{" "}
                <span className="text-primary">
                  Your Trading?
                </span>
              </>
            ) : (
              title
            )}
          </h2>
          <p className="fluid-body text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="grid gap-6 md:grid-cols-3 pt-6">
            {stats.map((s, i) => {
              const parsed = parseAnimated(s.value);
              const { ref, value } = useCountUp(parsed.animate ? parsed.num : 0);
              return (
                <div
                  key={i}
                  className="group glass-card p-6 text-center hover:shadow-elevation transition-all duration-500 animate-fade-in-up"
                >
                  <div
                    ref={parsed.animate ? ref : undefined}
                    className="text-3xl md:text-4xl font-display font-bold text-primary tracking-tight group-hover:scale-110 transition-transform duration-300"
                    aria-hidden={parsed.animate ? "true" : undefined}
                  >
                    {parsed.animate ? (
                      <>
                        {value}
                        {parsed.suffix}
                      </>
                    ) : (
                      s.value
                    )}
                  </div>
                  {parsed.animate && (
                    <span className="sr-only">{s.value}</span>
                  )}
                  <div className="mt-3 text-sm md:text-base text-muted-foreground font-medium">
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6">
            <Button
              size="lg"
              variant="hero"
              asChild
              className="hover:scale-105 transition-transform duration-300"
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
        </div>
      </div>
    </section>
  );
}
