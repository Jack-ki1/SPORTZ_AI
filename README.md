# SPORTZ_AI — Multi-Sport Data, Machine Learning Forecast Engine & AI Copilot

SPORTZ_AI is a high-performance sports analytics, forecasting, and data exploration platform covering **Formula 1 (F1), NBA Basketball, English Premier League (EPL), NFL Football, and MLB Baseball**.

The platform is architected around two core capabilities:

1. **Custom-Tuned Multi-Factor Machine Learning Models**: Built-in backend statistical engines that continuously evaluate team/driver form, win streaks, fatigue, home advantage, and sport-specific tactical weights. To overcome the inherent randomness of 50/50 coin-flip matchups, the engine provides an empirical **70%+ High-Conviction Tier** where predictions consistently achieve $\ge 70\%$ backtested walk-forward hit rates.
2. **User Custom AI Model Replacement Engine**: Users can navigate to the Settings desk, connect their preferred AI provider (OpenAI, OpenRouter, Groq, Together AI, Mistral, DeepSeek, local Ollama, or custom public HTTPS OpenAI-compatible endpoints), supply their own API key, and use their custom model **in place of** the backend ML models to predict fixtures, projected spreads, and confidence scores.

SPORTZ_AI is strictly an **exploratory analytics tool**, not a sportsbook. All forecasts are expressed as transparent mathematical probability distributions with verifiable provenance and historical backtest metrics.

---

## Table of Contents

1. [Project Overview & Philosophy](#1-project-overview--philosophy)
2. [Key Capabilities & User Workflows](#2-key-capabilities--user-workflows)
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
4. [Exhaustive Repository File Map](#4-exhaustive-repository-file-map)
5. [Sports Coverage & Live Data Ingestion](#5-sports-coverage--live-data-ingestion)
6. [Multi-Factor Machine Learning Forecast Methodology](#6-multi-factor-machine-learning-forecast-methodology)
7. [The Mathematics of 70%+ Accuracy & Conviction Tiering](#7-the-mathematics-of-70-accuracy--conviction-tiering)
8. [User Custom AI Model Integration](#8-user-custom-ai-model-integration)
9. [User-Driven Model Hyperparameter Tuning Reference](#9-user-driven-model-hyperparameter-tuning-reference)
10. [REST API Reference](#10-rest-api-reference)
11. [Security, Privacy & SSRF Protection Architecture](#11-security-privacy--ssrf-protection-architecture)
12. [Local Development & Operations](#12-local-development--operations)
13. [Vercel & Production Deployment Guide](#13-vercel--production-deployment-guide)
14. [Troubleshooting & Frequently Asked Questions](#14-troubleshooting--frequently-asked-questions)
15. [Guidelines for Future Improvement & Roadmap](#15-guidelines-for-future-improvement--roadmap)

---

## 1. Project Overview & Philosophy

### Core Mission

Professional sports analytics is frequently obscured by black-box sportsbook odds, paywalled tout services, or fabricated mock screens. SPORTZ_AI provides an open, reproducible, and deeply tunable alternative:

- **Clean Live Data**: Live fixtures, standings, rosters, and scores are ingested from public endpoints (ESPN Scoreboard/Standings and Jolpica Ergast F1).
- **Verifiable ML Provenance**: Walk-forward pairwise Elo models trained across historical regular-season results (from 2000/2010 to present) are committed directly to source control as a compact runtime asset (`shared/sports-models.json`).
- **User Agency**: The user is never locked into a single rigid model. Users can tune the statistical engine's hyperparameters via interactive sliders, apply calibrated presets, or swap in their own Large Language Model (LLM) to perform reasoning and game predictions.

### Product Principles

1. **Zero Hallucination / Provider Transparency**: The application never invents mock scores, fantasy player statistics, or imaginary injuries. When an upstream provider or event is unavailable, the UI explicitly flags `status: "unavailable"`.
2. **Analysis, Not Wagering**: Probabilities are objective statistical estimates, not betting advice or guaranteed outcomes.
3. **Client-Scoped Secrets**: User API keys for AI providers are stored strictly in `sessionStorage` in the active browser tab. They are forwarded in-memory for active prediction calls and are **never** written to backend disk, databases, or server logs.
4. **Zero-Dependency Backend**: The backend API service is built entirely with native Node.js standard library modules (`node:http`, `node:https`, `node:dns`, `node:net`, `node:fs`), eliminating runtime vulnerability surfaces and ensuring instant serverless cold starts on Vercel.

---

## 2. Key Capabilities & User Workflows

```
┌────────────────────────────────────────────────────────────────────────┐
│                              SPORTZ_AI                                 │
├──────────────┬──────────────┬──────────────┬─────────────┬─────────────┤
│ Predictions  │ Live Center  │   Matchups   │  Watchlist  │  Settings   │
│  • ML Picks  │  • Scores    │  • Head-to-  │  • Followed │  • Presets  │
│  • Custom AI │  • Standings │    Head      │    Teams &  │  • Sliders  │
│  • 70%+ Tier │  • Monte     │  • Rosters   │    Drivers  │  • AI Keys  │
│  • Copilot   │    Carlo Sim │  • Profiles  │  • Saved    │  • Bench-   │
│              │              │              │    Picks    │    marks    │
└──────────────┴──────────────┴──────────────┴─────────────┴─────────────┘
```

### 1. Forecast Desk (`/predictions`)

- **Engine Mode Selection**: Switch seamlessly between **Custom Tuned ML**, **Your Custom AI Model**, or **Blended Ensemble (Consensus)**.
- **70%+ Conviction Filter**: Filter fixtures to isolate only games meeting certified mathematical confidence thresholds ($\ge 70\%$ historical hit rate).
- **Matchup Intelligence**: Displays fair American moneyline odds (e.g. `-175 / +150`), projected spreads (e.g. `BOS -6.5 pts`), and key algorithmic factors (e.g. `Home Edge +55 Elo`, `Form Edge +24 Elo`).
- **Predict with AI**: Run instant LLM match evaluations for any fixture, generating projected scores, conviction tiers, tactical rationale, and key factors.
- **Batch AI Prediction**: One-click batch analysis across all scheduled fixtures in the active time window.
- **Pick Adoption & Local Desk**: Save personal calls or adopt AI predictions directly to browser local storage.

### 2. Live Center (`/live`)

- Real-time scoreboards across all 5 leagues with live/scheduled/final status flags.
- Comprehensive league tables and driver championship standings.
- **Monte Carlo Season Simulator**: Projects final table distributions by simulating remaining fixtures using current ratings and tunable iteration counts (250, 1,000, 3,000 runs).

### 3. Matchup Studio (`/matchups`)

- Head-to-head comparison tool for any two teams or F1 drivers.
- In-depth roster profile inspections with player status, experience, positions, and recent schedules.

### 4. Watchlist (`/watchlist`)

- Browser-local bookmarks for followed teams and drivers.
- Dynamic watchlist fixtures feed displaying upcoming games and model forecasts for followed competitors.

### 5. Settings & Model Tuning Center (`/settings`)

- **One-Click Presets**: Adopt pre-calibrated configurations ("70%+ High Conviction", "Balanced Multi-Factor", "Aggressive Form & Streak", "Contrarian Underdog Hunter").
- **Fine-Grained Hyperparameter Sliders**: Customize core parameters (conviction cutoff, form sensitivity, streak momentum, rest/fatigue penalties, venue advantage) and sport-specific weights (NBA pace, NFL turnovers, MLB starting pitcher equity, EPL xG weighting, F1 constructor aero ratio).
- **AI Model Replacement Configuration**: Select provider, enter custom model ID, API key, base URL, temperature, and custom tactical guidance prompts. Includes an interactive **Test Connection** button.
- **Empirical Validation Dashboard**: Inspect walk-forward backtests comparing full-sample accuracy against the 70%+ high-conviction tier across tens of thousands of evaluated games.

---

## 3. System Architecture & Data Flow

```
                      Browser (React 19 SPA)
         ┌──────────────────────────────────────────────┐
         │ • TanStack Router (File-Based Routes)        │
         │ • Tailwind CSS v4 Component Workspaces       │
         │ • LocalStorage (Picks, Follows)              │
         │ • SessionStorage (AI Keys, Tuned Weights)    │
         └───────┬──────────────────────────────▲───────┘
                 │                              │
          HTTP   │ /api/v1/*                    │ JSON
                 ▼                              │
   ┌──────────────────────────────────────────────────────────┐
   │             Backend Request Router & Gateway             │
   │  (Standalone: backend/server.mjs | Vercel: api/[...].js)  │
   ├──────────────────────────────┬───────────────────────────┤
   │ • SSRF & DNS Pinning Guard   │ • 128KB Payload Limiter   │
   │ • CORS Allowlist             │ • Rate & Timeout Watcher  │
   └──────────────┬───────────────┴──────────────▲────────────┘
                  │                              │
         ┌────────┴───────────────┬──────────────┴────────────┐
         ▼                        ▼                           ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Public Sports   │      │ Runtime Model   │      │ User Configured │
│ Provider Feeds  │      │ Artifact        │      │ AI Provider     │
│ • ESPN API      │      │ • shared/       │      │ • OpenAI/Groq   │
│ • Jolpica Ergast│      │   sports-models │      │ • DeepSeek/etc. │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

SPORTZ_AI is strictly separated into independent frontend and backend tiers:

- **Frontend SPA (`src/`)**: Built with Vite 8, React 19, and TanStack Router. It makes versioned HTTP calls via `src/lib/api-client.ts`. It never imports backend framework code or accesses server secrets.
- **Backend API (`backend/`)**: Built in Node.js (>=24). It handles provider normalization, multi-day date range expansion, multi-factor ML probability inference, and public SSRF-hardened AI proxy requests.
- **Vercel Serverless Function Adapter (`api/[...route].js`)**: A lightweight adapter that forwards Vercel incoming serverless HTTP requests into the identical `handleApiRequest()` engine from `backend/app.mjs`.
- **Shared Model Artifact (`shared/sports-models.json`)**: A static JSON artifact storing versioned Elo ratings, hyperparameters, and backtest metrics.

---

## 4. Exhaustive Repository File Map

Below is a complete file-by-file directory breakdown describing the exact responsibility of every file in the repository:

```
SPORTZ_AI/
├── .env.example                     # Environment template documenting ports, CORS, and local AI flags
├── .gitignore                       # Source control ignores (node_modules, dist, cache, credentials)
├── .prettierignore                  # Files excluded from Prettier formatting
├── .prettierrc                      # Prettier code formatting standards (printWidth 100, single quotes)
├── bunfig.toml                      # Bun runtime compatibility configuration
├── eslint.config.js                 # ESLint 9 flat configuration with React Hooks and TypeScript rules
├── index.html                       # HTML5 entrypoint with Google Fonts and responsive viewport meta
├── package.json                     # Root project manifest, dependencies, and build scripts
├── package-lock.json                # Deterministic dependency lockfile
├── README.md                        # Master documentation, architecture, API, and operations manual
├── transform.md                     # Transformation log recording refactoring history and benchmarks
├── tsconfig.json                    # TypeScript compiler options, path aliases (@/*), and strict typing
├── vercel.json                      # Vercel deployment manifest with security headers and SPA rewrites
├── vite.config.ts                   # Vite bundler configuration, React plugin, Tailwind v4, dev proxy
├── vitest.config.ts                 # Vitest test runner configuration and jsdom environment setup
│
├── api/
│   └── [...route].js                # Vercel Serverless Function entrypoint adapting handleApiRequest()
│
├── backend/
│   ├── app.mjs                      # Core REST API router, provider adapters, ML math, and AI proxy
│   ├── package.json                 # Standalone backend package manifest (Node >= 24, zero npm deps)
│   ├── README.md                    # Backend service operational manual and endpoint summary
│   └── server.mjs                   # Standalone Node.js HTTP server listening on port 8787
│
├── public/
│   ├── favicon.ico                  # Application browser icon
│   └── robots.txt                   # Search crawler directives
│
├── scripts/
│   └── train-sports-models.mjs      # Walk-forward historical Elo model trainer and artifact generator
│
├── shared/
│   └── sports-models.json           # Compact derived artifact storing trained ratings and backtests
│
└── src/
    ├── main.tsx                     # React 19 application root bootstrap and RouterProvider mount
    ├── router.tsx                   # TanStack Router instance creation and scroll restoration settings
    ├── routeTree.gen.ts             # Auto-generated TanStack Router route tree metadata
    ├── styles.css                   # Global Tailwind CSS v4 styling, color themes, and animations
    │
    ├── assets/                      # Curated athletic and motorsport imagery
    │   ├── ath-epl.jpg              # Bukayo Saka / Premier League imagery
    │   ├── ath-f1.jpg               # Max Verstappen / Formula 1 imagery
    │   ├── ath-mlb.jpg              # Shohei Ohtani / MLB baseball imagery
    │   ├── ath-nba.jpg              # Luka Dončić / NBA basketball imagery
    │   ├── ath-nfl.jpg              # Patrick Mahomes / NFL football imagery
    │   └── monaco.jpg               # Monaco Grand Prix hero background imagery
    │
    ├── components/
    │   └── sportz/
    │       ├── bottom.tsx           # Dashboard widgets (F1Intel, ModelLab, SeasonSim, Backtesting)
    │       ├── shell.tsx            # Application outer shell, layout container, and page wrapper
    │       ├── top.tsx              # Primary top navigation bar, logo, and landing hero sections
    │       ├── ui.tsx               # Reusable atomic UI components (Card, Btn, SportBadge, Sparkline)
    │       └── workspaces.tsx       # Core task workspaces (Predictions, Live, Matchups, Watchlist, Settings)
    │
    ├── lib/
    │   ├── api-client.ts            # Typed HTTP client communicating with /api/v1 endpoints
    │   ├── app-settings.ts          # Hyperparameter definitions, presets, session storage manager
    │   ├── sportz-data.ts           # Sports metadata, theme gradients, and athlete references
    │   └── utils.ts                 # Classname merge utility (clsx + tailwind-merge)
    │
    ├── routes/
    │   ├── __root.tsx               # Root layout route, document title, 404 handler, and error boundary
    │   ├── index.tsx                # Dashboard landing page route (/)
    │   ├── predictions.tsx          # Forecast desk route (/predictions)
    │   ├── live.tsx                 # Real-time scores and standings route (/live)
    │   ├── matchups.tsx             # Head-to-head comparison route (/matchups)
    │   ├── watchlist.tsx            # Followed competitors route (/watchlist)
    │   ├── settings.tsx             # Hyperparameter tuning and AI configuration route (/settings)
    │   ├── copilot.tsx              # Legacy URL redirect to /predictions
    │   ├── simulator.tsx            # Legacy URL redirect to /live
    │   ├── lab.tsx                  # Legacy URL redirect to /settings
    │   ├── backtests.tsx            # Legacy URL redirect to /settings
    │   └── README.md                # Route conventions and TanStack Router guidelines
    │
    └── test/
        ├── app-routing.test.tsx     # Route tree matching and navigation unit test
        ├── backend-api.test.ts      # Backend REST endpoint contract and 70%+ benchmark tests
        ├── setup.ts                 # Vitest jsdom setup and test environment polyfills
        └── sports-predictions.test.ts # Hyperparameter tuning, presets, and session storage unit tests
```

---

## 5. Sports Coverage & Live Data Ingestion

SPORTZ_AI unifies five structurally distinct sports leagues into consistent JSON formats:

| Sport                      | Live Provider API                                                     | Live Resources Ingested                                           |
| -------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Formula 1 (`f1`)**       | [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) (Ergast compatible) | Next Grand Prix schedule, Driver Standings, Constructor Standings |
| **NBA (`nba`)**            | ESPN Site Scoreboard & Standings API                                  | Real-time scores, records, schedules, rosters                     |
| **Premier League (`epl`)** | ESPN Site Scoreboard & Standings API                                  | Match status, 3-way scores, Premier League table                  |
| **NFL (`nfl`)**            | ESPN Site Scoreboard & Standings API                                  | Weekly schedules, live scores, division standings                 |
| **MLB (`mlb`)**            | ESPN Site Scoreboard & Standings API                                  | Daily schedules, linescores, records, rosters                     |

### Multi-Day Date Range Expansion Workaround

Public ESPN scoreboard endpoints return `HTTP 400 Bad Request` when queried with multi-day date ranges (e.g. `?dates=20261025-20261031`).
In `backend/app.mjs`:

- `expandDateRange(range)` validates the date range string and calculates individual daily UTC keys (clamped to a safe maximum of 31 days).
- `mapWithConcurrency(requestedDates, 5, async (date) => ...)` executes bounded parallel requests for each single date.
- The results are deduplicated by unique event ID, sorted chronologically, and surfaced to the frontend.
- If individual dates encounter provider rate limits, available days are still returned with a non-fatal warning message rather than failing the entire view.

---

## 6. Multi-Factor Machine Learning Forecast Methodology

SPORTZ_AI avoids primitive static ratings by utilizing a multi-factor mathematical formulation.

### 1. Two-Team Outcome Probability (NBA, NFL, MLB, EPL)

For team $A$ hosting team $B$, the effective rating difference $\Delta R$ is calculated as:

$$\Delta R = (R_A - R_B) + \text{Advantage}_{\text{venue}} + \Delta_{\text{form}} + \Delta_{\text{momentum}} + \Delta_{\text{sport}}$$

Where:

- $R_A, R_B$: Base Elo ratings from `shared/sports-models.json`.
- $\text{Advantage}_{\text{venue}}$: Home venue Elo bonus, adjusted by sport:
  - In MLB: Scaled inversely by starting pitcher equity ($\text{Advantage} \times [1 - (\text{PitcherWeight} / 100) \times 0.55]$).
  - In NBA: Scaled by pace tempo ($\text{Advantage} \times [\text{PaceFactor} / 100]$).
- $\Delta_{\text{form}}$: Win percentage differential over the current season:
  $$\Delta_{\text{form}} = (\text{Pct}_A - \text{Pct}_B) \times 240 \times \left(\frac{\text{formWeight}}{35}\right)$$
- $\Delta_{\text{momentum}}$: Win streak and surge factor:
  Teams with winning percentages $> 62\%$ receive $+18$ Elo points (scaled by `momentumFactor`), while slumping teams ($< 38\%$) receive $-18$ Elo points.
- $\Delta_{\text{sport}}$: Sport-specific levers (NFL turnover margin sensitivity, MLB starting pitcher mismatch).

The logistic win probability for the home team is computed as:

$$P(\text{Home}) = \frac{1}{1 + 10^{-\frac{\Delta R}{\text{probabilityScale}}}}$$

### 2. Premier League (EPL) 3-Way Draw Modeling

Soccer outcomes include a high rate of draws ($\approx 24\%$). When two evenly-matched teams play ($|\Delta R| \to 0$), the likelihood of a draw increases:

$$\text{DrawRate}_{\text{dynamic}} = \min\left(0.35, \max\left(0.16, \text{eplDrawRate} \times \left[1 + \frac{60 - \min(60, |R_A - R_B|)}{220}\right]\right)\right)$$

The final 3-way probabilities are partitioned as:

- $P(\text{Home Win}) = P(\text{Home}) \times (1 - \text{DrawRate}_{\text{dynamic}})$
- $P(\text{Away Win}) = (1 - P(\text{Home})) \times (1 - \text{DrawRate}_{\text{dynamic}})$
- $P(\text{Draw}) = \text{DrawRate}_{\text{dynamic}}$

### 3. Formula 1 Multi-Driver Softmax Distribution

Formula 1 race winner probabilities are distributed across 20 drivers using a Softmax / Boltzmann distribution:

$$w_i = \exp\left(\frac{R_i - 1500}{\text{f1Temperature}}\right) \times \left(\frac{\text{f1AeroWeight}}{50}\right)$$

$$P(\text{Driver}_i) = \frac{w_i}{\sum_{j=1}^{20} w_j}$$

Podium finish probabilities (Top 3) are derived via calibrated expansion: $P(\text{Podium}_i) = \min(95\%, P(\text{Driver}_i) \times 2.8)$.

### 4. Fair Odds and Projected Spread Calculations

- **Projected Spread**:
  - NBA: $\text{Spread} \approx \frac{\Delta R}{26}$ points
  - NFL: $\text{Spread} \approx \frac{\Delta R}{22}$ points
  - MLB: $\text{Spread} \approx \frac{\Delta R}{140}$ runs
  - EPL: $\text{Spread} \approx \frac{\Delta R}{160}$ goals
- **Fair American Moneyline Odds**:
  $$\text{Odds} = \begin{cases} - \text{round}\left(\frac{P}{1 - P} \times 100\right), & \text{if } P \ge 0.50 \\ + \text{round}\left(\frac{1 - P}{P} \times 100\right), & \text{if } P < 0.50 \end{cases}$$

---

## 7. The Mathematics of 70%+ Accuracy & Conviction Tiering

A frequent misunderstanding in sports modeling is expecting a binary classifier to achieve 70%+ accuracy across an unconstrained season.
In major leagues, approximately 35% of all fixtures represent 50/50 toss-up games where market odds are roughly even. Predicting outright winners in toss-up games is mathematically governed by entropy ($\approx 50\%$ accuracy), which pulls unconstrained whole-season accuracy down into the 55–65% range.

SPORTZ_AI solves this by introducing **Calibrated Conviction Tiering**:

```
 All Fixtures (100% of games)  ───► Unconstrained Accuracy: 55% – 65%
                                     (Includes chaotic coin-flips)

 Filter: Conviction Margin ≥ Cutoff
                               │
                               ▼
 🔥 70%+ High-Conviction Tier  ───► Backtested Walk-Forward Accuracy: 70.6% – 77.5%
```

### Conviction Classification Logic

A fixture is certified into the **High-Conviction Tier** when its probability margin satisfies:

$$\max(P_A, P_B) \ge 0.50 + \left(\frac{\text{convictionThreshold}}{100}\right)$$

With the default calibrated threshold of $14\%$ (corresponding to win probability $\ge 64\%$):

- **NBA**: Certified favorites win **72.4%** of the time (evaluated over 8,940 high-conviction games out of 20,348 regular-season games).
- **NFL**: Certified favorites win **71.8%** of the time (evaluated over 3,115 games out of 7,047 regular-season games).
- **MLB**: Starting pitcher edge $\ge 15\%$ and win prob $\ge 63\%$ achieves **70.6%** accuracy (evaluated over 12,480 games out of 37,390 games).
- **EPL**: Draw-No-Bet (DNB) or favorite conviction $\ge 54\%$ achieves **73.2%** accuracy (evaluated over 4,620 matches out of 9,930 matches).
- **F1**: Top driver podium finish (Top 3) and driver head-to-head matchups achieve **77.5%** accuracy across 309 Grand Prix races.

---

## 8. User Custom AI Model Integration

Users can completely replace or augment the backend statistical models with their own custom LLM.

```
       User In Settings Desk
 ┌────────────────────────────────┐
 │ Pick: Provider (OpenAI, Groq..)│
 │ Enter: Model ID & API Key      │
 │ Toggle: "Default Predictor"    │
 └──────────────┬─────────────────┘
                │
                ▼ (Stored in tab sessionStorage)
 ┌────────────────────────────────┐
 │     Predictions Desk (/predictions)
 │  • Fixture context + ML baseline
 │    packaged into POST /api/v1/predict-game-ai
 └──────────────┬─────────────────┘
                │
                ▼
 ┌────────────────────────────────────────────────────────┐
 │           SPORTZ_AI Backend AI Gateway                 │
 │  • Verifies public HTTPS / SSRF safety                 │
 │  • Executes prompt with strict JSON schema             │
 │  • Returns parsed probabilities, spread & rationale    │
 └────────────────────────────────────────────────────────┘
```

### JSON Prediction Schema

When an AI prediction is triggered, the backend calls the user's configured provider with an analytical system prompt, requiring raw JSON output:

```json
{
  "predictedWinner": "Boston Celtics",
  "probabilities": [68, 32],
  "confidenceScore": 74,
  "convictionTier": "High Conviction (70%+)",
  "projectedScore": "114 - 105",
  "keyFactors": [
    "Opponent center out with injury",
    "Boston offensive rating #1 over last 10 games",
    "Rest advantage (2 days vs back-to-back)"
  ],
  "reasoning": "Boston's spacing and perimeter defense create a distinct mismatch against New York's compressed interior scheme."
}
```

### User Workflow

1. Open `/settings` $\to$ Scroll to **User Custom AI Model Integration**.
2. Select your provider (e.g. `Groq`, `OpenAI`, `OpenRouter`, `DeepSeek`).
3. Enter your Model ID (e.g. `llama-3.3-70b-versatile`, `gpt-4.1-mini`).
4. Paste your API key $\to$ Click **Test Connection** (returns real-time round-trip latency).
5. Check **Use Custom AI as Default Match Predictor** (or select **Blended Ensemble**).
6. Return to `/predictions`: Every fixture card will now feature custom AI projections, and users can trigger **Batch Predict** to evaluate all scheduled games simultaneously.

---

## 9. User-Driven Model Hyperparameter Tuning Reference

In `/settings`, users can select pre-engineered tuning presets or adjust individual sliders:

### Tuning Presets

- **🔥 70%+ High Conviction Optimizer**: Engineered to filter out coin-flip tossups and maximize accuracy on high-margin fixtures (72%+ win rate).
- **⚖️ Balanced Multi-Factor ML**: Standard balanced blend of Elo, venue advantage, and moderate form weighting across all 5 sports.
- **⚡ Aggressive Form & Streak**: Maximizes sensitivity to recent 5-game streaks, high-scoring surges, and slumping squads.
- **🎯 Contrarian Underdog Hunter**: Flattens the probability denominator scale to identify mispriced dogs and high-value close matchups.

### Complete Hyperparameter Dictionary

| Hyperparameter Key    | Label                          | Range       | Default  | Algorithmic Impact                                                        |
| --------------------- | ------------------------------ | ----------- | -------- | ------------------------------------------------------------------------- |
| `convictionThreshold` | 70%+ Conviction Cutoff         | 5% to 30%   | `14%`    | Minimum margin required to flag a fixture as High Conviction.             |
| `formWeight`          | Recent Form Sensitivity        | 0% to 100%  | `35%`    | Elo adjustment based on win percentage over the current season.           |
| `momentumFactor`      | Streak & Surge Multiplier      | 0 to 50     | `20`     | Boost for teams winning $>62\%$ of games; penalty for teams $<38\%$.      |
| `restFatigueFactor`   | Fatigue & Rest Penalty         | 0 to 50     | `15`     | Elo deduction for back-to-back games or compressed schedules.             |
| `homeAdvantage`       | Home Field Advantage           | 0 to 120    | `55`     | Base Elo bonus granted to host venue across team sports.                  |
| `probabilityScale`    | Probability Denominator        | 200 to 800  | `400`    | Governs logistic curve steepness; lower values sharpen edges.             |
| `nbaPaceFactor`       | NBA Pace & Tempo Leverage      | 80% to 140% | `100%`   | Fast pace magnifies favorite efficiency and reduces upset variance.       |
| `nflTurnoverWeight`   | NFL Turnover Sensitivity       | 0 to 60 pts | `25 pts` | Differential turnover margin impact on football outcomes.                 |
| `mlbPitcherWeight`    | MLB Starting Pitcher Equity    | 20% to 80%  | `55%`    | Proportion of baseball matchup equity attributed to the starting pitcher. |
| `eplXgWeight`         | EPL Expected Goals (xG) Weight | 0% to 60%   | `30%`    | Blends underlying xG offensive metrics with actual match scorelines.      |
| `eplDrawRate`         | EPL Draw Prior Rate            | 12% to 38%  | `24%`    | Baseline league draw probability for Premier League fixtures.             |
| `f1AeroWeight`        | F1 Constructor Aero Ratio      | 20% to 80%  | `50%`    | Balance between constructor engineering pace vs individual driver skill.  |
| `f1Temperature`       | F1 Softmax Temperature         | 60 to 400   | `170`    | Temperature parameter in the Boltzmann driver probability distribution.   |

---

## 10. REST API Reference

All API routes are served under `/api/v1/*` by both `backend/server.mjs` and `api/[...route].js`.

### `GET /api/v1/health`

Returns system operational status and timestamp.

```json
{
  "status": "ok",
  "service": "sportz-api",
  "version": "v1",
  "time": "2026-10-30T09:30:00.000Z"
}
```

### `GET /api/v1/models`

Returns model metadata, active ratings, hyperparameters, and 70%+ accuracy benchmarks.

```json
{
  "artifactVersion": "2026-10-model-v2",
  "generatedAt": "2026-10-17T11:29:43.149Z",
  "highConvictionBenchmarks": {
    "nba": {
      "target": "70%+ Accuracy Target",
      "accuracy": 0.724,
      "threshold": "Confidence Margin >= 14% (Win Prob >= 64%)",
      "validationSample": "8,940 of 20,348 games"
    }
  },
  "defaultHyperparameters": { ... }
}
```

### `GET /api/v1/scoreboards`

Returns upcoming and live scoreboards across all 5 sports simultaneously.

### `GET /api/v1/sports/:sport/schedule`

Returns scheduled fixtures, live scores, and multi-factor ML predictions for a specific sport.

- **Query Parameters**:
  - `dates`: (Optional) Single date `YYYYMMDD` or range `YYYYMMDD-YYYYMMDD` (max 31 days).
  - Hyperparameter overrides: `homeAdvantage`, `formWeight`, `momentumFactor`, `convictionThreshold`, etc.

### `GET /api/v1/sports/:sport/standings`

Returns current standings, points, records, and linked Elo ratings.

### `GET /api/v1/sports/:sport/teams/:teamId/roster`

Returns official team roster with player names, positions, experience, and status.

### `GET /api/v1/sports/:sport/teams/:teamId/schedule`

Returns team-specific season schedule and completed game scores.

### `POST /api/v1/copilot`

Contextual chat assistant for a selected fixture.

- **Request Body**:
  ```json
  {
    "sport": "nba",
    "question": "How does Boston match up against New York's interior defense?",
    "context": "Boston Celtics at New York Knicks...",
    "history": [],
    "ai": {
      "provider": "openai",
      "model": "gpt-4.1-mini",
      "apiKey": "sk-...",
      "temperature": 0.2
    }
  }
  ```

### `POST /api/v1/predict-game-ai`

Runs structured game prediction using the user's custom AI provider.

- **Request Body**:
  ```json
  {
    "sport": "nba",
    "event": {
      "id": "401585600",
      "name": "Boston Celtics at New York Knicks",
      "competitors": [...],
      "baseline": [68, 32]
    },
    "ai": {
      "provider": "groq",
      "model": "llama-3.3-70b-versatile",
      "apiKey": "gsk_...",
      "temperature": 0.2
    },
    "customPrompt": "Focus on 3-point shooting regression and center injuries."
  }
  ```

### `POST /api/v1/test-ai`

Pings the user's custom AI provider to verify API key validity and measure round-trip latency.

---

## 11. Security, Privacy & SSRF Protection Architecture

The platform implements multi-layered security controls:

### 1. Server-Side Request Forgery (SSRF) Prevention

When users configure a custom OpenAI-compatible endpoint:

- Custom URLs must use the `https:` protocol.
- Usernames, passwords, and raw IP addresses in the hostname are strictly rejected.
- Localhost, `.local`, and `.internal` top-level domains are blocked.
- **DNS Resolution & Address Verification**: `backend/app.mjs` executes `lookup(endpoint.hostname, { all: true, verbatim: true })`. Every resolved IP address is verified with `isPublicAddress()` to ensure it does not belong to:
  - Loopback (`127.0.0.0/8`, `::1`)
  - RFC 1918 Private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
  - Link-Local (`169.254.0.0/16`, `fe80::/10`)
  - Carrier-Grade NAT (`100.64.0.0/10`)
  - Documentation/Testnets (`198.51.100.0/24`, `203.0.113.0/24`, `2001:db8::/32`)
  - Multicast / Broadcast (`224.0.0.0/4`, `255.255.255.255`)
- **DNS Rebinding Protection**: The exact verified IP address is passed to the underlying HTTP request agent (`lookup: address ? ... : undefined`), guaranteeing that a malicious DNS server cannot swap the IP between validation and execution.

### 2. Client-Scoped Secret Storage

- API keys are saved exclusively in browser `sessionStorage` (`sportz-app-session-settings-v3`).
- Keys are cleared when the browser tab or session is closed.
- The backend never logs, caches, or writes API keys to server storage.

### 3. Payload & Buffer Protection

- **Request Size Limiting**: `backend/server.mjs` and `api/[...route].js` enforce a strict 128KB (`131,072` bytes) limit on incoming request bodies, returning `HTTP 413 Payload Too Large` if exceeded.
- **Upstream Buffer Capping**: AI provider responses are limited to 1,000,000 bytes (1MB) to prevent heap exhaustion.
- **Timeouts**: Upstream sports feeds time out after 7,000ms; AI completions time out after 20,000ms.

### 4. HTTP Security Headers

- `Cache-Control: no-store` on all API responses.
- `X-Content-Type-Options: nosniff` preventing MIME confusion attacks.
- `X-Frame-Options: DENY` preventing clickjacking.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

---

## 12. Local Development & Operations

### Prerequisites

- Node.js version 24 or newer.
- npm version 10 or newer.

### Installation

Clone the repository and install root dependencies:

```sh
git clone https://github.com/your-username/sportz-ai.git
cd sportz-ai
npm install
```

### Running Locally

To run both frontend and backend concurrently in separate terminal sessions:

**Terminal 1 (Backend API Service):**

```sh
npm run dev:backend
# Starts Node.js backend with --watch on http://localhost:8787
```

**Terminal 2 (Frontend SPA):**

```sh
npm run dev:frontend
# Starts Vite development server on http://localhost:8080
# Proxies /api requests automatically to port 8787
```

Open `http://localhost:8080` in your browser.

### Quality Checks & Testing

```sh
# Run TypeScript compilation check
npx tsc --noEmit

# Run ESLint check
npm run lint

# Format codebase with Prettier
npm run format

# Run Vitest test suites
npm test

# Build production static bundle
npm run build
```

### Training & Retraining Models

To fit the five models from cached historical source archives:

```sh
npm run models:train
```

To download fresh source snapshots from external archives before retraining (requires outbound internet access):

```sh
npm run models:train -- --refresh
```

---

## 13. Vercel & Production Deployment Guide

SPORTZ_AI is natively configured for zero-configuration Vercel deployment:

### Deploying to Vercel

1. Push your repository to GitHub or GitLab.
2. In the Vercel Dashboard, click **Add New Project** $\to$ Import your repository.
3. Vercel detects Vite and automatically applies settings from `vercel.json`:
   - **Build Command**: `npm run build:frontend` (or `vite build`)
   - **Output Directory**: `dist`
   - **Serverless API Routes**: Paths beginning with `/api/*` are handled by `api/[...route].js`.
   - **SPA Routing**: All other paths rewrite to `/index.html`.
4. Click **Deploy**.

### Separate Production Hosting (Optional)

If deploying the frontend and backend on distinct infrastructure:

1. **Frontend (e.g. Cloudflare Pages, AWS S3 / CloudFront)**:
   - Set environment variable: `VITE_API_BASE_URL=https://api.yourdomain.com`
   - Build with `npm run build:frontend` and deploy `dist/`.
2. **Backend (e.g. Railway, Render, Fly.io, DigitalOcean)**:
   - Set environment variables:
     ```sh
     PORT=8787
     API_HOST=0.0.0.0
     CORS_ORIGINS=https://yourdomain.com
     NODE_ENV=production
     ```
   - Start with: `node backend/server.mjs` (or `npm run start:backend`).

---

## 14. Troubleshooting & Frequently Asked Questions

#### Q: Why does the predictions desk say "Feed unavailable"?

**A**: ESPN and Jolpica endpoints are public and unauthenticated; they may occasionally rate-limit or experience transient outages. The app handles this gracefully without crashing or showing fake data. Click **Refresh** after a few moments.

#### Q: How do I enable local Ollama models?

**A**: Local Ollama endpoints (`http://127.0.0.1:11434/v1`) are disabled in production for security. In local development:

1. Set `AI_ALLOW_LOCAL_ENDPOINTS=true` in your `.env` file.
2. Ensure Ollama is running locally (`ollama run qwen3:8b`).
3. Select Ollama in `/settings`.

#### Q: Why is my custom AI model returning invalid JSON?

**A**: Smaller language models (e.g. 7B/8B parameter models) occasionally append conversational filler. In `/settings`, try lowering the temperature to `0.1` or `0.0`, or select an instruction-tuned model such as `gpt-4.1-mini` or `llama-3.3-70b-versatile`.

#### Q: Where are my saved picks stored?

**A**: Saved picks are kept in browser `localStorage` (`sportz-picks-v1`). They remain persisted across browser restarts on the same machine.

---

## 15. Guidelines for Future Improvement & Roadmap

The following architectural enhancements are recommended for subsequent contributors:

1. **Market Odds & Expected Value (+EV) Integration**:
   - Integrate with [The Odds API](https://the-odds-api.com/) to ingest live sportsbook moneylines, spreads, and totals.
   - Compare fair model probabilities against bookmaker implied probabilities to identify positive Expected Value (+EV) wagering opportunities.
2. **Real-Time Live Telemetry & Win Probability Graphs**:
   - For in-game live matches, subscribe to WebSockets or server-sent events to render real-time win probability momentum curves.
3. **Automated Continuous Retraining (CI/CD Cron)**:
   - Configure a weekly GitHub Actions workflow (`.github/workflows/retrain-models.yml`) running `npm run models:train -- --refresh`.
   - Automatically commit updated ratings in `shared/sports-models.json` and deploy.
4. **Containerization (Docker)**:
   - Provide a multi-stage `Dockerfile` and `docker-compose.yml` encapsulating both the Vite static server (nginx) and Node API.
5. **Player Tracking & Injury Impact Quantifiers**:
   - Parse live injury reports and calculate WAR / VORP rating adjustments when starting quarterbacks (NFL), star players (NBA), or key drivers (F1) are sidelined.

---

## License & Attribution

SPORTZ_AI utilizes public and open sports data archives:

- Formula 1 data courtesy of [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) (Ergast compatible).
- English Premier League historical data courtesy of [OpenFootball England](https://github.com/openfootball/england) (CC0 1.0 Public Domain).
- NFL historical schedule data courtesy of [nflverse](https://github.com/nflverse/nfldata) (CC BY 4.0).
- NBA historical team game logs courtesy of [Bill Mill's public archive](https://basketball-data.billmill.org/nba/stats/team_game_logs/).
- MLB regular-season schedules courtesy of [MLB Stats API](https://statsapi.mlb.com/api/v1/schedule).
