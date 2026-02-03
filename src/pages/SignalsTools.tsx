import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Shield
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createCanonicalUrl, createBreadcrumbSchema } from "@/utils/seoHelpers";

const howToUseSteps = [
  {
    number: "1",
    title: "Paper-trade first",
    description: "Never trade live money with signals until you understand the logic behind each setup."
  },
  {
    number: "2", 
    title: "Follow risk limits",
    description: "Use our recommended position sizing and never exceed your daily/weekly risk limits."
  },
  {
    number: "3",
    title: "Only trade what you can explain back",
    description: "If you can't explain why a setup makes sense, don't take the trade."
  }
];

const whatIncluded = [
  {
    icon: Target,
    title: "Entry idea with clear rationale",
    description: "Why we see this as a potential setup based on DRIVE methodology"
  },
  {
    icon: XCircle,
    title: "Invalidation levels",
    description: "Exact price levels where the setup becomes invalid"
  },
  {
    icon: TrendingUp,
    title: "Target logic",
    description: "Where we see potential profit targets and why"
  },
  {
    icon: Clock,
    title: "Timeframe and session notes",
    description: "Which timeframes to watch and best trading sessions"
  }
];

const whatNotIncluded = [
  "Guaranteed profits or win rates",
  "Financial advice or recommendations", 
  "Live trade execution guidance",
  "Account management services"
];

const SignalsTools = () => {
  const location = useLocation();
  const canonical = createCanonicalUrl(location.pathname);

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Signals & Tools", url: canonical }
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Trading Signals & Tools | Educational Analysis by KenneDyne spot"
        description="Access educational trading signals and tools designed to help you understand market analysis. Learn from detailed analysis of DRIVE methodology applied to forex markets."
        keywords="trading signals, forex analysis, educational signals, trading tools, DRIVE methodology, market analysis, trading education"
        canonical={canonical}
        schema={breadcrumbSchema}
      />
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">
                <TrendingUp className="h-4 w-4 mr-2" />
                Study Guide
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                <span className="text-foreground">Signals are a </span>
                <span className="text-blue-400">study guide</span>
                <span className="text-foreground"> —not a </span>
                <span className="text-blue-300">shortcut</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Learn from our analysis, understand the reasoning, and develop your own trading edge through education.
              </p>
              <Button asChild variant="hero" size="lg">
                <a href="https://one.exnesstrack.org/a/17eqnrbs54" target="_blank" rel="noopener noreferrer sponsored">
                  Try Signals on Demo
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* How to Use */}
        <section className="py-20">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  How to use signals responsibly
                </h2>
                <p className="text-xl text-muted-foreground">
                  Three non-negotiable rules for signal users
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {howToUseSteps.map((step, index) => (
                  <Card key={index} className="p-8 text-center border border-border hover:shadow-card transition-all duration-200">
                    <div className="w-16 h-16 bg-gradient-professional rounded-full flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto mb-6">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-20 bg-accent/10">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  What's included in our signals
                </h2>
                <p className="text-xl text-muted-foreground">
                  Educational analysis to help you learn
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {whatIncluded.map((item, index) => (
                  <Card key={index} className="p-6 border border-border">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What's NOT Included */}
        <section className="py-20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  What's NOT included
                </h2>
                <p className="text-xl text-muted-foreground">
                  We're transparent about what signals can't do
                </p>
              </div>

              <Card className="p-8 border border-border">
                <ul className="space-y-4 list-none pl-0">
                  {whatNotIncluded.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <XCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Warning Section */}
        <section className="py-20 bg-accent/20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 border border-border">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      Important: Signals are for education only
                    </h3>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Our signals are study materials designed to help you understand market analysis. 
                        They are not financial advice or trade recommendations.
                      </p>
                      <p>
                        <strong>Risk Warning:</strong> Trading involves substantial risk. You can lose some or all of your capital. 
                        Only trade with money you can afford to lose and always use proper risk management.
                      </p>
                      <p>
                        Always practice on a demo account first and ensure you understand the logic 
                        behind each setup before considering live trading.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Ready to learn from our analysis?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Start with demo trading and focus on understanding the methodology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="lg">
                  <a href="https://one.exnesstrack.org/a/17eqnrbs54" target="_blank" rel="noopener noreferrer sponsored">
                    Try Signals on Demo
                  </a>
                </Button>
                <Button asChild variant="professional" size="lg">
                  <Link to="/strategy">
                    Learn DRIVE Strategy First
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default SignalsTools;
