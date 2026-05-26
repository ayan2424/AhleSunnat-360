---
name: Translation system
description: How the 11-language i18n system works and the rule for adding new keys
---

All language objects are typed as `typeof en` (strict), so every new translation key added to `en` MUST also be added to all 10 other language objects (ar, ur, rur, hi, fa, bn, ms, tr, fr, id). The `t()` function has a runtime fallback to English, but TypeScript will error at compile time if any language is missing a key.

**Why:** Strict typing catches missing translations at build time rather than showing blank strings at runtime.

**How to apply:** When adding new translation keys, add them to `en` first, then sequentially add them to all other 11 language objects (each has a unique `footerDua` value as a reliable anchor for targeted edits). The 11 languages are: en, ar, ur, rur, hi, fa, bn, ms, tr, fr, id.

File: `artifacts/mobile/utils/translations.ts`
