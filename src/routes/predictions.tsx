import { createFileRoute } from "@tanstack/react-router";
import { Shell, Wrap } from "@/components/sportz/shell";
import { ChooseSport, FeaturedAndLive } from "@/components/sportz/top";
import { F1Intel, Players } from "@/components/sportz/bottom";

export const Route = createFileRoute("/predictions")({
  head: () => ({
    meta: [
      { title: "Predictions — SPORTZ_AI" },
      { name: "description", content: "AI forecasts across Formula 1, NBA, EPL, NFL and MLB." },
      { property: "og:title", content: "Predictions — SPORTZ_AI" },
      {
        property: "og:description",
        content: "AI forecasts across Formula 1, NBA, EPL, NFL and MLB.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Shell title="Predictions" sub="AI forecasts across Formula 1, NBA, EPL, NFL and MLB.">
      <div className="mt-4">
        <ChooseSport />
      </div>
      <FeaturedAndLive />
      <Wrap>
        <F1Intel />
      </Wrap>
      <Players />
    </Shell>
  ),
});
