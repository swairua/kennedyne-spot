import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BookOpen, Target, TrendingUp, ArrowRight, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import educationHero from "@/assets/education-hero.jpg";
import { driveSteps } from "@/content/drive";
import { createCanonicalUrl } from "@/utils/seoHelpers";
import { LINKS, getInternalLinkProps } from "@/constants/links";

const LP_DriveEducation = () => {
  const benefits = [
    "Master the 5-step DRIVE trading framework",
    "Learn institutional-level market analysis", 
    "Develop disciplined risk management habits",
    "Understand market psychology and timing",
    "Build confidence through structured practice",
    "Access ongoing educational resources"
  ];

  const courseModules = [
    {
      title: "Direction Analysis",
      description: "Learn to identify market trends using institutional methods",
      icon: TrendingUp
    },
    {
      title: "Range Identification", 
      description: "Master support and resistance level analysis",
      icon: Target
    },
    {
      title: "Interest Point Selection",
      description: "Find high-probability entry zones",
      icon: BookOpen
    },
    {
      title: "Value & Risk Assessment",
      description: "Calculate proper position sizing and risk-reward ratios",
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Master DRIVE Trading Strategy | Structured Forex Education"
        description="Learn the proven 5-step DRIVE framework for forex trading. Structured education program with risk management, market analysis, and disciplined trading approach."
        keywords="DRIVE trading strategy, forex education, trading framework, risk management, market analysis"
        canonical={createCanonicalUrl('/lp/drive-education')}
      />
      
      {/* Minimal Navigation */}
      <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b z-40">
        <div className="container px-4">
          <div className="flex items-center justify-between h-16">
            <div className="font-bold text-xl text-primary">KenneDyne spot</div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-subtle overflow-hidden">
          <div className="absolute inset-0 hero-image">
            <img 
              src={educationHero} 
              alt="Professional forex education with DRIVE trading strategy framework" 
              className="w-full h-full object-cover"
              loading="eager"
              width={1920}
              height={1080}
              
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          <div className="container px-4 relative z-20">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20">
                <BookOpen className="h-4 w-4 mr-2" />
                Education-First Approach
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Master the <span className="text-primary">DRIVE</span> Trading Framework
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                Learn our proven 5-step systematic approach to forex trading. Education-focused program 
                that builds discipline, risk management skills, and consistent trading habits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button variant="hero" size="lg" asChild>
                  <a href="#enroll">
                    Start Learning Today
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <a href="#framework">Learn About DRIVE</a>
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-6 text-sm text-white/80">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Self-paced learning
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Education-first approach
                </div>
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Risk management focus
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DRIVE Framework Section */}
        <section id="framework" className="py-20">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  The <span className="text-primary">DRIVE</span> Framework
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  A systematic 5-step approach that removes emotion and builds consistency in your trading decisions.
                </p>
              </div>

              <div className="grid md:grid-cols-5 gap-6">
                {driveSteps.map((step, index) => (
                  <Card key={index} className="p-6 border border-border hover:shadow-card transition-all duration-200 text-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary mb-2">{step.letter}</div>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-accent/10">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  What You'll <span className="text-blue-400">Learn</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Comprehensive education program designed for sustainable trading success
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Course Modules */}
        <section className="py-20">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Course <span className="text-blue-400">Modules</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Step-by-step curriculum covering all aspects of the DRIVE framework
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {courseModules.map((module, index) => (
                  <Card key={index} className="p-6 border border-border hover:shadow-card transition-all duration-200">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <module.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {module.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="enroll" className="py-20 bg-gradient-subtle">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Ready to Start <span className="text-blue-400">Learning</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join our structured education program and learn to trade with discipline and consistency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" asChild>
                  <a {...getInternalLinkProps(LINKS.internal.learn)}>
                    Start Free Education
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a {...getInternalLinkProps(LINKS.internal.contact)}>Have Questions?</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Risk Disclaimer */}
        <section className="py-8 bg-muted/50">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Educational Content:</strong> This is educational material only. 
                Forex trading involves substantial risk of loss. Past performance does not guarantee future results. 
                Never trade with money you cannot afford to lose.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="py-8 border-t">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 KenneDyne spot. Educational content only.
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link to="/terms-of-use" className="text-muted-foreground hover:text-foreground">Terms</Link>
              <Link to="/risk-disclaimer" className="text-muted-foreground hover:text-foreground">Risk Disclaimer</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LP_DriveEducation;
