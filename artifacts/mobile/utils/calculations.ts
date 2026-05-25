export interface UserProfile {
  gender: "male" | "female";
  pubertyAge: number;
  currentAge: number;
  mensDaysPerMonth: number;
}

export interface PrayerCounts {
  fajar: number;
  zohar: number;
  asar: number;
  maghrib: number;
  isha: number;
  witr: number;
}

export interface PrayerInfo {
  key: keyof PrayerCounts;
  name: string;
  arabicName: string;
  rakaat: number;
  type: string;
  color: string;
  timeLabel: string;
}

export const PRAYERS: PrayerInfo[] = [
  {
    key: "fajar",
    name: "Fajr",
    arabicName: "فجر",
    rakaat: 2,
    type: "Farz",
    color: "#7BA7BC",
    timeLabel: "Dawn",
  },
  {
    key: "zohar",
    name: "Dhuhr",
    arabicName: "ظہر",
    rakaat: 4,
    type: "Farz",
    color: "#E8A838",
    timeLabel: "Noon",
  },
  {
    key: "asar",
    name: "Asr",
    arabicName: "عصر",
    rakaat: 4,
    type: "Farz",
    color: "#E07B39",
    timeLabel: "Afternoon",
  },
  {
    key: "maghrib",
    name: "Maghrib",
    arabicName: "مغرب",
    rakaat: 3,
    type: "Farz",
    color: "#B0586B",
    timeLabel: "Sunset",
  },
  {
    key: "isha",
    name: "Isha",
    arabicName: "عشاء",
    rakaat: 4,
    type: "Farz",
    color: "#5B6F9E",
    timeLabel: "Night",
  },
  {
    key: "witr",
    name: "Witr",
    arabicName: "وتر",
    rakaat: 3,
    type: "Wajib",
    color: "#7B5EA7",
    timeLabel: "Night",
  },
];

export function calculateQazaCounts(profile: UserProfile): PrayerCounts {
  const lapsedYears = Math.max(0, profile.currentAge - profile.pubertyAge);
  const totalDays = Math.round(lapsedYears * 365.25);

  let effectiveDays = totalDays;
  if (profile.gender === "female") {
    const mensDaysPerYear = profile.mensDaysPerMonth * 12;
    const totalMensDays = Math.round(mensDaysPerYear * lapsedYears);
    effectiveDays = Math.max(0, totalDays - totalMensDays);
  }

  return {
    fajar: effectiveDays,
    zohar: effectiveDays,
    asar: effectiveDays,
    maghrib: effectiveDays,
    isha: effectiveDays,
    witr: effectiveDays,
  };
}

export function getTotalRemaining(counts: PrayerCounts): number {
  return Object.values(counts).reduce((sum, v) => sum + v, 0);
}

export function getCompletionPercent(
  initial: PrayerCounts,
  current: PrayerCounts
): number {
  const totalInitial = getTotalRemaining(initial);
  if (totalInitial === 0) return 100;
  const totalCurrent = getTotalRemaining(current);
  const completed = totalInitial - totalCurrent;
  return Math.min(100, Math.max(0, (completed / totalInitial) * 100));
}

export function getPrayerCompletionPercent(
  initialCount: number,
  currentCount: number
): number {
  if (initialCount === 0) return 100;
  const completed = initialCount - currentCount;
  return Math.min(100, Math.max(0, (completed / initialCount) * 100));
}
