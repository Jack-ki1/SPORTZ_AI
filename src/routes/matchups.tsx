import { createFileRoute } from "@tanstack/react-router";
import { Shell, Wrap } from "@/components/sportz/shell";
import { Explain } from "@/components/sportz/top";
import { F1Intel, Players } from "@/components/sportz/bottom";

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
    <Shell title="Matchups" sub="Explainable AI matchup analysis and athlete intelligence.">
      <Wrap cols="xl:grid-cols-[1fr_1.25fr]">
        <Explain />
        <F1Intel />
      </Wrap>
      <Players />
    </Shell>
  ),
});
