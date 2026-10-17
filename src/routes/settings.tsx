import { createFileRoute } from "@tanstack/react-router";
import { SettingsWorkspace } from "@/components/sportz/workspaces";
import { Shell } from "@/components/sportz/shell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SPORTZ_AI" },
      {
        name: "description",
        content: "Tune forecasts, inspect sports models, and review historical backtests.",
      },
    ],
  }),
  component: () => (
    <Shell
      title="Settings"
      sub="Tune forecast behavior and review the model artifacts and historical validation used by this project."
    >
      <SettingsWorkspace />
    </Shell>
  ),
});
