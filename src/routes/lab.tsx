import { createFileRoute } from "@tanstack/react-router";
import { Shell, Wrap } from "@/components/sportz/shell";
import { ModelLab, Backtesting } from "@/components/sportz/bottom";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "Model Lab — SPORTZ_AI" },
      { name: "description", content: "From data to prediction — the models behind SPORTZ_AI." },
      { property: "og:title", content: "Model Lab — SPORTZ_AI" },
      {
        property: "og:description",
        content: "From data to prediction — the models behind SPORTZ_AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Shell title="Model Lab" sub="From data to prediction — the models behind SPORTZ_AI.">
      <Wrap>
        <ModelLab />
      </Wrap>
      <Backtesting />
    </Shell>
  ),
});
