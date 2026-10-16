import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Cloud,
  Database,
  Gauge,
  Layers,
  Send,
  ShieldCheck,
  Star,
  Target,
  Zap,
  Cpu,
  LineChart,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import monaco from "@/assets/monaco.jpg";
import {
  DRIVERS,
  GRID,
  LIVE,
  MODELS,
  PLAYERS,
  SEASON,
  SPORTS,
  TRUST,
  FACTORS,
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
        sub="Multi-factor AI race forecasting · Monaco GP · May 25, 2026"
        right={<DemoTag />}
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

type Msg = { role: "user" | "ai"; text: string };
function answer(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("arsenal") || t.includes("favour") || t.includes("explain"))
    return `For Arsenal vs Man City the ensemble gives Arsenal 57% (draw 26%, City 17%), confidence 78/100. Top drivers: ${FACTORS.slice(
      0,
      3,
    )
      .map((f) => `${f.name} ${f.v}%`)
      .join(", ")}. Data refreshed 3 min ago, model SPORTZ Ensemble v1.4.`;
  if (t.includes("f1") || t.includes("simulat") || t.includes("race")) {
    const res = simulate("f1", 10000);
    return `Ran 10,000 Monaco scenarios. ${DRIVERS.slice(0, 3)
      .map((d) => `${d.name} ${d.win}% win`)
      .join(", ")}. Season outlook: ${res
      .slice(0, 2)
      .map((r) => `${r.name} ${r.pct}%`)
      .join(", ")}. Safety-car risk is medium (41%).`;
  }
  if (t.includes("compare") || t.includes("mahomes") || t.includes("allen"))
    return "Mahomes: 94.8 QB rating, 4,620 projected yards, model impact 89/100. Allen: 102.4 QB rating, 4.8 EPA. Allen leads efficiency; Mahomes leads late-game win-probability added. Chiefs vs Bills currently 54% Chiefs.";
  if (t.includes("confidence") || t.includes("today"))
    return `Highest-confidence picks today: ${[...SPORTS]
      .sort((a, b) => b.pickPct - a.pickPct)
      .slice(0, 3)
      .map((s) => `${s.pick} (${s.pickPct}%)`)
      .join(", ")}.`;
  if (t.includes("nba") || t.includes("quality"))
    return `NBA data completeness is ${TRUST[1]!.complete}% (refreshed ${TRUST[1]!.ago}). Lakers vs Warriors has the strongest data quality — full tracking and injury feeds.`;
  if (t.includes("backtest"))
    return "30-day walk-forward backtest: Brier 0.082, log loss 0.291, accuracy 68.4% — beating the market baseline by 4.1 pts. Every fold is trained only on data before its test window.";
  if (t.includes("new") || t.includes("like i"))
    return "Think of it like a weather forecast for games: 57% means if this matchup were played 100 times, Arsenal would win about 57. Confidence tells you how sure the model is about that number.";
  return "I can explain predictions, run simulations, compare players or summarise backtests. Try “Why does the model favour Arsenal?”";
}

export function Copilot() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: "Hi — I'm the SPORTZ_AI Copilot. Ask me about any prediction, model or matchup.",
    },
  ]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);
  const ask = (text: string) => {
    if (!text.trim() || busy) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setQ("");
    setBusy(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: answer(text) }]);
      setBusy(false);
    }, 700);
  };
  const prompts = [
    "Why does the model favour Arsenal?",
    "Run 10,000 F1 race scenarios.",
    "Which NBA game has the strongest data quality?",
    "Compare Mahomes and Allen.",
  ];
  const chips: [string, string][] = [
    ["Compare", "Compare Mahomes and Allen"],
    ["Explain", "Explain this model like I'm new to sports analytics"],
    ["Simulate", "Run 10,000 F1 race scenarios"],
    ["Backtest", "Show backtest results"],
    ["Forecast", "Show me today's highest-confidence predictions"],
  ];
  return (
    <Card id="copilot" className="flex h-full flex-col">
      <SectionTitle title="AI Copilot" sub="Ask anything about sports, data or predictions." />
      <div className="flex gap-4">
        <div className="grad-ai hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-on-color sm:flex">
          <Bot className="h-8 w-8" />
        </div>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <Btn key={p} variant="chip" onClick={() => ask(p)}>
              {p}
            </Btn>
          ))}
        </div>
      </div>
      <div
        ref={box}
        className="no-scrollbar mt-4 h-56 space-y-2 overflow-y-auto rounded-2xl bg-soft p-3"
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-card text-navy-2 shadow-[var(--shadow-card)]",
            )}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="w-16 rounded-2xl bg-card px-3 py-2 text-sm text-muted-foreground">
            ···
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
        className="mt-3 flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-4"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition active:scale-90"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map(([l, p]) => (
          <Btn key={l} variant="chip" onClick={() => ask(p)}>
            {l}
          </Btn>
        ))}
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
      <SectionTitle title="Model Lab" sub="From data to prediction — powered by AI." />
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
      <p className="mb-2 mt-4 text-sm font-bold text-navy">Our Models</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {MODELS.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
          >
            <div>
              <p className="text-xs font-bold text-navy">
                {m.name} <span className="font-normal text-muted-foreground">{m.ver}</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                {m.sport} · trained {m.trained}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                m.status === "Retraining"
                  ? "bg-warn/10 text-warn"
                  : m.status === "Production"
                    ? "bg-primary/10 text-primary"
                    : "bg-up/10 text-up",
              )}
            >
              {m.status}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          ["Calibration", "0.082", "↓ better"],
          ["Model Drift", "Low", "stable"],
          ["Latency", "142 ms", "p95"],
          ["Missing Data", "1.8%", "all sports"],
          ["Version", "v1.4.0", "ensemble"],
        ].map(([a, b, c]) => (
          <div key={a} className="rounded-xl bg-soft p-3">
            <p className="text-[10px] text-muted-foreground">{a}</p>
            <p className="num text-lg font-black text-navy">{b}</p>
            <p className="text-[10px] text-up">{c}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

const RANGES = { "7 days": 7, "30 days": 30, Season: 120 } as const;
export function Backtesting() {
  const [range, setRange] = useState<keyof typeof RANGES>("30 days");
  const [sp, setSp] = useState<SportKey | "all">("all");
  const [run, setRun] = useState(0);
  const [loading, setLoading] = useState(false);
  const data = useMemo(() => {
    const n = 24,
      seed = RANGES[range] + (sp === "all" ? 0 : sp.length * 7) + run * 3;
    return Array.from({ length: n }, (_, i) => ({
      m: 0.6 + Math.sin(i / 2 + seed) * 0.04 + i * 0.003,
      b: 0.55 + Math.sin(i / 3 + seed) * 0.03,
    }));
  }, [range, sp, run]);
  const acc = ((data.reduce((a, d) => a + d.m, 0) / data.length) * 100).toFixed(1);
  const path = (k: "m" | "b") =>
    data
      .map(
        (d, i) => `${i ? "L" : "M"}${(i / (data.length - 1)) * 400},${140 - (d[k] - 0.45) * 500}`,
      )
      .join(" ");
  const ranking = [...MODELS].sort((a, b) => a.score - b.score);
  return (
    <section id="backtests" className="mx-auto mt-6 max-w-[1560px] px-4 md:px-8">
      <Card>
        <SectionTitle
          title="Backtesting & Trust"
          sub="How good has the model actually been? Walk-forward validation — no future data leaks into training."
          right={<DemoTag label="SIMULATED BACKTEST" />}
        />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(Object.keys(RANGES) as (keyof typeof RANGES)[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                r === range ? "bg-navy text-primary-foreground" : "bg-soft text-navy-2",
              )}
            >
              {r}
            </button>
          ))}
          <select
            value={sp}
            onChange={(e) => setSp(e.target.value as SportKey | "all")}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-navy"
          >
            <option value="all">All sports</option>
            {SPORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.short}
              </option>
            ))}
          </select>
          <Btn
            className="ml-auto"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setRun((x) => x + 1);
                setLoading(false);
              }, 900);
            }}
          >
            {loading ? "Running…" : "Run Backtest"}
          </Btn>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="rounded-2xl border border-border p-4">
            <div className="mb-2 flex gap-4 text-[11px] font-semibold">
              <span className="text-primary">— Model</span>
              <span className="text-muted-foreground">— Baseline</span>
            </div>
            <svg viewBox="0 0 400 150" className="h-44 w-full" preserveAspectRatio="none">
              {[30, 70, 110].map((y) => (
                <line key={y} x1="0" x2="400" y1={y} y2={y} className="stroke-border" />
              ))}
              <path
                d={path("b")}
                className="fill-none stroke-muted-foreground"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d={path("m")}
                className="fill-none stroke-primary transition-all"
                strokeWidth="2.5"
              />
            </svg>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="mb-3 text-xs font-bold text-navy">Performance Metrics</p>
            {[
              ["Brier Score", "0.082"],
              ["Log Loss", "0.291"],
              ["Accuracy", `${acc}%`],
              ["MAE (score)", "1.14"],
              ["Calibration error", "0.019"],
            ].map(([a, b]) => (
              <div
                key={a}
                className="flex justify-between border-b border-border py-2 text-sm last:border-0"
              >
                <span className="text-muted-foreground">{a}</span>
                <span className="num font-bold text-navy">{b}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="mb-3 text-xs font-bold text-navy">
              Model Tournament · Brier (lower = better)
            </p>
            {ranking.map((m, i) => (
              <div key={m.name} className="mb-2">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-navy">
                    {i + 1}. {m.name}
                  </span>
                  <span className="num text-muted-foreground">{m.score.toFixed(3)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div
                    className={cn("h-1.5 rounded-full", i === 0 ? "grad-ai" : "bg-primary/40")}
                    style={{ width: `${(0.16 / m.score) * 100 - 20}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-col items-center gap-2 rounded-2xl bg-soft p-5 text-center">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <p className="text-lg font-black text-navy">
            Probability, evidence, uncertainty — <span className="text-game">never certainty.</span>
          </p>
          <p className="text-sm text-muted-foreground">
            We don't just predict. We show you the why.
          </p>
        </div>
      </Card>
    </section>
  );
}

function simulate(k: SportKey, n: number) {
  const teams = SEASON[k].teams,
    wins = teams.map(() => 0);
  for (let s = 0; s < n; s++) {
    let best = -1,
      bi = 0;
    teams.forEach(([, str], i) => {
      const v = str + (Math.random() + Math.random() + Math.random() - 1.5) * 0.5;
      if (v > best) {
        best = v;
        bi = i;
      }
    });
    wins[bi] = (wins[bi] ?? 0) + 1;
  }
  return teams
    .map(([name], i) => ({ name, pct: Math.round(((wins[i] ?? 0) / n) * 100) }))
    .sort((a, b) => b.pct - a.pct);
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
        title="Season Simulator"
        sub={`${SEASON[k].label} · 2026 season`}
        right={<DemoTag label="SIMULATED" />}
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
          {[1000, 10000, 50000].map((v) => (
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
    </Card>
  );
}

export function DataTrust() {
  return (
    <Card className="h-full">
      <SectionTitle title="Data Trust" sub="Where every number comes from." />
      <p className="mb-3 rounded-xl bg-warn/10 px-3 py-2 text-xs font-semibold text-warn">
        This preview uses DEMO data. Feeds go LIVE once a data provider is connected.
      </p>
      <div className="divide-y divide-border">
        {TRUST.map((t) => {
          const s = sport(t.k);
          return (
            <div key={t.k} className="flex items-center gap-3 py-2.5">
              <SportBadge grad={s.grad} label={s.short} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-navy">{t.src}</p>
                <p className="text-[11px] text-muted-foreground">
                  Refreshed {t.ago} · {t.complete}% complete
                </p>
              </div>
              <span className="rounded-full bg-warn/10 px-2 py-0.5 text-[10px] font-bold text-warn">
                DEMO
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const ALL_FOLLOW = [
  "Max Verstappen",
  "Lando Norris",
  "Arsenal",
  "Luka Dončić",
  "Patrick Mahomes",
  "Shohei Ohtani",
  "Chiefs",
  "Dodgers",
];
export function Watchlist() {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    const v = localStorage.getItem("sportz-watch");
    setList(v ? JSON.parse(v) : ALL_FOLLOW.slice(0, 4));
  }, []);
  const save = (l: string[]) => {
    setList(l);
    localStorage.setItem("sportz-watch", JSON.stringify(l));
  };
  return (
    <Card id="watchlist" className="h-full">
      <SectionTitle title="Watchlist" sub="Follow teams, players and races." />
      <div className="space-y-2">
        {list.map((n, i) => {
          const chg = ((n.length * 7 + i * 3) % 9) - 3;
          return (
            <div
              key={n}
              className="flex items-center gap-3 rounded-xl border border-border px-3 py-2"
            >
              <Star className="h-4 w-4 fill-warn text-warn" />
              <span className="flex-1 text-sm font-bold text-navy">{n}</span>
              <span className={cn("num text-xs font-bold", chg >= 0 ? "text-up" : "text-down")}>
                {chg >= 0 ? "+" : ""}
                {chg}.{(i * 3) % 10}%
              </span>
              <button
                onClick={() => save(list.filter((x) => x !== n))}
                aria-label={`Remove ${n}`}
                className="text-muted-foreground hover:text-down"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {ALL_FOLLOW.filter((x) => !list.includes(x)).map((n) => (
          <Btn key={n} variant="chip" onClick={() => save([...list, n])}>
            <Plus className="h-3 w-3" />
            {n}
          </Btn>
        ))}
      </div>
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
    <footer className="mt-10 bg-soft">
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
      <p className="pb-6 text-center text-xs font-semibold text-muted-foreground">
        Designed for 2026 · Built to scale beyond five sports · Predictions are probabilistic and
        for analytics only. <Gauge className="inline h-3 w-3" /> {LIVE.length} live feeds simulated.
      </p>
    </footer>
  );
}
