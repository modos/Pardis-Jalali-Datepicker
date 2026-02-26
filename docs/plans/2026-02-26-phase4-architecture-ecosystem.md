# Phase 4 — Architecture & Ecosystem Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lift `pardis-jalali-datepicker` to a production-grade npm package with ESM/CJS/UMD build output, full TypeScript declarations, and an `aria-labelledby` accessibility fix — all without breaking the existing CDN/vanilla `lib/` usage.

**Architecture:** `tsup` builds `dist/` from the existing `lib/pardis-jalali-datepicker.js` source. A CJS guard appended to `lib/` makes it importable by bundlers/Node while staying invisible to browsers. A hand-authored `.d.ts` file is copied into `dist/` at build time. The `aria-labelledby` fix threads an instance-scoped ID from `PardisDatepicker` through `PardisRenderer` via its existing `options` third argument.

**Tech Stack:** Node.js ≥16, `tsup` ^8.0.0 (devDependency), vanilla JS (no TypeScript source — types are hand-authored)

---

### Task 1: Add CJS export guard to `lib/pardis-jalali-datepicker.js`

**Files:**
- Modify: `lib/pardis-jalali-datepicker.js` (append after line 1463, current last line)

**Step 1: Append the CJS guard**

Open [lib/pardis-jalali-datepicker.js](lib/pardis-jalali-datepicker.js) and append these lines at the very end (after the closing `}` of the `PardisDatepicker` class):

```js
// ── Module export guard (CJS/Node — invisible to browser <script>) ──
if (typeof module !== 'undefined') {
  module.exports = { PardisDatepicker, PardisEngine, JalaaliUtil };
}
```

**Step 2: Verify it does not break browser usage**

Open a terminal in the project root and run the existing tests:

```bash
npm test
```

Expected output: all year-boundary tests pass (same output as before).

**Step 3: Commit**

```bash
git add lib/pardis-jalali-datepicker.js
git commit -m "feat: add CJS export guard for bundler/Node compatibility"
```

---

### Task 2: Install `tsup` and add `tsup.config.js`

**Files:**
- Create: `tsup.config.js`
- Modify: `package.json`

**Step 1: Install tsup as a devDependency**

```bash
npm install --save-dev tsup
```

Expected: `node_modules/tsup/` appears, `package.json` gets `"devDependencies": { "tsup": "^8.x.x" }`.

**Step 2: Create `tsup.config.js` at the project root**

```js
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['lib/pardis-jalali-datepicker.js'],
  format: ['esm', 'cjs', 'iife'],
  globalName: 'PardisJalaliDatepicker',
  outDir: 'dist',
  clean: true,
  minify: false,
  splitting: false,
  sourcemap: false,
  dts: false,
});
```

Note: `dts: false` because the source is plain JS — we hand-copy the `.d.ts` in the build script instead.

**Step 3: Update `package.json`**

Replace the entire `package.json` content with:

```json
{
  "name": "pardis-jalali-datepicker",
  "version": "1.2.0",
  "description": "A modern, zero-dependency Persian (Jalali/Shamsi) datepicker — multi-instance, inline mode, range selection, input masking, and three built-in themes.",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "style": "lib/pardis-jalali-datepicker.css",
  "files": [
    "lib",
    "dist",
    "README.md",
    "LICENSE"
  ],
  "sideEffects": ["**/*.css"],
  "engines": { "node": ">=16.0.0" },
  "scripts": {
    "build": "tsup && cp lib/pardis-jalali-datepicker.d.ts dist/index.d.ts",
    "test": "node scripts/year-boundary-test.js"
  },
  "keywords": [
    "datepicker",
    "jalali",
    "shamsi",
    "persian",
    "jalaali",
    "calendar",
    "date",
    "iran",
    "farsi",
    "rtl",
    "vanilla-js",
    "zero-dependency"
  ],
  "author": "Alireza Kariminejad",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/alirezakariminejad/Pardis-Jalali-Datepicker.git"
  },
  "homepage": "https://alirezakariminejad.github.io/Pardis-Jalali-Datepicker/",
  "bugs": {
    "url": "https://github.com/alirezakariminejad/Pardis-Jalali-Datepicker/issues"
  },
  "devDependencies": {
    "tsup": "^8.0.0"
  }
}
```

**Step 4: Verify build runs (before the .d.ts exists — it will fail at the `cp` step, that's expected)**

```bash
npm run build
```

Expected: `dist/index.mjs`, `dist/index.cjs`, `dist/index.global.js` are created. The `cp` command fails with "no such file" — that is fine, Task 3 fixes it.

**Step 5: Commit**

```bash
git add tsup.config.js package.json package-lock.json
git commit -m "build: introduce tsup for ESM/CJS/IIFE dist output"
```

---

### Task 3: Hand-author TypeScript declaration file

**Files:**
- Create: `lib/pardis-jalali-datepicker.d.ts`

**Step 1: Create the declaration file**

Create `lib/pardis-jalali-datepicker.d.ts` with:

```ts
export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export interface DateRange {
  start: JalaliDate | null;
  end: JalaliDate | null;
}

export interface PardisOptions {
  inline?: boolean;
  rangeMode?: boolean;
  outputFormat?: 'jalali' | 'gregorian' | 'both';
  mobileMode?: boolean;
  minDate?: JalaliDate | null;
  maxDate?: JalaliDate | null;
  initialYear?: number | null;
  initialMonth?: number | null;
  disabledDates?: JalaliDate[] | ((jy: number, jm: number, jd: number) => boolean) | null;
  highlightedDates?: (JalaliDate & { className?: string })[] | null;
  maxRange?: number | null;
  numeralType?: 'persian' | 'latin';
  onChange?: ((payload: object) => void) | null;
  onRangeStart?: ((payload: object) => void) | null;
  onRangeSelect?: ((range: DateRange) => void) | null;
  onClear?: (() => void) | null;
}

export declare class PardisDatepicker {
  constructor(target: string | HTMLElement, options?: PardisOptions);
  getValue(): object | null;
  setValue(date: JalaliDate): void;
  setOption(key: keyof PardisOptions, value: unknown): void;
  open(): void;
  close(): void;
  destroy(): void;
  goToToday(): void;
  getPresetRange(name: 'thisWeek' | 'thisMonth' | 'last7Days' | 'last30Days'): DateRange;
}
```

**Step 2: Run the full build and verify all four dist files are produced**

```bash
npm run build
```

Expected output — no errors, and these files appear:
- `dist/index.mjs`
- `dist/index.cjs`
- `dist/index.global.js`
- `dist/index.d.ts`

Verify `dist/index.d.ts` was copied correctly:

```bash
head -5 dist/index.d.ts
```

Expected first line: `export interface JalaliDate {`

**Step 3: Smoke-test CJS require in Node**

```bash
node -e "const { PardisDatepicker } = require('./dist/index.cjs'); console.log(typeof PardisDatepicker);"
```

Expected output: `function`

**Step 4: Smoke-test ESM import**

```bash
node --input-type=module -e "import { PardisDatepicker } from './dist/index.mjs'; console.log(typeof PardisDatepicker);"
```

Expected output: `function`

**Step 5: Add `dist/` to `.gitignore` (build artifacts should not be committed)**

Check if `.gitignore` exists:

```bash
cat .gitignore 2>/dev/null || echo "(no .gitignore yet)"
```

If it exists, add `dist/` to it. If it doesn't, create it with:

```
dist/
node_modules/
```

**Step 6: Commit**

```bash
git add lib/pardis-jalali-datepicker.d.ts .gitignore
git commit -m "feat: add hand-authored TypeScript declaration file"
```

---

### Task 4: `aria-labelledby` — instance counter + heading ID

**Files:**
- Modify: `lib/pardis-jalali-datepicker.js`

**Step 1: Add instance counter + heading ID in the constructor**

In [lib/pardis-jalali-datepicker.js:1114-1115](lib/pardis-jalali-datepicker.js#L1114-L1115), after `this._currentPayload = null;`, insert:

```js
this._headingId = 'pardis-heading-' + (++PardisDatepicker._counter);
```

Then, after the closing `}` of the `PardisDatepicker` class (just before the CJS guard added in Task 1), add:

```js
PardisDatepicker._counter = 0;
```

**Step 2: Wire `aria-labelledby` on the popover**

In [lib/pardis-jalali-datepicker.js:1181-1183](lib/pardis-jalali-datepicker.js#L1181-L1183), replace:

```js
this._popover.setAttribute('role', 'dialog');
this._popover.setAttribute('aria-modal', 'true');
this._popover.setAttribute('aria-label', 'تقویم تاریخ');
```

with:

```js
this._popover.setAttribute('role', 'dialog');
this._popover.setAttribute('aria-modal', 'true');
this._popover.setAttribute('aria-labelledby', this._headingId);
```

**Step 3: Pass `headingId` to PardisRenderer**

In [lib/pardis-jalali-datepicker.js:1189](lib/pardis-jalali-datepicker.js#L1189), replace:

```js
this._renderer = new PardisRenderer(this._calEl, this.engine);
```

with:

```js
this._renderer = new PardisRenderer(this._calEl, this.engine, { headingId: this._headingId });
```

**Step 4: Set the heading `id` in `_renderDayView`**

In [lib/pardis-jalali-datepicker.js:714](lib/pardis-jalali-datepicker.js#L714), replace:

```js
        <div class="pardis-header-title">
```

with:

```js
        <div class="pardis-header-title" id="${this.options.headingId || ''}">
```

**Step 5: Set the heading `id` in `_renderMonthView`**

In [lib/pardis-jalali-datepicker.js:780](lib/pardis-jalali-datepicker.js#L780), replace:

```js
        <div class="pardis-header-title">
```

with:

```js
        <div class="pardis-header-title" id="${this.options.headingId || ''}">
```

**Step 6: Set the heading `id` in `_renderYearView`**

In [lib/pardis-jalali-datepicker.js:807](lib/pardis-jalali-datepicker.js#L807), replace:

```js
        <div class="pardis-header-title">
```

with:

```js
        <div class="pardis-header-title" id="${this.options.headingId || ''}">
```

**Step 7: Run tests**

```bash
npm test
```

Expected: all year-boundary tests pass.

**Step 8: Commit**

```bash
git add lib/pardis-jalali-datepicker.js
git commit -m "fix(a11y): wire aria-labelledby to instance-scoped heading id"
```

---

### Task 5: Update CHANGELOG, bump to v2.0.0, tag and push

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `package.json`

**Step 1: Add v2.0.0 section to `CHANGELOG.md`**

Prepend the following section at the top of the changelog body (after the `# Changelog` heading):

```markdown
## [2.0.0] - 2026-02-26

### Added
- ESM (`dist/index.mjs`), CJS (`dist/index.cjs`), and IIFE (`dist/index.global.js`) build output via `tsup`.
- `package.json` exports map, `"module"` field, and `"types"` field pointing to `dist/`.
- Full TypeScript declaration file (`lib/pardis-jalali-datepicker.d.ts`) with `JalaliDate`, `DateRange`, `PardisOptions`, and `PardisDatepicker` class types.

### Fixed
- `aria-labelledby` added to `role="dialog"` popover, pointing to the month/year heading with an instance-scoped ID (`pardis-heading-N`). Removes the previous redundant `aria-label`.

### Changed
- `package.json` `"main"` entry moved from `lib/pardis-jalali-datepicker.js` to `./dist/index.cjs`. **Breaking change for bundler users** (update your import if you were importing the `lib/` path directly in Node/webpack). CDN `<script src="lib/...">` users are unaffected.
- `"files"` in `package.json` now includes the entire `lib/` directory and `dist/`.

### BREAKING CHANGES
- Bundler `require('pardis-jalali-datepicker')` now resolves to `dist/index.cjs` instead of `lib/pardis-jalali-datepicker.js`.
- The `"exports"` field in `package.json` blocks deep imports (e.g. `require('pardis-jalali-datepicker/lib/...')`).
```

**Step 2: Bump version in `package.json`**

Change `"version": "1.2.0"` to `"version": "2.0.0"`.

**Step 3: Run tests one final time**

```bash
npm test
```

Expected: all tests pass.

**Step 4: Run the build one final time**

```bash
npm run build
```

Expected: `dist/` is regenerated cleanly, all four files present.

**Step 5: Commit, tag, and push**

```bash
git add CHANGELOG.md package.json
git commit -m "Release v2.0.0"
git tag -a v2.0.0 -m "v2.0.0"
git push origin main
git push origin v2.0.0
```

**Step 6: Create GitHub Release**

Go to https://github.com/alirezakariminejad/Pardis-Jalali-Datepicker/releases/new, select tag `v2.0.0`, paste the `[2.0.0]` section from CHANGELOG.md as the release notes, publish.

---

## Verification Checklist

- [ ] `npm test` passes (year-boundary tests)
- [ ] `npm run build` produces `dist/index.mjs`, `dist/index.cjs`, `dist/index.global.js`, `dist/index.d.ts`
- [ ] `node -e "const {PardisDatepicker}=require('./dist/index.cjs');console.log(typeof PardisDatepicker)"` → `function`
- [ ] `node --input-type=module -e "import {PardisDatepicker} from './dist/index.mjs';console.log(typeof PardisDatepicker)"` → `function`
- [ ] `dist/index.d.ts` starts with `export interface JalaliDate {`
- [ ] DOM inspection: `role="dialog"` element has `aria-labelledby="pardis-heading-1"` (no `aria-label`)
- [ ] DOM inspection: `.pardis-header-title` has `id="pardis-heading-1"`
- [ ] Two pickers on same page: heading IDs are `pardis-heading-1` and `pardis-heading-2`
- [ ] CDN `<script src="lib/pardis-jalali-datepicker.js">` still works (`window.PardisDatepicker` is undefined but `new PardisDatepicker(...)` throws as expected in non-browser context)
- [ ] `git tag` shows `v2.0.0`
