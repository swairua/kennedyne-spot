import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  TrendingUp,
  Brain,
  Target,
  Clock,
  Users,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { driveStepsSimple } from "@/content/drive";
import forexEducationHero from "@/assets/forex-education-hero.jpg";
import { LINKS } from "@/constants/links";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const learningPaths = [
  {
    level: "Beginner",
    title: "Trading Fundamentals",
    description: "Master the basics of market structure, risk management, and trading psychology.",
    duration: "1-2 weeks",
    modules: 8,
    price: "Free",
    priceValue: 0,
    features: [
      "Market structure basics",
      "Risk management principles",
      "Trading psychology fundamentals",
      "Platform navigation",
      "Economic calendar usage"
    ],
    badge: "Most Popular",
    color: "bg-green-500"
  },
  {
    level: "Intermediate",
    title: "Institutional Strategies",
    description: "Advanced concepts used by institutional traders and fund managers.",
    duration: "2-4 weeks",
    modules: 16,
    price: "$199",
    priceValue: 199,
    features: [
      "Market maker behavior",
      "Liquidity analysis",
      "Advanced risk models",
      "Portfolio management",
      "Algorithmic concepts"
    ],
    badge: "Professional",
    color: "bg-blue-500"
  },
  {
    level: "Advanced",
    title: "DRIVE Methodology",
    description: "Learn our proprietary DRIVE system for systematic trading approach.",
    duration: "4-8 weeks",
    modules: 12,
    price: "$299",
    priceValue: 299,
    features: [
      "DRIVE system deep dive",
      "Advanced chart analysis",
      "Multi-timeframe analysis",
      "Trade management strategies",
      "Live trading sessions"
    ],
    badge: "Expert Level",
    color: "bg-purple-500"
  }
];

export default function Learn() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentCourse, setPaymentCourse] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const { toast } = useToast();

  const openPayment = (amount: number, course: string) => {
    setPaymentAmount(amount);
    setPaymentCourse(course);
    setShowPaymentModal(true);
  };

  const initiatePayment = async () => {
    if (!paymentPhone || !paymentAmount) {
      toast({ title: 'Invalid input', description: 'Please enter phone and confirm amount', variant: 'destructive' });
      return;
    }
    setIsPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke('initiate_mpesa_stk_push', {
        body: { amount: paymentAmount, phone: paymentPhone, accountReference: paymentCourse, description: `Payment for ${paymentCourse}` }
      });

      if (error) throw error;
      const resp = data as any;
      if (resp?.success) {
        toast({ title: 'STK Push Sent', description: 'Please complete the payment on your phone.' });
        setShowPaymentModal(false);
        setPaymentPhone('');
      } else {
        toast({ title: 'Payment failed', description: JSON.stringify(resp?.error || resp), variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Payment error', err);
      toast({ title: 'Payment error', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <section className="relative py-20 md:py-28 bg-gradient-subtle overflow-hidden">
          <div className="absolute inset-0 hero-image">
            <img
              src={forexEducationHero}
              alt="Professional forex education classroom with trading charts and learning environment"
              className="w-full h-full object-cover"
              loading="eager"
              width={1920}
              height={1080}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          <div className="container px-4 relative z-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                <span className="text-blue-300">Structured Learning Materials</span> for{" "}
                <span className="text-blue-400">Professional Traders</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
                Our progressive curriculum takes you from complete beginner to institutional-level understanding.
                No shortcuts, just proven education.
              </p>
              <div className="mb-8">
                <Button variant="hero" size="lg" asChild>
                  <Link to={LINKS.internal.resources}>
                    Start Learning Today
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 md:gap-8 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>2,000+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>500+ Hours Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 flex-shrink-0" />
                  <span>Verified Results</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Paths */}
        <section className="py-20">
          <div className="container px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {learningPaths.map((path, index) => (
                <Card key={index} className="relative shadow-card hover:shadow-elevation transition-all duration-300">
                  {path.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className={`${path.color} text-white`}>
                        {path.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pt-8">
                    <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                      {path.level}
                    </div>
                    <CardTitle className="text-2xl">{path.title}</CardTitle>
                    <CardDescription className="text-base">
                      {path.description}
                    </CardDescription>
                    <div className="text-3xl font-bold text-primary mt-4">
                      {path.price}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{path.duration}</span>
                      <span>{path.modules} modules</span>
                    </div>

                    <ul className="space-y-3 list-none pl-0">
                      {path.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="grid grid-cols-1 gap-3">
                      <Button variant="outline" className="w-full hidden" size="lg" asChild>
                        <Link to={LINKS.internal.resources} aria-label={`${path.price === 'Free' ? 'Start Free' : 'Enroll Now'} - ${path.title}`}>
                          {path.price === "Free" ? "Start Free" : "Enroll Now"}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>

                      {path.priceValue && path.priceValue > 0 && (
                        <Button variant="default" className="w-full" size="lg" onClick={() => openPayment(path.priceValue, path.title)}>
                          Pay {path.price}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* DRIVE Methodology Preview */}
        <section className="py-20 bg-accent/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  The <span className="text-primary">DRIVE</span> Methodology
                </h2>
                <p className="text-xl text-muted-foreground">
                  Direction, Range, Interest Point, Value of Risk, Entry
                </p>
              </div>

              <div className="grid md:grid-cols-5 gap-6">
                {driveStepsSimple.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-professional flex items-center justify-center">
                        <IconComponent className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-card p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Pay for {paymentCourse}</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Phone number</label>
                <input type="tel" value={paymentPhone} onChange={(e) => setPaymentPhone(e.target.value)} placeholder="07XXXXXXXX or +2547XXXXXXX" className="w-full p-3 rounded-md bg-background border border-border" />
                <div className="flex items-center justify-between">
                  <div className="text-sm">Amount</div>
                  <div className="font-semibold">KES {paymentAmount}</div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                  <Button variant="hero" className="flex-1" onClick={initiatePayment} disabled={isPaying}>{isPaying ? 'Processing...' : 'Pay via M-Pesa'}</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
