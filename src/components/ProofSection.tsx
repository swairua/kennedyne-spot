import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  TrendingUp, 
  Shield,
  ArrowRight 
} from "lucide-react";

const caseStudies = [
  {
    title: "GBPUSD Structure Break",
    context: "4H bias change with liquidity sweep confirmation",
    riskReward: "1:2.5 R",
    verification: "Myfxbook",
    status: "Completed",
    lessons: ["Patience at key levels", "Risk management held"]
  },
  {
    title: "EURUSD Range Analysis",
    context: "Daily range with multiple timeframe confluence",
    riskReward: "1:3.2 R", 
    verification: "FxBlue",
    status: "Completed",
    lessons: ["DRIVE methodology validated", "Journal process key"]
  },
  {
    title: "USDCAD Impulse Entry",
    context: "Break of structure with volume confirmation",
    riskReward: "1:1.8 R",
    verification: "Internal",
    status: "Completed", 
    lessons: ["Entry timing crucial", "Management plan followed"]
  }
];

export function ProofSection() {
  return (
    <section className="py-20 bg-accent/10">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Proof done right
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Case studies with before/after journal screenshots, entry/exit rationale, and risk taken. 
              No win-rate promises—only process and risk data.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {caseStudies.map((study, index) => (
              <Card key={index} className="p-6 border border-border hover:shadow-card transition-all duration-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {study.status}
                    </Badge>
                    <Badge variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      {study.verification}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground">
                    {study.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground">
                    {study.context}
                  </p>
                  
                  <div className="text-sm">
                    <span className="text-foreground font-medium">Risk/Reward: </span>
                    <span className="text-primary">{study.riskReward}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Key Lessons:</p>
                    {study.lessons.map((lesson, lessonIndex) => (
                      <p key={lessonIndex} className="text-xs text-muted-foreground">
                        • {lesson}
                      </p>
                    ))}
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="professional" size="lg">
              Explore Results
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}