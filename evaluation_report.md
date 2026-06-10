# 🏆 CarbonLedger — Hackathon Evaluation Report

> Evaluating against the rubric: **Code Quality, Security, Efficiency, Testing, Accessibility, Problem Statement Alignment, Google Services Usage**

---

## 📊 Score Summary (Predicted)

| Rubric Dimension             | Score | Max | Notes                                         |
|------------------------------|-------|-----|-----------------------------------------------|
| Code Quality                 | 8     | 10  | Clean architecture, minor issues              |
| Security                     | 7     | 10  | Good XSS handling, API key exposure risk       |
| Efficiency                   | 8     | 10  | Lazy loading, smart caching                   |
| Testing                      | 7     | 10  | Good coverage, missing edge cases             |
| Accessibility                | 6     | 10  | Some effort, but gaps remain                  |
| Problem Statement Alignment  | 9     | 10  | Excellent alignment, rich feature set         |
| Google Services Usage        | 8     | 10  | Deep Gemini integration across 3 use cases    |
| **Estimated Total**          | **53**| **70** |                                             |

---

## 1. Code Quality — 8/10 ✅

### Strengths
- **Clean architecture**: Component pattern (`render()` + `init()`) is consistent across all 10 components. Easy to reason about.
- **Separation of concerns**: Services layer (`gemini.js`, `storage.js`, `carbon-data.js`) is cleanly decoupled from UI components.
- **Design system**: The CSS is well-tokenized with custom properties. The `style.css` at 1420 lines is large but logically organized with section headers.
- **Good naming**: Variables like `healthScore`, `todayTotal`, `budgetUsed` are self-documenting.
- **JSDoc comments**: Service functions have proper JSDoc annotations.

### Risks / Issues

> [!WARNING]
> **`innerHTML` used everywhere for rendering.** While `escapeHtml()` is applied in some places (logger, dashboard, reports), the pattern of building HTML strings with template literals and inserting via `innerHTML` is fragile. A missed `escapeHtml()` call = XSS. Automated scanners will flag every `innerHTML` assignment.

> [!IMPORTANT]
> **Global `window` pollution.** Several functions are attached directly to `window` (`window.carbonNavigate`, `window.showToast`, `window.toggleTheme`, `window.startPack`). While functional for a SPA of this size, automated code quality tools may dock points for this pattern. Consider using a simple event bus or module exports instead.

- **Minor**: `package.json` has `"version": "0.0.0"` — should be `"1.0.0"` to match the `CarbonLedger v1.0.0` shown in the Settings page footer.

---

## 2. Security — 7/10 ⚠️

### Strengths
- ✅ `escapeHtml()` utility exists and is used in critical paths (logger AI results, dashboard activity list, reports statement).
- ✅ `.env` is properly `.gitignore`'d.
- ✅ Gemini responses are parsed as text/JSON only, never executed as code.
- ✅ No `eval()` usage anywhere.

### Risks / Issues

> [!CAUTION]
> **API key is embedded in the client-side bundle.** `import.meta.env.VITE_GEMINI_API_KEY` gets inlined by Vite at build time into the JavaScript bundle. Anyone can open DevTools → Sources and extract your Gemini API key. This is a fundamental limitation of a client-side-only architecture. Automated security scanners **will** flag this.
>
> **Mitigation options (if time permits):**
> - Add a comment in README acknowledging this is a hackathon prototype and the key is rate-limited on Google's free tier.
> - Or add a simple Vercel Edge Function proxy (5 lines of code) that keeps the key server-side.

> [!WARNING]
> **Inconsistent `escapeHtml()` usage.** Not every user-facing data insertion uses it. For example:
> - [goals.js:83](file:///c:/Users/PC/Desktop/Carbon-Ledger/src/components/goals.js#L83) — `goal.title` is rendered without escaping. This data comes from `CHALLENGE_PACKS` (safe), but the pattern is inconsistent.
> - [streaks.js:77](file:///c:/Users/PC/Desktop/Carbon-Ledger/src/components/streaks.js#L77) — badge names rendered directly.
> - These are safe because the data is hardcoded, but an automated scanner doesn't know that.

- **CSP headers**: No Content Security Policy is configured. Vercel supports this via `vercel.json` headers.

---

## 3. Efficiency — 8/10 ✅

### Strengths
- ✅ **Code splitting via dynamic imports**: Every route lazily loads its component (`() => import('./components/dashboard.js')`). This is excellent for initial load time.
- ✅ **Skeleton screens**: The router shows content-aware skeleton placeholders while loading, which is a premium UX pattern.
- ✅ **IndexedDB for storage**: Using `idb-keyval` is much more performant than `localStorage` for structured data.
- ✅ **Canvas forest cleanup**: `cleanupForest()` properly cancels `requestAnimationFrame` and disconnects `ResizeObserver` when navigating away — no memory leaks.
- ✅ **Gemini model fallback chain**: The `generateWithFallback()` function in `gemini.js` tries multiple models, which is excellent resilience engineering.

### Risks / Issues

> [!NOTE]
> **Chart.js is not tree-shaken.** The import `import Chart from 'chart.js/auto'` bundles the entire Chart.js library (~200KB). Using selective imports (`import { Chart, DoughnutController, ArcElement... }`) would reduce bundle size significantly. Automated efficiency checks may flag bundle size.

- **No service worker caching strategy**: The `sw.js` is registered in `index.html` but its actual implementation wasn't reviewed. If it's a no-op or basic shell, the PWA offline experience will be limited.

---

## 4. Testing — 7/10 ⚠️

### Strengths
- ✅ **3 test files** covering the 3 service modules:
  - `carbon-data.test.js` — 7 test cases covering baseline calculation, budget, savings, edge cases (empty answers, 0% goal, negative goals).
  - `storage.test.js` — Profile CRUD, activity ordering, streak logic with `vi.useFakeTimers()`.
  - `gemini.test.js` — Mocked API, JSON parsing, markdown-wrapped responses, error handling.
- ✅ Tests use `vitest` with proper mocking (`vi.mock`, `vi.fn`).
- ✅ Streak freeze logic is specifically tested (a complex business rule).

### Risks / Issues

> [!WARNING]
> **No `test` script in `package.json`.** The `scripts` section only has `dev`, `build`, `preview`. There is no `"test": "vitest"` script. An automated runner that executes `npm test` will **fail**. This is a critical oversight that could cost you points.

> [!IMPORTANT]
> **Missing test coverage areas:**
> - No component tests (DOM rendering, event handlers).
> - No test for `calculateBaseline()` with every answer combination.
> - No integration test for the router (`navigate()` function).
> - `deleteActivity()`, `getTodayTotal()`, `getTodayActivities()` are untested.

---

## 5. Accessibility — 6/10 ⚠️

### Strengths
- ✅ `aria-label` on all nav buttons, back buttons, FAB, and interactive elements.
- ✅ `aria-hidden="true"` on decorative SVGs.
- ✅ `aria-live="polite"` on the toast container for screen reader announcements.
- ✅ `@media (prefers-reduced-motion: reduce)` is implemented — disabling all animations.
- ✅ `.sr-only` utility class exists for screen-reader-only content.
- ✅ Semantic HTML5: `<nav>`, `<button>`, `<h1>`, `<label>`, `<ul>`, `<li>`.

### Risks / Issues

> [!CAUTION]
> **No `tabindex` management.** The hash router swaps page content via `innerHTML`, but focus is never programmatically moved to the new page heading. Screen reader users will be lost after navigation — they'll still be focused on the nav button they clicked, not the new content.

> [!WARNING]
> **Focus trapping missing in modals.** The profile edit modal in `settings.js` uses `classList.remove('hidden')` to show, but there's no focus trap. Tab key will escape the modal and interact with background content. The modal also doesn't close on `Escape` key.

- **Color contrast in dark mode**: Some green-on-dark-green combinations may not meet WCAG 4.5:1. `--green-700` (#15803d) on `--bg-card` (rgba(20, 40, 24, 0.90)) is borderline.
- **Charts are not accessible**: Chart.js canvases have no `alt` text or `aria-label`. Screen readers will see empty canvases.
- **Interactive `<div>` elements**: Some clickable elements use `<div>` with `onclick` instead of `<button>` (e.g., option cards in onboarding, category cards in logger). These are not keyboard-focusable.

---

## 6. Problem Statement Alignment — 9/10 ✅✅

### Strengths
This is the **strongest dimension**. The app directly and deeply addresses carbon footprint tracking:

- ✅ **Onboarding quiz** calculating a personalized baseline from 5 lifestyle categories with EPA/DEFRA-sourced emission factors.
- ✅ **Daily budget model** — the fintech bank-statement metaphor is creative and well-executed.
- ✅ **Activity logging** — dual-mode (manual presets + AI natural language).
- ✅ **Living forest visualization** — gamification that directly ties to carbon performance.
- ✅ **Streaks, achievements, lottery** — behavioral psychology for habit formation.
- ✅ **Challenge packs** — actionable reduction challenges with real CO₂ savings data.
- ✅ **What-If simulator** — both slider-based and AI-powered scenario modeling.
- ✅ **Carbon Statement** — the bank statement view is the most unique and differentiated feature.
- ✅ **Demo data seeder** — judges can immediately see a populated app without manual onboarding.

### Minor gap
- The README doesn't explicitly call out the **"How it works"** in a way that maps to the problem statement. The hackathon context section is good but could be more detailed on the *logic/algorithm* behind baseline calculation.

---

## 7. Google Services Usage — 8/10 ✅

### Strengths
- ✅ **3 distinct Gemini API use cases**:
  1. `parseActivity()` — Natural language → structured carbon activity data.
  2. `getInsight()` — Period data → personalized eco-coaching sentences.
  3. `whatIf()` — Scenario questions → annual savings analysis with equivalents.
- ✅ **Model fallback chain**: Tries `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-flash-latest`. This shows deep understanding of the API.
- ✅ **Structured prompts**: Each prompt includes explicit output format instructions, reference values, and rules. The prompts are well-engineered.
- ✅ **Graceful degradation**: Every Gemini call has a `try/catch` with a meaningful fallback (hardcoded insight text, error toast, empty array).

### Risks / Issues

> [!NOTE]
> **Only one Google service used.** The rubric says "Google Services usage" (plural). Using additional services like **Firebase Analytics** (just tracking), **Cloud Run** (API key proxy), or **Vertex AI** would score higher. However, the depth of Gemini integration across 3 use cases is strong.

---

## 🔧 Submission Essentials Compliance

Per the rubric screenshots, participants must document:

| Requirement | Status | Location |
|---|---|---|
| Which tools were used | ⚠️ Partial | README lists tech stack, but doesn't call out **Anti-Gravity** by name |
| Why they were selected | ⚠️ Missing | No rationale for tool choices in README |
| How prompts evolved | ❌ Missing | No prompt engineering documentation |
| What GenAI handled vs what humans designed | ❌ Missing | No attribution section |

> [!CAUTION]
> **This is the biggest gap.** The hackathon explicitly requires documenting AI tool usage in the submission (LinkedIn post and/or README). You need a section that explains:
> 1. "We used **Anti-Gravity (Gemini)** as our AI coding assistant"
> 2. "Gemini API powers 3 features: Smart Log, AI Insights, What-If Simulator"
> 3. "The emission factor database, design system, and gamification logic were human-designed"
> 4. Brief note on prompt evolution (e.g., "We iterated on structured output prompts to get reliable JSON from Gemini")

---

## 🚨 Critical Fixes (Do Before Submission)

### 1. Add `test` script to `package.json`
```diff
  "scripts": {
    "dev": "vite",
    "build": "vite build",
-   "preview": "vite preview"
+   "preview": "vite preview",
+   "test": "vitest run"
  },
```
Without this, automated test runners will fail.

### 2. Add AI Tool Usage section to README
Add a section documenting which AI tools were used and what they handled vs. human design decisions.

### 3. Fix `GRIEVANCES.md` and `SUGGESTIONS.md`
These files are currently in the repo and will be visible to evaluators. Either:
- Delete them and commit, OR
- Add them to `.gitignore` and remove from tracking

### 4. Update `package.json` version
Change `"version": "0.0.0"` to `"1.0.0"`.

---

## ✅ What's Already Great (Don't Touch)

- The Living Forest canvas animation — this is your **wow factor**
- The Carbon Statement view — unique, creative, well-executed
- The demo data seeder — judges will love not having to onboard manually
- The Gemini fallback chain — shows engineering maturity
- The earthy design system with dark mode — visually polished
- Sound effects and confetti — delightful micro-interactions

---

## 📋 Quick Win Fixes (15 minutes each)

| Fix | Impact | Effort |
|-----|--------|--------|
| Add `"test": "vitest run"` to package.json | **HIGH** — tests will actually run | 1 min |
| Add AI tools documentation section to README | **HIGH** — submission requirement | 10 min |
| Remove `GRIEVANCES.md` and `SUGGESTIONS.md` from git | **MEDIUM** — looks unprofessional | 2 min |
| Add `aria-label` to chart canvases | **MEDIUM** — accessibility score | 2 min |
| Import Chart.js selectively instead of `chart.js/auto` | **LOW** — bundle size optimization | 10 min |
