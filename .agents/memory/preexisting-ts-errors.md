---
name: Pre-existing TS errors
description: Two known non-blocking TypeScript errors that existed before our work
---

Two TypeScript errors are pre-existing (not introduced by our work) and are non-blocking:

1. `app/onboarding.tsx(89,20)` — Expo Router route type for `"/(tabs)"` string literal doesn't satisfy the union type. This is an Expo Router typing issue, not a runtime problem.

2. `hooks/useColors.ts(21,10)` — Type cast of the Colors object to `Record<string, ...>` conflicts because `radius` is a `number` not a theme color shape. This is a pre-existing architectural shortcut.

**Why:** Both were present before our work began. They do not affect runtime behavior. Do not attempt to fix them without user instruction as they would require restructuring core hooks.

**How to apply:** When running typecheck and seeing only these 2 errors, consider the check passed. New code must not introduce additional errors.
