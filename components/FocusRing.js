"use client";

export default function FocusRing({
  totalSeconds,
  remainingSeconds,
  label = "FOCUS",
}) {
  if (!totalSeconds) return null;

  const progress = remainingSeconds / totalSeconds;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const getColor = () => {
    if (progress > 0.5) return "#FFD700";
    if (progress > 0.2) return "#F59E0B";
    return "#12d30c";
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* SVG Ring */}
        <svg className="w-56 h-56 -rotate-90">
          {/* Background */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="#1f2937"
            strokeWidth="14"
            fill="none"
          />

          {/* Progress */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke={getColor()}
            strokeWidth="14"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]"
          />
        </svg>

        {/* CENTER CONTENT */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          {/* 🎯 Icon */}
          <div className="text-yellow-400 text-xl mb-1">🎯</div>

          {/* Time */}
          <div className="text-4xl font-bold text-white tracking-wider">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>

          {/* Label */}
          <div className="text-xs tracking-[2px] text-slate-400 mt-1">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
