# SPORTZ_AI Backend

This is the independent Node.js API service used by the SPORTZ_AI frontend.

The frontend and backend are separate processes during local development.

Vercel also exposes the same request handler through `../api/[...route].js`.

## Runtime

- Node.js 24 or newer.
- No backend npm runtime dependencies.
- Outbound HTTPS access to public sports providers.
- Outbound HTTPS access to the selected hosted AI provider when Copilot is used.

## Local development

From the repository root, start this service with:

```sh
npm run dev:backend
```

The default API address is `http://localhost:8787`.

The development server restarts when a backend source file changes.

Start the frontend separately with `npm run dev:frontend`.

Vite proxies `/api` to port 8787 by default.

The backend can be started directly from this directory with:

```sh
npm run dev
```

Use `npm start` for a non-watch process from this directory.

## Environment variables

`API_PORT` selects the listening port.

`PORT` is used when `API_PORT` is not set by a hosting platform.

`API_HOST` selects the interface; the default is `0.0.0.0`.

`CORS_ORIGINS` is a comma-separated allowlist for separately hosted frontend origins.

Local defaults allow `http://localhost:8080` and `http://127.0.0.1:8080`.

`AI_ALLOW_LOCAL_ENDPOINTS=true` enables the local Ollama preset in non-production development.

The local Ollama preset is rejected when `NODE_ENV=production`.

Do not configure local endpoint access on a deployed public API.

There is no required server-wide AI API key.

Users configure their provider key and model in the application Settings page.

User AI configuration is included only in a Copilot request and is never persisted by this service.

## Endpoints

- `GET /api/v1/health`
- `GET /api/v1/models`
- `GET /api/v1/scoreboards`
- `GET /api/v1/sports/{sport}/schedule`
- `GET /api/v1/sports/{sport}/standings`
- `GET /api/v1/sports/{sport}/teams/{teamId}/roster`
- `GET /api/v1/sports/{sport}/teams/{teamId}/schedule`
- `POST /api/v1/copilot`

Valid sport keys are `f1`, `nba`, `epl`, `nfl`, and `mlb`.

The route parser accepts digits in sport names such as the `1` in `f1`.

See the [root README](../README.md) for request formats, response shapes, provider sources, settings, and deployment instructions.

## Security controls

The API responds with `Cache-Control: no-store`.

CORS is restricted to configured origins.

Forecast settings are validated and clamped.

Date ranges are limited to 31 days.

Upstream requests have finite timeouts.

AI output response bodies have a size limit.

The server does not log AI request bodies or API keys.

Preset AI providers use fixed provider endpoints.

Custom AI endpoints require public HTTPS hosts.

Custom endpoint DNS results are checked and the selected public address is pinned for the request.

Custom endpoint redirects are not followed.

Loopback HTTP is only available through the explicitly enabled local Ollama preset.
