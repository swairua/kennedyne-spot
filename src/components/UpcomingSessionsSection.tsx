import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users,
  ArrowRight 
} from "lucide-react";
import { useState } from "react";
import { useSessionForm } from "@/hooks/useSessionForm";

export function UpcomingSessionsSection() {
  const [email, setEmail] = useState("");
  const { submitRegistration, isSubmitting } = useSessionForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    const result = await submitRegistration(email);
    if (result.success) {
      setEmail("");
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Upcoming sessions
            </h2>
            <p className="text-xl text-muted-foreground">
              Weekly free class (Zoom/YouTube Live)
            </p>
          </div>

          <Card className="p-8 border border-border">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge variant="secondary" className="inline-flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Weekly Session
                  </Badge>
                  
                  <h3 className="text-2xl font-bold text-foreground">
                    DRIVE Strategy Fundamentals
                  </h3>
                  
                  <p className="text-muted-foreground">
                    Learn the foundation of our 5-step methodology. Perfect for beginners 
                    and those looking to add structure to their trading.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      Every Wednesday, 7:00 PM EAT
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      Limited to 100 participants
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Save My Seat'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
                
                <p className="text-xs text-muted-foreground text-center">
                  Free session. No spam. You can unsubscribe anytime.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}