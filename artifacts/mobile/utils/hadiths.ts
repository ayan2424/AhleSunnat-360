export interface Hadith {
  text: string;
  source: string;
  arabic?: string;
}

export const HADITHS: Hadith[] = [
  {
    arabic: "الصَّلَاةُ عِمَادُ الدِّينِ",
    text: "Prayer is the pillar of religion. Whoever establishes it has established religion, and whoever abandons it has destroyed religion.",
    source: "Bayhaqi",
  },
  {
    arabic: "أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ الصَّلَاةُ",
    text: "The first thing the servant will be held accountable for on the Day of Resurrection is the prayer. If it is sound, the rest of his deeds will be sound.",
    source: "At-Tabarani",
  },
  {
    arabic: "بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكُ الصَّلَاةِ",
    text: "Between a man and disbelief and paganism is the abandonment of prayer.",
    source: "Sahih Muslim",
  },
  {
    arabic: "مَنْ فَاتَتْهُ صَلَاةُ الْعَصْرِ فَكَأَنَّمَا وُتِرَ أَهْلَهُ وَمَالَهُ",
    text: "Whoever misses the Asr prayer, it is as if he lost his family and property.",
    source: "Sahih Bukhari",
  },
  {
    arabic: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ الصَّلَاةُ لِوَقْتِهَا",
    text: "The most beloved deed to Allah is the prayer performed on time.",
    source: "Sahih Bukhari",
  },
  {
    arabic: "صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي",
    text: "Pray as you have seen me praying.",
    source: "Sahih Bukhari",
  },
  {
    arabic: "إِنَّ الصَّلَاةَ تَنْهَى عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
    text: "Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.",
    source: "Quran 29:45",
  },
  {
    arabic: "اغْتَنِمْ خَمْسًا قَبْلَ خَمْسٍ",
    text: "Make use of five before five: your youth before your old age, your health before your sickness, your richness before your poverty, your free time before your busyness, and your life before your death.",
    source: "Al-Hakim",
  },
  {
    arabic: "مَنْ صَلَّى الصُّبْحَ فَهُوَ فِي ذِمَّةِ اللَّهِ",
    text: "Whoever offers the Fajr prayer, he is under the protection of Allah.",
    source: "Sahih Muslim",
  },
  {
    arabic: "جُعِلَتْ قُرَّةُ عَيْنِي فِي الصَّلَاةِ",
    text: "The coolness of my eyes has been placed in prayer.",
    source: "An-Nasai",
  },
  {
    arabic: "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَى",
    text: "Guard the prayers and the middle prayer and stand before Allah, devoutly obedient.",
    source: "Quran 2:238",
  },
  {
    arabic: "إِنَّ الصَّلَاةَ تَنْهَى عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
    text: "Verily, the prayer keeps one from the great sins and evil deeds.",
    source: "Quran 29:45",
  },
  {
    arabic: "مَنْ تَرَكَ الصَّلَاةَ مُتَعَمِّدًا",
    text: "When you complete your qadha prayers, make the intention of completing the qadha obligation — so it is counted as obligatory, not nafl.",
    source: "Fiqh Guidance",
  },
  {
    arabic: "إِذَا قَامَ أَحَدُكُمْ إِلَى الصَّلَاةِ فَلْيُقْبِلْ عَلَيْهَا",
    text: "When one of you stands to pray, he stands before Allah. Let him consider how he addresses Him.",
    source: "Al-Bayhaqi",
  },
  {
    arabic: "الْقَضَاءُ أَوْلَى مِنَ النَّافِلَةِ",
    text: "Making up missed (qadha) prayers takes priority over voluntary (nafl) prayers — begin with what is obligatory.",
    source: "Fiqh Principle",
  },
];

export function getDailyHadith(): Hadith {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return HADITHS[dayOfYear % HADITHS.length];
}
