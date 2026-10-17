# Frontend routes

TanStack Router uses file-based routes in this folder.

Each route declares a `Route` export using `createFileRoute`.

Route metadata such as page titles belongs in each route's `head` function.

The generated route tree is `src/routeTree.gen.ts`.

Do not edit generated route-tree metadata by hand.

| File              | URL            | Purpose                                                             |
| ----------------- | -------------- | ------------------------------------------------------------------- |
| `index.tsx`       | `/`            | Home page and introductory dashboard.                               |
| `predictions.tsx` | `/predictions` | Fixtures, forecasts, saved picks, and Prediction Copilot.           |
| `live.tsx`        | `/live`        | Provider standings, scores, upcoming events, and season simulation. |
| `matchups.tsx`    | `/matchups`    | Team/driver, head-to-head, and roster comparisons.                  |
| `watchlist.tsx`   | `/watchlist`   | Browser-local followed teams, drivers, fixtures, and forecasts.     |
| `settings.tsx`    | `/settings`    | Forecast controls, AI setup, model metadata, and backtest metrics.  |
| `copilot.tsx`     | `/copilot`     | Legacy redirect to the current Predictions workflow.                |
| `lab.tsx`         | `/lab`         | Legacy redirect to Settings.                                        |
| `backtests.tsx`   | `/backtests`   | Legacy redirect to Settings.                                        |
| `simulator.tsx`   | `/simulator`   | Legacy redirect to Live Center.                                     |
| `__root.tsx`      | Root layout    | Document head, not-found page, and error boundary.                  |

## Adding a page

Create a `.tsx` file under `src/routes/`.

Export a TanStack `Route` declaration from that file.

Add the page to navigation when users need a persistent entry point.

Use the shared `Shell` for routed workspaces.

Keep page-specific state and UI in the workspace component when it is substantial.

Keep external API requests in `src/lib/api-client.ts`.

Run a frontend build so the route plugin updates `src/routeTree.gen.ts`.

Check the generated type for the route path after the build.
