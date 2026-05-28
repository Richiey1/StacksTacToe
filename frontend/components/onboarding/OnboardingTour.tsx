"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, Grid3x3, Swords, Trophy } from "lucide-react";

const slides = [
  {
    title: "On-Chain PvP",
    description:
      "Welcome to StacksTacToe. A winner-takes-all Tic-Tac-Toe game powered by Bitcoin L2.",
    icon: <Grid3x3 className="w-10 h-10 text-orange-500" />,
    color: "from-orange-500/10 to-transparent",
  },
  {
    title: "Challenge Others",
    description:
      "Create a game, set your wager in STX or sBTC, and wait for an opponent to join the fray.",
    icon: <Swords className="w-10 h-10 text-orange-500" />,
    color: "from-orange-500/10 to-transparent",
  },
  {
    title: "Claim the Pot",
    description:
      "Every move is verified on-chain. Win the match and the smart contract automatically sends you the rewards.",
    icon: <Trophy className="w-10 h-10 text-orange-500" />,
    color: "from-orange-500/10 to-transparent",
  },
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Small delay to avoid cascading render warning while still showing on mount
    const timer = setTimeout(() => {
      const hasSeenTour = localStorage.getItem("stackstactoe_tour_seen");
      if (!hasSeenTour) {
        setIsOpen(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("stackstactoe_tour_seen", "true");
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-md bg-black border-4 border-orange-500 shadow-[8px_8px_0px_0px_#fff] overflow-hidden">
        {/* Pixelated Pattern Overlay */}
        <div 
          className="absolute inset-0 bg-orange-600 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
              linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)
            `,
            backgroundSize: '4px 4px',
            backgroundPosition: '0 0, 2px 2px',
          }}
        />

        <div className="relative p-6 md:p-8 flex flex-col items-center text-center z-10">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 bg-black border-2 border-white text-white hover:bg-orange-500 hover:text-black transition-all cursor-pointer font-pixel text-[8px] uppercase font-bold"
            title="Skip"
          >
            [X]
          </button>

          <div className="mb-6 p-4 bg-black border-4 border-white shadow-[4px_4px_0px_0px_#f97316] inline-block">
            {slides[currentSlide].icon}
          </div>

          <h2 className="text-sm md:text-base font-pixel text-orange-500 mb-4 uppercase tracking-wider">
            {slides[currentSlide].title}
          </h2>
          <p className="font-pixel text-[9px] md:text-[10px] leading-loose text-zinc-300 mb-8 uppercase tracking-wide max-w-[320px]">
            {slides[currentSlide].description}
          </p>

          <div className="w-full flex items-center justify-between mt-auto pt-4 border-t-4 border-white/10">
            {/* Square Retro Indicators */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 border-2 transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-orange-500 border-white shadow-[2px_2px_0px_0px_#000]"
                      : "bg-black border-zinc-700"
                  }`}
                />
              ))}
            </div>

            {/* Retro Action Button */}
            <button
              onClick={nextSlide}
              className="flex items-center gap-1 px-4 py-2.5 bg-black border-4 border-white text-white hover:bg-orange-500 hover:text-black shadow-[4px_4px_0px_0px_#f97316] font-pixel text-[10px] uppercase transition-all active:translate-y-0.5 cursor-pointer"
            >
              <span>{currentSlide === slides.length - 1 ? "Play Now" : "Next"}</span>
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
