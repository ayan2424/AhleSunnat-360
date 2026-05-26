const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul Qa'dah", "Dhul Hijjah",
];

const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthNameEn: string;
  monthNameAr: string;
}

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

  const monthIdx = month - 1;
  return {
    day,
    month,
    year,
    monthNameEn: HIJRI_MONTHS_EN[monthIdx] ?? "",
    monthNameAr: HIJRI_MONTHS_AR[monthIdx] ?? "",
  };
}

export function formatHijri(h: HijriDate, arabic = false): string {
  if (arabic) {
    return `${h.day} ${h.monthNameAr} ${h.year} هـ`;
  }
  return `${h.day} ${h.monthNameEn} ${h.year} AH`;
}

export function getSpecialNights(h: HijriDate): string | null {
  if (h.month === 9) return "Ramadan 🌙";
  if (h.month === 9 && h.day >= 21 && h.day % 2 !== 0) return "Laylat al-Qadr ✨";
  if (h.month === 7 && h.day === 27) return "Laylat al-Mi'raj 🕌";
  if (h.month === 8 && h.day === 15) return "Shab-e-Barat 🌟";
  if (h.month === 3 && h.day === 12) return "Eid Milad-un-Nabi ﷺ 💚";
  if (h.month === 10 && h.day === 1) return "Eid ul-Fitr 🎉";
  if (h.month === 12 && h.day === 10) return "Eid ul-Adha 🌹";
  if (h.month === 1 && h.day === 10) return "Youm-e-Ashura 🕌";
  return null;
}
