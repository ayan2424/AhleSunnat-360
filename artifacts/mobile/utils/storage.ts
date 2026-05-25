import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PrayerCounts, UserProfile } from "./calculations";

const KEYS = {
  USER_PROFILE: "qaza_user_profile",
  INITIAL_COUNTS: "qaza_initial_counts",
  CURRENT_COUNTS: "qaza_current_counts",
  ONBOARDING_DONE: "qaza_onboarding_done",
  TOTAL_COMPLETED: "qaza_total_completed",
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
  const profile = await loadUserProfile();
  const initial = await loadInitialCounts();
  const current = await loadCurrentCounts();
  const totalCompleted = await loadTotalCompleted();
  return JSON.stringify(
    { profile, initialCounts: initial, currentCounts: current, totalCompleted, exportedAt: new Date().toISOString() },
    null,
    2
  );
}
