export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export function loadStreak() {
  const data = localStorage.getItem("adhd_streak");
  return data ? JSON.parse(data) : { count: 0, lastUpdated: null };
}

export function saveStreak(data) {
  localStorage.setItem("adhd_streak", JSON.stringify(data));
}

export function updateStreak(hasProgress) {
  const today = getTodayDate();
  const streak = loadStreak();

  if (streak.lastUpdated === today) return streak;

  if (hasProgress) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (streak.lastUpdated === yesterdayStr) {
      streak.count += 1;
    } else {
      streak.count = 1;
    }
  } else {
    streak.count = 0;
  }

  streak.lastUpdated = today;
  saveStreak(streak);

  return streak;
}
