import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { calculateQazaCounts, PrayerCounts, UserProfile } from "@/utils/calculations";
import {
  clearAllData,
  isOnboardingDone,
  loadCurrentCounts,
  loadInitialCounts,
  loadTotalCompleted,
  loadUserProfile,
  markOnboardingDone,
  saveCurrentCounts,
  saveInitialCounts,
  saveTotalCompleted,
  saveUserProfile,
} from "@/utils/storage";

interface AppContextType {
  isLoaded: boolean;
  onboardingDone: boolean;
  userProfile: UserProfile | null;
  initialCounts: PrayerCounts | null;
  currentCounts: PrayerCounts | null;
  totalCompleted: number;
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  decrementPrayer: (key: keyof PrayerCounts) => void;
  incrementPrayer: (key: keyof PrayerCounts) => void;
  logFullDay: () => void;
  resetProgress: () => Promise<void>;
  recalculate: (profile: UserProfile) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [initialCounts, setInitialCounts] = useState<PrayerCounts | null>(null);
  const [currentCounts, setCurrentCounts] = useState<PrayerCounts | null>(null);
  const [totalCompleted, setTotalCompleted] = useState(0);

  useEffect(() => {
    (async () => {
      const done = await isOnboardingDone();
      if (done) {
        const [profile, initial, current, completed] = await Promise.all([
          loadUserProfile(),
          loadInitialCounts(),
          loadCurrentCounts(),
          loadTotalCompleted(),
        ]);
        setUserProfile(profile);
        setInitialCounts(initial);
        setCurrentCounts(current);
        setTotalCompleted(completed);
        setOnboardingDone(true);
      }
      setIsLoaded(true);
    })();
  }, []);

  const completeOnboarding = useCallback(async (profile: UserProfile) => {
    const counts = calculateQazaCounts(profile);
    await Promise.all([
      saveUserProfile(profile),
      saveInitialCounts(counts),
      saveCurrentCounts(counts),
      saveTotalCompleted(0),
      markOnboardingDone(),
    ]);
    setUserProfile(profile);
    setInitialCounts(counts);
    setCurrentCounts(counts);
    setTotalCompleted(0);
    setOnboardingDone(true);
  }, []);

  const updateCounts = useCallback(async (newCounts: PrayerCounts, newCompleted: number) => {
    setCurrentCounts(newCounts);
    setTotalCompleted(newCompleted);
    await saveCurrentCounts(newCounts);
    await saveTotalCompleted(newCompleted);
  }, []);

  const decrementPrayer = useCallback((key: keyof PrayerCounts) => {
    if (!currentCounts) return;
    if (currentCounts[key] <= 0) return;
    const newCounts = { ...currentCounts, [key]: currentCounts[key] - 1 };
    const newCompleted = totalCompleted + 1;
    updateCounts(newCounts, newCompleted);
  }, [currentCounts, totalCompleted, updateCounts]);

  const incrementPrayer = useCallback((key: keyof PrayerCounts) => {
    if (!currentCounts || !initialCounts) return;
    if (currentCounts[key] >= initialCounts[key]) return;
    const newCounts = { ...currentCounts, [key]: currentCounts[key] + 1 };
    const newCompleted = Math.max(0, totalCompleted - 1);
    updateCounts(newCounts, newCompleted);
  }, [currentCounts, initialCounts, totalCompleted, updateCounts]);

  const logFullDay = useCallback(() => {
    if (!currentCounts) return;
    const keys = Object.keys(currentCounts) as (keyof PrayerCounts)[];
    const loggedCount = keys.filter(k => currentCounts[k] > 0).length;
    const newCounts: PrayerCounts = { ...currentCounts };
    keys.forEach((k) => {
      if (newCounts[k] > 0) newCounts[k] -= 1;
    });
    const newCompleted = totalCompleted + loggedCount;
    updateCounts(newCounts, newCompleted);
  }, [currentCounts, totalCompleted, updateCounts]);

  const resetProgress = useCallback(async () => {
    if (!initialCounts) return;
    await updateCounts({ ...initialCounts }, 0);
  }, [initialCounts, updateCounts]);

  const recalculate = useCallback(async (profile: UserProfile) => {
    const counts = calculateQazaCounts(profile);
    await Promise.all([
      saveUserProfile(profile),
      saveInitialCounts(counts),
      saveCurrentCounts(counts),
      saveTotalCompleted(0),
    ]);
    setUserProfile(profile);
    setInitialCounts(counts);
    setCurrentCounts(counts);
    setTotalCompleted(0);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoaded,
        onboardingDone,
        userProfile,
        initialCounts,
        currentCounts,
        totalCompleted,
        completeOnboarding,
        decrementPrayer,
        incrementPrayer,
        logFullDay,
        resetProgress,
        recalculate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
