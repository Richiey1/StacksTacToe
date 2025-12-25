"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  timeRemaining: bigint | null; // in seconds
  onTimeout?: () => void;
  warningThreshold?: number; // seconds before timeout to show warning
}

export function CountdownTimer({ 
  timeRemaining, 
  onTimeout,
  warningThreshold = 3600 // 1 hour default
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!timeRemaining) {
      setRemaining(null);
      return;
    }

    // Convert BigInt to number
    const initialTime = Number(timeRemaining);
    setRemaining(initialTime);

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return null;
        const newTime = prev - 1;
        if (newTime <= 0) {
          onTimeout?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, onTimeout]);

  if (remaining === null) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Clock className="w-4 h-4" />
        <span>Calculating...</span>
      </div>
    );
  }

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const isWarning = remaining <= warningThreshold;
  const isCritical = remaining <= 1800; // 30 minutes
  const isExpired = remaining <= 0;

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  const timeString = `${hours > 0 ? `${hours}:` : ""}${formatTime(minutes)}:${formatTime(seconds)}`;

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-white font-semibold">
        <Clock className="w-4 h-4" />
        <span>Time Expired - Can Forfeit</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${
      isCritical 
        ? "text-orange-500 animate-pulse" 
        : isWarning 
        ? "text-yellow-400" 
        : "text-white"
    }`}>
      <Clock className={`w-4 h-4 ${isCritical ? "animate-pulse" : ""}`} />
      <span className="font-mono">{timeString}</span>
      {isCritical && (
        <span className="text-xs text-orange-500 ml-2">⚠️ Time running out!</span>
      )}
    </div>
  );
}
