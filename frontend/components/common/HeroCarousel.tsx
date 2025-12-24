'use client'

import { useState, useEffect } from 'react';
import { Grid3x3, Trophy, Zap, Shield } from 'lucide-react';
import { TabType } from '@/app/page';

interface HeroCarouselProps {
  onTabChange: (tab: TabType) => void;
}

const slides = [
  {
    icon: Grid3x3,
    title: 'Play Tic-Tac-Toe',
    description: 'Challenge players in classic 3x3 or advanced 5x5 games',
    color: 'text-orange-500',
    action: 'games' as TabType,
  },
  {
    icon: Trophy,
    title: 'Compete & Win',
    description: 'Climb the leaderboard and earn STX rewards',
    color: 'text-blue-500',
    action: 'leaderboard' as TabType,
  },
  {
    icon: Zap,
    title: 'Instant Matches',
    description: 'Create or join games with STX betting',
    color: 'text-yellow-500',
    action: 'create' as TabType,
  },
  {
    icon: Shield,
    title: 'Provably Fair',
    description: 'All games secured by Stacks blockchain',
    color: 'text-green-500',
    action: 'games' as TabType,
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

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="relative">
      <div className="glass rounded-2xl p-8 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className={`${slide.color} p-4 rounded-full bg-white/10`}>
            <Icon className="w-12 h-12 md:w-16 md:h-16" />
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          <span className="text-orange-500">STACKS</span>
          <span className="text-white">TacToe</span>
        </h1>

        <h2 className="text-xl md:text-2xl font-semibold text-white mb-3">
          {slide.title}
        </h2>

        <p className="text-gray-300 text-base md:text-lg mb-6 max-w-2xl mx-auto">
          {slide.description}
        </p>

        <button
          onClick={() => onTabChange(slide.action)}
          className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
        >
          Get Started
        </button>

        {/* Slide indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
