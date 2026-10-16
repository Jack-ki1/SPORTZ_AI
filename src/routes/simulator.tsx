import { createFileRoute } from "@tanstack/react-router";
import { Shell, Wrap } from "@/components/sportz/shell";
import { SeasonSim, F1Intel } from "@/components/sportz/bottom";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Season Simulator — SPORTZ_AI" },
      { name: "description", content: "Run thousands of season simulations for every sport." },
      { property: "og:title", content: "Season Simulator — SPORTZ_AI" },
      {
        property: "og:description",
        content: "Run thousands of season simulations for every sport.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Shell title="Season Simulator" sub="Run thousands of season simulations for every sport.">
      <Wrap cols="lg:grid-cols-2">
        <SeasonSim />
        <F1Intel />
      </Wrap>
    </Shell>
  ),
});
