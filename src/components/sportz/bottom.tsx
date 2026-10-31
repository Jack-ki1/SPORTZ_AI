import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  Cloud,
  Database,
  GraduationCap,
  Layers,
  ShieldCheck,
  Star,
  Target,
  Zap,
  Cpu,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import monaco from "@/assets/monaco.jpg";
import modelArtifact from "../../../shared/sports-models.json";
import {
  DRIVERS,
  GRID,
  PLAYERS,
  SEASON,
  SPORTS,
  FACTORS,
  isSportKey,
  sport,
  type SportKey,
} from "@/lib/sportz-data";
import { Btn, Card, DemoTag, Ring, SectionTitle, SportBadge } from "./ui";
import { Logo } from "./top";

const F1_TABS = [
  "Race Winner",
  "Podium",
  "Qualifying",
  "Strategy",
  "Weather",
  "Simulation",
] as const;

export function F1Intel() {
  const [tab, setTab] = useState<(typeof F1_TABS)[number]>("Race Winner");
  const key = tab === "Podium" ? "podium" : tab === "Qualifying" ? "quali" : "win";
  return (
    <Card id="f1" className="h-full">
      <SectionTitle
        title="F1 Race Intelligence"
        sub="Illustrative race analysis. No current F1 session provider is configured."
        right={<DemoTag label="DEMO DATA" />}
      />
      <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto">
        {F1_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              t === tab ? "grad-f1 text-on-color" : "bg-soft text-navy-2 hover:text-f1",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <img
          src={monaco}
          alt="Monaco street circuit"
          loading="lazy"
          width={1280}
          height={720}
          className="h-56 w-full rounded-2xl object-cover lg:h-full"
        />
        <div className="space-y-2">
          {tab === "Strategy" ? (
            <InfoList
              rows={[
                ["Soft (S)", "Start · 18 laps", "bg-down"],
                ["Medium (M)", "1-stop · 60 laps", "bg-warn"],
                ["Hard (H)", "Alt 1-stop", "bg-muted-foreground"],
                ["Intermediate", "If rain > 40%", "bg-up"],
                ["Wet (W)", "Unlikely", "bg-primary"],
              ]}
            />
          ) : tab === "Weather" ? (
            <InfoList
              rows={[
                ["Conditions", "Light rain · 22°C", "bg-cyan"],
                ["Rain chance", "28% (laps 30–50)", "bg-primary"],
                ["Track temp", "38°C", "bg-f1"],
                ["Wind", "9 km/h SW", "bg-muted-foreground"],
                ["Impact", "+3% chaos factor", "bg-warn"],
              ]}
            />
          ) : tab === "Simulation" ? (
            <div className="flex items-center gap-4 rounded-2xl bg-soft p-4">
              <Ring pct={68} size={110} stroke={12}>
                <span className="num text-xl font-black text-navy">10k</span>
                <span className="text-[9px] text-muted-foreground">runs</span>
              </Ring>
              <div className="space-y-1 text-sm">
                <p className="font-bold text-navy">Monte Carlo · Verstappen</p>
                <p>
                  Win <b className="num">32%</b>
                </p>
                <p>
                  Podium <b className="num">68%</b>
                </p>
                <p>
                  DNF <b className="num text-down">12%</b>
                </p>
                <p className="text-xs text-muted-foreground">90% CI win: 29–35%</p>
              </div>
            </div>
          ) : (
            DRIVERS.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center gap-3 rounded-xl border border-border px-3 py-2"
              >
                <span className="num w-4 text-sm font-black text-f1">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-navy">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground">{d.team}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div
                      className="grad-f1 h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${d[key]}%` }}
                    />
                  </div>
                </div>
                <span className="num text-sm font-black text-navy">{d[key]}%</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-3">
          <p className="mb-1 text-xs font-bold text-navy">Qualifying Grid (Top 10)</p>
          <ol className="grid grid-cols-2 gap-x-3 text-[11px] text-navy-2">
            {GRID.map((g, i) => (
              <li key={g}>
                <span className="num font-bold text-f1">{i + 1}</span> {g}
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs font-bold text-navy">Weather</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-navy-2">
            <Cloud className="h-5 w-5 text-cyan" />
            Light rain · 22°C
          </p>
          <p className="mt-3 text-xs font-bold text-navy">Safety Car Risk</p>
          <p className="text-sm font-semibold text-warn">Medium · 41%</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs font-bold text-navy">Chaos Factor</p>
          <p className="num mt-1 text-3xl font-black text-f1">0.37</p>
          <p className="text-[11px] text-muted-foreground">
            Grid influence at Monaco: very high (0.82)
          </p>
        </div>
      </div>
    </Card>
  );
}

function InfoList({ rows }: { rows: [string, string, string][] }) {
  return (
    <>
      {rows.map(([a, b, c]) => (
        <div
          key={a}
          className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"
        >
          <span className={cn("h-3 w-3 rounded-full", c)} />
          <span className="flex-1 text-sm font-bold text-navy">{a}</span>
          <span className="text-xs text-muted-foreground">{b}</span>
        </div>
      ))}
    </>
  );
}

export function Players() {
  const keys = ["nba", "epl", "nfl", "mlb"] as const;
  return (
    <section
      id="players"
      className="mx-auto mt-6 grid max-w-[1560px] gap-5 px-4 sm:grid-cols-2 md:px-8 xl:grid-cols-4"
    >
      <div className="sm:col-span-2 xl:col-span-4">
        <SectionTitle
          title="Player examples"
          sub="Illustrative sample content. Live player statistics are not connected."
          right={<DemoTag label="DEMO DATA" />}
        />
      </div>
      {keys.map((k) => {
        const s = sport(k),
          p = PLAYERS[k];
        return (
          <div
            key={k}
            className="overflow-hidden rounded-[1.4rem] border border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-lift"
          >
            <div className={cn(s.grad, "relative h-28 overflow-hidden p-4 text-on-color")}>
              <p className="text-xl font-black">{s.short}</p>
              <span className="mt-2 inline-block rounded-md bg-background/20 px-2 py-0.5 text-xs font-bold">
                {p.title}
              </span>
              <img
                src={s.img}
                alt={s.athlete}
                loading="lazy"
                width={768}
                height={1024}
                className="absolute -bottom-6 right-0 h-40 w-auto object-cover"
              />
            </div>
            <div className="divide-y divide-border px-4">
              {p.rows.map((r, i) => (
                <div key={r.n} className="flex items-center gap-3 py-3">
                  {i === 0 ? (
                    <img
                      src={s.img}
                      alt=""
                      loading="lazy"
                      className="h-9 w-9 rounded-full object-cover object-top"
                    />
                  ) : (
                    <div
                      className={cn(
                        s.grad,
                        "flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold text-on-color",
                      )}
                    >
                      {r.n
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy">{r.n}</p>
                    <p className="num text-[11px] text-muted-foreground">{r.a}</p>
                  </div>
                  <span className="num text-xs font-bold text-navy-2">{r.b}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-border bg-soft px-4 py-3">
              {p.foot.map(([a, b]) => (
                <div key={a}>
                  <p className="text-[10px] text-muted-foreground">{a}</p>
                  <p
                    className={cn(
                      "text-sm font-black",
                      a === "Model Impact" ? s.text : "text-navy",
                    )}
                  >
                    {b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function Copilot() {
  return (
    <Card id="copilot" className="relative h-full overflow-hidden">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-ai/10 blur-3xl" />
      <SectionTitle
        title="Prediction Copilot"
        sub="Ask questions about real provider fixtures and their model forecasts."
        right={<DemoTag label="OPTIONAL AI" />}
      />
      <div className="relative flex flex-wrap items-center gap-4 rounded-2xl border border-ai/15 bg-gradient-to-br from-ai/[.07] via-card to-primary/[.06] p-5">
        <div className="grad-ai flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-on-color shadow-lg shadow-ai/20">
          <Bot className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-navy">Your model. Your match context.</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Choose a provider and model in Settings, then ask Copilot from Predictions with a
            selected fixture attached.
          </p>
        </div>
        <Link
          to="/predictions"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ai to-primary px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5"
        >
          Open Predictions <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary"
        >
          Configure AI
        </Link>
      </div>
    </Card>
  );
}

export function ModelLab() {
  const steps: [string, typeof Database, string][] = [
    ["Data Sources", Database, "grad-nfl"],
    ["Feature Store", Layers, "grad-epl"],
    ["Sport Model", Cpu, "grad-nba"],
    ["Ensemble", Zap, "grad-epl"],
    ["Calibration", Target, "grad-nfl"],
    ["Forecast", LineChart, "grad-f1"],
  ];
  return (
    <Card id="lab" className="h-full">
      <SectionTitle
        title="Model Lab"
        sub={`Version ${modelArtifact.artifactVersion} · generated ${new Date(modelArtifact.generatedAt).toLocaleDateString()}`}
        right={<DemoTag label="ELO MODELS" />}
      />
      <div className="no-scrollbar flex items-center overflow-x-auto pb-2">
        {steps.map(([n, I, g], i) => (
          <div key={n} className="flex items-center">
            <div className="flex w-24 flex-col items-center gap-1.5 rounded-xl border border-border bg-soft p-3 text-center">
              <div
                className={cn(
                  g,
                  "flex h-9 w-9 items-center justify-center rounded-lg text-on-color",
                )}
              >
                <I className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold text-navy">{n}</span>
            </div>
            {i < steps.length - 1 && <div className="flow-line h-0.5 w-6 shrink-0" />}
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {SPORTS.map((s) => {
          const model = modelArtifact.models[s.key];
          return (
            <div key={s.key} className="rounded-xl bg-soft p-3">
              <p className="text-sm font-bold text-navy">
                {s.short} · {model.algorithm}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {model.metrics.games.toLocaleString()} historical outcomes · Brier{" "}
                {model.metrics.brierScore ?? "—"} · accuracy{" "}
                {model.metrics.accuracy == null
                  ? "—"
                  : `${(model.metrics.accuracy * 100).toFixed(1)}%`}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 rounded-xl bg-soft p-4 text-xs leading-relaxed text-muted-foreground">
        Historical chronological Elo backtests. These are simple baseline models without player
        features or probability calibration; metrics differ by sport and should not be compared
        directly. Refresh with <code>npm run models:train</code>.
      </p>
    </Card>
  );
}

export function Backtesting() {
  return (
    <section id="backtests" className="mx-auto mt-6 max-w-[1560px] px-4 md:px-8">
      <Card>
        <SectionTitle
          title="Historical Walk-Forward Evaluation"
          sub="Each prediction was scored before that result updated the Elo ratings."
          right={<DemoTag label="MEASURED RESULTS" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="p-2">Sport</th>
                <th className="p-2">Events</th>
                <th className="p-2">Brier score</th>
                <th className="p-2">Log loss</th>
                <th className="p-2">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {SPORTS.map((s) => {
                const m = modelArtifact.models[s.key].metrics;
                return (
                  <tr key={s.key} className="border-b border-border last:border-0">
                    <td className="p-2 font-bold text-navy">{s.short}</td>
                    <td className="num p-2">{m.games.toLocaleString()}</td>
                    <td className="num p-2">{m.brierScore ?? "—"}</td>
                    <td className="num p-2">{m.logLoss ?? "—"}</td>
                    <td className="num p-2">
                      {m.accuracy == null ? "—" : `${(m.accuracy * 100).toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 rounded-xl bg-soft p-4 text-xs leading-relaxed text-muted-foreground">
          The evaluation is chronological and uses only prior results to rate each event. Brier
          scores use different outcome definitions (including three-way EPL and multi-driver F1), so
          compare a sport only against its own future model versions. Data availability, naming
          differences and source terms limit coverage; see Data Sources & Limits.
        </p>
      </Card>
    </section>
  );
}

function simulate(k: SportKey, n: number) {
  const model = modelArtifact.models[k];
  const ratings = model.ratings as Record<string, number>;
  const names = model.teams as Record<string, string>;
  const entries = Object.entries(ratings).map(([id, rating]) => ({
    id,
    rating,
    name: names[id] ?? id,
  }));
  const wins = entries.map(() => 0);
  const strengths = entries.map(({ rating }) => Math.exp((rating - 1500) / 180));
  const total = strengths.reduce((sum, value) => sum + value, 0);
  for (let s = 0; s < n; s++) {
    let draw = Math.random() * total;
    let winner = 0;
    for (let i = 0; i < strengths.length; i++) {
      draw -= strengths[i] ?? 0;
      if (draw <= 0) {
        winner = i;
        break;
      }
    }
    wins[winner] = (wins[winner] ?? 0) + 1;
  }
  return entries
    .map(({ name }, i) => ({ name, pct: Math.round(((wins[i] ?? 0) / n) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 12);
}

export function SeasonSim() {
  const [k, setK] = useState<SportKey>("epl");
  const [n, setN] = useState(10000);
  const [res, setRes] = useState<{ name: string; pct: number }[]>([]);
  useEffect(() => {
    setRes(simulate(k, n));
  }, [k, n]);
  const s = sport(k);
  return (
    <Card id="simulator" className="h-full">
      <SectionTitle
        title="Elo-Weighted Outcome Simulator"
        sub={`${SEASON[k].label} · hypothetical outcome draws using the trained Elo ratings`}
        right={<DemoTag label="ILLUSTRATIVE SIMULATION" />}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {SPORTS.map((x) => (
          <button
            key={x.key}
            onClick={() => setK(x.key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              x.key === k ? cn(x.grad, "text-on-color") : "bg-soft text-navy-2",
            )}
          >
            {x.short}
          </button>
        ))}
        <select
          value={n}
          onChange={(e) => setN(+e.target.value)}
          className="ml-auto rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold"
        >
          {[1000, 10000].map((v) => (
            <option key={v} value={v}>
              {v.toLocaleString()} sims
            </option>
          ))}
        </select>
        <Btn variant="chip" onClick={() => setRes(simulate(k, n))}>
          Re-run
        </Btn>
      </div>
      <div className="space-y-3">
        {res.map((r) => (
          <div key={r.name}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-bold text-navy">{r.name}</span>
              <span className={cn("num font-black", s.text)}>{r.pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted">
              <div
                className={cn(s.grad, "h-2.5 rounded-full transition-all duration-700")}
                style={{ width: `${r.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        This samples a possible top outcome from Elo rating strength. It does not simulate real
        fixtures, injuries, rosters, or an actual season schedule.
      </p>
    </Card>
  );
}

export function DataTrust() {
  return (
    <Card className="h-full">
      <SectionTitle
        title="Data Sources & Limits"
        sub="Provider and model coverage, stated plainly."
      />
      <p className="mb-3 rounded-xl bg-warn/10 px-3 py-2 text-xs font-semibold text-warn">
        Schedule and result feeds are public endpoints with no production service guarantee.
        Historical model data can have source specific terms.
      </p>
      <div className="divide-y divide-border">
        {SPORTS.map((s) => {
          return (
            <div key={s.key} className="flex items-center gap-3 py-2.5">
              <SportBadge grad={s.grad} label={s.short} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-navy">
                  {s.key === "f1" ? "Jolpica F1 API" : "ESPN scoreboard"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {s.key === "f1"
                    ? "Ergast compatible schedule and driver standings; no live telemetry."
                    : "Schedule and score feed; status and fetch time appear in Live Center."}
                </p>
              </div>
              <span className="rounded-full bg-warn/10 px-2 py-0.5 text-[10px] font-bold text-warn">
                Unofficial
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Historical Elo models use OpenFootball public domain EPL results, nflverse schedules and
        scores (CC BY 4.0 attribution), Jolpica/Ergast F1 results, MLB Stats API results, and a
        public NBA team log archive. NBA derived data rights and permitted commercial use need
        separate confirmation; do not treat this prototype as cleared for commercial or wagering
        use. ESPN and these public APIs can change without notice.
      </p>
    </Card>
  );
}

type HomeWatchItem = { sport: SportKey; id: string; name: string };
export function Watchlist() {
  const [list, setList] = useState<HomeWatchItem[]>([]);
  useEffect(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem("sportz-watch-v2") ?? "[]");
      const valid = Array.isArray(value)
        ? value.filter((item): item is HomeWatchItem => {
            if (typeof item !== "object" || item === null) return false;
            const candidate = item as Record<string, unknown>;
            return (
              isSportKey(candidate["sport"]) &&
              typeof candidate["id"] === "string" &&
              typeof candidate["name"] === "string"
            );
          })
        : [];
      setList(valid);
    } catch {
      setList([]);
    }
  }, []);
  return (
    <Card id="watchlist" className="h-full">
      <SectionTitle title="Watchlist" sub={`${list.length} followed teams or drivers`} />
      {list.length ? (
        <div className="space-y-2">
          {list.slice(0, 5).map((item) => (
            <div
              key={`${item.sport}:${item.id}`}
              className="flex items-center gap-3 rounded-xl border border-border px-3 py-2"
            >
              <SportBadge grad={sport(item.sport).grad} label={sport(item.sport).short} size="sm" />
              <span className="flex-1 text-sm font-bold text-navy">{item.name}</span>
              <Star className="h-4 w-4 fill-warn text-warn" />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          Follow a team or driver to see it summarized here.
        </p>
      )}
      <Link
        to="/watchlist"
        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        Manage watchlist <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

export function Footer() {
  const steps: [string, string, string, string][] = [
    ["1", "PREDICT", "Accurate, data-driven forecasts", "grad-f1"],
    ["2", "EXPLAIN", "Clear reasoning, key factors", "grad-nba"],
    ["3", "SIMULATE", "Explore scenarios, manage risk", "grad-epl"],
    ["4", "LEARN", "Get smarter with every game", "grad-nfl"],
  ];
  return (
    <footer className="mt-10 border-t border-border bg-soft">
      <div className="mx-auto grid max-w-[1560px] items-center gap-6 px-4 py-10 md:px-8 lg:grid-cols-[1fr_3fr_1fr]">
        <div>
          <Logo />
          <p className="mt-2 text-lg font-black text-navy">
            The Future of
            <br />
            Sports Intelligence
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {steps.map(([n, t, d, g]) => (
            <div
              key={t}
              className={cn(
                g,
                "rounded-2xl p-4 text-on-color transition-transform hover:-translate-y-1",
              )}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-sm font-black text-navy">
                {n}
              </span>
              <p className="mt-2 font-black">{t}</p>
              <p className="text-xs opacity-90">{d}</p>
            </div>
          ))}
        </div>
        <div className="text-sm font-semibold text-navy-2">
          More sports. More data. More possibilities.
          <Link to="/predictions" className="mt-3 block">
            <Btn>
              Join the Future <ArrowRight className="h-4 w-4" />
            </Btn>
          </Link>
        </div>
      </div>

      {/* Prominent Legal Disclaimer & Academic Student Project Notice */}
      <div className="mx-auto max-w-[1560px] px-4 pb-8 md:px-8">
        <div className="rounded-2xl border border-border/80 bg-card p-5 text-xs text-muted-foreground shadow-xs">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider text-navy">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>Academic Project Notice &amp; Legal Disclaimer</span>
          </div>
          <div className="mt-3 grid gap-3.5 leading-relaxed md:grid-cols-2">
            <div>
              <p className="font-bold text-navy">Educational &amp; Student Project Purpose:</p>
              <p className="mt-0.5">
                SPORTZ_AI is a non-commercial student experiment built strictly for educational,
                learning, portfolio demonstration, and experimental research testing purposes. It
                was created for fun as a school project to explore sports machine learning and
                user-driven AI integrations. It is NOT a commercial enterprise, financial service,
                or licensed wagering platform.
              </p>
            </div>
            <div>
              <p className="font-bold text-navy">
                No Betting or Financial Advice (Zero Wagering Reliance):
              </p>
              <p className="mt-0.5">
                This software does not provide sports betting, gambling, financial, or investment
                advice. All win probabilities, projected spreads, fair odds, and AI match analyses
                are hypothetical mathematical simulations generated for testing purposes only. They
                are not instructions, tips, or guarantees of any real-world sports outcome. Do not
                use this software for real-money wagering. The student author assumes zero liability
                or legal responsibility for any actions or financial losses resulting from the use
                of this software.
              </p>
            </div>
            <div className="border-t border-border/60 pt-2.5 md:col-span-2">
              <p className="font-bold text-navy">
                Non-Affiliation &amp; Nominative Fair Use Trademark Disclaimer:
              </p>
              <p className="mt-0.5">
                SPORTZ_AI is an independent academic project and is NOT affiliated with, endorsed
                by, sponsored by, or associated with Formula 1 (FIA / Formula One Licensing B.V.),
                the National Basketball Association (NBA), the English Premier League (The Football
                Association Premier League Limited), the National Football League (NFL), Major
                League Baseball (MLB), ESPN, or any participating team, club, or athlete. All
                trademarks, team names, and logos belong strictly to their respective owners and are
                referenced solely under nominative fair use for descriptive, academic identification
                purposes. This software and data feeds are provided &ldquo;AS IS&rdquo; and
                &ldquo;AS AVAILABLE&rdquo; without warranties of any kind.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] font-medium text-muted-foreground">
          &copy; {new Date().getFullYear()} SPORTZ_AI &middot; Built for fun &amp; academic testing
          &middot; Non-commercial student project &middot; All trademarks belong to their respective
          holders.
        </p>
      </div>
    </footer>
  );
}
