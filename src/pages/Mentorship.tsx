import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Target,
  BookOpen,
  MessageSquare,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { createWhatsAppLink, WHATSAPP_MESSAGES, DEFAULT_WHATSAPP_PHONE } from "@/utils/whatsapp";
import { trackEvent } from "@/components/GTMProvider";
import { useState, useEffect } from "react";
import { useMentorshipForm } from "@/hooks/useMentorshipForm";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, CheckCircle2, MessageCircle } from "lucide-react";
import forexMentorshipHero from "@/assets/forex-mentorship-hero.jpg";

const mentorshipFeatures = [
  {
    icon: Users,
    title: "8-week cohort format",
    description: "Learn alongside committed traders in a structured group setting"
  },
  {
    icon: MessageSquare,
    title: "Optional 1:1 sessions",
    description: "Personal feedback on your specific trading challenges and goals"
  },
  {
    icon: BookOpen,
    title: "Weekly live reviews",
    description: "Analyze real trades and setups with the group every week"
  },
  {
    icon: Target,
    title: "Homework assignments",
    description: "Practical exercises to reinforce learning and build discipline"
  },
  {
    icon: TrendingUp,
    title: "Journal audits",
    description: "Professional review of your trading journal and feedback"
  },
  {
    icon: CheckCircle,
    title: "Graduation review",
    description: "Final assessment to ensure you're ready for independent trading"
  }
];

const whatYouGet = [
  "Personal feedback on your trading approach",
  "Customized risk management plan",
  "Weekly accountability check-ins",
  "Access to private mentorship community",
  "Trade journal review and optimization",
  "One-on-one goal setting sessions"
];

const Mentorship = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    goals: "",
    availability: ""
  });
  
  const [isEligible, setIsEligible] = useState(false);
  const [ackNotEligible, setAckNotEligible] = useState(false);
  const [showWhatsAppSuccess, setShowWhatsAppSuccess] = useState(false);
  
  const { submitApplication, isSubmitting } = useMentorshipForm();
  const { toast } = useToast();

  // Check eligibility from localStorage
  useEffect(() => {
    const checkEligibility = () => {
      const placementQuizPassed = localStorage.getItem('placementQuizPassed') === 'true';
      const mentorshipEligible = localStorage.getItem('mentorshipEligible') === 'true';
      setIsEligible(placementQuizPassed || mentorshipEligible);
    };
    
    checkEligibility();
    
    // Listen for storage changes (e.g., quiz passed in another tab)
    const handleStorageChange = () => {
      checkEligibility();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check eligibility before submitting
    if (!isEligible && !ackNotEligible) {
      toast({
        title: "Eligibility Required",
        description: "Please complete the placement quiz or beginner track, or acknowledge that your application may be waitlisted.",
        variant: "destructive",
      });
      return;
    }
    
    const result = await submitApplication(formData);
    
    if (result.success) {
      // Reset form on success
      setFormData({
        name: "",
        email: "",
        phone: "",
        experience: "",
        goals: "",
        availability: ""
      });
      setAckNotEligible(false);
      
      // Show WhatsApp success button
      if (result.showWhatsApp) {
        setShowWhatsAppSuccess(true);
        // Hide after 10 seconds
        setTimeout(() => setShowWhatsAppSuccess(false), 10000);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-subtle overflow-hidden">
          <div className="absolute inset-0 hero-image">
            <img 
              src={forexMentorshipHero} 
              alt="Professional forex mentorship session with mentor and student analyzing trading charts" 
              className="w-full h-full object-cover"
              loading="eager"
              width={1920}
              height={1080}
              
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          <div className="container px-4 relative z-20 on-hero">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge variant="secondary" className="mb-6 bg-white/10 border-white/20">
                    <Users className="h-4 w-4 mr-2" />
                    Limited Cohorts
                  </Badge>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    <span>Mentorship</span> that builds{" "}
                    <span>discipline</span>
                  </h1>
                  <p className="text-hero-body mb-8 leading-relaxed">
                    8-week cohort + optional 1:1, weekly live reviews, homework, journal audits.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Button asChild variant="hero" size="lg">
                      <a href="#mentorship" className="flex items-center gap-2">
                        Apply for Mentorship
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      8 weeks
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Max 12 students
                    </div>
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Results focused
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Format & Features */}
        <section className="py-20">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  <span className="text-blue-400">Mentorship</span> format
                </h2>
                <p className="text-xl text-muted-foreground">
                  Structured learning with personal accountability
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {mentorshipFeatures.map((feature, index) => (
                  <Card key={index} className="p-6 border border-border hover:shadow-card transition-all duration-200">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What You'll Get */}
        <section className="py-20 bg-accent/10">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  You'll <span className="text-blue-400">get</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Personal guidance to accelerate your learning
                </p>
              </div>

              <Card className="p-8 border border-border">
                <div className="grid md:grid-cols-2 gap-6">
                  {whatYouGet.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Eligibility */}
        <section className="py-20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                <span className="text-blue-400">Eligibility</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Complete the Beginner track or pass placement quiz
              </p>
              
              {isEligible ? (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center justify-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      You're eligible! You can apply directly for mentorship.
                    </span>
                  </div>
                  <Button asChild variant="hero" size="lg">
                    <a href="#mentorship" className="flex items-center gap-2">
                      Apply for Mentorship
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <div className="flex items-start justify-center gap-3 mb-4">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <p className="text-amber-700 dark:text-amber-300 font-medium">
                        Complete one of these steps first to become eligible
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild variant="professional" size="lg">
                      <Link 
                        to="/placement-quiz"
                        onClick={() => trackEvent('cta_click_placement_quiz_eligibility')}
                      >
                        Take Placement Quiz
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link 
                        to="/services/learn"
                        onClick={() => trackEvent('cta_click_beginner_track_eligibility')}
                      >
                        Start Beginner Track
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Or apply anyway - your application may be waitlisted until you complete the requirements.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="mentorship" className="py-20 bg-accent/20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Apply for <span className="text-blue-400">Mentorship</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Tell us about your trading journey and goals
                </p>
              </div>

              {/* Eligibility Banner */}
              <div className="mb-8">
                {!isEligible && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="ackNotEligible"
                        checked={ackNotEligible}
                        onCheckedChange={(checked) => setAckNotEligible(checked as boolean)}
                      />
                      <label
                        htmlFor="ackNotEligible"
                        className="text-sm text-amber-700 dark:text-amber-300 leading-5"
                      >
                        I understand my application may be waitlisted since I haven't completed the placement quiz or beginner track yet.
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <Card className="p-8 border border-border">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Mobile number (WhatsApp preferred) *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+254712345678"
                      pattern="^\+?\d{9,15}$"
                      title="Use international format like +254... or local format with 9-15 digits"
                      required
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Please use international format (e.g., +254712345678)</p>
                  </div>

                  <div>
                    <Label htmlFor="experience">Trading Experience</Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Describe your trading background, how long you've been trading, and what challenges you're facing..."
                      required
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="goals">Goals</Label>
                    <Textarea
                      id="goals"
                      name="goals"
                      value={formData.goals}
                      onChange={handleChange}
                      placeholder="What do you hope to achieve through mentorship? What specific areas do you want to improve?"
                      required
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Input
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      placeholder="When are you available for weekly sessions? (e.g., Weekday evenings, Weekend mornings)"
                      required
                      className="mt-2"
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Apply for Mentorship"}
                  </Button>

                  {showWhatsAppSuccess && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                        Application submitted successfully! For any urgent questions or to notify us about your submission, contact us via WhatsApp:
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const whatsappUrl = createWhatsAppLink(
                            DEFAULT_WHATSAPP_PHONE, 
                            `Hi! I just submitted a mentorship application. My name is ${formData.name || '[Name]'}. I wanted to let you know I'm very interested in joining the next cohort!`
                          );
                          trackEvent('whatsapp_post_application_click', { 
                            source: 'mentorship_success',
                            applicant_name: formData.name
                          });
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="w-full border-green-500/30 text-green-700 dark:text-green-300 hover:bg-green-500/20"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp us now
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    We'll review your application and get back to you within 48 hours.
                  </p>
                </form>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Mentorship;
