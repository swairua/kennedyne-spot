import { 
  TrendingUp, 
  BarChart3, 
  MapPin, 
  Shield, 
  Play
} from "lucide-react";

export interface DriveStep {
  letter: string;
  icon: any;
  title: string;
  description: string;
  details: string[];
}

// Canonical DRIVE strategy data
export const driveSteps: DriveStep[] = [
  {
    letter: "D",
    icon: TrendingUp,
    title: "Direction",
    description: "Learn how to analyze market direction across multiple timeframes (Monthly, Weekly, Daily).",
    details: [
      "Align with broader institutional market trends",
      "Explore methods for analyzing potential trend shifts",
      "Master higher timeframe confluence"
    ]
  },
  {
    letter: "R", 
    icon: BarChart3,
    title: "Range",
    description: "Learn how to define market ranges to narrow tradable areas.",
    details: [
      "Map the weekly range for structured setups",
      "Learn to recognize areas of imbalance and liquidity",
      "Identify key support and resistance zones"
    ]
  },
  {
    letter: "I",
    icon: MapPin,
    title: "Interest Point (POI)", 
    description: "Learn how to align support and resistance across timeframes.",
    details: [
      "Identify higher-timeframe tradable order blocks",
      "Confirm setups using multiple confluence factors",
      "Master institutional Points of Interest"
    ]
  },
  {
    letter: "V",
    icon: Shield,
    title: "Value of Risk",
    description: "Learn how to apply structured risk-to-reward ratios.",
    details: [
      "Practice disciplined position sizing",
      "Build habits that encourage consistency over time",
      "Master risk management fundamentals"
    ]
  },
  {
    letter: "E",
    icon: Play,
    title: "Entry",
    description: "Learn how to follow structured entry rules.",
    details: [
      "Explore ways to scale into winning positions",
      "Learn systematic trade management techniques",
      "Execute with institutional precision"
    ]
  }
];

// Simplified version for teasers/cards
export const driveStepsSimple = driveSteps.map(step => ({
  letter: step.letter,
  icon: step.icon,
  title: step.title,
  description: step.description
}));

export const driveAcronym = "D.R.I.V.E";
export const driveFullName = "Direction, Range, Interest Point, Value of Risk, Entry";
