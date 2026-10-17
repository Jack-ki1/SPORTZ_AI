import { createFileRoute } from "@tanstack/react-router";
import { PredictionsWorkspace } from "@/components/sportz/workspaces";
import { Shell } from "@/components/sportz/shell";

export const Route = createFileRoute("/predictions")({
  head: () => ({
    meta: [
      { title: "Predictions — SPORTZ_AI" },
      {
        name: "description",
        content:
          "Browse provider fixtures and inspect historical Elo forecasts across five sports.",
      },
    ],
  }),
  component: () => (
    <Shell>
      <PredictionsWorkspace />
    </Shell>
  ),
});
