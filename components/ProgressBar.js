"use client";

import { useEffect, useRef, useState } from "react";

function getMainTask(mainTask) {
  if (typeof mainTask === "string") {
    return {
      title: mainTask,
      completed: false,
    };
  }

  return {
    title: typeof mainTask?.title === "string" ? mainTask.title : "",
    completed: Boolean(mainTask?.completed),
  };
}

function getProgressColor(progress) {
  if (progress === 100) {
    return "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] progress-complete-pulse";
  }

  if (progress >= 75) {
    return "bg-gradient-to-r from-yellow-400 to-amber-500";
  }

  if (progress >= 50) {
    return "bg-purple-500";
  }

  if (progress >= 25) {
    return "bg-blue-500";
  }

  return "bg-gray-500";
}

function getProgressEmoji(progress) {
  if (progress === 100) {
    return "🏆";
  }

  if (progress >= 75) {
    return "⚡";
  }

  if (progress >= 50) {
    return "🔥";
  }

  if (progress >= 25) {
    return "🚶";
  }

  return "🌱";
}

export default function ProgressBar({ data }) {
  const [shouldScaleEmoji, setShouldScaleEmoji] = useState(false);
  const previousProgress = useRef(0);
  const blocks = data?.blocks ? Object.values(data.blocks) : [];
  let totalTasks = 0;
  let completedTasks = 0;

  blocks.forEach((block) => {
    const mainTask = getMainTask(block?.mainTask);

    if (mainTask.title.trim() || mainTask.completed) {
      totalTasks += 1;

      if (mainTask.completed) {
        completedTasks += 1;
      }
    }

    if (Array.isArray(block?.smallTasks)) {
      block.smallTasks.forEach((task) => {
        totalTasks += 1;

        if (task.completed) {
          completedTasks += 1;
        }
      });
    }
  });

  const percentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const textColor = percentage === 100 ? "text-yellow-200" : "text-yellow-300";
  const progressColor = getProgressColor(percentage);
  const progressEmoji = getProgressEmoji(percentage);

  useEffect(() => {
    if (percentage > previousProgress.current) {
      setShouldScaleEmoji(true);

      const timeoutId = setTimeout(() => {
        setShouldScaleEmoji(false);
      }, 220);

      previousProgress.current = percentage;
      return () => clearTimeout(timeoutId);
    }

    previousProgress.current = percentage;
  }, [percentage]);

  return (
    <section className="mb-8 rounded-xl border border-yellow-400/10 bg-slate-900/80 p-6 shadow-xl shadow-black/25">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
          <span
            className={`inline-block transition-transform duration-200 ${
              shouldScaleEmoji ? "scale-110" : "scale-100"
            } ${percentage === 100 ? "animate-pulse" : ""}`}
          >
            {progressEmoji}
          </span>
          Progress
        </h2>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-in-out ${progressColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className={`text-sm font-semibold transition-colors ${textColor}`}>
          {percentage}%
        </p>
      </div>
      <p className="mt-3 text-sm text-slate-400">
        {completedTasks} of {totalTasks} tasks complete
      </p>
      {percentage === 100 && (
        <p className="mt-3 text-sm font-semibold text-green-300">
          🏆 Amazing work! You completed everything!
        </p>
      )}
    </section>
  );
}
