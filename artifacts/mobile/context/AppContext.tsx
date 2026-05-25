import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { calculateQazaCounts, PrayerCounts, UserProfile } from "@/utils/calculations";
import { getNewMilestones, Milestone } from "@/utils/milestones";
import { updateStreak, StreakData } from "@/utils/streak";
import {
  clearAllData,
  DailyHistory,
  incrementHistoryToday,
  isOnboardingDone,
  loadCurrentCounts,
  loadHistory,
  loadInitialCounts,
  loadSetupDate,
  loadStreakData,
  loadTotalCompleted,
  loadUserProfile,
  markOnboardingDone,
  saveCurrentCounts,
  saveInitialCounts,
  saveSetupDate,
  saveStreakData,
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
  streak: StreakData;
  history: DailyHistory;
  setupDate: string | null;
  pendingMilestone: Milestone | null;
  dismissMilestone: () => void;
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
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastLogDate: null, totalDaysLogged: 0 });
  const [history, setHistory] = useState<DailyHistory>({});
  const [setupDate, setSetupDate] = useState<string | null>(null);
  const [pendingMilestone, setPendingMilestone] = useState<Milestone | null>(null);
  const totalCompletedRef = useRef(0);

  useEffect(() => {
    (async () => {
      const done = await isOnboardingDone();
      if (done) {
        const [profile, initial, current, completed, streakData, hist, sd] = await Promise.all([
          loadUserProfile(),
          loadInitialCounts(),
          loadCurrentCounts(),
          loadTotalCompleted(),
          loadStreakData(),
          loadHistory(),
          loadSetupDate(),
        ]);
        setUserProfile(profile);
        setInitialCounts(initial);
        setCurrentCounts(current);
        setTotalCompleted(completed);
        totalCompletedRef.current = completed;
        setStreak(streakData);
        setHistory(hist);
        setSetupDate(sd);
        setOnboardingDone(true);
      }
      setIsLoaded(true);
    })();
  }, []);

  const completeOnboarding = useCallback(async (profile: UserProfile) => {
    const counts = calculateQazaCounts(profile);
    const today = new Date().toISOString().split("T")[0];
    await Promise.all([
      saveUserProfile(profile),
      saveInitialCounts(counts),
      saveCurrentCounts(counts),
      saveTotalCompleted(0),
      markOnboardingDone(),
      saveSetupDate(today),
    ]);
    setUserProfile(profile);
    setInitialCounts(counts);
    setCurrentCounts(counts);
    setTotalCompleted(0);
    totalCompletedRef.current = 0;
    setSetupDate(today);
    setOnboardingDone(true);
  }, []);

  const applyLog = useCallback(async (newCounts: PrayerCounts, addedCount: number) => {
    const prevTotal = totalCompletedRef.current;
    const newTotal = prevTotal + addedCount;

    const newStreak = updateStreak(streak);
    const newHistory = await incrementHistoryToday(history, addedCount);
    const newMilestones = getNewMilestones(prevTotal, newTotal);

    setCurrentCounts(newCounts);
    setTotalCompleted(newTotal);
    totalCompletedRef.current = newTotal;
    setStreak(newStreak);
    setHistory(newHistory);

    if (newMilestones.length > 0) {
      setPendingMilestone(newMilestones[newMilestones.length - 1]);
    }

    await Promise.all([
      saveCurrentCounts(newCounts),
      saveTotalCompleted(newTotal),
      saveStreakData(newStreak),
    ]);
  }, [streak, history]);

  const decrementPrayer = useCallback((key: keyof PrayerCounts) => {
    if (!currentCounts || currentCounts[key] <= 0) return;
    const newCounts = { ...currentCounts, [key]: currentCounts[key] - 1 };
    applyLog(newCounts, 1);
  }, [currentCounts, applyLog]);

  const incrementPrayer = useCallback((key: keyof PrayerCounts) => {
    if (!currentCounts || !initialCounts) return;
    if (currentCounts[key] >= initialCounts[key]) return;
    const newCounts = { ...currentCounts, [key]: currentCounts[key] + 1 };
    const prevTotal = totalCompletedRef.current;
    const newTotal = Math.max(0, prevTotal - 1);
    setCurrentCounts(newCounts);
    setTotalCompleted(newTotal);
    totalCompletedRef.current = newTotal;
    saveCurrentCounts(newCounts);
    saveTotalCompleted(newTotal);
  }, [currentCounts, initialCounts]);

  const logFullDay = useCallback(() => {
    if (!currentCounts) return;
    const keys = Object.keys(currentCounts) as (keyof PrayerCounts)[];
    const loggedCount = keys.filter(k => currentCounts[k] > 0).length;
    if (loggedCount === 0) return;
    const newCounts: PrayerCounts = { ...currentCounts };
    keys.forEach((k) => { if (newCounts[k] > 0) newCounts[k] -= 1; });
    applyLog(newCounts, loggedCount);
  }, [currentCounts, applyLog]);

  const resetProgress = useCallback(async () => {
    if (!initialCounts) return;
    const resetCounts = { ...initialCounts };
    setCurrentCounts(resetCounts);
    setTotalCompleted(0);
    totalCompletedRef.current = 0;
    await Promise.all([saveCurrentCounts(resetCounts), saveTotalCompleted(0)]);
  }, [initialCounts]);

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
    totalCompletedRef.current = 0;
  }, []);

  const dismissMilestone = useCallback(() => setPendingMilestone(null), []);

  return (
    <AppContext.Provider value={{
      isLoaded, onboardingDone, userProfile, initialCounts, currentCounts,
      totalCompleted, streak, history, setupDate, pendingMilestone,
      dismissMilestone, completeOnboarding, decrementPrayer,
      incrementPrayer, logFullDay, resetProgress, recalculate,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
