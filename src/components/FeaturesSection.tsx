import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Shield, 
  Calendar, 
  FileText,
  ArrowRight 
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Structured Learning Path",
    description: "From beginner basics to advanced institutional strategies with our comprehensive DRIVE methodology.",
    cta: "Explore Learn Path"
  },
  {
    icon: Users,
    title: "Personal Mentorship",
    description: "One-on-one guidance from experienced traders who understand the Kenyan market dynamics.",
    cta: "Book Mentorship"
  },
  {
    icon: TrendingUp,
    title: "Signals & Analysis",
    description: "Weekly market analysis and educational signals to help you understand market structure.",
    cta: "View Signals"
  },
  {
    icon: Calendar,
    title: "Live Webinars",
    description: "Regular educational sessions covering current market conditions and trading psychology.",
    cta: "Join Next Session"
  },
  {
    icon: FileText,
    title: "Case Studies",
    description: "Real trading examples with verified results to demonstrate risk management principles.",
    cta: "See Results"
  },
  {
    icon: Shield,
    title: "Compliance First",
    description: "Full transparency with proper risk disclosures and CMA regulatory compliance.",
    cta: "View Compliance"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-16 lg:py-18 floating-section">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to become a{" "}
            <span className="text-primary">
              disciplined trader
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive education platform focuses on building strong foundations rather than quick wins.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="floating-card group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-professional flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary-hover group">
                  {feature.cta}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="hero" size="lg">
            Start Your Education Journey
          </Button>
        </div>
      </div>
    </section>
  );
}
