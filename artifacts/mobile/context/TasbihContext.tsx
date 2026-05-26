import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { TASBIH_PRESETS, getTodayDateString } from "@/utils/tasbih";

const STORAGE_KEY = "@qaza_tasbih";

interface TasbihState {
  todayDate: string;
  counts: Record<string, number>;
  allTime: Record<string, number>;
  customTargets: Record<string, number>;
}

const DEFAULT_STATE: TasbihState = {
  todayDate: getTodayDateString(),
  counts: {},
  allTime: {},
  customTargets: {},
};

interface TasbihContextValue {
  counts: Record<string, number>;
  allTime: Record<string, number>;
  customTargets: Record<string, number>;
  getTarget: (id: string) => number;
  increment: (id: string) => void;
  resetToday: (id: string) => void;
  setCustomTarget: (id: string, target: number) => void;
}

const TasbihContext = createContext<TasbihContextValue | null>(null);

export function TasbihProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TasbihState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: TasbihState = JSON.parse(raw);
        const today = getTodayDateString();
        if (saved.todayDate !== today) {
          setState({ ...saved, todayDate: today, counts: {} });
        } else {
          setState(saved);
        }
      }
    } catch (_) {}
    setLoaded(true);
  }

  async function save(next: TasbihState) {
    setState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (_) {}
  }

  function getTarget(id: string): number {
    if (state.customTargets[id] != null) return state.customTargets[id];
    return TASBIH_PRESETS.find((p) => p.id === id)?.defaultTarget ?? 100;
  }

  function increment(id: string) {
    const newCount = (state.counts[id] ?? 0) + 1;
    const newAllTime = (state.allTime[id] ?? 0) + 1;
    save({
      ...state,
      counts: { ...state.counts, [id]: newCount },
      allTime: { ...state.allTime, [id]: newAllTime },
    });
  }

  function resetToday(id: string) {
    save({
      ...state,
      counts: { ...state.counts, [id]: 0 },
    });
  }

  function setCustomTarget(id: string, target: number) {
    save({
      ...state,
      customTargets: { ...state.customTargets, [id]: target },
    });
  }

  if (!loaded) return null;

  return (
    <TasbihContext.Provider
      value={{
        counts: state.counts,
        allTime: state.allTime,
        customTargets: state.customTargets,
        getTarget,
        increment,
        resetToday,
        setCustomTarget,
      }}
    >
      {children}
    </TasbihContext.Provider>
  );
}

export function useTasbih() {
  const ctx = useContext(TasbihContext);
  if (!ctx) throw new Error("useTasbih must be used within TasbihProvider");
  return ctx;
}
