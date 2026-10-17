# SPORTZ_AI

SPORTZ_AI is a sports data, forecasting, and analysis application.

It covers Formula 1, NBA, the English Premier League, NFL, and MLB.

The platform contains a browser frontend and an independent Node.js API backend.

The frontend and backend can be developed and hosted separately.

On Vercel, the same backend handler is exposed as serverless API functions.

This guide is the main operating, development, deployment, and maintenance manual.

It is intentionally detailed so a new maintainer can work without relying on prior chat history.

## Table of contents

1. [Project goals](#project-goals)
2. [System architecture](#system-architecture)
3. [Feature map](#feature-map)
4. [Technology and runtime requirements](#technology-and-runtime-requirements)
5. [Quick start](#quick-start)
6. [Running the applications separately](#running-the-applications-separately)
7. [Configuration reference](#configuration-reference)
8. [AI provider setup](#ai-provider-setup)
9. [Session and browser storage](#session-and-browser-storage)
10. [API reference](#api-reference)
11. [Sports data providers](#sports-data-providers)
12. [Forecast methodology](#forecast-methodology)
13. [Training and updating the model artifact](#training-and-updating-the-model-artifact)
14. [Vercel deployment](#vercel-deployment)
15. [Security and privacy](#security-and-privacy)
16. [Quality checks](#quality-checks)
17. [Troubleshooting](#troubleshooting)
18. [Repository map](#repository-map)
19. [Maintenance workflow](#maintenance-workflow)
20. [Known limitations](#known-limitations)
21. [Glossary](#glossary)

## Project goals

The app aims to make sports schedules, results, tables, and forecasts easier to inspect.

It offers one interface for five sports with different season structures and data shapes.

Each sports forecast is exposed as an estimate with a named data source and model artifact.

Users can select fixtures, inspect forecast probabilities, and save picks locally.

Users can compare teams or drivers using current provider standings.

Users can configure forecast controls without editing source code.

Users can choose a language model for the contextual Prediction Copilot.

AI credentials and app settings are scoped to the active browser tab session.

The application must state when a provider, model, roster, or event is unavailable.

The UI should not invent injuries, lineup changes, player statistics, or live events.

The application is an analysis product, not a sportsbook.

Forecast probabilities are not guarantees or betting instructions.

### Product principles

Provider data and historical model data have separate responsibilities.

Current schedules come from live public provider APIs.

Historical ratings come from the versioned model artifact in `shared/`.

The browser never downloads historical training archives to render ordinary pages.

The browser communicates with the backend through a small versioned HTTP API.

The backend owns external provider requests and model inference.

The model artifact is checked into source control for reproducible deployments.

User-specific AI configuration is never stored in backend files or a database.

The app remains usable for sports data when no AI provider is configured.

### Intended audience

The repository is suitable for product developers, data engineers, and sports analytics contributors.

It is useful as a personal analysis tool or an exploratory public web application.

Public data availability and licensing must be reviewed before commercial use.

The current project does not provide an authenticated user account system.

The current project does not synchronize browser picks between devices.

The current project does not provide sportsbook odds or a wagering workflow.

## System architecture

The user interface is a React single-page application.

Vite builds that frontend into static files in `dist/`.

TanStack Router maps URLs to files in `src/routes/`.

The frontend calls the API using relative `/api/v1/...` URLs by default.

During local development Vite proxies `/api` to `http://localhost:8787`.

In production Vercel routes `/api/*` to the catch-all function in `api/`.

The Vercel function imports the same handler used by the separate backend server.

The API handler lives in `backend/app.mjs`.

The separate Node server lives in `backend/server.mjs`.

The API reads the committed model artifact at `shared/sports-models.json`.

The training program writes a new model artifact at that same path.

The front and back ends share types only where explicitly imported by frontend code.

The backend is plain JavaScript modules and Node built-ins.

The backend has no npm runtime dependencies.

### Request flow

1. A user opens a page such as `/predictions`.

2. TanStack Router selects the matching route file.

3. A workspace component loads browser settings and relevant page state.

4. `src/lib/api-client.ts` sends a request to `/api/v1/...`.

5. Vite forwards the request locally, or Vercel invokes `api/[...route].js`.

6. The adapter converts the host request to the standard Fetch API `Request` object.

7. `backend/app.mjs` validates the path and request parameters.

8. The backend fetches the selected upstream sports provider.

9. The backend normalizes provider data to SPORTZ_AI response objects.

10. The backend reads Elo ratings from the shared artifact.

11. The API returns no-store JSON to the frontend.

12. The React workspace renders the normalized values and errors.

### Deployment shapes

The frontend can be deployed to any static hosting provider.

The backend can run on any Node.js service that supports outbound HTTPS.

Frontend and backend can use separate domains.

When hosted separately, set `VITE_API_BASE_URL` at frontend build time.

The API must allow the frontend origin through `CORS_ORIGINS`.

When deployed on Vercel, frontend and API share a host by default.

Same-origin Vercel requests do not need a custom API base URL.

The Vercel deployment uses Node.js 24 for the API runtime.

The repository includes both local server and Vercel adapter entry points.

## Feature map

### Home

The home page introduces the five supported sports.

It includes a hero panel and selected sport cards.

It shows provider scoreboard summaries when data is available.

It explains the forecast method and model caveats.

It provides F1 and player information panels.

It includes model, backtest, simulator, data trust, and watchlist summaries.

Some home panels are explanatory or curated presentation content.

The home page is not the API contract or source of truth for fixtures.

### Predictions

The Predictions workspace selects one of the five sports.

It loads provider fixtures for a selected date window.

The date choices include this week, weekdays, this weekend, and next week.

Each forecastable fixture has an explicit Run prediction action.

Run prediction requests that fixture's date from the backend again.

Successful runs show the backend forecast distribution and model artifact label.

The F1 analysis is a multi-driver outcome distribution.

The F1 top-two gap is not a head-to-head win probability.

The EPL output includes a draw probability.

Users can save a selected outcome in browser local storage.

Users can select a fixture as context for the Prediction Copilot.

The Copilot is available when a compatible model is configured in Settings.

### Live Center

The Live Center selects a sport and loads provider standings.

It displays provider-derived league or driver table rows.

It groups recent events into latest results, live games, and upcoming fixtures.

The page refreshes on the interval configured in Settings.

The selected sport determines which provider is queried.

The season simulator estimates table outcomes by repeated stochastic runs.

The simulator is an illustrative projection, not a bookmaker model.

The simulator runs in the browser and uses current standings and Elo ratings.

### Matchups

The Matchups workspace selects a sport and two teams or two drivers.

It shows the selected rows from the current league table.

It displays played events, record, points, and rating when supplied by the provider.

It can load recent head-to-head schedule events for supported team sports.

It can load and compare player roster profiles where the provider supports rosters.

Its Run matchup analysis action uses the currently returned Elo ratings.

The matchup probability is pairwise and assumes a neutral venue.

It does not model player availability or lineup changes.

F1 pairwise comparisons use driver ratings from the same standings endpoint.

### Watchlist

The Watchlist workspace lets users follow provider teams and drivers.

Follows are stored in the browser and are not tied to a user account.

The page loads schedules for sports represented in the watchlist.

Matching fixtures can run a forecast and show the outcome visualization.

Users can save a pick from a followed fixture.

The home page shows a summary of the same provider-ID watchlist.

The Watchlist workspace is the place to add and remove provider IDs.

### Settings

Settings include home advantage, Elo probability scale, EPL draw prior, and F1 temperature.

Settings include provider refresh interval and default simulator iteration count.

Settings include whether the UI displays Elo values.

Settings include AI provider, endpoint, model ID, API key, temperature, and output limit.

Settings are stored in the current tab session, not permanent local storage.

The AI configuration is sent only with a Copilot request.

The AI key is not a shared platform secret.

The AI key is not stored in the backend or a remote database.

### Model Lab and Backtests

Model Lab and Backtests are presented under Settings.

The pages display artifact version and generated timestamp.

The pages display metrics recorded by the training script.

The displayed metrics are artifact values, not a live training run.

To update metrics, train and review a new artifact before committing it.

## Technology and runtime requirements

Use Node.js 24 or a compatible later release for the backend.

Use Node.js 24 for the frontend toolchain for a single supported runtime.

Use npm 10 or a compatible later npm release.

Use Git for version control and deployment.

The app is tested against modern evergreen browsers.

The app needs a browser with Fetch, ES modules, and session storage.

Provider-backed pages require outbound internet access from the backend.

The frontend can be served statically after the Vite build.

The backend requires outbound HTTPS to data providers and selected AI providers.

The backend does not use a database.

The backend does not use a Redis cache.

The backend does not require Supabase.

### Main runtime libraries

React renders components and manages page state.

TanStack Router provides file-based client routing.

Vite serves local frontend development and bundles production assets.

Tailwind CSS v4 provides utility styling.

Lucide React supplies interface icons.

`clsx` and `tailwind-merge` provide the class helper in `src/lib/utils.ts`.

### Development and quality libraries

TypeScript checks frontend code.

ESLint checks source conventions.

Prettier formats source files through the ESLint integration.

Vitest runs the repository's frontend routing test.

Testing Library renders React components in the test environment.

JSDOM supplies a browser-like environment to Vitest.

Hyparquet reads parquet datasets for model training.

Hyparquet compressors decode supported compressed parquet data.

## Quick start

Clone the repository to a local workspace.

Enter the project directory.

Install dependencies from the lockfile.

```bash
npm ci
```

Start the API in one terminal.

```bash
npm run dev:backend
```

The local API listens on port `8787` by default.

Start the frontend in a second terminal.

```bash
npm run dev:frontend
```

Vite listens on port `8080` by default.

Open `http://localhost:8080` in a browser.

The frontend proxy sends `/api` requests to port `8787`.

The default local development configuration does not need an API key.

Sports data works without configuring a generative AI provider.

The Copilot asks for AI settings when a user has not configured them.

### Quick start with a single command

`npm run dev` starts only the frontend.

It does not start the API process.

Keep both commands running in separate terminals during development.

Do not run two services on the same port.

If port 8080 is busy, Vite may select the next available port.

If the selected port changes, the browser URL changes with it.

The API's default CORS origin list includes ports 8080 and 127.0.0.1:8080.

Add a changed frontend origin to `CORS_ORIGINS` when using cross-origin requests.

## Running the applications separately

The frontend and backend are separate programs.

They can run in different terminal sessions.

They can run on separate machines.

They can be deployed independently.

### Frontend process

The frontend entry point is `src/main.tsx`.

The Vite configuration is `vite.config.ts`.

The default development port is 8080.

The frontend uses Vite's `/api` development proxy.

The proxy target is `http://localhost:8787`.

The frontend static build output directory is `dist/`.

Run the frontend development server with `npm run dev:frontend`.

Run the frontend production build with `npm run build:frontend`.

Preview the build with `npm run preview`.

### Backend process

The backend HTTP server entry point is `backend/server.mjs`.

The shared API implementation is `backend/app.mjs`.

The default API port is 8787.

Set `API_PORT` to choose a custom port.

The backend also honors `PORT` when `API_PORT` is not set.

Set `API_HOST` to choose the listening interface.

The default listening interface is `0.0.0.0`.

Run the backend development watcher with `npm run dev:backend`.

Run the backend without watch mode with `npm run start:backend`.

The backend package is `backend/package.json`.

It intentionally has no runtime package dependency list.

### Connecting separate deployments

Set `VITE_API_BASE_URL` on the frontend build environment.

The value should be the backend origin, without a trailing slash.

Example value: `https://api.example.com`.

Set the backend `CORS_ORIGINS` to a comma-separated frontend origin list.

Include the scheme and hostname in each origin.

Do not include API paths in the CORS origin.

Do not use a wildcard origin with credentials.

After changing `VITE_API_BASE_URL`, rebuild the frontend.

Vite embeds `VITE_` variables into the generated JavaScript bundle.

Never place an API key in a `VITE_` environment variable.

## Configuration reference

### Frontend build variables

`VITE_API_BASE_URL` is optional.

Leave it unset for same-origin requests.

Set it only when the API is hosted on another origin.

It is public configuration and is visible in the browser bundle.

Never store secrets in frontend build variables.

### Backend environment variables

`API_PORT` controls the local Node HTTP port.

`PORT` is used by container hosts that provide a port automatically.

`API_HOST` controls the local listening address.

`CORS_ORIGINS` is a comma-separated allowlist for cross-origin frontend calls.

`AI_ALLOW_LOCAL_ENDPOINTS` permits the local Ollama preset during development only.

`AI_ALLOW_LOCAL_ENDPOINTS` is ignored for a production `NODE_ENV`.

There is no required platform-wide model API key.

User-selected AI credentials are configured in the application Settings page.

There is no database connection string.

There is no Supabase requirement.

### Forecast settings

Home advantage is expressed in Elo points.

Probability scale controls how quickly Elo rating differences change estimated probability.

EPL draw prior is a probability between 0 and 1.

F1 temperature controls how sharply driver ratings translate into a race distribution.

Refresh interval controls the Live Center polling cadence.

Default simulation runs selects an initial simulator iteration count.

Show Elo controls whether ratings are displayed in standings tables.

Settings values are clamped by the backend before being used for forecasts.

### Local environment setup

Set environment variables in the shell that starts the backend.

On macOS or Linux, a one-command example is shown below.

```bash
API_PORT=8787 CORS_ORIGINS=http://localhost:8080 npm run dev:backend
```

On Windows PowerShell, set the variables in the current terminal first.

```powershell
$env:API_PORT = "8787"
$env:CORS_ORIGINS = "http://localhost:8080"
npm run dev:backend
```

Do not commit a file containing private keys.

## AI provider setup

The Prediction Copilot supports OpenAI-compatible chat completion APIs.

The user chooses a provider and model in Settings.

The user supplies their own API key when required by that provider.

The user can adjust model temperature and maximum output tokens.

The user can choose a custom public HTTPS OpenAI-compatible endpoint.

Local Ollama can be used with the separately running development backend.

### Supported provider presets

OpenAI uses `https://api.openai.com/v1`.

OpenRouter uses `https://openrouter.ai/api/v1`.

Groq uses `https://api.groq.com/openai/v1`.

Together AI uses `https://api.together.xyz/v1`.

Mistral uses `https://api.mistral.ai/v1`.

DeepSeek uses `https://api.deepseek.com/v1`.

Ollama uses `http://127.0.0.1:11434/v1` in local development only.

The preset model ID is an editable starting point.

Provider model availability can change over time.

Use the exact model identifier displayed by the provider account.

Current provider API references:

- [OpenAI API model documentation](https://platform.openai.com/docs/engines/chat-gpt)
- [OpenRouter chat completion reference](https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request)
- [Groq OpenAI compatibility](https://console.groq.com/docs/openai)
- [DeepSeek chat completions](https://api-docs.deepseek.com/api/create-chat-completion/)

### Configure a hosted provider

Open Settings in the SPORTZ_AI navigation.

Choose the provider that issued the API key.

Review the base URL shown for that provider.

Enter the exact model ID supported by the provider account.

Paste the API key into the password field.

Adjust temperature if a more or less varied answer is required.

Adjust maximum tokens to control response length and approximate provider usage.

Open Predictions and choose a fixture for context.

Ask Prediction Copilot a question.

The request is sent through the backend to the selected provider.

If the provider rejects the model, verify the exact model name in its account dashboard.

If the provider rejects the key, create or rotate the key in that provider's dashboard.

### Configure a custom endpoint

Choose `Custom OpenAI-compatible` in Settings.

Enter a base URL that points to the provider's API root.

Do not add `/chat/completions` to the URL.

The backend appends `/chat/completions` to the base URL.

The backend requires HTTPS for custom public endpoints.

The backend rejects URL credentials, IP-literal hosts, localhost, and private address resolution.

The backend resolves the endpoint and pins the outgoing request to a public IP address.

The backend does not follow redirects for AI requests.

The endpoint must accept bearer authorization and OpenAI-compatible JSON.

Enter the provider's model ID and API key.

Custom endpoint errors are returned to the Copilot conversation.

### Configure local Ollama

Install Ollama and start its local service.

Download a chat model supported by the local Ollama runtime.

Enter the exact local model name in Settings.

Start the SPORTZ_AI backend on the same machine as Ollama.

Set `AI_ALLOW_LOCAL_ENDPOINTS=true` in the backend process environment.

Do not set `AI_ALLOW_LOCAL_ENDPOINTS=true` in production.

The Ollama API key can remain blank.

The Ollama connection uses the local backend host, not the browser host.

An Ollama service on another machine requires a secure public HTTPS endpoint or a private network design.

Vercel functions cannot reach a user's laptop localhost service.

### AI request lifecycle

The user's key is held in React state and tab session storage.

The user can clear the key with the Clear AI setup button.

The browser attaches the AI configuration to one Copilot API request.

The backend validates provider, model ID, token count, temperature, and request size fields.

The backend sends a chat completion request to the selected provider.

The backend does not write the key to a file.

The backend does not write the key to a database.

The backend does not include the key in an application log message.

The API response returns answer text and provider mode only.

The provider may retain prompts under its own account policy.

Review the selected AI provider's privacy and retention terms.

### AI payload behavior

Copilot includes the selected sport and any selected fixture data.

Copilot includes at most the recent eight chat messages.

Each history message is clipped to a bounded length.

The fixture context has a maximum accepted size.

The system instruction tells the model to state uncertainty.

The system instruction prohibits inventing missing live data.

The system instruction describes Elo forecasts as estimates.

The API does not expose web search or tool use to the selected language model.

The AI provider cannot make a live sports data request through this application.

Current sports facts must come from the supplied provider context.

## Session and browser storage

Forecast settings are stored in `sessionStorage`.

AI provider, model, endpoint, key, temperature, and token limit are stored in `sessionStorage`.

Session storage is scoped to the current browser tab session.

Closing the tab or browser session clears the browser's session storage under normal browser behavior.

The Settings page includes an action to clear the AI configuration immediately.

The app does not send settings to an account database.

Saved picks use `localStorage` and persist on that browser until removed by the user.

Watchlist follows use `localStorage` and persist on that browser until removed by the user.

Saved picks and watchlist follows are not AI credentials.

Saved picks and watchlists do not synchronize across devices.

Private browsing modes may clear browser storage when the window closes.

Browser storage is accessible to JavaScript running on the same origin.

Do not enter an API key on a computer or browser profile you do not trust.

Use the provider's key restrictions and spending limits where available.

## API reference

All JSON endpoints are prefixed with `/api/v1`.

The Vercel adapter dispatches routes through `backend/app.mjs`.

The local server dispatches routes through the same `handleApiRequest` function.

Responses include `Cache-Control: no-store`.

An API route error is returned as JSON with an `error` field.

### Health endpoint

`GET /api/v1/health` reports service health and the API version.

It does not verify that third-party providers are currently online.

Example response:

```json
{
  "status": "ok",
  "service": "sportz-api",
  "version": "v1",
  "time": "2026-01-01T00:00:00.000Z"
}
```

### Model endpoint

`GET /api/v1/models` returns artifact version, generation time, and model summaries.

The endpoint returns the committed model artifact.

It does not trigger training.

### Scoreboard endpoint

`GET /api/v1/scoreboards` returns scoreboard data for all supported sports.

Each scoreboard can fail independently based on an upstream provider.

The response includes `fetchedAt` and a `results` array.

### Schedule endpoint

`GET /api/v1/sports/{sport}/schedule` loads one sport schedule.

Supported sport keys are `f1`, `nba`, `epl`, `nfl`, and `mlb`.

The route key accepts letters and digits.

The `f1` route must not be rejected because its identifier contains a digit.

The optional `dates` parameter is `YYYYMMDD` or `YYYYMMDD-YYYYMMDD`.

Date ranges may cover at most 31 days.

Forecast settings can be supplied as query parameters.

The endpoint validates forecast settings and uses defaults for invalid values.

Example request:

```text
GET /api/v1/sports/nba/schedule?dates=20261017-20261023&probabilityScale=400
```

Example F1 request:

```text
GET /api/v1/sports/f1/schedule?dates=20261017-20261024
```

An empty event list can mean that no event falls in the selected date range.

An unavailable provider returns `status: unavailable` and an `error` description.

### Standings endpoint

`GET /api/v1/sports/{sport}/standings` returns normalized table rows.

The `f1` route returns driver standings from Jolpica.

The other supported routes return provider standings.

Rows include IDs, names, group, played count, win/loss record, points, percentage, and rating.

Some statistics are missing for some sports and are represented with zero, null, or empty values.

Consumers should not treat absent fields as confirmed zero performance.

### Team roster endpoint

`GET /api/v1/sports/{sport}/teams/{teamId}/roster` returns roster profiles.

This endpoint is not available for F1.

The endpoint only includes fields supplied by the public provider.

It does not enrich injury reports or private tracking data.

### Team schedule endpoint

`GET /api/v1/sports/{sport}/teams/{teamId}/schedule` returns a team schedule.

This endpoint is not available for F1.

The Matchups page uses this endpoint to find recent shared events.

### Copilot endpoint

`POST /api/v1/copilot` sends a user question to the selected AI provider.

The endpoint expects JSON with `sport`, `question`, `context`, `history`, and `ai` fields.

The `ai` field includes provider name, model, key, endpoint, temperature, and maximum tokens.

The API does not persist any of those fields.

An empty key returns an explanatory configuration response without a provider call.

The Ollama preset does not require a key.

The AI request has a finite timeout.

The provider response body has a bounded maximum size.

Custom AI endpoints must resolve to public addresses before the outbound request.

### API error behavior

Unknown API paths return HTTP 404.

Unknown sport keys return HTTP 404.

Invalid dates return HTTP 400.

Invalid Copilot payloads return HTTP 400.

Provider errors are returned as an unavailable result for schedule or standings data.

AI provider errors are presented as a Copilot answer with provider error mode.

The frontend should display the provider's error without pretending data loaded successfully.

## Sports data providers

### Formula 1

F1 schedules and driver standings use the Jolpica F1 API.

Jolpica is an Ergast-compatible public API.

The backend requests the current race calendar.

The backend requests current driver standings.

The standings response supplies current driver names, constructors, points, and position.

The Elo artifact supplies driver rating inputs for the race distribution.

The schedule is one current or upcoming race event with drivers as outcomes.

This product does not include race telemetry.

This product does not include qualifying session simulations.

This product does not include pit strategy or weather features.

If a selected range contains no race, the API returns an empty event list.

If Jolpica is unavailable, the API reports the provider error and keeps the app route valid.

Jolpica source: [api.jolpi.ca](https://api.jolpi.ca/ergast/f1/).

### NBA

NBA schedules and scoreboards use ESPN's public scoreboard endpoints.

NBA standings use ESPN's public standings endpoint.

Roster profiles use the ESPN team roster endpoint.

Historical Elo data is trained from a public team game log archive.

The training source is configured in `scripts/train-sports-models.mjs`.

The app does not claim an official ESPN partnership.

### Premier League

Premier League schedules and scoreboards use ESPN's public scoreboard endpoints.

Premier League standings use ESPN's public standings endpoint.

Historical Elo training uses OpenFootball England results.

The training script records source attribution in the generated artifact.

The backend applies an EPL draw prior to the two team outcome probabilities.

Draw percentage is configured from the Settings page.

### NFL

NFL schedules and scoreboards use ESPN's public scoreboard endpoints.

NFL standings use ESPN's public standings endpoint.

Roster profiles use the ESPN team roster endpoint.

Historical Elo data is trained from nflverse schedule and score data.

The artifact and documentation retain the source's attribution requirements.

The application does not display live player tracking data.

### MLB

MLB schedules and scoreboards use ESPN's public scoreboard endpoints.

MLB standings use ESPN's public standings endpoint.

Roster profiles use the ESPN team roster endpoint.

Historical Elo data is trained from the MLB Stats API.

MLB home advantage is scaled by the backend forecast implementation.

Player-level projections are not provided by the Elo baseline.

### Provider data expectations

Public endpoints may change without notice.

Providers may rate limit requests.

Providers may return incomplete records during off-seasons.

Some APIs omit player, venue, or result fields for particular leagues.

The frontend should distinguish empty results from provider failure.

Do not add fake fallback fixtures to hide an upstream failure.

Provider fallback behavior should be explicit and labeled in the interface.

## Forecast methodology

The shared artifact contains ratings for teams and F1 drivers.

For two-team sports the backend computes an Elo logistic probability.

The formula uses the difference between two ratings and a scale value.

The formula can include a configurable home advantage.

The backend adjusts MLB home advantage with a fixed sport multiplier.

For EPL the backend allocates the configured draw prior separately.

For F1 the backend converts current driver Elo ratings into a multi-driver distribution.

The F1 distribution uses a temperature setting.

Event probabilities are rounded to integer percentages for display.

Rounded values may not sum to exactly 100 percent.

The F1 probability is not a guarantee of a race result.

The models do not currently include injuries or player availability.

The models do not currently include betting odds or market movement.

The models do not currently include confirmed starting lineups.

The models do not currently include granular player statistics.

The models do not currently include weather inputs.

The model name and artifact version should remain visible near a forecast.

Forecast changes should be evaluated against held-out historical outcomes.

The app should not claim causal explanations that the model did not compute.

## Training and updating the model artifact

The model builder is `scripts/train-sports-models.mjs`.

It uses historical public data sources listed in the script and artifact.

Some archives are downloaded into `.cache/sports-data/`.

That cache is ignored by Git.

Parquet sources are read with Hyparquet.

CSV sources are parsed by the script.

The script performs a chronological Elo walk-forward evaluation.

The prediction is recorded before updating a game's ratings.

Metrics include Brier score and log loss where the outcome space supports them.

Accuracy is included as a simple secondary metric.

The script writes `shared/sports-models.json`.

Run the current artifact validation and summary command:

```bash
npm run models:train
```

Refresh source data before training with:

```bash
npm run models:train -- --refresh
```

The refresh flag re-downloads source archives.

Review source licenses and attribution before using data in another context.

Review the generated `sources` section before committing the new artifact.

Review training metrics for suspicious changes.

Compare rating aliases with current provider team names.

Test newly generated forecasts against actual schedule response formats.

Commit the new artifact with the training script change if they are coupled.

Do not run training inside a Vercel request.

Do not commit `.cache/sports-data/` files.

Do not remove the artifact; it is a production runtime dependency.

### Artifact format

The root field `artifactVersion` identifies the model artifact revision.

The root field `generatedAt` identifies when the data was produced.

The root field `sources` records public training source names and URLs.

The root field `models` contains one model entry for each supported sport.

Each model entry includes an algorithm label.

Each model entry contains ratings keyed by normalized provider identifiers.

Each model entry can include an alias map.

Each model entry contains chronological backtest metrics.

The backend validates by runtime lookup rather than a separate schema file.

Treat artifact field changes as API changes for the backend.

## Vercel deployment

The repository includes `vercel.json`.

Vercel runs `npm run build:frontend`.

Vercel publishes the generated `dist/` directory.

The API function is `api/[...route].js`.

The function imports `backend/app.mjs`.

The SPA rewrite sends non-API paths to `index.html`.

The API wildcard handles `/api/v1/...` URLs.

Set the project Node.js runtime to version 24.

Use the repository's npm lockfile to install dependencies.

Do not configure Vercel to build the backend as a separate frontend artifact.

The API function is deployed as part of the same Vercel project.

### Vercel setup checklist

1. Push the repository to the Git provider.

2. Import the repository into Vercel.

3. Select the repository root as the project root.

4. Select the Node.js 24 runtime.

5. Keep the build command as `npm run build:frontend`.

6. Keep the output directory as `dist`.

7. Leave `VITE_API_BASE_URL` unset for same-origin API requests.

8. Set `CORS_ORIGINS` only if another frontend origin calls the API.

9. Do not set an AI provider key unless intentionally providing a server-wide integration.

10. Deploy a preview.

11. Open `/api/v1/health` on the preview domain.

12. Open `/api/v1/sports/f1/standings` on the preview domain.

13. Open `/api/v1/sports/nba/schedule` on the preview domain.

14. Open the frontend and test navigation to a nested route.

15. Test a prediction request and provider failure display.

16. Test Copilot using a key you can revoke.

17. Review Vercel function logs for errors without copying sensitive request data.

18. Promote the deployment only after provider routes respond as expected.

### Vercel runtime considerations

Provider APIs may have variable response times.

The backend uses finite timeouts for upstream fetches.

The NBA and other ESPN schedule ranges are split into daily requests.

Date requests use bounded concurrency.

Vercel may impose execution duration and response limits based on plan.

Keep the requested date range within the API's 31-day limit.

Avoid loading all sports scoreboards on every individual page.

Use the sport-specific schedule endpoint for page-specific work.

The local Ollama preset is disabled in production.

Custom AI endpoint access is restricted to public HTTPS addresses.

## Security and privacy

The API key is user-supplied and sent from the browser only when Copilot is used.

The key is held in tab session storage to support navigation between Settings and Predictions.

The key is not sent with ordinary sports schedule requests.

The key is not stored by the server after the request finishes.

The key is not included in normal application log messages.

The selected AI provider receives the prompt and context necessary to answer.

Do not use a custom endpoint unless you trust its operator.

Custom endpoint requests require public HTTPS and are DNS-resolved with private ranges rejected.

Custom endpoint connections are pinned to a resolved public address.

Custom endpoint requests do not follow redirects.

The backend rejects private and local custom endpoint addresses to limit SSRF exposure.

The Ollama exception only targets loopback and requires an explicit local development flag.

Vercel production rejects the Ollama loopback exception.

`CORS_ORIGINS` should list only trusted frontend origins.

Do not use wildcard CORS origins for a public deployment.

Do not commit `.env` files.

The `.gitignore` excludes `.env` and `.env.*` except `.env.example`.

No `.env.example` is required for the default local setup.

Keep backend-only secrets out of variables prefixed with `VITE_`.

Review upstream provider terms and rate limits.

Review model provider data retention policies.

Rotate and revoke any key that is accidentally exposed.

Set reasonable spending limits at each provider account.

The current application has no user authentication or account ownership model.

Do not expose personal or private data in Copilot context.

Avoid logging full Copilot request bodies.

## Quality checks

Format changed source files with Prettier.

Run ESLint before committing.

Run TypeScript's no-emit check before committing.

Build the static frontend before deploying.

The repository includes Vitest configuration and a route test.

Run the test suite when code changes affect routing or React behavior.

The normal release checks are listed below.

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Run all tests with:

```bash
npm test
```

Run tests in watch mode with:

```bash
npm run test:watch
```

Check backend JavaScript syntax with:

```bash
node --check backend/app.mjs
node --check backend/server.mjs
```

Check that generated assets do not contain API credentials.

Check that the Git diff does not include provider datasets or local caches.

Review lint warnings separately from lint errors.

Do not silence a warning without understanding its cause.

## Troubleshooting

### The browser says `API route not found`

Confirm the frontend is calling `/api/v1/...`.

Confirm the backend process is running locally.

Confirm the Vite proxy targets port 8787.

Confirm the API route name matches the backend router.

Sport route identifiers may contain digits, including `f1`.

The route matcher permits letters and digits for the sport key.

Check whether the request was sent to the frontend origin or API origin.

Check the Vercel catch-all API function deployment logs.

Open `/api/v1/health` directly to confirm the handler is deployed.

### F1 schedule is empty

F1 schedule responses include a race only when it falls in the selected date range.

Try a date window around an upcoming Grand Prix weekend.

F1 schedule data comes from Jolpica, not ESPN.

F1 standings can still load when the selected date range has no race.

Check that `/api/v1/sports/f1/standings` returns `status: ok`.

Check the API response provider and error fields.

An empty event list is different from an unknown route.

### A schedule returns no events

Confirm the selected date range includes the sport's season.

Some leagues are seasonal and may be between competitions.

Try a broader valid date window.

Check the schedule response's `provider` field.

Check the response's `status` and `error` fields.

Try `/api/v1/scoreboards` to inspect all provider summaries.

Do not interpret provider failure as a score of zero.

### A prediction button is disabled

The model artifact may not have a rating match for that fixture.

Check team aliases in `shared/sports-models.json`.

Check the provider's competitor display name and abbreviation.

The API intentionally does not invent ratings for unknown teams.

Train or add reviewed aliases if the model data supports the new team.

### Copilot says it is not configured

Open Settings and select an AI provider.

Enter a valid provider API key unless using local Ollama.

Enter the model ID exactly as the provider lists it.

Ask a question from Predictions after saving the configuration.

The AI settings are scoped to the active browser session.

Closing the browser session clears the settings.

### Copilot returns an authentication error

Check that the key belongs to the selected provider.

Check that the provider account has access to the selected model.

Remove leading or trailing spaces from the key.

Confirm the provider preset base URL is displayed.

Revoke the key if it was pasted into an untrusted browser.

### Copilot returns a model error

Confirm the exact provider model ID.

Some providers use namespaced identifiers such as `vendor/model-name`.

Model availability can change without a frontend release.

The model field is editable in Settings.

### Custom AI endpoint is blocked

Custom endpoints must use HTTPS.

Custom endpoints cannot use a raw IP address.

Custom endpoints cannot resolve to private or link-local addresses.

Custom endpoints cannot redirect the backend to another host.

Use a supported provider preset when possible.

For local development, select Ollama and enable the local endpoint flag.

### Ollama cannot be reached

Confirm the Ollama service is running on the backend machine.

Confirm the local model has been downloaded.

Set `AI_ALLOW_LOCAL_ENDPOINTS=true` for the local backend process.

Do not use this preset from a Vercel deployment.

Use a hosted model provider for a deployed application.

### CORS blocks a request

Same-origin requests normally do not require CORS configuration.

For separate domains, set the backend's `CORS_ORIGINS` allowlist.

Use the exact frontend scheme, host, and port.

Restart the backend after changing environment variables.

Avoid wildcard origins.

### The frontend is blank after deployment

Confirm Vercel publishes `dist/`.

Confirm `npm run build:frontend` completes.

Confirm the SPA rewrite is present in `vercel.json`.

Open browser developer tools and review failed asset requests.

Confirm the app and API are deployed to the intended project root.

### A nested page returns a hosting 404

Confirm Vercel applies the non-API rewrite to `index.html`.

Confirm the page is a client route in TanStack Router.

Confirm `src/routeTree.gen.ts` includes the route.

Vite's TanStack route plugin regenerates route metadata during build.

Do not hand-edit generated route metadata to fix a route source issue.

### TypeScript reports a missing route

Check that the route file exists under `src/routes/`.

Check that it exports the expected `Route` value.

Run the frontend build to regenerate route metadata.

Check `src/routeTree.gen.ts` after the build.

### A provider returns HTTP 400

Inspect the exact upstream request path and query string.

Date format errors should be corrected before expanding provider retries.

ESPN range behavior may differ from daily requests.

The backend splits ESPN ranges into bounded daily requests.

Do not retry an invalid request repeatedly without changing its parameters.

### The training script fails to download data

Confirm network access from the development machine.

Confirm `curl` is installed.

Review the source URL and source host status.

Check whether a cached source file exists under `.cache/sports-data/`.

Use the refresh flag only when downloading new data is desired.

Never check cached source archives into Git.

### The lockfile differs from package metadata

Run `npm install` with a supported npm release.

Review dependency changes before committing the regenerated lockfile.

Use `npm ci` for deployment and clean builds.

Do not edit `package-lock.json` by hand.

## Repository map

This section explains the purpose of each maintained project file.

Generated folders such as `node_modules/`, `dist/`, and `.cache/` are not source files.

Local editor settings and machine-specific hidden directories are not part of the application.

### Root configuration and documentation

`README.md` is the main product, setup, API, deployment, and operations guide.

`package.json` defines frontend scripts and direct JavaScript dependencies.

`package-lock.json` locks npm dependency versions for repeatable installation.

`backend/package.json` defines backend start scripts and its Node runtime requirement.

`tsconfig.json` defines TypeScript compiler settings and the `@/` source alias.

`vite.config.ts` configures Vite, React, Tailwind, port 8080, and the local API proxy.

`vitest.config.ts` configures browser-like tests and the frontend alias.

`eslint.config.js` configures TypeScript, React hooks, refresh, and Prettier lint rules.

`bunfig.toml` defines Bun lockfile behavior and a package release-age policy.

`.gitignore` excludes build outputs, dependencies, data caches, credentials, and editor files.

`index.html` is Vite's HTML shell and contains the frontend mount node.

`vercel.json` defines the frontend build, static output, and SPA fallback rewrite.

`transform.md` records the project's architectural transformation and data/model plan.

`src/routes/README.md` describes the current TanStack file-based route conventions.

`backend/README.md` describes backend-specific start commands and API operation.

### Vercel API adapter

`api/[...route].js` is the Vercel catch-all API function.

It adapts Node request and response objects to Fetch API request and response objects.

It delegates all route logic to `backend/app.mjs`.

It contains no sports or model business logic.

### Backend implementation

`backend/app.mjs` defines sport mappings and default forecast values.

It contains normalization and provider request helpers.

It expands and validates date ranges.

It fetches Jolpica and ESPN data.

It converts upstream provider records into the application API schema.

It calculates Elo probability distributions.

It validates AI configuration and Copilot requests.

It blocks unsafe custom AI endpoint targets.

It dispatches versioned API routes through `handleApiRequest`.

`backend/server.mjs` starts the standalone local Node HTTP server.

It translates Node incoming messages into Fetch API requests.

It imports `handleApiRequest` rather than duplicating route logic.

`backend/package.json` declares the backend package as an ES module.

It requires Node.js 24 or later.

It has `dev` and `start` scripts.

### Frontend bootstrap and routing

`src/main.tsx` creates the router and mounts the React application.

`src/router.tsx` constructs TanStack Router with scroll restoration.

`src/routeTree.gen.ts` is generated route metadata; do not edit it manually.

`src/routes/__root.tsx` defines the document head, outlet, not-found page, and error UI.

`src/routes/index.tsx` renders the home page composition.

`src/routes/predictions.tsx` declares the `/predictions` route and metadata.

`src/routes/live.tsx` declares the `/live` route and metadata.

`src/routes/matchups.tsx` declares the `/matchups` route and metadata.

`src/routes/watchlist.tsx` declares the `/watchlist` route and metadata.

`src/routes/settings.tsx` declares the `/settings` route and metadata.

`src/routes/copilot.tsx` redirects the legacy `/copilot` route to the current workflow.

`src/routes/lab.tsx` redirects the legacy Model Lab route to Settings.

`src/routes/backtests.tsx` redirects the legacy Backtests route to Settings.

`src/routes/simulator.tsx` redirects the legacy Simulator route to Live Center.

### Frontend shared components

`src/components/sportz/top.tsx` contains the shared navigation and home-page upper panels.

`src/components/sportz/bottom.tsx` contains the home-page analysis and information panels.

`src/components/sportz/shell.tsx` wraps routed workspaces with navigation and footer.

`src/components/sportz/ui.tsx` contains project-specific cards, buttons, badges, and visualizations.

`src/components/sportz/workspaces.tsx` contains the predictions, live, matchup, watchlist, and settings workspaces.

### Frontend data and settings modules

`src/lib/api-client.ts` defines frontend API types and typed HTTP functions.

It is the normal frontend boundary for backend requests.

`src/lib/app-settings.ts` defines default settings and tab-session persistence.

It defines provider presets and AI configuration types.

`src/lib/sportz-data.ts` defines sport names, color classes, images, and static presentation metadata.

`src/lib/utils.ts` exports the class name merge helper used by the UI.

### Frontend styles and assets

`src/styles.css` defines Tailwind theme tokens, sport colors, utilities, and base styles.

`src/assets/ath-f1.jpg` is the Formula 1 presentation image.

`src/assets/ath-nba.jpg` is the NBA presentation image.

`src/assets/ath-epl.jpg` is the Premier League presentation image.

`src/assets/ath-nfl.jpg` is the NFL presentation image.

`src/assets/ath-mlb.jpg` is the MLB presentation image.

`src/assets/monaco.jpg` is the Monaco race visual used on the home page.

`public/favicon.ico` is the browser icon.

`public/robots.txt` defines crawler access for the public application.

### Shared model and training files

`shared/sports-models.json` is the production model artifact read by the backend.

`scripts/train-sports-models.mjs` downloads and processes historical data and writes the artifact.

`.cache/sports-data/` is a local ignored cache created by the training program.

### Tests

`src/test/app-routing.test.tsx` verifies core app routing behavior.

`src/test/setup.ts` configures Testing Library matchers for Vitest.

`vitest.config.ts` selects JSDOM and discovers frontend tests.

## Maintenance workflow

Use a feature branch for a focused code change.

Read the relevant workspace and API implementation before editing.

Keep provider fetches in the backend.

Keep browser API calls in `src/lib/api-client.ts`.

Keep user-facing errors visible and actionable.

Avoid fake data in production screens.

Update API types when a response shape changes.

Update the API documentation when a route changes.

Update the artifact format documentation when model data changes.

Update the README when configuration or deployment behavior changes.

Review data source licensing before adding a new training dataset.

Run formatting on changed files.

Run lint and type checking.

Build the frontend before pushing.

Run the test suite when changing routes or interactive behavior.

Review the final Git diff for generated files.

Review the final Git diff for secrets.

Review the final Git diff for unintended data deletion.

Commit model artifacts only after inspecting their metrics and source metadata.

### Adding another sport

Define a canonical sport key in the frontend sport type.

Add presentation metadata and a color token for that sport.

Add provider mapping and API normalization in the backend.

Add historical data support to the trainer where data is available.

Add ratings to the versioned artifact.

Add forecast logic appropriate for the outcome space.

Add provider schedule and table behavior.

Update the sport selector and all sport-aware views.

Document source URLs, data limitations, and license terms.

Add a regression check for route parsing and normalized response shape.

Avoid assuming every sport has two competitors or binary outcomes.

### Changing an upstream provider

Document provider base URL and route shape.

Document rate limits and terms.

Add finite request timeouts.

Normalize provider errors for the frontend.

Keep API response types stable when possible.

Test empty, partial, and malformed provider responses.

Ensure a failure in one sport does not break all other scoreboard cards.

Avoid logging full upstream payloads.

### Changing model methodology

Describe the hypothesis and expected behavior change.

Implement chronological training to avoid leakage.

Compare against the previous artifact on the same data window.

Report metrics by sport and outcome type.

Inspect calibration and outlier ratings.

Document additional features and their availability time.

Do not use post-event information to generate pre-event predictions.

Version the artifact when its schema or methodology changes.

Keep historical source provenance with the artifact.

## Known limitations

Sports data providers are public and have no service-level agreement.

Provider schedules may lag official league sites.

Team and driver aliases can drift across seasons.

Roster feeds may be incomplete or delayed.

The live data experience depends on upstream scoreboard refresh behavior.

The current model is based primarily on Elo ratings.

The current model does not include a complete athlete-level feature store.

The app has no authentication, account management, or synced watchlists.

The simulator estimates outcomes from current standings and rating assumptions.

The simulator does not replicate the official schedule for every sport.

F1 race distributions are approximations based on driver ratings.

The AI provider receives user question and selected sports context.

AI response quality and cost depend on the user's selected provider and model.

AI output can be incorrect and should be checked against primary sports sources.

Commercial use requires independent review of provider terms, trademarks, and data rights.

## Glossary

**Artifact** means the committed JSON model output consumed by the backend.

**Backtest** means a historical walk-forward evaluation of forecast quality.

**Brier score** measures squared error between forecast probabilities and outcomes.

**CORS** means browser cross-origin request policy.

**Elo** means a rating system that updates competitors based on relative performance.

**Endpoint** means a backend HTTP route or provider URL, depending on context.

**Log loss** penalizes probability assignments that strongly disagree with observed results.

**Model temperature** scales the spread of F1 driver probabilities.

**Provider** means an upstream sports data or language model service.

**Session storage** means browser storage scoped to one tab session.

**SPA** means single-page application.

**Walk-forward** means train and predict in time order without using future results.

## Final operational checklist

The frontend and backend have separate start commands.

The backend route matcher accepts alphanumeric sport keys such as `f1`.

The F1 API routes use Jolpica.

The NBA, EPL, NFL, and MLB schedule routes use ESPN public feeds.

The frontend reads forecasts through the backend API.

The model artifact is checked in and versioned.

The settings page contains forecast and AI configuration.

AI setup is scoped to the current tab session.

Custom AI endpoint requests reject private and local destinations.

Ollama is restricted to explicit local development.

The project does not require a database for its current features.

The project does not require a global OpenAI key.

The deployment build writes static files to `dist/`.

The Vercel adapter routes API calls through the same backend handler used locally.

Use the quality checks before pushing a release.

Review provider terms and generated model metrics before public or commercial use.
