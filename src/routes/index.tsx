import { createFileRoute } from "@tanstack/react-router";
import { Nav, Hero, ChooseSport, FeaturedAndLive, Explain } from "@/components/sportz/top";
import {
  F1Intel,
  Players,
  Copilot,
  ModelLab,
  Backtesting,
  SeasonSim,
  DataTrust,
  Watchlist,
  Footer,
} from "@/components/sportz/bottom";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SPORTZ_AI — AI That Understands The Game" },
      {
        name: "description",
        content:
          "AI predictions, explanations, simulations and live intelligence across Formula 1, NBA, EPL, NFL and MLB.",
      },
      { property: "og:title", content: "SPORTZ_AI — AI That Understands The Game" },
      {
        property: "og:description",
        content:
          "Five sports. One intelligence layer. Predictions, explainable AI, simulations and backtests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <ChooseSport />
        <FeaturedAndLive />
        <section className="mx-auto mt-6 grid max-w-[1560px] gap-5 px-4 md:px-8 xl:grid-cols-[1fr_1.25fr]">
          <Explain />
          <F1Intel />
        </section>
        <Players />
        <section className="mx-auto mt-6 grid max-w-[1560px] gap-5 px-4 md:px-8 xl:grid-cols-[1fr_1.25fr]">
          <Copilot />
          <ModelLab />
        </section>
        <Backtesting />
        <section className="mx-auto mt-6 grid max-w-[1560px] gap-5 px-4 md:px-8 lg:grid-cols-3">
          <SeasonSim />
          <Watchlist />
          <DataTrust />
        </section>
      </main>
      <Footer />
    </div>
  );
}
