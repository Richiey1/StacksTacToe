"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, Grid3x3, Swords, Trophy } from "lucide-react";

const slides = [
  {
    title: "On-Chain PvP",
    description: "Welcome to StacksTacToe. A winner-takes-all Tic-Tac-Toe game powered by Bitcoin L2.",
    icon: <Grid3x3 className="w-12 h-12 text-blue-500" />,
    color: "bg-blue-500/10",
  },
  {
    title: "Challenge Others",
    description: "Create a game, set your wager in STX or sBTC, and wait for an opponent to join the fray.",
    icon: <Swords className="w-12 h-12 text-red-500" />,
    color: "bg-red-500/10",
  },
  {
    title: "Claim the Pot",
    description: "Every move is verified on-chain. Win the match and the smart contract automatically sends you the rewards.",
    icon: <Trophy className="w-12 h-12 text-amber-500" />,
    color: "bg-amber-500/10",
  },
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("stackstactoe_tour_seen");
    if (!hasSeenTour) {
      setIsOpen(true);
    }
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className={`p-10 flex flex-col items-center text-center transition-colors duration-500 ${slides[currentSlide].color}`}>
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-8 p-6 bg-zinc-800 rounded-2xl border border-zinc-700 shadow-lg">
            {slides[currentSlide].icon}
          </div>
          
          <h2 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">
            {slides[currentSlide].title}
          </h2>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-10">
            {slides[currentSlide].description}
          </p>

          <div className="w-full flex items-center justify-between mt-auto pt-6 border-t border-zinc-800/50">
            <div className="flex gap-1.5">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "w-8 bg-blue-500" : "w-2 bg-zinc-800"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-95 group"
            >
              {currentSlide === slides.length - 1 ? "Play Now" : "Next"}
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
