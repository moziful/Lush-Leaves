"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronRight, FiRefreshCw, FiCheck, FiInfo } from "react-icons/fi";
import Button from "@/components/Button";

interface QuizQuestion {
  id: number;
  question: string;
  field: "difficulty" | "sunlight" | "category";
  options: { label: string; value: string; desc: string }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How much experience do you have with plants?",
    field: "difficulty",
    options: [
      { label: "Beginner", value: "Easy", desc: "Forgiving plants that tolerate occasional neglect." },
      { label: "Intermediate", value: "Medium", desc: "Requires regular watering and stable lighting." },
      { label: "Expert", value: "Hard", desc: "Finicky exotics needing precise humidity and care." },
    ],
  },
  {
    id: 2,
    question: "What lighting conditions will this plant live in?",
    field: "sunlight",
    options: [
      { label: "Bright Indirect", value: "Bright Indirect", desc: "Near a window shielded by a sheer curtain." },
      { label: "Low to Moderate", value: "Low to Bright Indirect", desc: "Deeper in a room or in spaces with smaller windows." },
      { label: "Full Sun", value: "Full Sun", desc: "Receiving direct sunlight on window sills." },
    ],
  },
  {
    id: 3,
    question: "What is your main botanical goal?",
    field: "category",
    options: [
      { label: "Lush Greenery", value: "Foliage", desc: "Huge leaf fenestrations and gorgeous textures." },
      { label: "Pets Safety", value: "Pet Friendly", desc: "Non-toxic, safe varieties for cats and dogs." },
      { label: "Floral Colors", value: "Flowers", desc: "Stunning blooms to bring vibrant color accents." },
    ],
  },
];

export default function PlantFinderQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = quizQuestions[currentStep];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.field]: value }));
  };

  const handleNext = () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
  };

  const selectedValue = answers[currentQuestion?.field];
  const isFinished = currentStep === quizQuestions.length - 1 && selectedValue;

  // Build target href based on answers
  const exploreUrl = `/explore?difficulty=${answers.difficulty || ""}&category=${answers.category || ""}`;

  // Progress calculation: 0% until first selection is made
  const totalQuestions = quizQuestions.length;
  let progressPercent = 0;
  if (currentStep > 0 || selectedValue) {
    // Current step progress + step completion fraction
    const completedSteps = currentStep + (selectedValue ? 1 : 0);
    progressPercent = Math.round((completedSteps / totalQuestions) * 100);
  }

  return (
    <section className="bg-cream py-20 relative overflow-hidden">
      {/* Decorative backdrop shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sage/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-forest/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          
          {/* Left: Text Info Intro */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-forest/50 flex items-center gap-1.5">
                <FiInfo className="h-4 w-4" /> Personal Curator
              </span>
              <h2 className="text-3xl font-black tracking-tight text-forest-dark sm:text-4xl">
                Find Your Perfect <span className="text-forest">Green Match</span>
              </h2>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Don't guess. Answer 3 quick questions about your light, care dedication, and household needs, and let our botanical matchmaking helper calculate your ideal match.
            </p>
            
            <div className="hidden lg:block pt-4">
              <div className="inline-flex items-center gap-3 bg-white border border-sage/20 rounded-2xl p-4 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/10 text-xs font-black text-forest">
                  3
                </span>
                <span className="text-xs font-bold text-forest-dark">Simple Steps to Find Your Perfect Plant</span>
              </div>
            </div>
          </div>

          {/* Right: Quiz Card Box */}
          <div className="lg:col-span-3">
            <div className="relative overflow-hidden min-h-[320px] flex flex-col justify-between">
              
              {/* Top Progress bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-forest/65 font-black uppercase tracking-widest mb-3">
                  <span>Question {currentQuestion.id} of {quizQuestions.length}</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <div className="h-1.5 w-full bg-sage/10 rounded-full overflow-hidden mb-6">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-forest transition-all duration-500 rounded-full"
                  />
                </div>

                {/* Question */}
                <h3 className="text-base sm:text-lg font-black text-forest-dark mb-4 leading-snug">
                  {currentQuestion.question}
                </h3>

                {/* Options Grid */}
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedValue === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "bg-forest/5 border-forest ring-1 ring-forest shadow-sm"
                            : "bg-white border-sage/15 hover:bg-sage/10 hover:border-sage/30"
                        }`}
                      >
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                          isSelected ? "border-forest bg-forest text-white" : "border-sage/40 bg-white"
                        }`}>
                          {isSelected && <FiCheck className="h-2.5 w-2.5" />}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <p className="text-xs font-black text-forest-dark">{opt.label}</p>
                          <p className="text-[10px] text-slate-500 font-medium leading-none">— {opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Nav actions */}
              <div className="flex items-center justify-between pt-4 border-t border-sage/10 mt-6">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-xs font-black uppercase tracking-wider text-forest-dark/60 hover:text-forest transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-4">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-terracotta hover:underline cursor-pointer"
                      title="Reset Quiz"
                    >
                      <FiRefreshCw className="h-3.5 w-3.5" /> Reset
                    </button>
                  )}

                  {isFinished ? (
                    <Link href={exploreUrl}>
                      <Button variant="primary" className="flex items-center gap-1.5 shadow-sm px-6">
                        View Matches <FiChevronRight />
                      </Button>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!selectedValue}
                      className="flex items-center gap-1.5 rounded-xl bg-forest px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-forest-dark shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                    >
                      Next Step <FiChevronRight />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
