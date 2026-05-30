export const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Ula", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul Qa'dah", "Dhul Hijjah",
];

export const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];

export const HIJRI_MONTHS_UR = [
  "محرم", "صفر", "ربیع الاول", "ربیع الثانی",
  "جمادی الاول", "جمادی الثانی", "رجب", "شعبان",
  "رمضان", "شوال", "ذوالقعدہ", "ذوالحجہ",
];

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthNameEn: string;
  monthNameAr: string;
  monthNameUr: string;
}

export type EventType = "celebration" | "martyr" | "birthday" | "wafat" | "special" | "fast";

export interface IslamicEvent {
  month: number;
  day: number;
  title: string;
  titleUr: string;
  type: EventType;
  description?: string;
  emoji: string;
}

export const EVENT_COLORS: Record<EventType, string> = {
  celebration: "#27AE60",
  martyr:      "#C0392B",
  birthday:    "#D4A017",
  wafat:       "#8E44AD",
  special:     "#2980B9",
  fast:        "#16A085",
};

export const EVENT_LABELS: Record<EventType, string> = {
  celebration: "Celebration",
  martyr:      "Shahadat",
  birthday:    "Wiladat",
  wafat:       "Wafat / Urs",
  special:     "Special",
  fast:        "Recommended Fast",
};

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  // ── Muharram (Month 1) ─────────────────────────────────────────────────────
  { month: 1,  day: 1,  title: "Islamic New Year",                       titleUr: "اسلامی نیا سال",               type: "special",     emoji: "🌙", description: "First day of the Hijri calendar — new beginnings under Allah's mercy" },
  { month: 1,  day: 9,  title: "Tasu'a — Recommended Fast",              titleUr: "تاسوعہ",                       type: "fast",        emoji: "🤲", description: "9th Muharram — sunnah to fast this day before Ashura" },
  { month: 1,  day: 10, title: "Youm-e-Ashura",                          titleUr: "یوم عاشورہ",                   type: "martyr",      emoji: "🕌", description: "Shahadat Imam Husayn AS & companions at Karbala. Also: Hazrat Musa AS freed from Pharaoh on this day" },
  { month: 1,  day: 25, title: "Wafat Imam Zayn al-Abidin AS",           titleUr: "وفات امام زین العابدین ؑ",    type: "wafat",       emoji: "🌹", description: "4th Imam — Ali ibn Husayn AS, known for ceaseless worship and his book of supplications, Al-Sahifa al-Sajjadiyya" },

  // ── Safar (Month 2) ────────────────────────────────────────────────────────
  { month: 2,  day: 7,  title: "Wafat Imam Hasan al-Mujtaba AS",         titleUr: "وفات امام حسن مجتبیٰ ؑ",     type: "wafat",       emoji: "🌹", description: "2nd Imam and grandson of Prophet ﷺ — the Sayyid of Youth of Paradise (one narration; also 28 Safar)" },
  { month: 2,  day: 20, title: "Arbaeen — 40 Days After Ashura",         titleUr: "اربعین",                       type: "special",     emoji: "🕊️", description: "40th day after the martyrdom of Imam Husayn AS at Karbala — the largest annual peaceful gathering in the world" },
  { month: 2,  day: 28, title: "Wafat Imam Hasan al-Mujtaba AS",         titleUr: "وفات امام حسن مجتبیٰ ؑ",     type: "wafat",       emoji: "🌹", description: "2nd Imam — alternate narration. Grandson of Prophet ﷺ, poisoned after a peace treaty with Muawiyah" },
  { month: 2,  day: 29, title: "Urs Hazrat Data Ganj Bakhsh RA",         titleUr: "عرس حضرت داتا گنج بخشؒ",     type: "wafat",       emoji: "🌟", description: "Hazrat Ali Hujwiri RA — great Sufi saint buried in Lahore, author of Kashf al-Mahjub (the first Persian Sufi treatise)" },

  // ── Rabi al-Awwal (Month 3) ────────────────────────────────────────────────
  { month: 3,  day: 12, title: "Eid Milad-un-Nabi ﷺ",                   titleUr: "عید میلاد النبی ﷺ",           type: "celebration", emoji: "💚", description: "Wiladat of the most beloved — Hazrat Muhammad Mustafa ﷺ. The greatest day for Muslims worldwide. Also: Wafat Rasulullah ﷺ" },

  // ── Rabi al-Thani (Month 4) ────────────────────────────────────────────────
  { month: 4,  day: 11, title: "Gyarwein Sharif — Urs Ghous-ul-Azam",   titleUr: "گیارہویں شریف",               type: "wafat",       emoji: "🌹", description: "Wafat of Sheikh Abdul Qadir Jilani RA — Sultan of Saints, founder of the Qadiriyya order, born Baghdad 470 AH" },

  // ── Jumada al-Ula (Month 5) ────────────────────────────────────────────────
  { month: 5,  day: 13, title: "Wafat Hazrat Fatima al-Zahra SA",        titleUr: "وفات حضرت فاطمہ الزہرا ؑ",   type: "wafat",       emoji: "🌹", description: "Daughter of Prophet ﷺ, wife of Hazrat Ali AS — one narration. Called the 'Chief of Women of Paradise'" },

  // ── Jumada al-Thani (Month 6) ──────────────────────────────────────────────
  { month: 6,  day: 3,  title: "Wafat Hazrat Fatima al-Zahra SA",        titleUr: "وفات حضرت فاطمہ الزہرا ؑ",   type: "wafat",       emoji: "🌹", description: "Alternate narration for the passing of Sayyidah Fatima al-Zahra SA. Mother of Imam Hasan and Imam Husayn" },
  { month: 6,  day: 20, title: "Wiladat Hazrat Fatima al-Zahra SA",      titleUr: "ولادت حضرت فاطمہ الزہرا ؑ",  type: "birthday",    emoji: "💐", description: "Birth of Sayyidah Fatima al-Zahra SA in Makkah — the Noor of the Prophet's ﷺ eye" },
  { month: 6,  day: 22, title: "Wafat Hazrat Abu Bakr Siddiq RA",        titleUr: "وفات حضرت ابو بکر صدیقؓ",    type: "wafat",       emoji: "🌙", description: "1st Khalifa of Islam — the closest companion and father-in-law of Prophet ﷺ, called 'Al-Siddiq' (The Truthful)" },

  // ── Rajab (Month 7) ────────────────────────────────────────────────────────
  { month: 7,  day: 1,  title: "Start of Sacred Month Rajab",            titleUr: "ماہ رجب کا آغاز",             type: "special",     emoji: "🌙", description: "One of the four sacred months. Sunnah: 'O Allah, bless us in Rajab and Sha'ban and let us reach Ramadan' — Hadith" },
  { month: 7,  day: 13, title: "Wiladat Hazrat Ali ibn Abi Talib AS",    titleUr: "ولادت حضرت علی ابن ابی طالبؓ", type: "birthday",   emoji: "🕌", description: "Born inside the Ka'bah — cousin and son-in-law of Prophet ﷺ, 4th Khalifa, 1st Imam, Asad-ullah al-Ghalib (Lion of Allah)" },
  { month: 7,  day: 27, title: "Shab-e-Mi'raj (Laylat al-Mi'raj)",       titleUr: "شب معراج",                    type: "special",     emoji: "✨", description: "The miraculous Night Journey — Prophet ﷺ traveled from Makkah to Jerusalem and then ascended through the seven heavens to meet Allah" },

  // ── Sha'ban (Month 8) ──────────────────────────────────────────────────────
  { month: 8,  day: 3,  title: "Wiladat Imam Husayn ibn Ali AS",         titleUr: "ولادت امام حسین ابن علیؓ",   type: "birthday",    emoji: "💚", description: "Sayyid-us-Shuhadah — grandson of Prophet ﷺ. The Prophet said: 'Husayn is from me and I am from Husayn'" },
  { month: 8,  day: 4,  title: "Wiladat Hazrat Abbas ibn Ali AS",        titleUr: "ولادت حضرت عباس ابن علیؓ",  type: "birthday",    emoji: "💐", description: "Alamdar of Karbala — brother of Imam Husayn AS, known as Qamar-e-Bani Hashim (Moon of Banu Hashim)" },
  { month: 8,  day: 5,  title: "Wiladat Imam Zayn al-Abidin AS",         titleUr: "ولادت امام زین العابدین ؑ",  type: "birthday",    emoji: "💐", description: "4th Imam — born in Sha'ban, survived Karbala, compiled the famous Du'a al-Jawshan and Sahifa al-Sajjadiyya" },
  { month: 8,  day: 15, title: "Shab-e-Barat (Laylat al-Bara'ah)",       titleUr: "شب برات",                    type: "special",     emoji: "🌟", description: "Night of Forgiveness — Allah's mercy descends, destinies are recorded for the coming year. Night of intensive ibadah, fasting next day recommended" },

  // ── Ramadan (Month 9) ──────────────────────────────────────────────────────
  { month: 9,  day: 1,  title: "Start of Ramadan al-Mubarak",            titleUr: "رمضان المبارک کا آغاز",      type: "celebration", emoji: "🌙", description: "The blessed month of fasting, Quran, Tarawih, and intensified worship. The month in which the Quran was revealed" },
  { month: 9,  day: 10, title: "Wafat Hazrat Khadijah al-Kubra RA",      titleUr: "وفات حضرت خدیجہ الکبریٰؓ",  type: "wafat",       emoji: "🌹", description: "First wife and first Muslim — the Prophet ﷺ called the year she died the 'Year of Sadness'. She gave everything for Islam" },
  { month: 9,  day: 15, title: "Wiladat Imam Hasan al-Mujtaba AS",       titleUr: "ولادت امام حسن مجتبیٰ ؑ",   type: "birthday",    emoji: "💚", description: "2nd Imam — grandson of Prophet ﷺ, the Sayyid of Youth of Paradise, born in Ramadan of the 3rd year AH" },
  { month: 9,  day: 17, title: "Ghazwa Badr — Victory of Islam",         titleUr: "غزوہ بدر",                   type: "celebration", emoji: "⚔️", description: "First major battle of Islam — 313 Muslims under Prophet ﷺ defeated 1000+ Quraysh. Called 'Yaum al-Furqan' (Day of Criterion)" },
  { month: 9,  day: 21, title: "Shahadat Hazrat Ali AS + Laylat al-Qadr", titleUr: "شہادت حضرت علیؓ + شب قدر", type: "martyr",      emoji: "🕌", description: "4th Khalifa martyred in the mosque of Kufa, struck on 19th, passed on 21st. This is also one of the blessed Laylat al-Qadr nights" },
  { month: 9,  day: 23, title: "Laylat al-Qadr — 23rd Ramadan",          titleUr: "شب قدر — ۲۳ رمضان",         type: "special",     emoji: "✨", description: "One of the odd nights of the last 10 — seek Laylat al-Qadr, better than 1000 months of worship" },
  { month: 9,  day: 25, title: "Laylat al-Qadr — 25th Ramadan",          titleUr: "شب قدر — ۲۵ رمضان",         type: "special",     emoji: "✨", description: "One of the odd nights of the last 10 — angels descend and peace prevails until dawn" },
  { month: 9,  day: 27, title: "Shab-e-Qadr — 27th Ramadan",             titleUr: "شب قدر — ۲۷ رمضان",         type: "special",     emoji: "✨", description: "Most widely observed Laylat al-Qadr night — Night of Power, better than 1000 months. Grand night of worship across the world" },

  // ── Shawwal (Month 10) ─────────────────────────────────────────────────────
  { month: 10, day: 1,  title: "Eid ul-Fitr",                            titleUr: "عید الفطر",                   type: "celebration", emoji: "🎉", description: "Festival of Breaking the Fast — Zakat al-Fitr must be given before Eid prayer. Day of joy, family, and gratitude to Allah" },
  { month: 10, day: 15, title: "Ghazwa Uhud",                            titleUr: "غزوہ احد",                   type: "special",     emoji: "⚔️", description: "Battle of Uhud — great test for the Muslims. Hazrat Hamza RA (Sayyid-ush-Shuhadah) achieved martyrdom on this day" },
  { month: 10, day: 25, title: "Wafat Imam Jafar al-Sadiq AS",           titleUr: "وفات امام جعفر صادقؓ",      type: "wafat",       emoji: "🌹", description: "6th Imam — master scholar whose students included Imam Abu Hanifa RA and Imam Malik RA. Source of vast Islamic knowledge" },

  // ── Dhul Qa'dah (Month 11) ─────────────────────────────────────────────────
  { month: 11, day: 11, title: "Wiladat Imam Ali al-Ridha AS",           titleUr: "ولادت امام علی الرضاؓ",     type: "birthday",    emoji: "💐", description: "8th Imam — known for his great knowledge and forbearance. Buried in Mashhad, Iran (Shrine of Imam Ridha)" },

  // ── Dhul Hijjah (Month 12) ─────────────────────────────────────────────────
  { month: 12, day: 8,  title: "Yawm al-Tarwiyah — Hajj Day 1",         titleUr: "یوم الترویہ",                type: "special",     emoji: "🕌", description: "Pilgrims depart from Makkah to Mina — the first of the main Hajj days. Pilgrims offer Dhuhr, Asr, Maghrib, Isha, Fajr at Mina" },
  { month: 12, day: 9,  title: "Youm-e-Arafah — Day of Arafah",         titleUr: "یوم عرفہ",                  type: "fast",        emoji: "🤲", description: "Greatest day of the year — pilgrims stand at the Plain of Arafah. Non-Hajis: fasting on this day expiates sins of 2 years" },
  { month: 12, day: 10, title: "Eid ul-Adha — Day of Qurbani",          titleUr: "عید الاضحیٰ",               type: "celebration", emoji: "🐑", description: "Festival of Sacrifice — commemorating Hazrat Ibrahim AS's submission to Allah. Qurbani (animal sacrifice) is Wajib on this day" },
  { month: 12, day: 11, title: "Ayyam al-Tashreeq — Day 2",             titleUr: "ایام تشریق (دوسرا دن)",     type: "celebration", emoji: "🎊", description: "Days of Hajj — stoning the Jamarat in Mina. Qurbani valid until sunset of 13th Dhul Hijjah. Days of eating, drinking, and remembering Allah" },
  { month: 12, day: 12, title: "Ayyam al-Tashreeq — Day 3",             titleUr: "ایام تشریق (تیسرا دن)",     type: "celebration", emoji: "🎊", description: "Continued Hajj rites — some pilgrims may leave Mina (Nafar Awwal) after stoning on this day" },
  { month: 12, day: 13, title: "Ayyam al-Tashreeq — Last Day",          titleUr: "ایام تشریق (آخری دن)",      type: "celebration", emoji: "🎊", description: "Final day of Hajj activities — all pilgrims must stone the Jamarat and leave Mina before sunset" },
  { month: 12, day: 18, title: "Shahadat Hazrat Uthman RA",             titleUr: "شہادت حضرت عثمانؓ",         type: "martyr",      emoji: "🕌", description: "3rd Khalifa Hazrat Uthman ibn Affan RA was martyred on 18 Dhul Hijjah 35 AH. Compiler of the Quran, possessor of two lights (Dhun-Nurayn). His Shahadat is a day of grief for Ahl al-Sunna." },
  { month: 12, day: 24, title: "Shahadat Hazrat Umar ibn al-Khattab RA", titleUr: "شہادت حضرت عمر فاروقؓ",  type: "martyr",      emoji: "🕌", description: "2nd Khalifa — Al-Farouq (one who distinguishes right from wrong), martyred while leading Fajr prayer in Masjid al-Nabawi" },
];

export function toHijri(date: Date = new Date()): HijriDate {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const jd =
    Math.trunc((1461 * (y + 4800 + Math.trunc((m - 14) / 12))) / 4) +
    Math.trunc((367 * (m - 2 - 12 * Math.trunc((m - 14) / 12))) / 12) -
    Math.trunc((3 * Math.trunc((y + 4900 + Math.trunc((m - 14) / 12)) / 100)) / 4) +
    d - 32075;

  let l = jd - 1948440 + 10632;
  const n = Math.trunc((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.trunc((10985 - l) / 5316) * Math.trunc((50 * l) / 17719) +
    Math.trunc(l / 5670) * Math.trunc((43 * l) / 15238);
  l =
    l -
    Math.trunc((30 - j) / 15) * Math.trunc((17719 * j) / 50) -
    Math.trunc(j / 16) * Math.trunc((15238 * j) / 43) +
    29;
  const month = Math.trunc((24 * l) / 709);
  const day = l - Math.trunc((709 * month) / 24);
  const year = 30 * n + j - 30;

  const idx = month - 1;
  return {
    day,
    month,
    year,
    monthNameEn: HIJRI_MONTHS_EN[idx] ?? "",
    monthNameAr: HIJRI_MONTHS_AR[idx] ?? "",
    monthNameUr: HIJRI_MONTHS_UR[idx] ?? "",
  };
}

export function fromHijri(year: number, month: number, day: number): Date {
  const jd =
    Math.floor((11 * year + 3) / 30) +
    354 * year +
    30 * month -
    Math.floor((month - 1) / 2) +
    day +
    1948440 -
    385;

  let l = jd + 68569;
  const n = Math.floor((4 * l) / 146097);
  l = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l + 1)) / 1461001);
  l = l - Math.floor((1461 * i) / 4) + 31;
  const jj = Math.floor((80 * l) / 2447);
  const gDay = l - Math.floor((2447 * jj) / 80);
  l = Math.floor(jj / 11);
  const gMonth = jj + 2 - 12 * l;
  const gYear = 100 * (n - 49) + i + l;

  return new Date(gYear, gMonth - 1, gDay);
}

export function hijriDaysInMonth(year: number, month: number): number {
  if (month % 2 === 1) return 30;
  if (month === 12 && (11 * year + 14) % 30 < 11) return 30;
  return 29;
}

export function formatHijri(h: HijriDate, arabic = false): string {
  if (arabic) {
    return `${h.day} ${h.monthNameAr} ${h.year} هـ`;
  }
  return `${h.day} ${h.monthNameEn} ${h.year} AH`;
}

export function getEventsForDay(month: number, day: number): IslamicEvent[] {
  return ISLAMIC_EVENTS.filter(e => e.month === month && e.day === day);
}

export function getEventsForMonth(month: number): IslamicEvent[] {
  return ISLAMIC_EVENTS.filter(e => e.month === month).sort((a, b) => a.day - b.day);
}

const EVENT_PRIORITY: EventType[] = ["celebration", "special", "birthday", "fast", "wafat", "martyr"];

export function getSpecialNights(h: HijriDate): string | null {
  const events = getEventsForDay(h.month, h.day);

  // Entire Ramadan month shows banner even if no specific event today
  if (h.month === 9 && events.length === 0) return "🌙 Ramadan al-Mubarak";

  if (events.length === 0) return null;

  for (const type of EVENT_PRIORITY) {
    const match = events.find(e => e.type === type);
    if (match) return `${match.emoji} ${match.title}`;
  }
  return `${events[0].emoji} ${events[0].title}`;
}
