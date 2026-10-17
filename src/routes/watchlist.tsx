import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/sportz/shell";
import { WatchlistWorkspace } from "@/components/sportz/workspaces";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "Watchlist — SPORTZ_AI" },
      { name: "description", content: "Follow teams, players, drivers and races." },
      { property: "og:title", content: "Watchlist — SPORTZ_AI" },
      { property: "og:description", content: "Follow teams, players, drivers and races." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Shell>
      <WatchlistWorkspace />
    </Shell>
  ),
});
