import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  CheckCircle,
  ArrowRight 
} from "lucide-react";
import { useState } from "react";
import { useNewsletterForm } from "@/hooks/useNewsletterForm";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const { submitSubscription, isSubmitting } = useNewsletterForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    const result = await submitSubscription(email);
    if (result.success) {
      setEmail("");
    }
  };

  const benefits = [
    "Setups and analysis for the upcoming week",
    "Mistakes we're learning from and how to avoid them", 
    "Updated checklists and risk management tips",
    "Market structure insights and key levels"
  ];

  return (
    <section className="py-16 lg:py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-20"></div>
      <div className="container px-4 relative">
        <div className="max-w-5xl mx-auto">
          <Card className="glass-card p-8 md:p-16 shadow-elevation">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Badge variant="secondary" className="inline-flex items-center bg-primary/10 text-primary border-primary/20">
                  <FileText className="h-4 w-4 mr-2" />
                  Lead Magnet
                </Badge>
                
                <h2 className="fluid-h3 font-display font-bold text-foreground">
                  Weekly Market{" "}
                  <span className="text-primary">Notes</span>
                </h2>
                
                <p className="fluid-body text-muted-foreground leading-relaxed">
                  Setups, mistakes we're learning from, and checklists delivered to your inbox every Sunday
                </p>
                
                <ul className="space-y-4 list-none pl-0">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="newsletter-email" className="block text-sm font-semibold text-foreground mb-3">
                      Email address
                    </label>
                    <Input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full h-12 bg-card/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  
                  <Button type="submit" variant="hero" size="lg" className="w-full h-12 hover:scale-105 hover:shadow-button transition-all duration-300" disabled={isSubmitting}>
                    {isSubmitting ? 'Subscribing...' : 'Get the Notes'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
                
                <p className="text-sm text-muted-foreground text-center font-medium">
                  Weekly insights. No spam. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
