# 🎯 CarbonLedger — Path to 9-10/10 Checklist

---

## 1. Code Quality (8 → 10)

- [ ] **Fix `package.json` version** — change `"0.0.0"` to `"1.0.0"` *(1 min)*
- [ ] **Remove `window` globals** — replace `window.startPack`, `window.carbonNavigate`, `window.showToast`, `window.toggleTheme` with a proper event bus or module-level exports *(15 min)*
- [ ] **Delete `GRIEVANCES.md` and `SUGGESTIONS.md` from git** — `git rm` both files, add to `.gitignore` *(2 min)*
- [ ] **Add consistent JSDoc to all component files** — every `render()` and `init()` should have a `@returns` and `@description` *(10 min)*
- [ ] **Lint-clean the codebase** — run a one-time pass to fix any inconsistent spacing, trailing commas, unused variables *(5 min)*

---

## 2. Security (7 → 9)

- [ ] **Add a Vercel Edge Function API proxy** — create `api/gemini.js` that receives prompts from the client and forwards to Gemini with the API key server-side. Update `gemini.js` to call `/api/gemini` instead of the SDK directly. This removes the API key from the client bundle entirely *(30 min)*
- [ ] **Audit every `innerHTML` assignment** — grep for all `.innerHTML =` across components. Ensure every piece of dynamic user-sourced or AI-sourced data passes through `escapeHtml()` before insertion *(15 min)*
- [ ] **Add Content Security Policy headers** — create/update `vercel.json` with CSP headers that restrict script sources, block inline `eval`, and limit `connect-src` to your Gemini API endpoint *(10 min)*
- [ ] **Add `rel="noopener noreferrer"` to any external links** in README or app *(2 min)*

---

## 3. Efficiency (8 → 10)

- [ ] **Tree-shake Chart.js** — replace `import Chart from 'chart.js/auto'` with selective imports (`Chart, DoughnutController, ArcElement, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip`) and register them manually *(10 min)*
- [ ] **Verify `sw.js` has a proper caching strategy** — ensure the service worker caches app shell assets (HTML, CSS, JS) for offline use. If it's a stub, implement a cache-first strategy for static assets and network-first for API calls *(15 min)*
- [ ] **Add `loading="lazy"` to any `<img>` tags** if screenshots or images are embedded anywhere in the app *(2 min)*
- [ ] **Debounce simulator sliders** — the `input` event on range sliders fires on every pixel drag. Add a small debounce (50ms) to `updateSimulation()` in `dashboard.js` *(5 min)*

---

## 4. Testing (7 → 10)

- [ ] **Add `"test": "vitest run"` to `package.json` scripts** — without this, `npm test` fails and automated runners score 0 *(1 min, CRITICAL)*
- [ ] **Add tests for `deleteActivity()`** in `storage.test.js` *(5 min)*
- [ ] **Add tests for `getTodayActivities()` and `getTodayTotal()`** with fake timers *(10 min)*
- [ ] **Add tests for `startChallenge()`, `completeGoalItem()`, `markGoalComplete()`** in `storage.test.js` *(10 min)*
- [ ] **Add tests for `unlockAchievement()` — including duplicate prevention** *(5 min)*
- [ ] **Add tests for `earnTicket()` and `spendTicket()`** *(5 min)*
- [ ] **Add a test for `escapeHtml()`** — verify it escapes `<`, `>`, `&`, `"`, `'` and handles `null`/`undefined` *(5 min)*
- [ ] **Add a test for `getDailyBudget()` with edge cases** — 100% reduction, 0 baseline *(5 min)*
- [ ] **Run `npm test` and verify all tests pass** *(2 min)*

---

## 5. Accessibility (6 → 9)

- [ ] **Add focus management on navigation** — after `navigate()` renders a new page in `main.js`, programmatically focus the page's `<h1>` or first heading using `viewRoot.querySelector('h1')?.focus()` with `tabindex="-1"` on headings *(10 min)*
- [ ] **Add focus trap to the profile edit modal** — trap Tab/Shift+Tab inside the modal, close on `Escape` key, return focus to the trigger button on close *(15 min)*
- [ ] **Add `aria-label` to both chart canvases** — e.g., `aria-label="Donut chart showing carbon emissions by category"` and `aria-label="Line chart showing daily carbon emissions trend"` *(2 min)*
- [ ] **Add `role="img"` to the forest canvas** — with an `aria-label` like `"Living forest visualization reflecting your carbon health"` *(2 min)*
- [ ] **Convert clickable `<div>` elements to `<button>`** — specifically `.option-card` in onboarding and `.category-card` in logger. Or add `role="button"` and `tabindex="0"` with `keydown` Enter/Space handlers *(15 min)*
- [ ] **Add `aria-live="polite"` region for dynamic content updates** — specifically the AI insight container and the budget bar value, so screen readers announce changes *(5 min)*
- [ ] **Ensure all form inputs have visible labels** — the AI text input in logger and the what-if textarea in dashboard need associated `<label>` elements *(5 min)*
- [ ] **Test keyboard navigation end-to-end** — verify every interactive element is reachable via Tab key, and activatable via Enter/Space. Fix any gaps *(10 min)*

---

## 6. Problem Statement Alignment (9 → 10)

- [ ] **Add a detailed "Approach & Algorithm" section to README** — explain the baseline calculation formula, how `ONBOARDING_QUESTIONS` map to daily kg CO₂, the budget formula (`baseline - (baseline × goalPercent/100)`), and cite EPA/DEFRA sources *(10 min)*
- [ ] **Add a "Data Sources" subsection** — list the specific emission factor sources (EPA eGRID for electricity, DEFRA for transport/food, IPCC for lifestyle) to show research rigor *(5 min)*

---

## 7. Google Services Usage (8 → 10)

- [ ] **Add a second Google service** — the easiest option is **Firebase Analytics** via the client-side SDK. Just track 3-4 key events: `onboarding_complete`, `activity_logged`, `challenge_started`, `achievement_unlocked`. This shows usage of multiple Google services *(20 min)*
- [ ] **Document Gemini prompt engineering in README** — add a subsection showing how the prompts were structured (structured output instructions, reference emission values baked into prompts, JSON-only response format) and how they evolved *(10 min)*

---

## 8. Submission Essentials (Missing → Complete)

- [ ] **Add "Built With AI" section to README** — document:
  - Tools used: Anti-Gravity (Gemini-powered IDE), Gemini API
  - Why: Anti-Gravity for rapid full-stack development, Gemini API for NL parsing and insights
  - What GenAI handled: Code scaffolding, CSS design system generation, component boilerplate
  - What humans designed: Emission factor research, gamification mechanics, UX flow decisions, fintech metaphor concept
  *(15 min)*
- [ ] **Add "Prompt Engineering" subsection** — brief note on how prompts evolved (e.g., "Started with simple 'parse this text' prompts, iterated to include reference emission values and strict JSON output format for reliability") *(5 min)*
- [ ] **Prepare LinkedIn post** — draft a post covering tool usage explanation, architecture overview, and prompt flow. Include a link to the live demo *(15 min, separate from code)*

## 9. Awareness & Sharing (New — High Impact)

The hackathon values spreading awareness. Transform the Welcome screen from a simple landing page into an **awareness-first experience** with shocking carbon facts, educational content, and easy sharing.

### Welcome Screen — Carbon Awareness Section
- [ ] **Add a "Did You Know?" scrolling facts section** — between the feature list and the action buttons, add an eye-catching section with shocking carbon statistics displayed as animated counter cards. Facts like:
  - *"The average person produces **16.3 kg** of CO₂ every single day"*
  - *"A single beef burger = **5.5 kg CO₂** — the same as driving 29 km"*
  - *"If everyone reduced just **15%**, we'd save **6 billion tonnes** of CO₂ per year"*
  - *"A round-trip flight from NYC to London = **1.8 tonnes CO₂** — one person's entire month"*
  Style these as bold stat cards with large numbers and earthy gradients *(15 min)*

- [ ] **Add a "Why Track Carbon?" explainer section** — a compact, visual section explaining:
  - 🌡️ *"Earth has warmed 1.2°C since pre-industrial times"*
  - 🏭 *"Individual actions account for ~72% of global emissions"*
  - 📉 *"Tracking is the first step — you can't reduce what you don't measure"*
  Use icons + short punchy text, not paragraphs *(10 min)*

- [ ] **Add equivalence visualizer** — a mini interactive element: *"Your daily coffee = ☕ 0.21 kg CO₂ = 🌳 4 trees needed to offset per year"*. Show 2-3 everyday items with their surprising CO₂ cost *(10 min)*

### Welcome Screen — Share CTA
- [ ] **Add a "Spread the Word" section to the Welcome screen** — below the action buttons, add a visually distinct card with the text *"Help your friends track their carbon too"* with a **"Share CarbonLedger"** button *(10 min)*
- [ ] **Use the Web Share API** — `navigator.share()` with a pre-written awareness message. Falls back to **copy-to-clipboard** on desktop *(10 min)*

### Settings — Persistent "Invite Friends"
- [ ] **Add an "Invite Friends" row in Settings** — triggers the same Web Share / copy-link flow *(5 min)*

### Dashboard — Share Impact
- [ ] **Add a "Share my impact" mini-button on the streak card** — shares a personalized message with the user's streak count *(10 min)*

---

## ⚡ Priority Order (What to Do First)

### 🔴 Critical (Do these or lose major points)
1. Add `"test": "vitest run"` to package.json
2. Delete GRIEVANCES.md and SUGGESTIONS.md from git
3. Add "Built With AI" section to README
4. Run `npm test` and verify all pass
5. **Add "Spread the Word" share feature to Welcome screen**

### 🟡 High Impact (Best ROI for time spent)
6. Add "Invite Friends" to Settings + "Share impact" on Dashboard
7. Add focus management on navigation
8. Add `aria-label` to chart canvases and forest canvas
9. Audit all `innerHTML` for `escapeHtml()` coverage
10. Add CSP headers via `vercel.json`
11. Tree-shake Chart.js
12. Add extra test cases for storage/utils

### 🟢 Nice to Have (If time permits)
13. Vercel Edge Function API proxy
14. Firebase Analytics integration
15. Focus trap in modal
16. Convert divs to buttons in onboarding
17. Remove window globals
18. Debounce sliders

