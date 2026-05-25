export interface Hadith {
  text: string;
  source: string;
}

export const HADITHS: Hadith[] = [
  {
    text: "Prayer is the pillar of religion. Whoever establishes it has established religion, and whoever abandons it has destroyed religion.",
    source: "Bayhaqi",
  },
  {
    text: "The first thing the servant will be held accountable for on the Day of Resurrection is the prayer. If it is sound, the rest of his deeds will be sound. If it is corrupt, the rest of his deeds will be corrupt.",
    source: "At-Tabarani",
  },
  {
    text: "Between a man and disbelief and paganism is the abandonment of prayer.",
    source: "Sahih Muslim",
  },
  {
    text: "Whoever misses the Asr prayer, it is as if he lost his family and property.",
    source: "Sahih Bukhari",
  },
  {
    text: "The most beloved deed to Allah is the prayer performed on time.",
    source: "Sahih Bukhari",
  },
  {
    text: "Pray as you have seen me praying.",
    source: "Sahih Bukhari",
  },
  {
    text: "When one of you stands to pray, he stands before Allah. Let him consider how he addresses Him.",
    source: "Al-Bayhaqi",
  },
  {
    text: "Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.",
    source: "Quran 29:45",
  },
  {
    text: "Make use of five before five: your youth before your old age, your health before your sickness, your richness before your poverty, your free time before your busyness, and your life before your death.",
    source: "Al-Hakim",
  },
  {
    text: "Whoever offers the Fajr prayer, he is under the protection of Allah.",
    source: "Sahih Muslim",
  },
  {
    text: "The coolness of my eyes has been placed in prayer.",
    source: "An-Nasai",
  },
  {
    text: "Verily, the prayer keeps one from the great sins and evil deeds.",
    source: "Quran 29:45",
  },
  {
    text: "Guard the prayers and the middle prayer and stand before Allah, devoutly obedient.",
    source: "Quran 2:238",
  },
  {
    text: "Whoever is negligent about prayer, Allah will punish him fifteen punishments — six in this life, three at death, three in the grave, and three on the Day of Judgment.",
    source: "Ibn Qayyim",
  },
  {
    text: "When you complete your qadha prayers, make an intention of completing the qadha and not performing nafl, so it is counted as obligatory.",
    source: "Fiqh Guidance",
  },
];

export function getRandomHadith(): Hadith {
  return HADITHS[Math.floor(Math.random() * HADITHS.length)];
}

export function getDailyHadith(): Hadith {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
  );
  return HADITHS[dayOfYear % HADITHS.length];
}
