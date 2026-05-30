---
name: Hijri calendar utils
description: What's exported from hijri.ts and how to extend it
---

`artifacts/mobile/utils/hijri.ts` exports:
- `toHijri(date?)` — Gregorian → HijriDate
- `fromHijri(year, month, day)` — HijriDate → JS Date (used by calendar screen to get weekday of 1st)
- `hijriDaysInMonth(year, month)` — returns 29 or 30 (odd months = 30, even = 29, Dhul Hijjah leap = 30)
- `getEventsForDay(month, day)` — returns all IslamicEvent[] for that Hijri day
- `getEventsForMonth(month)` — returns all events in the month, sorted by day
- `getSpecialNights(h)` — returns first notable event string for header chip; entire Ramadan month shows "🌙 Ramadan al-Mubarak" even on days without specific events
- `ISLAMIC_EVENTS` — 41 events covering all 12 Hijri months (Muharram thru Dhul Hijjah)
- `EVENT_COLORS`, `EVENT_LABELS` — keyed by EventType: celebration|martyr|birthday|wafat|special|fast
- `HIJRI_MONTHS_EN`, `HIJRI_MONTHS_AR`, `HIJRI_MONTHS_UR` — month name arrays (exported for calendar screen)

**Why:** The Islamic Calendar tab (calendar.tsx) needs fromHijri to compute weekday of month start, and needs event data to render colored dots on calendar days.

**How to apply:** When adding new Islamic events, add to the ISLAMIC_EVENTS array in hijri.ts. The calendar screen and tracker header chip auto-update.
