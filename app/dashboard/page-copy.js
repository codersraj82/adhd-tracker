"use client";

import { useEffect, useRef, useState } from "react";
import {
  addFocusSession,
  getTodayData,
  updateBlock,
} from "../../services/storage";
import ProgressBar from "../../components/ProgressBar";
import UserName from "../../components/UserName";
import { updateStreak } from "../../services/streak";

const sections = [
  {
    key: "morning",
    title: "🌅 Morning",
    placeholder: "What is the first helpful task?",
  },
  {
    key: "work",
    title: "🧑‍💼 Work",
    placeholder: "What matters most during work?",
  },
  {
    key: "evening",
    title: "🌙 Evening",
    placeholder: "What would make the evening easier?",
  },
];

const priorityOptions = [
  { value: 1, label: "High", dot: "🔴" },
  { value: 2, label: "Medium", dot: "🟡" },
  { value: 3, label: "Low", dot: "🟢" },
];

const moodOptions = [
  { value: "great", emoji: "😄", label: "great" },
  { value: "good", emoji: "🙂", label: "good" },
  { value: "neutral", emoji: "😐", label: "neutral" },
  { value: "low", emoji: "😞", label: "low" },
  { value: "stressed", emoji: "😫", label: "stressed" },
];

const focusDurations = [2, 5, 25, 60];
const USER_NAME_KEY = "adhd_user_name";

const motivationMessages = [
  "Start small, you're doing great 💪",
  "One step is enough today 🌱",
  "Progress > perfection ✨",
  "Just begin, that's the win 🚀",
];

const appreciationMessages = [
  "Nice work, {name}! You're making progress 💪",
  "Keep going, {name}! One step at a time 🌱",
  "You're doing great, {name} ✨",
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

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

function areAllMainTasksCompleted(data) {
  if (!data) {
    return false;
  }

  return sections.every((section) => {
    const mainTask = getMainTask(data.blocks?.[section.key]?.mainTask);

    return mainTask.title.trim() && mainTask.completed;
  });
}

function getAppreciationMessage(name) {
  const randomIndex = Math.floor(Math.random() * appreciationMessages.length);

  return appreciationMessages[randomIndex].replace("{name}", name);
}

// function isActiveTask(blockType, taskType, taskIndex = null) {
//   return (
//     activeFocus &&
//     activeFocus.blockType === blockType &&
//     activeFocus.taskType === taskType &&
//     activeFocus.taskIndex === taskIndex
//   );
// }

//*********************** *//

export default function DashboardPage() {
  const [todayData, setTodayData] = useState(null);
  const [streak, setStreak] = useState({ count: 0 });
  const [saveStatus, setSaveStatus] = useState("Loading...");
  const [userName, setUserName] = useState("friend");
  const [motivation, setMotivation] = useState(motivationMessages[0]);
  const [appreciation, setAppreciation] = useState(
    getAppreciationMessage("friend"),
  );
  const [focusMessage, setFocusMessage] = useState("");
  const [activeFocus, setActiveFocus] = useState(null);
  const [isSavingFocus, setIsSavingFocus] = useState(false);
  const [newTaskTitles, setNewTaskTitles] = useState({
    morning: "",
    work: "",
    evening: "",
  });
  const [newTaskPriorities, setNewTaskPriorities] = useState({
    morning: 2,
    work: 2,
    evening: 2,
  });
  const [recentlyAddedTask, setRecentlyAddedTask] = useState("");
  const [recentlyCompletedMainTask, setRecentlyCompletedMainTask] =
    useState("");

  //********************* *//

  const hasAskedName = useRef(false);

  const dailyFocusTotal =
    todayData?.focusSessions
      .filter((session) => session.completed)
      .reduce((total, session) => total + session.duration, 0) || 0;
  const isFocusBusy = Boolean(activeFocus) || isSavingFocus;
  const allMainTasksCompleted = areAllMainTasksCompleted(todayData);
  const motivationText = allMainTasksCompleted
    ? `All main tasks completed. Big win for today, ${userName} 💪`
    : motivation;

  //**************************** *//
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationMessages.length);
    setMotivation(motivationMessages[randomIndex]);
  }, []);

  useEffect(() => {
    if (hasAskedName.current) {
      return;
    }

    hasAskedName.current = true;

    const savedName = localStorage.getItem(USER_NAME_KEY);
    const nextName =
      savedName || window.prompt("What should I call you?")?.trim() || "friend";

    localStorage.setItem(USER_NAME_KEY, nextName);
    setUserName(nextName);
    setAppreciation(getAppreciationMessage(nextName));
  }, []);

  useEffect(() => {
    if (!recentlyAddedTask) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setRecentlyAddedTask("");
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [recentlyAddedTask]);

  useEffect(() => {
    if (!recentlyCompletedMainTask) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setRecentlyCompletedMainTask("");
    }, 1600);

    return () => clearTimeout(timeoutId);
  }, [recentlyCompletedMainTask]);

  useEffect(() => {
    async function loadTodayData() {
      try {
        const data = await getTodayData();
        setTodayData(data);
        setSaveStatus("Saved locally");
      } catch (error) {
        setSaveStatus("Storage unavailable");
      }
    }

    loadTodayData();
  }, []);

  useEffect(() => {
    if (!todayData) return;

    const progress = hasUserProgress(todayData);
    const streakData = updateStreak(progress);

    setStreak(streakData);
  }, [todayData]);

  useEffect(() => {
    if (!activeFocus) {
      return;
    }

    if (activeFocus.remainingSeconds <= 0) {
      completeFocusSession(
        activeFocus.duration,
        "Focus session complete. Nice work 💪",
      );
      setActiveFocus(null);
      return;
    }

    const intervalId = setInterval(() => {
      setActiveFocus((currentFocus) => {
        if (!currentFocus) {
          return null;
        }

        return {
          ...currentFocus,
          remainingSeconds: currentFocus.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeFocus]);

  //************************** *//

  function isActiveTask(blockType, taskType, taskIndex = null) {
    return (
      activeFocus &&
      activeFocus.blockType === blockType &&
      activeFocus.taskType === taskType &&
      activeFocus.taskIndex === taskIndex
    );
  }

  function handleTaskFocus(blockType, taskType, taskIndex, duration) {
    if (!todayData || isFocusBusy) return;

    if (duration === "custom") {
      const custom = prompt("Enter minutes:");
      if (!custom) return;
      duration = Number(custom);
    }

    setActiveFocus({
      blockType,
      taskType,
      taskIndex,
      duration,
      remainingSeconds: duration * 60,
    });

    setFocusMessage(`${duration} min focus started 🎯`);
  }

  async function saveBlock(blockType, blockData) {
    if (!todayData) {
      return;
    }

    const updatedData = {
      ...todayData,
      blocks: {
        ...todayData.blocks,
        [blockType]: blockData,
      },
    };

    setTodayData(updatedData);
    setSaveStatus("Saving...");

    try {
      await updateBlock(blockType, blockData);
      setSaveStatus("Saved locally");
    } catch (error) {
      setSaveStatus("Could not save");
    }
  }

  async function completeFocusSession(duration, message) {
    setIsSavingFocus(true);
    setSaveStatus("Saving...");

    try {
      const updatedData = await addFocusSession({
        duration,
        completed: true,
      });

      setTodayData(updatedData);
      setFocusMessage(message);
      setSaveStatus("Saved locally");
    } catch (error) {
      setSaveStatus("Could not save focus");
    } finally {
      setIsSavingFocus(false);
    }
  }
  function hasUserProgress(data) {
    const blocks = data?.blocks || {};

    for (let key in blocks) {
      const block = blocks[key];

      // main task completed
      if (block?.mainTask?.completed) return true;

      // any small task completed
      if (block?.smallTasks?.some((t) => t.completed)) return true;
    }

    return false;
  }
  function handleStartFocus(duration) {
    if (!todayData || isFocusBusy) {
      return;
    }

    setFocusMessage(`${duration}-minute focus started.`);
    setActiveFocus({
      duration,
      remainingSeconds: duration * 60,
    });
  }

  function handleStartAnyway() {
    if (!todayData || isFocusBusy) {
      return;
    }

    completeFocusSession(2, "You started. That’s a win 💪");
  }

  function handleMainTaskChange(blockType, value) {
    const currentBlock = todayData.blocks?.[blockType] || {
      mainTask: { title: "", completed: false },
      smallTasks: [],
      mood: "neutral",
    };
    const currentMainTask = getMainTask(currentBlock.mainTask);

    saveBlock(blockType, {
      ...currentBlock,
      mainTask: {
        ...currentMainTask,
        title: value,
      },
    });
  }

  function handleMainTaskToggle(blockType) {
    const currentBlock = todayData.blocks?.[blockType] || {};
    const currentMainTask = getMainTask(currentBlock.mainTask);
    const nextCompleted = !currentMainTask.completed;

    setRecentlyCompletedMainTask(nextCompleted ? blockType : "");
    if (isActiveTask(blockType, "main")) {
      setActiveFocus(null);
    }
    if (nextCompleted) {
      setAppreciation(getAppreciationMessage(userName));
    }

    saveBlock(blockType, {
      ...currentBlock,
      mainTask: {
        ...currentMainTask,
        completed: nextCompleted,
      },
    });
  }

  function handleNewTaskTitleChange(blockType, value) {
    setNewTaskTitles({
      ...newTaskTitles,
      [blockType]: value,
    });
  }

  function handleNewTaskPriorityChange(blockType, value) {
    setNewTaskPriorities({
      ...newTaskPriorities,
      [blockType]: Number(value),
    });
  }

  // ✅ ONLY FIXED PARTS — KEEP REST SAME

  function handleAddTask(event, blockType) {
    event.preventDefault();

    const title = newTaskTitles[blockType].trim();
    if (!title || !todayData) return;

    const currentBlock = todayData.blocks?.[blockType] || {};
    const existingTasks = currentBlock.smallTasks || []; // ✅ FIX

    const newTask = {
      title,
      completed: false,
      priority: newTaskPriorities[blockType],
    };

    const nextTasks = [...existingTasks, newTask]; // ✅ FIX

    const newTaskKey = `${blockType}-${nextTasks.length - 1}-${title}`;

    setNewTaskTitles({
      ...newTaskTitles,
      [blockType]: "",
    });

    setRecentlyAddedTask(newTaskKey);

    saveBlock(blockType, {
      ...currentBlock,
      smallTasks: nextTasks,
    });
  }

  // -------------------------

  function handleToggleTask(blockType, taskIndex) {
    const currentBlock = todayData.blocks?.[blockType] || {};
    const existingTasks = currentBlock.smallTasks || []; // ✅ FIX

    const currentTask = existingTasks[taskIndex]; // ✅ FIX
    if (!currentTask) return;

    const nextCompleted = !currentTask.completed;

    const nextTasks = existingTasks.map((task, index) => {
      if (isActiveTask(blockType, "sub", taskIndex)) {
        setActiveFocus(null);
      }

      if (index !== taskIndex) return task;

      return {
        ...task,
        completed: nextCompleted,
      };
    });

    if (nextCompleted) {
      setAppreciation(getAppreciationMessage(userName));
    }

    saveBlock(blockType, {
      ...currentBlock,
      smallTasks: nextTasks,
    });
  }

  // -------------------------

  function handleDeleteTask(blockType, taskIndex) {
    const currentBlock = todayData.blocks?.[blockType] || {};
    const existingTasks = currentBlock.smallTasks || []; // ✅ FIX

    const nextTasks = existingTasks.filter(
      (task, index) => index !== taskIndex,
    );

    saveBlock(blockType, {
      ...currentBlock,
      smallTasks: nextTasks,
    });
  }

  function handleMoodChange(blockType, mood) {
    const currentBlock = todayData.blocks?.[blockType] || {};

    saveBlock(blockType, {
      ...currentBlock,
      mood,
    });
  }

  return (
    <main className="fade-in min-h-screen px-4 py-10 text-white sm:py-14">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mx-auto mb-4 max-w-xl rounded-xl border border-yellow-400/20 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-yellow-200 shadow-lg shadow-black/20">
            {motivationText}
          </p>
          <p className="text-sm font-medium text-slate-300">
            Good to see you, {userName} 👋
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
            ADHD Tracker
          </h1>
          <p className="mt-4 text-base text-slate-400">
            Plan your day in simple sections that are easy to scan.
          </p>
          <p className="mt-3 text-sm font-medium text-yellow-300">
            {appreciation}
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            {saveStatus}
          </p>
        </div>
        <UserName />

        <div className="mb-4 text-center">
          <p className="text-lg font-semibold text-yellow-400">
            🔥 Streak: {streak?.count || 0} day{streak?.count === 1 ? "" : "s"}
          </p>

          {streak?.count > 0 && (
            <p className="text-sm text-slate-400">
              {streak.count >= 5
                ? "You're on fire 🔥 keep going!"
                : "Consistency builds success 🌱"}
            </p>
          )}
        </div>

        <ProgressBar data={todayData} />

        <section
          className={`mb-8 rounded-xl border bg-slate-900/80 p-6 shadow-xl shadow-black/25 transition duration-300 ${
            activeFocus
              ? "focus-pulse border-yellow-400/40 shadow-[0_0_10px_rgba(255,215,0,0.4)]"
              : "border-yellow-400/10"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Focus session
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-400">
                Today's focus: {dailyFocusTotal} minutes
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {focusDurations.map((duration) => {
                const isActive = activeFocus?.duration === duration;

                return (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => handleStartFocus(duration)}
                    disabled={!todayData || isFocusBusy}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300/40 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isActive
                        ? "border-yellow-400/50 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_10px_rgba(255,215,0,0.4)]"
                        : "border-slate-700 bg-slate-800 text-slate-200 hover:border-yellow-400/30 hover:text-yellow-200"
                    }`}
                  >
                    {duration} min
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleStartAnyway}
                disabled={!todayData || isFocusBusy}
                className="rounded-md bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/10 transition duration-200 hover:shadow-[0_0_10px_rgba(255,215,0,0.4)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start Anyway
              </button>
            </div>
          </div>

          {activeFocus && (
            <div className="focus-enter mt-5 rounded-xl border border-yellow-400/30 bg-slate-950/80 px-4 py-4 text-center shadow-[0_0_10px_rgba(255,215,0,0.4)]">
              <p className="text-sm font-semibold text-yellow-200">
                Active {activeFocus.duration}-minute session
              </p>
              <p className="mt-1 text-4xl font-bold text-white">
                {formatTime(activeFocus.remainingSeconds)}
              </p>
            </div>
          )}

          {focusMessage && (
            <p className="mt-4 rounded-md border border-yellow-400/10 bg-slate-950/60 px-3 py-2 text-center text-sm font-medium text-slate-300">
              {focusMessage}
            </p>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          {todayData?.blocks &&
            sections.map((section) => {
              const rawBlock = todayData?.blocks?.[section.key] || {};

              const block = {
                mainTask: rawBlock.mainTask || "",
                smallTasks: rawBlock.smallTasks || [],
                mood: rawBlock.mood || "neutral",
              };

              const mainTask = getMainTask(block.mainTask);

              return (
                <article
                  key={section.title}
                  className="rounded-xl border border-yellow-400/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20 transition duration-300 hover:scale-105 hover:border-yellow-400/20 hover:shadow-[0_0_10px_rgba(255,215,0,0.18)]"
                >
                  <h2 className="text-2xl font-semibold text-white">
                    {section.title}
                  </h2>
                  <label
                    htmlFor={`${section.key}-main-task`}
                    className="mt-6 block text-sm font-medium text-slate-300"
                  >
                    Main task
                  </label>
                  <div className="mt-2">
                    <div
                      className={`flex items-center gap-2 ${
                        isActiveTask(section.key, "main")
                          ? "ring-2 ring-yellow-400 rounded-md p-1"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={mainTask.completed}
                        onChange={() => {
                          handleMainTaskToggle(section.key);

                          // 🛑 stop focus if completed
                          if (isActiveTask(section.key, "main")) {
                            setActiveFocus(null);
                          }
                        }}
                        className="h-5 w-5"
                      />

                      <input
                        type="text"
                        value={mainTask.title}
                        onChange={(e) =>
                          handleMainTaskChange(section.key, e.target.value)
                        }
                        placeholder={section.placeholder}
                        className={`w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-500 ${
                          mainTask.completed ? "line-through opacity-60" : ""
                        }`}
                      />

                      <select
                        onChange={(e) =>
                          handleTaskFocus(
                            section.key,
                            "main",
                            null,
                            e.target.value === "custom"
                              ? "custom"
                              : Number(e.target.value),
                          )
                        }
                        className="bg-slate-800 text-white text-xs rounded px-1 py-1"
                      >
                        <option value="">🎯</option>
                        <option value={2}>2m</option>
                        <option value={5}>5m</option>
                        <option value={25}>25m</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    {/* ⏱ Timer BELOW task */}
                    {isActiveTask(section.key, "main") && (
                      <div className="mt-2 text-sm text-yellow-300 font-semibold">
                        ⏱ {formatTime(activeFocus.remainingSeconds)}
                      </div>
                    )}
                  </div>

                  {recentlyCompletedMainTask === section.key && (
                    <p className="mt-2 text-sm font-medium text-yellow-200">
                      Nice! One step done ✅
                    </p>
                  )}
                  {!mainTask.title.trim() && (
                    <p className="mt-2 text-sm text-slate-500">
                      Start with one simple goal
                    </p>
                  )}

                  <div className="mt-5">
                    <p className="text-sm font-medium text-slate-300">Mood</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {moodOptions.map((mood) => {
                        const isSelected = block.mood === mood.value;

                        return (
                          <button
                            key={mood.value}
                            type="button"
                            onClick={() =>
                              handleMoodChange(section.key, mood.value)
                            }
                            disabled={!todayData}
                            aria-label={`Set mood to ${mood.label}`}
                            className={`rounded-md border px-2.5 py-2 text-lg transition duration-200 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300/30 disabled:cursor-not-allowed disabled:opacity-60 ${
                              isSelected
                                ? "border-yellow-400/50 bg-yellow-400/10 shadow-[0_0_10px_rgba(255,215,0,0.25)]"
                                : "border-slate-700 bg-slate-950/70"
                            }`}
                          >
                            {mood.emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <form
                    onSubmit={(event) => handleAddTask(event, section.key)}
                    className="mt-5 space-y-3"
                  >
                    <label
                      htmlFor={`${section.key}-small-task`}
                      className="block text-sm font-medium text-slate-300"
                    >
                      Small tasks
                    </label>
                    <input
                      id={`${section.key}-small-task`}
                      type="text"
                      value={newTaskTitles[section.key]}
                      onChange={(event) =>
                        handleNewTaskTitleChange(
                          section.key,
                          event.target.value,
                        )
                      }
                      placeholder="Add a small task"
                      disabled={!todayData}
                      className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10 disabled:bg-slate-800"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newTaskPriorities[section.key]}
                        onChange={(event) =>
                          handleNewTaskPriorityChange(
                            section.key,
                            event.target.value,
                          )
                        }
                        disabled={!todayData}
                        aria-label={`${section.title} task priority`}
                        className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10 disabled:bg-slate-800"
                      >
                        {priorityOptions.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.dot} {priority.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={
                          !todayData || !newTaskTitles[section.key].trim()
                        }
                        className="rounded-md bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition duration-200 hover:shadow-[0_0_10px_rgba(255,215,0,0.35)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </form>

                  {block.smallTasks.length === 0 && (
                    <p className="mt-5 rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-500">
                      Break it into small steps…
                    </p>
                  )}

                  <ul className="mt-5 space-y-2">
                    {block.smallTasks.map((task, taskIndex) => {
                      const priority = priorityOptions.find(
                        (option) => option.value === task.priority,
                      );
                      const taskKey = `${section.key}-${taskIndex}-${task.title}`;

                      return (
                        <li className="rounded-md border px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                handleToggleTask(section.key, taskIndex);

                                // 🛑 stop focus if completed
                                if (
                                  isActiveTask(section.key, "sub", taskIndex)
                                ) {
                                  setActiveFocus(null);
                                }
                              }}
                              className="h-5 w-5 border rounded"
                            />

                            <span className="text-sm text-slate-200 flex-1">
                              {task.title}
                            </span>

                            <button
                              onClick={() =>
                                handleTaskFocus(
                                  section.key,
                                  "sub",
                                  taskIndex,
                                  5,
                                )
                              }
                              className="text-xs px-2 py-1 rounded bg-yellow-500 text-black"
                            >
                              🎯
                            </button>
                          </div>

                          {/* ⏱ Timer BELOW */}
                          {isActiveTask(section.key, "sub", taskIndex) && (
                            <div className="mt-2 text-sm text-yellow-300">
                              ⏱ {formatTime(activeFocus.remainingSeconds)}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })}
        </div>
      </section>
    </main>
  );
}
