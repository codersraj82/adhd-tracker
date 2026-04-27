"use client";

import { useEffect, useState } from "react";
import {
  addFocusSession,
  getTodayData,
  updateBlock,
} from "../../services/storage";

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

const motivationMessages = [
  "Start small, you're doing great 💪",
  "One step is enough today 🌱",
  "Progress > perfection ✨",
  "Just begin, that's the win 🚀",
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

export default function DashboardPage() {
  const [todayData, setTodayData] = useState(null);
  const [saveStatus, setSaveStatus] = useState("Loading...");
  const [motivation, setMotivation] = useState(motivationMessages[0]);
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

  const dailyFocusTotal =
    todayData?.focusSessions
      .filter((session) => session.completed)
      .reduce((total, session) => total + session.duration, 0) || 0;
  const isFocusBusy = Boolean(activeFocus) || isSavingFocus;

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationMessages.length);
    setMotivation(motivationMessages[randomIndex]);
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
    if (!activeFocus) {
      return;
    }

    if (activeFocus.remainingSeconds <= 0) {
      completeFocusSession(
        activeFocus.duration,
        "Focus session complete. Nice work 💪"
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
    const currentBlock = todayData.blocks[blockType];

    saveBlock(blockType, {
      ...currentBlock,
      mainTask: value,
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

  function handleAddTask(event, blockType) {
    event.preventDefault();

    const title = newTaskTitles[blockType].trim();

    if (!title || !todayData) {
      return;
    }

    const currentBlock = todayData.blocks[blockType];
    const newTask = {
      title,
      completed: false,
      priority: newTaskPriorities[blockType],
    };
    const nextTasks = [...currentBlock.smallTasks, newTask];
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

  function handleToggleTask(blockType, taskIndex) {
    const currentBlock = todayData.blocks[blockType];
    const nextTasks = currentBlock.smallTasks.map((task, index) => {
      if (index !== taskIndex) {
        return task;
      }

      return {
        ...task,
        completed: !task.completed,
      };
    });

    saveBlock(blockType, {
      ...currentBlock,
      smallTasks: nextTasks,
    });
  }

  function handleDeleteTask(blockType, taskIndex) {
    const currentBlock = todayData.blocks[blockType];
    const nextTasks = currentBlock.smallTasks.filter(
      (task, index) => index !== taskIndex
    );

    saveBlock(blockType, {
      ...currentBlock,
      smallTasks: nextTasks,
    });
  }

  function handleMoodChange(blockType, mood) {
    const currentBlock = todayData.blocks[blockType];

    saveBlock(blockType, {
      ...currentBlock,
      mood,
    });
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center">
          <p className="mx-auto mb-4 max-w-xl rounded-lg bg-white/75 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm ring-1 ring-emerald-100">
            {motivation}
          </p>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            ADHD Tracker
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Plan your day in simple sections that are easy to scan.
          </p>
          <p className="mt-2 text-sm font-medium text-emerald-700">
            {saveStatus}
          </p>
        </div>

        <section className="mb-6 rounded-lg bg-white/85 p-5 shadow-sm ring-1 ring-slate-200 transition duration-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Focus session
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
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
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isActive
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
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
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Start Anyway
              </button>
            </div>
          </div>

          {activeFocus && (
            <div className="focus-enter mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-emerald-800">
                Active {activeFocus.duration}-minute session
              </p>
              <p className="mt-1 text-3xl font-bold text-emerald-900">
                {formatTime(activeFocus.remainingSeconds)}
              </p>
            </div>
          )}

          {focusMessage && (
            <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-center text-sm font-medium text-slate-700">
              {focusMessage}
            </p>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-lg bg-white/85 p-5 shadow-sm ring-1 ring-slate-200 transition duration-200 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-slate-900">
                {section.title}
              </h2>
              <label
                htmlFor={`${section.key}-main-task`}
                className="mt-5 block text-sm font-medium text-slate-700"
              >
                Main task
              </label>
              <input
                id={`${section.key}-main-task`}
                type="text"
                value={todayData?.blocks[section.key].mainTask || ""}
                onChange={(event) =>
                  handleMainTaskChange(section.key, event.target.value)
                }
                placeholder={section.placeholder}
                disabled={!todayData}
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
              />

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-700">Mood</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {moodOptions.map((mood) => {
                    const isSelected =
                      todayData?.blocks[section.key].mood === mood.value;

                    return (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() =>
                          handleMoodChange(section.key, mood.value)
                        }
                        disabled={!todayData}
                        aria-label={`Set mood to ${mood.label}`}
                        className={`rounded-md border px-2.5 py-2 text-lg transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 shadow-sm"
                            : "border-slate-200 bg-white"
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
                  className="block text-sm font-medium text-slate-700"
                >
                  Small tasks
                </label>
                <input
                  id={`${section.key}-small-task`}
                  type="text"
                  value={newTaskTitles[section.key]}
                  onChange={(event) =>
                    handleNewTaskTitleChange(section.key, event.target.value)
                  }
                  placeholder="Add a small task"
                  disabled={!todayData}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                />
                <div className="flex gap-2">
                  <select
                    value={newTaskPriorities[section.key]}
                    onChange={(event) =>
                      handleNewTaskPriorityChange(
                        section.key,
                        event.target.value
                      )
                    }
                    disabled={!todayData}
                    aria-label={`${section.title} task priority`}
                    className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.dot} {priority.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!todayData || !newTaskTitles[section.key].trim()}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Add
                  </button>
                </div>
              </form>

              <ul className="mt-5 space-y-2">
                {todayData?.blocks[section.key].smallTasks.map(
                  (task, taskIndex) => {
                    const priority = priorityOptions.find(
                      (option) => option.value === task.priority
                    );
                    const taskKey = `${section.key}-${taskIndex}-${task.title}`;

                    return (
                      <li
                        key={taskKey}
                        className={`flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 transition-all duration-200 ${
                          task.completed
                            ? "bg-emerald-50/80 opacity-75"
                            : "hover:border-slate-300"
                        } ${
                          recentlyAddedTask === taskKey ? "task-enter" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleTask(section.key, taskIndex)
                          }
                          aria-label={
                            task.completed
                              ? `Mark ${task.title} incomplete`
                              : `Mark ${task.title} complete`
                          }
                          className={`h-5 w-5 shrink-0 rounded border transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                            task.completed
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          <span className="sr-only">Toggle complete</span>
                        </button>
                        <span
                          aria-label={`${priority?.label || "Medium"} priority`}
                          className="shrink-0 text-sm"
                        >
                          {priority?.dot || "🟡"}
                        </span>
                        <span
                          className={`min-w-0 flex-1 text-sm transition duration-200 ${
                            task.completed
                              ? "text-slate-500 line-through"
                              : "text-slate-800"
                          }`}
                        >
                          {task.title}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteTask(section.key, taskIndex)
                          }
                          aria-label={`Delete ${task.title}`}
                          className="rounded px-2 py-1 text-lg leading-none text-slate-400 transition duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                          ×
                        </button>
                      </li>
                    );
                  }
                )}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
