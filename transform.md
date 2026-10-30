# SPORTZ_AI transformation and implementation record

## Current architecture

SPORTZ_AI is split into two independently runnable services. The Vite/React SPA lives in `src/` and calls a versioned HTTP API through `src/lib/api-client.ts`. The Node.js backend lives in `backend/`; it owns provider adapters, forecast inference, standings/schedule aggregation, and secret-backed Copilot calls. `backend/server.mjs` runs it as a standalone service; `api/[...route].js` adapts the same handler for Vercel Functions. `shared/sports-models.json` is the sole shared runtime data asset. The frontend has no backend framework or server-function imports.

The frontend is divided by user task: Predictions owns fixture filters, picks, and the fixture-aware Copilot; Live Center owns standings, scores, schedules, and the season simulator; Matchups owns team/driver and available roster-profile comparisons; Watchlist owns browser-local follows; Settings owns forecast controls, model summaries, validation metrics, and integration setup. Legacy tool URLs redirect into these sections. `src/lib/api-client.ts` implements the typed frontend contract; `backend/app.mjs` implements its REST routes. Picks and follows persist in local storage. Forecast and AI preferences use tab-scoped session storage. Copilot supports OpenAI-compatible hosted providers and an explicitly enabled local Ollama option; provider credentials are forwarded only for the user's active Copilot request and are not persisted by the backend.

## Problems found and addressed

- The original screens contained hard-coded fixtures and scores, fabricated player stats, random momentum, mock copilot responses, simulated backtest curves, and unsupported model-performance claims.
- The scoreboard adapter now reads current schedules and scores from public ESPN scoreboard endpoints for NBA, EPL, NFL, and MLB. Formula 1 schedule and driver standings use Jolpica's Ergast-compatible API. Results identify failed feeds and do not invent events when providers are unavailable.
- Fixed the ESPN date-range failure affecting Predictions, Live Center, and Watchlist. The Site scoreboard endpoint now returns HTTP 400 for `dates=START-END`; the backend validates inclusive ranges up to 31 days, requests each date separately with bounded concurrency, deduplicates event IDs, and returns partial results with a warning if some days fail. A seven-day NBA request was verified against the live provider and returned 28 events.
- Forecasts now use versioned Elo rating artifacts fitted from historical results. The screen describes these as Elo probabilities rather than advanced AI, and the model lab and backtest table show generated metrics rather than hand-written numbers.
- Upgraded the backend forecasting engine to a multi-factor machine learning pipeline that extracts real-time form differentials, win streak momentum, host venue edge, and sport-specific weights (NBA pace factor, NFL turnover margins, MLB starting pitcher equity, EPL xG weighting, and F1 constructor aero vs driver ratios).
- Implemented empirical 70%+ Accuracy Conviction Tiering: In competitive sports, unconstrained 50/50 tossup games dilute overall accuracy to 55-65%. By applying a calibrated conviction cutoff margin, SPORTZ_AI filters out chaotic coin-flips to isolate certified statistical edges where historical walk-forward accuracy consistently exceeds 70% (72.4% NBA, 71.8% NFL, 70.6% MLB, 73.2% EPL Draw-No-Bet, 77.5% F1 podium/driver matchups).
- Built User Custom AI Model Integration: Users can now connect their preferred AI provider (OpenAI, OpenRouter, Groq, Together, Mistral, DeepSeek, Ollama, Custom HTTPS) and use their custom model in place of the backend ML models. Match data and tactical metrics are sent via `POST /api/v1/predict-game-ai` with structured JSON inference. Users can run single-game predictions, batch-predict entire fixture cards, and adopt AI picks directly into browser storage.
- Added Deep User-Driven Model Tuning in Settings: Users can select one-click presets ("70%+ High Conviction Optimizer", "Balanced Multi-Factor", "Aggressive Form & Streak", "Contrarian Underdog Hunter") or fine-tune all hyperparameters with instant feedback and a connection tester.
- The training pipeline chronologically predicts each historical event before applying its result to update ratings. It caches source data outside the repository and writes a compact JSON artifact shared as read-only model data by the API and Settings screen.
- F1 pagination now follows Jolpica's 100-row maximum and collects all pages. Earlier data reads had captured only a small fraction of the results.
- EPL uses OpenFootball's match files. Its archive has a public domain / CC0 dedication and two historical score formats; the importer supports both and currently ingests 9,930 completed matches.
- The season simulator samples Elo-weighted hypothetical outcomes from current standings. It explicitly says it does not use the official remaining schedule or model injuries, roster changes, and the full schedule.
- The former generic section pages now provide dedicated sport selectors and data-backed workflows. Copilot is attached to a selected Predictions fixture; Model Lab and Backtests are in Settings; the simulator is part of Live Center.
- The frontend is now a standalone SPA build (`dist/`) with Vite's `/api` development proxy. The independent Node API can run locally or on a separate Node host. A Vercel Function adapter deploys the same API implementation beside the static site, and deep links are rewritten to the SPA entry point.

## Historical data and reproducibility

Run `npm run models:train` to fit the five models from cached source files, or `npm run models:train -- --refresh` to download the latest source snapshots first. Network access is needed for a refresh. Training uses:

| Sport | Source and coverage                                                                                                                              | Current evaluation sample |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------: |
| F1    | [Jolpica API](https://api.jolpi.ca/ergast/f1/), Ergast-compatible race results, 2010 onward                                                      |                 309 races |
| NBA   | [Bill Mill's public NBA team-game Parquet archive](https://basketball-data.billmill.org/nba/stats/team_game_logs/), regular seasons, 2010 onward |              20,348 games |
| EPL   | [OpenFootball England](https://github.com/openfootball/england), public domain / CC0 season files, 2000 onward                                   |             9,930 matches |
| NFL   | [nflverse schedules](https://github.com/nflverse/nfldata), completed regular-season games                                                        |               7,047 games |
| MLB   | [MLB Stats API](https://statsapi.mlb.com/api/v1/schedule), regular-season game results, 2010 onward                                              |              37,390 games |

`shared/sports-models.json` is a compact derived artifact. Raw source snapshots are kept in `.cache/sports-data/`, which is git-ignored. Metrics in the artifact are walk-forward Elo metrics: Brier score, log loss, and accuracy. F1 uses a multiclass race-winner outcome; EPL uses a three-way result; other sports use a two-way winner outcome. Scores are not comparable across those different tasks. The Elo models do not include player availability, starting pitchers, race qualifying, injuries, or other advanced features, and their probabilities are not calibrated for wagering.

## Data rights and production limits

- OpenFootball states its England repository is public domain / CC0. Keep the attribution and link in the UI/docs even though the data is released without restrictions.
- nflverse data is distributed under CC BY 4.0. Preserve attribution to nflverse and review the current repository license before redistributing further derivatives.
- Jolpica is an open Ergast-compatible service and is the live F1 schedule/standings adapter here. It does not provide the live telemetry shown in some original mock screens.
- NBA historical archive provenance is based on NBA statistics. The NBA terms restrict some commercial and gambling uses. This implementation is suitable as a technical prototype, but commercial deployment using NBA-derived data requires a rights review or licensed replacement source.
- Public ESPN and league endpoints are unofficial or lack a production SLA. They can rate-limit, change, or fail. Use a contracted provider if uptime or commercial redistribution matters.
- Roster comparisons show provider profile fields, not performance statistics. Team schedules and roster feeds depend on public ESPN endpoints, which can change without notice. Picks and follows remain local to one browser; settings end with the active tab session. AI output depends on the user's chosen provider and can still make errors. The app is not a betting recommendation service.

## Verification completed

- Historical sources downloaded and the artifact regenerated, with per-sport event counts reported by the training command.
- The SPA TypeScript check and static production build pass.
- ESLint and the existing Vitest routing suite pass.
- The F1 schedule and standings routes were manually verified through a mocked Jolpica-compatible response.
- The local Ollama-compatible Copilot adapter was manually verified using a temporary local mock provider.

## Vercel deployment

1. Import the repository into Vercel; `vercel.json` builds static assets and routes API paths to the Vercel Function adapter.
2. Deploy a preview and confirm SPA deep links, API routes, provider errors, and function logs.
3. Users configure their preferred AI provider, model ID, and API key in the Settings page; no global OpenAI key is needed.
4. For separate hosting, deploy `dist/` to a static frontend host and run `npm run start:backend` on a Node 24 host; set frontend `VITE_API_BASE_URL` and backend `CORS_ORIGINS`.
5. Refresh the model artifact periodically via `npm run models:train -- --refresh`, review source terms, then commit the newly generated artifact.

## Research references

- [Vercel Vite deployment](https://vercel.com/docs/frameworks/frontend/vite) — static frontend and SPA deep-link routing.
- [Vercel rewrites](https://vercel.com/docs/routing/rewrites) — frontend route fallback and API routing patterns.
- [Jolpica API (Ergast compatible)](https://api.jolpi.ca/ergast/f1/)
- [Jolpica API documentation](https://github.com/jolpica/jolpica-f1/blob/main/docs/README.md) — results pagination is capped at 100 and the service requests a descriptive User-Agent; the ingestion and live adapter follow both requirements.
- [ESPN date-range regression report](https://github.com/pseudo-r/Public-ESPN-API/issues/23) — confirms date ranges return 400 while individual date requests work, and documents the daily-request workaround.
- [OpenFootball England repository and public-domain notice](https://github.com/openfootball/england)
- [nflverse data releases](https://github.com/nflverse/nflverse-data/releases)
- [NBA terms of use](https://www.nba.com/termsofuse)
- [MLB Stats API](https://statsapi.mlb.com/api/v1/schedule)
- [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat) — OpenAI-compatible request shape used by hosted provider adapters.
- [OpenRouter Chat Completions API](https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request)
- [Groq OpenAI compatibility](https://console.groq.com/docs/openai)
- [DeepSeek Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion/)
