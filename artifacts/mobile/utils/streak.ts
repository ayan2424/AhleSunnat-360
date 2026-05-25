export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
  totalDaysLogged: number;
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function updateStreak(streak: StreakData): StreakData {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (streak.lastLogDate === today) {
    return streak;
  }

  let newCurrentStreak = 1;
  if (streak.lastLogDate === yesterday) {
    newCurrentStreak = streak.currentStreak + 1;
  }

  return {
    currentStreak: newCurrentStreak,
    longestStreak: Math.max(streak.longestStreak, newCurrentStreak),
    lastLogDate: today,
    totalDaysLogged: streak.totalDaysLogged + 1,
  };
}

export function isStreakActive(streak: StreakData): boolean {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  return streak.lastLogDate === today || streak.lastLogDate === yesterday;
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 100) return "🏆";
  if (streak >= 30) return "🔥";
  if (streak >= 14) return "⭐";
  if (streak >= 7) return "✨";
  if (streak >= 3) return "💫";
  return "🌙";
}
