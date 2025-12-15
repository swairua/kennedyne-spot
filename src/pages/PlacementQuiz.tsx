import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Brain, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createCanonicalUrl, createBreadcrumbSchema } from "@/utils/seoHelpers";

const quizQuestions = [
  {
    question: "What is the difference between a market order and a limit order?",
    options: [
      "Market orders are always filled at the best price, limit orders may not be filled",
      "Market orders execute immediately at current price, limit orders execute at specified price",
      "Market orders are safer than limit orders",
      "There is no difference"
    ],
    correct: 1,
    explanation: "Market orders execute immediately at the current market price, while limit orders only execute when the market reaches your specified price."
  },
  {
    question: "What does 'pip' stand for in forex trading?",
    options: [
      "Price Interest Point",
      "Percentage in Point",
      "Point in Percentage",
      "Price in Profit"
    ],
    correct: 1,
    explanation: "A pip (Percentage in Point) is the smallest price move in a currency pair, typically the fourth decimal place."
  },
  {
    question: "If you're long EUR/USD and the pair goes from 1.1000 to 1.1050, what happened?",
    options: [
      "You lost 50 pips",
      "You gained 50 pips",
      "You lost 5 pips",
      "You gained 5 pips"
    ],
    correct: 1,
    explanation: "Going from 1.1000 to 1.1050 is a 50 pip gain. Since you're long (bought EUR/USD), you profit when the price goes up."
  },
  {
    question: "What is the recommended risk per trade for beginners?",
    options: [
      "10% of account balance",
      "5% of account balance", 
      "1-2% of account balance",
      "As much as possible to maximize profits"
    ],
    correct: 2,
    explanation: "Risk management is crucial. Most professional traders risk no more than 1-2% of their account balance per trade."
  },
  {
    question: "What is a 'stop loss' order used for?",
    options: [
      "To take profits when price reaches a target",
      "To limit losses if price moves against you",
      "To enter a trade at a better price",
      "To increase position size"
    ],
    correct: 1,
    explanation: "A stop loss order automatically closes your position at a predetermined loss level to protect your capital."
  }
];

export default function PlacementQuiz() {
  console.log('PlacementQuiz component is rendering');
  const location = useLocation();
  const canonical = createCanonicalUrl(location.pathname);

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Placement Quiz", url: canonical }
  ]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { toast } = useToast();

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      const score = calculateScore();
      if (score >= 4) {
        localStorage.setItem('placementQuizPassed', 'true');
        localStorage.setItem('mentorshipEligible', 'true');
        toast({
          title: "Congratulations!",
          description: "You passed the placement quiz and are eligible for mentorship!",
        });
      } else {
        toast({
          title: "Quiz Complete!",
          description: "Start with our beginner track to build your foundation, then apply for mentorship.",
          variant: "default",
        });
      }
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === quizQuestions[index].correct ? 1 : 0);
    }, 0);
  };

  const score = calculateScore();
  const passed = score >= 4;

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Trading Knowledge Assessment | KenneDyne spot Placement Quiz"
          description="Test your trading knowledge and assess your readiness for our mentorship program. This placement quiz evaluates your understanding of forex trading fundamentals."
          keywords="trading quiz, placement test, forex knowledge, trading fundamentals, mentorship eligibility"
          canonical={canonical}
          schema={breadcrumbSchema}
        />
        <Navigation />
        <main className="pt-20">
          <section className="py-20">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="mb-8">
                  {passed ? (
                    <div className="text-green-500 mb-4">
                      <Trophy className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <Badge variant="secondary" className="bg-green-100 text-green-800 mb-4">
                        Passed!
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-orange-500 mb-4">
                      <Brain className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 mb-4">
                        Needs Review
                      </Badge>
                    </div>
                  )}
                </div>

                <h1 className="text-4xl font-bold mb-6">
                  Quiz Results: {score}/{quizQuestions.length}
                </h1>

                {passed ? (
                  <div className="mb-8">
                    <p className="text-xl text-muted-foreground mb-6">
                      Excellent! You've demonstrated solid trading fundamentals and are eligible for our mentorship program.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild variant="hero" size="lg">
                        <Link to="/mentorship#mentorship">
                          Apply for Mentorship
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link to="/services/learn">
                          Continue Learning
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <p className="text-xl text-muted-foreground mb-6">
                      We recommend completing our beginner track first to build a stronger foundation before applying for mentorship.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild variant="professional" size="lg">
                        <Link to="/services/learn">
                          Start Beginner Track
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" onClick={() => window.location.reload()}>
                        Retake Quiz
                      </Button>
                    </div>
                  </div>
                )}

                <Card className="p-6 text-left">
                  <h3 className="text-xl font-semibold mb-4">Review Your Answers</h3>
                  <div className="space-y-4">
                    {quizQuestions.map((question, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <p className="font-medium mb-2">{index + 1}. {question.question}</p>
                        <div className="flex items-center gap-2 mb-2">
                          {selectedAnswers[index] === question.correct ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className={selectedAnswers[index] === question.correct ? "text-green-700" : "text-red-700"}>
                            Your answer: {question.options[selectedAnswers[index]]}
                          </span>
                        </div>
                        {selectedAnswers[index] !== question.correct && (
                          <p className="text-green-700 mb-2">
                            Correct answer: {question.options[question.correct]}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {question.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Trading Knowledge Assessment | KenneDyne spot Placement Quiz"
        description="Test your trading knowledge and assess your readiness for our mentorship program. This placement quiz evaluates your understanding of forex trading fundamentals."
        keywords="trading quiz, placement test, forex knowledge, trading fundamentals, mentorship eligibility"
        canonical={canonical}
        schema={breadcrumbSchema}
      />
      <Navigation />
      <main className="pt-20">
        <section className="py-20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="secondary" className="mb-4">
                  <Brain className="h-4 w-4 mr-2 text-primary" />
                  Placement Quiz
                </Badge>
                <h1 className="text-4xl font-bold mb-4">
                  Test Your Trading <span className="text-blue-400">Knowledge</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Pass this quiz to be eligible for our mentorship program
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                  <span>•</span>
                  <span>Passing score: 4/5</span>
                </div>
              </div>

              <Card className="p-8">
                <div className="mb-6">
                  <div className="w-full bg-accent rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">
                    {quizQuestions[currentQuestion].question}
                  </h2>
                  
                  <div className="space-y-3">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                          selectedAnswers[currentQuestion] === index
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedAnswers[currentQuestion] === index
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`} />
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button 
                      onClick={handlePrevious}
                      variant="outline"
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>
                    
                    <Button 
                      onClick={handleNext}
                      disabled={selectedAnswers[currentQuestion] === undefined}
                      variant={currentQuestion === quizQuestions.length - 1 ? "hero" : "professional"}
                    >
                      {currentQuestion === quizQuestions.length - 1 ? "Finish Quiz" : "Next"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
