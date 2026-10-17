import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/sportz/shell";
import { MatchupsWorkspace } from "@/components/sportz/workspaces";

export const Route = createFileRoute("/matchups")({
  head: () => ({
    meta: [
      { title: "Matchups — SPORTZ_AI" },
      { name: "description", content: "Explainable AI matchup analysis and athlete intelligence." },
      { property: "og:title", content: "Matchups — SPORTZ_AI" },
      {
        property: "og:description",
        content: "Explainable AI matchup analysis and athlete intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Shell>
      <MatchupsWorkspace />
    </Shell>
  ),
});
