import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/sportz/shell";
import { LiveWorkspace } from "@/components/sportz/workspaces";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Center — SPORTZ_AI" },
      { name: "description", content: "Real-time scores and model movement across five sports." },
      { property: "og:title", content: "Live Center — SPORTZ_AI" },
      {
        property: "og:description",
        content: "Real-time scores and model movement across five sports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Shell>
      <LiveWorkspace />
    </Shell>
  ),
});
