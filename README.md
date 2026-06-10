# 🌿 Carbon-Ledger

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vanilla JS](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Gemini API](https://img.shields.io/badge/Gemini%20API-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](https://ai.google.dev/)
[![Deploy Status](https://img.shields.io/badge/Vercel-Deployed-166534?style=for-the-badge&logo=vercel&logoColor=white)](https://carbon-ledger.vercel.app/)

> **[🌍 Live Demo: carbon-ledger.vercel.app](https://carbon-ledger.vercel.app/)**

**Carbon-Ledger** is a state-of-the-art, client-side progressive web app (PWA) designed to track, analyze, and reduce your daily carbon footprint. Built entirely as an intelligent, serverless Single Page Application (SPA), it empowers users through gamification, interactive data visualizations, and AI-driven insights—all completely local and private.

## 📱 App Gallery

*(Judges: See the live demo above to experience the animations and full UI!)*

<p align="center">
  <img src="https://placehold.co/240x480/166534/ffffff.png?text=Welcome+Screen" width="20%" alt="Welcome">
  <img src="https://placehold.co/240x480/166534/ffffff.png?text=Living+Forest" width="20%" alt="Dashboard">
  <img src="https://placehold.co/240x480/166534/ffffff.png?text=AI+Smart+Log" width="20%" alt="Logger">
  <img src="https://placehold.co/240x480/166534/ffffff.png?text=Carbon+Statement" width="20%" alt="Reports">
</p>

*(Note to dev: Replace the placehold.co links with actual screenshots in `docs/` before submission)*

## ✨ Key Features

- **Dynamic Living Forest Dashboard**: Your daily emissions literally shape the app's ecosystem. Stay under budget to watch your forest thrive, or go over and watch the skies grey and leaves fall.
- **AI Smart Log**: Just type out your day in natural language (e.g., "I drove 15km to work and ate a beef burger"). The Gemini API instantly parses your activities and quantifies their carbon impact.
- **Streaks & Lottery System**: Earn a "Streak Freeze" ticket every day you hit your emissions goal. Spin the daily lottery for a chance to win rewards that protect your streak on bad days.
- **Interactive What-If Simulator**: Tweak your daily habits with sliders (like transit vs. driving or meat-free days) to see real-time projections of your annual savings translated into "trees planted" or "flights offset."
- **Privacy-First Architecture**: 100% of your data (streaks, activities, goals, profile) is stored locally on your device via IndexedDB. Nothing is ever sent to a remote database.

## 🛠️ Tech Stack

- **Framework**: Vanilla JS + Vite SPA
- **Styling**: Vanilla CSS with a bespoke tokenized design system (Glassmorphism + Dark Mode readiness).
- **Storage**: `idb-keyval` (IndexedDB Wrapper for offline-first persistence).
- **AI Integration**: Google Gemini API (`@google/genai`) for natural language activity logging and dynamic weekly insights.
- **Charting**: `chart.js` for robust data reporting (Donut/Line charts).
- **Testing**: `vitest` for business logic testing.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Gemini API Key

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/aadhyanthk/Carbon-Ledger.git
   cd Carbon-Ledger
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Configure Environment Variables:
   Create a \`.env\` file in the root directory and add your Gemini API Key:
   \`\`\`env
   VITE_GEMINI_API_KEY=your_api_key_here
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## 🧪 Testing
Run the unit test suite via Vitest:
\`\`\`bash
npm test
\`\`\`

## 🌍 Deployment
Carbon-Ledger is highly optimized for deployment on Edge networks like **Vercel** or **Netlify**. 
Since it is a purely client-side Vite application, you can deploy it in 3 clicks:
1. Connect your GitHub repository to Vercel.
2. Ensure the Build Command is set to \`npm run build\` and Output Directory to \`dist\`.
3. Add your \`VITE_GEMINI_API_KEY\` to the Environment Variables settings in Vercel.
4. Click Deploy!
