import { useEffect, useState } from "react";
import { ArrowRight, Search, Sparkles, SlidersHorizontal, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { SPORTS, FACTORS, sport } from "@/lib/sportz-data";
import { getScoreboards, type ScoreboardEvent } from "@/lib/api-client";
import { Btn, Card, DemoTag, Ring, SectionTitle, SportBadge } from "./ui";

const NAV = [
  ["Home", "/"],
  ["Predictions", "/predictions"],
  ["Live Center", "/live"],
  ["Matchups", "/matchups"],
  ["Watchlist", "/watchlist"],
  ["Settings", "/settings"],
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="h-8 w-8">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--primary)" />
            <stop offset=".5" stopColor="var(--cyan)" />
            <stop offset="1" stopColor="var(--ai)" />
          </linearGradient>
        </defs>
        <path d="M24 4H10L4 10l6 6h12l-6 6H4l4 6h14l6-6-6-6H10l6-6h12z" fill="url(#lg)" />
      </svg>
      <span className="text-xl font-black tracking-tight text-navy">
        SPORTZ<span className="text-primary">_</span>AI
      </span>
    </Link>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-xl"
          : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1560px] items-center gap-6 px-4 md:px-8">
        <Logo />
        <nav className="no-scrollbar hidden flex-1 items-center gap-1 overflow-x-auto lg:flex">
          {NAV.map(([n, to]) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-accent text-primary" }}
              inactiveProps={{ className: "text-navy-2" }}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors hover:bg-accent hover:text-primary"
            >
              {n}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-up/10 px-3 py-1 text-[11px] font-bold text-up sm:flex">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-up" />
            SPORTS
          </span>
          <label className="hidden items-center gap-2 rounded-full border border-border bg-soft px-3 py-1.5 xl:flex">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search sports, teams, players..."
              className="w-52 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </label>
          <div className="grad-ai flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-on-color">
            YOU
          </div>
        </div>
      </div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {NAV.map(([n, to]) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-primary text-primary-foreground" }}
            inactiveProps={{ className: "bg-soft text-navy-2" }}
            className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium"
          >
            {n}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="mx-auto grid max-w-[1560px] gap-8 px-4 pb-10 pt-8 md:px-8 lg:grid-cols-[minmax(320px,0.8fr)_2fr] lg:items-center"
    >
      <div>
        <h1 className="text-5xl font-black leading-[0.92] text-navy md:text-6xl xl:text-7xl">
          SPORTS DATA
          <br />
          MADE CLEAR
          <br />
          <span className="text-game">FOR THE GAME</span>
        </h1>
        <p className="mt-5 text-lg font-bold text-navy">Five sports. One scoreboard layer.</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          SPORTZ_AI brings together provider scoreboards and historical Elo forecasts across Formula
          1, NBA, EPL, NFL and MLB. Trained model forecasts will appear when validated models and
          licensed historical data are connected.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/predictions">
            <Btn>
              Explore Predictions <ArrowRight className="h-4 w-4" />
            </Btn>
          </Link>
          <Link to="/live">
            <Btn variant="ghost">See Live Center</Btn>
          </Link>
        </div>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {SPORTS.map((s, i) => (
          <div key={s.key} className="group w-[42vw] shrink-0 snap-start md:w-auto">
            <div
              className={cn(
                s.grad,
                "relative h-[340px] overflow-hidden rounded-[1.6rem] transition-transform duration-500 group-hover:-translate-y-2 md:h-[420px] md:-skew-x-6",
              )}
              style={{ transitionDelay: `${i * 20}ms` }}
            >
              <img
                src={s.img}
                alt={`${s.athlete} — ${s.short}`}
                width={768}
                height={1024}
                className="h-full w-full scale-110 object-cover object-top transition-transform duration-700 group-hover:scale-[1.18] md:skew-x-6"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/70 to-transparent" />
            </div>
            <div className="-mt-6 flex flex-col items-center text-center">
              <div
                className={cn(
                  s.grad,
                  "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background text-xs font-black text-on-color shadow-lift",
                )}
              >
                {s.short}
              </div>
              <p className="mt-1.5 text-sm font-bold text-navy">{s.athlete}</p>
              <p className={cn("text-xs font-bold", s.text)}>{s.short}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ChooseSport() {
  return (
    <section id="predictions" className="mx-auto max-w-[1560px] px-4 md:px-8">
      <SectionTitle
        title="Choose Your Sport"
        sub="Choose a sport to explore its provider scoreboard and historical Elo forecast model."
        right={
          <Link to="/predictions" className="text-sm font-semibold text-primary">
            View All Sports →
          </Link>
        }
      />
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {SPORTS.map((s) => (
          <Link
            key={s.key}
            to="/predictions"
            hash={s.key === "f1" ? "f1" : "players"}
            className="group w-[70vw] shrink-0 snap-start overflow-hidden rounded-[1.4rem] border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift sm:w-[45vw] md:w-auto"
          >
            <div className={cn(s.grad, "relative h-52 overflow-hidden")}>
              <img
                src={s.img}
                alt={s.athlete}
                loading="lazy"
                width={768}
                height={1024}
                className="absolute bottom-0 right-0 h-[115%] w-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="relative p-4 text-on-color">
                <p className="text-2xl font-black">{s.short}</p>
                <p className="max-w-[9rem] text-[11px] font-semibold opacity-90">{s.tagline}</p>
              </div>
              <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold text-navy">
                Scoreboard · {s.short}
              </span>
            </div>
            <div className="p-4">
              <p className="text-[11px] text-muted-foreground">{s.name}</p>
              <p className={cn("text-sm font-bold", s.text)}>{s.tagline}</p>
              <p className="text-xs text-muted-foreground">View provider schedule</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FeaturedAndLive() {
  const [events, setEvents] = useState<ScoreboardEvent[]>([]);
  const [feedState, setFeedState] = useState<"loading" | "ready" | "partial" | "unavailable">(
    "loading",
  );
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await getScoreboards();
        if (!active) return;
        setEvents(response.results.flatMap((result) => result.events));
        setFetchedAt(response.fetchedAt);
        const available = response.results.filter((result) => result.status === "ok").length;
        setFeedState(
          available === response.results.length
            ? "ready"
            : available > 0
              ? "partial"
              : "unavailable",
        );
      } catch {
        if (active) setFeedState("unavailable");
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);
  const featured = events.find((event) => event.state === "scheduled" && event.baseline);
  const liveEvents = events.filter((event) => event.state === "live");
  return (
    <section className="mx-auto mt-6 grid max-w-[1560px] gap-5 px-4 md:px-8 xl:grid-cols-[1.25fr_1fr]">
      <Card>
        <SectionTitle title="Upcoming Model Forecast" right={<DemoTag label="HISTORICAL ELO" />} />
        {featured ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SportBadge
                grad={sport(featured.sport).grad}
                label={sport(featured.sport).short}
                size="sm"
              />
              {featured.league} ·{" "}
              {featured.startTime
                ? new Date(featured.startTime).toLocaleString()
                : "Start time unavailable"}
            </div>
            <p className="text-lg font-bold text-navy">{featured.name}</p>
            <p className="text-xs text-muted-foreground">
              Historical Elo probabilities. They are not betting advice and are not guaranteed to be
              calibrated.
            </p>
            {featured.competitors.map((team, index) => (
              <div key={team.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-navy">
                    {team.name}{" "}
                    <span className="text-muted-foreground">
                      {team.record ? `(${team.record})` : ""}
                    </span>
                  </span>
                  <b className="num text-primary">
                    {featured.baseline?.[index] ?? team.probability ?? 0}%
                  </b>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${featured.baseline?.[index] ?? team.probability ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
            {featured.drawProbability != null && (
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-navy">Draw</span>
                  <b className="num text-primary">{featured.drawProbability}%</b>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${featured.drawProbability}%` }}
                  />
                </div>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              Model: {featured.model} · source feed refreshed{" "}
              {fetchedAt ? new Date(fetchedAt).toLocaleTimeString() : "—"}
            </p>
          </div>
        ) : (
          <p className="rounded-xl bg-soft p-4 text-sm text-muted-foreground">
            {feedState === "loading"
              ? "Loading provider schedule…"
              : feedState === "unavailable"
                ? "Scoreboard provider is unavailable. No forecast is shown."
                : feedState === "partial"
                  ? "Some scoreboard feeds are unavailable. No forecast is shown without a complete event record."
                  : "No upcoming event with team records is currently available. No forecast is shown."}
          </p>
        )}
      </Card>
      <Card id="live">
        <SectionTitle title="Live Center" right={<DemoTag label="PROVIDER FEEDS" />} />
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-muted-foreground sm:grid-cols-[auto_1fr_auto_auto]">
          <span>Sport</span>
          <span>Match / Event</span>
          <span className="hidden sm:block">Score</span>
          <span>Status</span>
        </div>
        <div className="mt-2 divide-y divide-border">
          {liveEvents.map((event) => {
            const s = sport(event.sport);
            return (
              <div
                key={event.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 py-3 sm:grid-cols-[auto_1fr_auto_auto]"
              >
                <SportBadge grad={s.grad} label={s.short} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-navy">{event.shortName}</p>
                  <p className="text-[11px] text-muted-foreground">{event.status}</p>
                </div>
                <span className="num hidden text-sm font-bold text-navy sm:block">
                  {event.competitors.map((team) => team.score ?? "—").join(" – ")}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-down/10 px-2 py-0.5 text-[10px] font-bold text-down">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-down" />
                  Live
                </span>
              </div>
            );
          })}
          {liveEvents.length === 0 && (
            <p className="py-5 text-sm text-muted-foreground">
              {feedState === "loading"
                ? "Checking provider for live events…"
                : feedState === "unavailable"
                  ? "Live scores are unavailable because the provider could not be reached."
                  : feedState === "partial"
                    ? "Some scoreboard feeds are unavailable, and no live event was returned."
                    : "No live events reported by the provider right now."}
            </p>
          )}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">
          Provider scoreboards · refreshed{" "}
          {fetchedAt ? new Date(fetchedAt).toLocaleTimeString() : "—"} · no synthetic live scores
        </p>
      </Card>
    </section>
  );
}

export function Explain() {
  const [alt, setAlt] = useState(false);
  const [showImp, setShowImp] = useState(false);
  const factors = FACTORS.map((f) => (alt && f.name === "Injuries" ? { ...f, v: 6 } : f));
  const conf = alt ? 64 : 78;
  return (
    <Card id="matchups" className="h-full">
      <SectionTitle
        title="Why does the model lean this way?"
        right={
          alt ? (
            <span className="rounded-full bg-ai/10 px-2 py-0.5 text-[10px] font-bold text-ai">
              SCENARIO: City fully fit
            </span>
          ) : (
            <DemoTag />
          )
        }
      />
      <div className="mb-5 flex items-center gap-6 text-sm font-bold text-navy">
        <span className="flex items-center gap-2">
          <SportBadge grad="grad-epl" label="ARS" size="sm" />
          Arsenal
        </span>
        <span className="text-muted-foreground">vs</span>
        <span className="flex items-center gap-2">
          <SportBadge grad="grad-nfl" label="MCI" size="sm" />
          Man City
        </span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {factors.map((f) => (
            <div key={f.name}>
              <div className="mb-1 flex justify-between text-xs font-semibold text-navy">
                <span>{f.name}</span>
                <span className="num">{f.v}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="grad-nfl h-2 rounded-full transition-all duration-700"
                  style={{ width: `${(f.v / 30) * 100}%` }}
                />
              </div>
              {showImp && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  SHAP mean |Δp|: {((f.v / 100) * 0.42).toFixed(3)}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-soft p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Analysis
            </p>
            <p className="text-sm leading-relaxed text-navy-2">
              {alt
                ? "With City's squad fully available, the injury edge almost disappears. Arsenal still lead on home form and attacking metrics, but the matchup becomes close to a coin flip and uncertainty rises."
                : "Arsenal's home form, better attacking metrics and Manchester City's injury concerns are the biggest contributors to this prediction. Venue and recent form provide additional support, while the model remains cautious because the matchup is still relatively balanced."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Ring pct={conf} size={84} stroke={8}>
              <span className="num text-lg font-black text-navy">{conf}</span>
              <span className="text-[9px] text-muted-foreground">/100</span>
            </Ring>
            <div className="rounded-xl border border-border px-4 py-3 text-center">
              <Activity className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1 text-xs font-bold text-navy">
                {alt ? "High" : "Medium"} Uncertainty
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn variant="chip" onClick={() => setShowImp((v) => !v)}>
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {showImp ? "Hide" : "View"} Feature Importance
            </Btn>
            <Btn variant="chip" onClick={() => setAlt((v) => !v)}>
              {alt ? "Reset Scenario" : "Run Alternative Scenario"}
            </Btn>
          </div>
        </div>
      </div>
    </Card>
  );
}
