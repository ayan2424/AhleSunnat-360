export interface Milestone {
  value: number;
  title: string;
  message: string;
  emoji: string;
  color: string;
}

export const MILESTONES: Milestone[] = [
  { value: 1, title: "First Step", message: "You've completed your very first Qaza prayer. Every journey begins with a single step.", emoji: "🌱", color: "#52B788" },
  { value: 10, title: "Ten Down", message: "10 prayers completed! Your dedication is already showing. Keep going.", emoji: "✨", color: "#52B788" },
  { value: 50, title: "Halfway Milestone", message: "50 prayers completed! You are building a beautiful habit of seeking closeness to Allah.", emoji: "⭐", color: "#C8A84B" },
  { value: 100, title: "Century Completed", message: "100 prayers done! Masha'Allah — your perseverance is an act of worship in itself.", emoji: "💫", color: "#C8A84B" },
  { value: 250, title: "Quarter Thousand", message: "250 prayers! Your steadfastness is remarkable. Allah sees every effort you make.", emoji: "🌟", color: "#E8A838" },
  { value: 500, title: "Five Hundred", message: "500 prayers completed! Subhan'Allah — what an achievement of patience and faith.", emoji: "🔥", color: "#E8A838" },
  { value: 1000, title: "One Thousand", message: "1,000 prayers! This is extraordinary dedication. May Allah reward you abundantly.", emoji: "🏆", color: "#D4AF37" },
  { value: 2500, title: "Remarkable Journey", message: "2,500 prayers completed. Your commitment to making up for lost time is truly inspiring.", emoji: "👑", color: "#D4AF37" },
  { value: 5000, title: "Five Thousand", message: "5,000 prayers! This is a monumental achievement. May Allah accept every single one.", emoji: "🌙", color: "#B0586B" },
  { value: 10000, title: "Ten Thousand", message: "10,000 prayers completed! You are an inspiration. May Allah grant you Jannatul Firdaus.", emoji: "🕌", color: "#7B5EA7" },
];

export function getNewMilestones(previousTotal: number, newTotal: number): Milestone[] {
  return MILESTONES.filter(m => m.value > previousTotal && m.value <= newTotal);
}

export function getNextMilestone(total: number): Milestone | null {
  return MILESTONES.find(m => m.value > total) ?? null;
}

export function getPreviousMilestone(total: number): Milestone | null {
  const passed = MILESTONES.filter(m => m.value <= total);
  return passed[passed.length - 1] ?? null;
}
