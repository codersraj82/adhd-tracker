"use client";

export default function FocusButtons({ onStart, compact = false }) {
  const durations = [2, 5, 25, 60];

  return (
    <div className={`flex gap-2 ${compact ? "mt-2" : ""}`}>
      {durations.map((d) => (
        <button
          key={d}
          onClick={() => onStart(d)}
          className={`px-2 py-1 text-xs rounded border 
          hover:scale-105 transition ${
            compact ? "bg-slate-800 text-white" : ""
          }`}
        >
          {d}m
        </button>
      ))}

      <button
        onClick={() => onStart(2, true)}
        className="px-2 py-1 text-xs rounded bg-yellow-500 text-black hover:scale-105 transition"
      >
        Start
      </button>
    </div>
  );
}
