import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Shield, 
  Brain, 
  PenTool 
} from "lucide-react";

const learningAreas = [
  {
    icon: TrendingUp,
    title: "Market structure & Smart Money Concepts (SMC)",
    description: "Understand how professionals view and navigate market structure"
  },
  {
    icon: Shield,
    title: "Risk management & position sizing",
    description: "Learn to protect capital and size positions based on your risk tolerance"
  },
  {
    icon: Brain,
    title: "Trade psychology and discipline",
    description: "Develop the mental framework needed for consistent execution"
  },
  {
    icon: PenTool,
    title: "Execution & journaling",
    description: "Master entry techniques and maintain detailed trading records"
  }
];

export function WhatYoullLearnSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What you'll learn
            </h2>
            <p className="text-xl text-muted-foreground">
              Foundation skills for disciplined trading
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {learningAreas.map((area, index) => (
              <Card key={index} className="group p-8 border border-border/50 hover:shadow-elevation transition-all duration-500 hover:-translate-y-1 min-h-[200px] flex">
                <div className="flex items-start space-x-6 w-full">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <area.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {area.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {area.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
