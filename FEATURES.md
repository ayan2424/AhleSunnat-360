# AhleSunnat-360 (Qaza Namaz Tracker) — Features, Functionality & Workflows

## Overview
AhleSunnat-360 is a mobile-first Qaza Namaz Tracker that helps users calculate missed prayers (Qaza-e-Umri) and track progress toward completion. It includes a daily tracker, spiritual content, tasbih counters, duas, an Islamic calendar, and detailed progress analytics. All user data is stored locally on the device.

## Core Features & Functionality

### 1) Onboarding & Qaza Calculation
- Guided onboarding flow: welcome → gender → age of puberty → current age → menstruation days (female) → summary.
- Calculates total missed prayers using age range and (for females) menstruation day deductions.
- Shows summary totals: years of Qaza, total days, menstruation days deducted, and final prayer days to make up.
- Stores user profile and initial counts locally.

### 2) Daily Tracker (Qaza Logging)
- Daily dashboard with Hijri date and special night highlights.
- Overall progress ring, total completed/remaining counts, and best streak stats.
- Prayer-by-prayer cards for Fajr, Dhuhr, Asr, Maghrib, Isha, Witr.
- One-tap logging for each prayer and undo support.
- Quick “Log Full Day” action to record one Qaza for all six prayers.
- Milestone celebrations (modal) for significant completion totals.
- Hadith carousel for daily spiritual reminders.

### 3) Tasbih Counter
- Preset dhikr list with Arabic, transliteration, meaning, and virtue.
- Tap-to-count experience with haptics and animated feedback.
- Daily target tracking and completion state.
- Custom target editing per dhikr.
- Daily counters reset automatically each day; all-time counts persist.

### 4) Duas & Azkar Library
- Categorized dua library: Morning, Evening, After Salah, Special Duas, Salawat/Durood.
- Each dua includes Arabic text, transliteration, translation, source, and count.
- Expand/collapse details and mark duas “done” per day.
- Daily progress meter per category.

### 5) Islamic (Hijri) Calendar
- Hijri month view with navigation and “Today” shortcut.
- Highlights Islamic events, fasts, and celebrations.
- Event legend by type (celebration, martyrdom, special, fast, etc.).
- Event detail cards with Urdu titles and descriptions.

### 6) Progress Analytics
- Overall completion percentage with totals (done/left).
- Per-prayer completion breakdown and progress bars.
- Streaks (current and longest) and daily averages.
- Completion estimate based on historical pace.
- Milestone progress toward next target and historical milestone list.

### 7) History & Activity Heatmap
- 17-week activity heatmap of logged prayers.
- Monthly labels, intensity legend, and daily summaries.
- Stats for total logged, best day, average on active days.
- Empty-state guidance for new users.

### 8) Settings & Preferences
- Language selection with multi-language and RTL support (Arabic, Urdu, Persian, etc.).
- Dark mode toggle with system override.
- Profile summary (gender, ages, years of Qaza, menstruation days).
- Prayer breakdown with rakaat and remaining counts.
- Data actions: export progress as JSON, recalculate profile, reset progress.

### 9) Local-First Data Storage
- All app state (profile, counts, streaks, history, tasbih, preferences) stored locally via AsyncStorage.
- No required backend connectivity for core functionality.

### 10) Backend (API Server)
- Separate Express API server included in the repo.
- Health check endpoint: `GET /api/healthz`.

## Key Workflows

### Onboarding & Setup
1. User completes onboarding questions.
2. App calculates Qaza counts and stores them with profile data.
3. Onboarding is marked complete and the user is routed to the Tracker tab.

### Daily Qaza Logging
1. User logs a prayer (decrement remaining count).
2. Total completed count increases; daily history and streak are updated.
3. Milestones are checked and displayed when reached.
4. Undo reverses a log action (increment remaining count).

### Quick Log Full Day
1. User taps “Quick Log Full Day”.
2. One Qaza is logged for each prayer that still has remaining count.
3. History and streak update once for the batch log.

### Tasbih Tracking
1. User selects a dhikr preset and taps to count.
2. Daily target and completion state update in real time.
3. All-time totals persist; daily counts reset on a new date.

### Duas Completion Tracking
1. User filters by category and reads a dua.
2. Marking “Done” stores the daily completion state.
3. Category progress updates as more duas are completed.

### Calendar Browsing
1. User navigates Hijri months or jumps to today.
2. Selecting a day filters to events on that day.
3. Events display details, type badges, and descriptions.

### Progress & History Insights
1. Progress screen aggregates totals and estimates completion time.
2. History screen visualizes multi-week activity and streak strength.

### Data Management
1. Export produces a JSON snapshot of profile, counts, streak, and history.
2. Recalculate clears data and re-runs onboarding for new counts.
3. Reset progress restores counts to initial values while keeping profile.
