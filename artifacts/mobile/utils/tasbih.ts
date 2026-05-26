export interface TasbihPreset {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  defaultTarget: number;
  color: string;
  virtue: string;
}

export const TASBIH_PRESETS: TasbihPreset[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ اللّٰهِ",
    transliteration: "SubhanAllah",
    meaning: "Glory be to Allah",
    defaultTarget: 33,
    color: "#4ECDC4",
    virtue: "Recited 33 times after each Salah. Fills the scale of good deeds.",
  },
  {
    id: "alhamdulillah",
    arabic: "اَلْحَمْدُ لِلّٰهِ",
    transliteration: "Alhamdulillah",
    meaning: "All praise is due to Allah",
    defaultTarget: 33,
    color: "#E8A838",
    virtue: "Recited 33 times after each Salah. 'Alhamdulillah fills the scales.' — Sahih Muslim",
  },
  {
    id: "allahuakbar",
    arabic: "اَللّٰهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    meaning: "Allah is the Greatest",
    defaultTarget: 34,
    color: "#E07B39",
    virtue: "Recited 34 times after each Salah — completing 100 with SubhanAllah & Alhamdulillah.",
  },
  {
    id: "lailaha",
    arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ",
    transliteration: "La ilaha illAllah",
    meaning: "There is no god but Allah",
    defaultTarget: 100,
    color: "#5B6F9E",
    virtue: "The best of dhikr. Whoever says it sincerely, Paradise is guaranteed. — Tirmidhi",
  },
  {
    id: "durood",
    arabic: "اَللّٰهُمَّ صَلِّ عَلٰی سَيِّدِنَا مُحَمَّدٍ",
    transliteration: "Allahumma Salli 'ala Sayyidina Muhammad ﷺ",
    meaning: "O Allah, send blessings upon our Master Muhammad ﷺ",
    defaultTarget: 100,
    color: "#7BA7BC",
    virtue: "Whoever sends Salawat on the Prophet ﷺ once, Allah sends 10 upon him. — Sahih Muslim",
  },
  {
    id: "astaghfirullah",
    arabic: "أَسْتَغْفِرُ اللّٰهَ الْعَظِيمَ",
    transliteration: "Astaghfirullah al-'Azeem",
    meaning: "I seek forgiveness from Allah, the Almighty",
    defaultTarget: 100,
    color: "#B0586B",
    virtue: "Whoever seeks forgiveness often, Allah will give him relief from every worry and a way out from every difficulty. — Abu Dawood",
  },
  {
    id: "durood_taj",
    arabic: "اَللّٰهُمَّ صَلِّ عَلٰى سَيِّدِنَا مُحَمَّدٍ ۨصَاحِبِ التَّاجِ",
    transliteration: "Durood-e-Taj",
    meaning: "Salawat upon the Crown of Prophets ﷺ",
    defaultTarget: 11,
    color: "#7B5EA7",
    virtue: "A beloved Salawat among Barelvi & Sufi traditions — read 11 times for barakah.",
  },
  {
    id: "hasbunallah",
    arabic: "حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "HasbunAllahu wa Ni'mal Wakeel",
    meaning: "Allah is sufficient for us and He is the best Guardian",
    defaultTarget: 100,
    color: "#4A7C59",
    virtue: "The words of Prophet Ibrahim ﷺ and Prophet Muhammad ﷺ in times of hardship. — Quran 3:173",
  },
];

export interface TasbihDayData {
  date: string;
  counts: Record<string, number>;
}

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}
