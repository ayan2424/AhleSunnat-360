import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PrayerCounts, UserProfile } from "./calculations";
import type { StreakData } from "./streak";

const KEYS = {
  USER_PROFILE: "qaza_user_profile",
  INITIAL_COUNTS: "qaza_initial_counts",
  CURRENT_COUNTS: "qaza_current_counts",
  ONBOARDING_DONE: "qaza_onboarding_done",
  TOTAL_COMPLETED: "qaza_total_completed",
  STREAK_DATA: "qaza_streak_data",
  HISTORY: "qaza_history",
  SETUP_DATE: "qaza_setup_date",
};

export type DailyHistory = Record<string, number>;

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastLogDate: null,
  totalDaysLogged: 0,
};

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return raw ? JSON.parse(raw) : null;
}

export async function saveInitialCounts(counts: PrayerCounts): Promise<void> {
  await AsyncStorage.setItem(KEYS.INITIAL_COUNTS, JSON.stringify(counts));
}

export async function loadInitialCounts(): Promise<PrayerCounts | null> {
  const raw = await AsyncStorage.getItem(KEYS.INITIAL_COUNTS);
  return raw ? JSON.parse(raw) : null;
}

export async function saveCurrentCounts(counts: PrayerCounts): Promise<void> {
  await AsyncStorage.setItem(KEYS.CURRENT_COUNTS, JSON.stringify(counts));
}

export async function loadCurrentCounts(): Promise<PrayerCounts | null> {
  const raw = await AsyncStorage.getItem(KEYS.CURRENT_COUNTS);
  return raw ? JSON.parse(raw) : null;
}

export async function saveTotalCompleted(total: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.TOTAL_COMPLETED, String(total));
}

export async function loadTotalCompleted(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEYS.TOTAL_COMPLETED);
  return raw ? parseInt(raw, 10) : 0;
}

export async function saveStreakData(streak: StreakData): Promise<void> {
  await AsyncStorage.setItem(KEYS.STREAK_DATA, JSON.stringify(streak));
}

export async function loadStreakData(): Promise<StreakData> {
  const raw = await AsyncStorage.getItem(KEYS.STREAK_DATA);
  return raw ? JSON.parse(raw) : DEFAULT_STREAK;
}

export async function saveHistory(history: DailyHistory): Promise<void> {
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

export async function loadHistory(): Promise<DailyHistory> {
  const raw = await AsyncStorage.getItem(KEYS.HISTORY);
  return raw ? JSON.parse(raw) : {};
}

export async function incrementHistoryToday(history: DailyHistory, count: number): Promise<DailyHistory> {
  const today = new Date().toISOString().split("T")[0];
  const updated = { ...history, [today]: (history[today] ?? 0) + count };
  await saveHistory(updated);
  return updated;
}

export async function saveSetupDate(date: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETUP_DATE, date);
}

export async function loadSetupDate(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.SETUP_DATE);
}

export async function markOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, "true");
}

export async function isOnboardingDone(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
  return raw === "true";
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

export async function exportDataAsJson(): Promise<string> {
  const [profile, initial, current, totalCompleted, streak, history] = await Promise.all([
    loadUserProfile(),
    loadInitialCounts(),
    loadCurrentCounts(),
    loadTotalCompleted(),
    loadStreakData(),
    loadHistory(),
  ]);
  return JSON.stringify(
    {
      profile,
      initialCounts: initial,
      currentCounts: current,
      totalCompleted,
      streak,
      history,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}
