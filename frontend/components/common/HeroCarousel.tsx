"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type TabType = "games" | "create" | "leaderboard" | "challenges";

interface HeroCarouselProps {
  onTabChange: (tab: TabType) => void;
}

const slides = [
  {
    title: "Play Tic-Tac-Toe",
    subtitle: "On Stacks Blockchain",
    description: "Compete with players worldwide in decentralized Tic-Tac-Toe",
    action: "View Games",
    tab: "games" as TabType,
    gradient: "from-orange-500 to-orange-600",
  },
  {
    title: "Create Your Game",
    subtitle: "Set Your Stakes",
    description: "Choose your bet amount and board size, make the first move",
    action: "Create Game",
    tab: "create" as TabType,
    gradient: "from-orange-500 to-red-600",
  },
  {
    title: "Climb the Ranks",
    subtitle: "Prove Your Skills",
    description: "Compete for the top spot on the leaderboard",
    action: "View Leaderboard",
    tab: "leaderboard" as TabType,
    gradient: "from-yellow-500 to-orange-600",
  },
];

export function HeroCarousel({ onTabChange }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className={`bg-gradient-to-r ${slide.gradient} p-8 sm:p-12 md:p-16 text-white`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4">
            {slide.title}
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-6 opacity-90">
            {slide.subtitle}
          </p>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-80">
            {slide.description}
          </p>
          <button
            onClick={() => onTabChange(slide.tab)}
            className="bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            {slide.action}
          </button>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-8" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
