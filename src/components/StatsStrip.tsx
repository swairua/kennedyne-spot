import { useSiteContent } from "@/hooks/useSiteContent";
import { CheckCircle } from "lucide-react";

export default function StatsStrip() {
  const { content } = useSiteContent();
  const indicators = content.hero?.trustIndicators || [];

  return (
    <section className="relative py-8 lg:py-12">
      {/* Background image */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="w-full h-full bg-cover bg-center opacity-90"
          style={{
            backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2F929a94a73a3e4246bd07aab61b8a8dc4%2F8e5ce0d7091c4f2a8b254f987425af94?format=webp&width=1600')`,
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {indicators.map((ind, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-white/6 border border-white/20 backdrop-blur-md p-6 text-center shadow-lg"
                role="figure"
                aria-label={`${ind.value} ${ind.label}`}
              >
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {ind.value}
                </div>
                <div className="text-sm md:text-base text-white/90">{ind.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
