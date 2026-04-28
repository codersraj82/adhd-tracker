"use client";

import { useEffect, useState } from "react";

export default function FocusRing({ duration, isRunning }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const progress = timeLeft / duration;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // 🎯 ADHD-friendly color logic
  const getColor = () => {
    if (progress > 0.5) return "#FFD700"; // gold
    if (progress > 0.2) return "#F59E0B"; // amber-500
    return "#EF4444"; // red-500
  };

  return (
    <div
      className={`flex flex-col items-center justify-center 
      ${progress < 0.1 ? "animate-pulse" : ""}`}
    >
      <svg className="w-36 h-36 -rotate-90">
        {/* Background ring */}
        <circle
          cx="72"
          cy="72"
          r={radius}
          stroke="#1f2937" // gray-800
          strokeWidth="10"
          fill="none"
        />

        {/* Progress ring */}
        <circle
          cx="72"
          cy="72"
          r={radius}
          stroke={getColor()}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>

      {/* Time Display */}
      <div className="mt-3 text-xl font-semibold text-gray-100 tracking-wider">
        {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </div>
    </div>
  );
}
