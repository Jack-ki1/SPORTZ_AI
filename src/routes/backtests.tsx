import { createFileRoute } from "@tanstack/react-router";
import { Shell, Wrap } from "@/components/sportz/shell";
import { Backtesting, ModelLab, DataTrust } from "@/components/sportz/bottom";

export const Route = createFileRoute("/backtests")({
  head: () => ({
    meta: [
      { title: "Backtests — SPORTZ_AI" },
      {
        name: "description",
        content: "How good has the model actually been? Walk-forward validation.",
      },
      { property: "og:title", content: "Backtests — SPORTZ_AI" },
      {
        property: "og:description",
        content: "How good has the model actually been? Walk-forward validation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Shell title="Backtests" sub="How good has the model actually been? Walk-forward validation.">
      <Backtesting />
      <Wrap cols="lg:grid-cols-2">
        <ModelLab />
        <DataTrust />
      </Wrap>
    </Shell>
  ),
});
