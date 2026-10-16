import { createFileRoute } from "@tanstack/react-router";
import { Shell, Wrap } from "@/components/sportz/shell";
import { FeaturedAndLive } from "@/components/sportz/top";
import { DataTrust, SeasonSim } from "@/components/sportz/bottom";

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
    <Shell title="Live Center" sub="Real-time scores and model movement across five sports.">
      <FeaturedAndLive />
      <Wrap cols="lg:grid-cols-2">
        <DataTrust />
        <SeasonSim />
      </Wrap>
    </Shell>
  ),
});
