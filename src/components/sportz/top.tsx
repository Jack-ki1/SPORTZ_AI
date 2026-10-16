import { useEffect, useState } from "react";
import { ArrowRight, Search, Sparkles, SlidersHorizontal, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { SPORTS, LIVE, FACTORS, sport } from "@/lib/sportz-data";
import { Btn, Card, DemoTag, Ring, SectionTitle, Sparkline, SportBadge } from "./ui";

const NAV = [
  ["Home", "/"],
  ["Predictions", "/predictions"],
  ["Live Center", "/live"],
  ["Matchups", "/matchups"],
  ["AI Copilot", "/copilot"],
  ["Model Lab", "/lab"],
  ["Backtests", "/backtests"],
  ["Watchlist", "/watchlist"],
  ["Simulator", "/simulator"],
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
            LIVE
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
          AI THAT
          <br />
          UNDERSTANDS
          <br />
          <span className="text-game">THE GAME</span>
        </h1>
        <p className="mt-5 text-lg font-bold text-navy">Five sports. One intelligence layer.</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          SPORTZ_AI uses advanced AI, real-time sports data, predictive analytics and simulation to
          deliver intelligent forecasts, insights and explanations across Formula 1, NBA, EPL, NFL
          and MLB.
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
        sub="Get AI-powered predictions, insights and analysis for your favourite sport."
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
                {s.pick} · {s.pickPct}%
              </span>
            </div>
            <div className="p-4">
              <p className="text-[11px] text-muted-foreground">{s.nextLabel}</p>
              <p className={cn("text-sm font-bold", s.text)}>{s.next}</p>
              <p className="text-xs text-muted-foreground">{s.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

const rand = (n: number, seed: number) =>
  Array.from(
    { length: n },
    (_, i) => 50 + Math.sin(i * 0.9 + seed) * 10 + i * 1.5 + ((i * seed) % 5),
  );

export function FeaturedAndLive() {
  const [rows, setRows] = useState(LIVE.map((r, i) => ({ ...r, spark: rand(12, i + 1) })));
  useEffect(() => {
    const t = setInterval(
      () =>
        setRows((rs) =>
          rs.map((r) => {
            const d = (Math.random() - 0.45) * 0.4;
            const spark = [...r.spark.slice(1), (r.spark[r.spark.length - 1] ?? 50) + d * 10];
            return { ...r, move: +(r.move + d).toFixed(1), spark };
          }),
        ),
      2500,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <section className="mx-auto mt-6 grid max-w-[1560px] gap-5 px-4 md:px-8 xl:grid-cols-[1.25fr_1fr]">
      <Card>
        <SectionTitle title="Featured Prediction" right={<DemoTag />} />
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <SportBadge grad="grad-epl" label="EPL" size="sm" /> Today · 16:30 · Premier League
        </div>
        <div className="grid gap-6 md:grid-cols-[1fr_220px]">
          <div>
            <div className="flex items-center justify-around gap-2">
              <Team name="Arsenal" short="ARS" />
              <Ring pct={57} size={150}>
                <span className="num text-4xl font-black text-navy">57%</span>
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
                  HOME WIN
                </span>
              </Ring>
              <Team name="Man City" short="MCI" />
            </div>
            <div className="mt-5 grid grid-cols-3 text-center">
              {[
                ["57%", "Home Win", "text-primary"],
                ["26%", "Draw", "text-navy"],
                ["17%", "Away Win", "text-navy"],
              ].map(([v, l, c]) => (
                <div key={l}>
                  <p className={cn("num text-2xl font-black", c)}>{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between rounded-xl bg-soft px-4 py-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Home win trend · 7d</p>
                <Sparkline data={[48, 50, 49, 52, 54, 55, 57]} className="w-28" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Market consensus</p>
                <Sparkline data={[52, 51, 53, 52, 52, 53, 53]} className="w-28" />
              </div>
            </div>
          </div>
          <div className="space-y-4 border-border md:border-l md:pl-6">
            <Stat
              label="Projected Score"
              value={<span className="text-primary">2 – 1</span>}
              note="(Arsenal)"
            />
            <div>
              <Stat
                label="Confidence"
                value={
                  <>
                    78<span className="text-base text-muted-foreground">/100</span>
                  </>
                }
              />
              <div className="mt-1.5 h-2 rounded-full bg-muted">
                <div className="h-2 w-[78%] rounded-full bg-up" />
              </div>
            </div>
            <Stat
              label="Data Freshness"
              value={<span className="text-base text-up">3 min ago</span>}
            />
            <Stat label="Model" value={<span className="text-sm">SPORTZ Ensemble v1.4</span>} />
            <Link to="/matchups">
              <Btn className="w-full">
                Explain Prediction <ArrowRight className="h-4 w-4" />
              </Btn>
            </Link>
          </div>
        </div>
      </Card>
      <Card id="live">
        <SectionTitle title="Live Center" right={<DemoTag label="SIMULATED FEED" />} />
        <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-muted-foreground sm:grid-cols-[auto_1fr_auto_auto_auto]">
          <span>Sport</span>
          <span>Match / Event</span>
          <span className="hidden sm:block">Score</span>
          <span>Status</span>
          <span className="text-right">Momentum</span>
        </div>
        <div className="mt-2 divide-y divide-border">
          {rows.map((r) => {
            const s = sport(r.k);
            return (
              <div
                key={r.k}
                className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-3 py-3 sm:grid-cols-[auto_1fr_auto_auto_auto]"
              >
                <SportBadge grad={s.grad} label={s.short} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-navy">{r.event}</p>
                  <p className="text-[11px] text-muted-foreground">{r.state}</p>
                </div>
                <span className="num hidden text-sm font-bold text-navy sm:block">{r.score}</span>
                <span className="flex items-center gap-1 rounded-full bg-down/10 px-2 py-0.5 text-[10px] font-bold text-down">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-down" />
                  Live
                </span>
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={cn(
                      "num w-12 text-right text-xs font-bold",
                      r.move >= 0 ? "text-up" : "text-down",
                    )}
                  >
                    {r.move >= 0 ? "+" : ""}
                    {r.move}%
                  </span>
                  <Sparkline data={r.spark} up={r.move >= 0} className="hidden w-16 sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}

function Team({ name, short }: { name: string; short: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-soft text-sm font-black text-navy">
        {short}
      </div>
      <span className="text-sm font-bold text-navy">{name}</span>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <p className="num text-3xl font-black text-navy">{value}</p>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
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
