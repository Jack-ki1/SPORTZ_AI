import { createFileRoute } from "@tanstack/react-router";
import { Shell, Wrap } from "@/components/sportz/shell";
import { Copilot, DataTrust } from "@/components/sportz/bottom";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "AI Copilot — SPORTZ_AI" },
      { name: "description", content: "Ask anything about sports, data or predictions." },
      { property: "og:title", content: "AI Copilot — SPORTZ_AI" },
      { property: "og:description", content: "Ask anything about sports, data or predictions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Shell title="AI Copilot" sub="Ask anything about sports, data or predictions.">
      <Wrap cols="xl:grid-cols-[1.4fr_1fr]">
        <Copilot />
        <DataTrust />
      </Wrap>
    </Shell>
  ),
});
