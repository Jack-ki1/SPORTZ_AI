import { useCallback, useEffect, useState, type FormEvent } from "react";
import { BarChart3, Check, LoaderCircle, Play, RefreshCw, Send, Trash2 } from "lucide-react";
import models from "../../../shared/sports-models.json";
import { SPORTS, isSportKey, sport, type SportKey } from "@/lib/sportz-data";
import {
  AI_PROVIDER_DEFAULTS,
  DEFAULT_AI_SETTINGS,
  DEFAULT_APP_SETTINGS,
  readAppSettings,
  writeAppSettings,
  type AIProvider,
  type AppSettings,
} from "@/lib/app-settings";
import { getSportSchedule, type ScoreboardEvent } from "@/lib/api-client";
import {
  askSportsCopilot,
  getLeagueTable,
  getTeamRoster,
  getTeamSchedule,
  type LeagueRow,
  type TeamGame,
  type RosterPlayer,
} from "@/lib/api-client";
import { Btn, Card, DemoTag, SectionTitle, SportBadge } from "./ui";

const selectClass =
  "rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-navy outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-bold text-muted-foreground";

function WorkspaceHero({
  eyebrow,
  title,
  description,
  sportKey,
  onSportChange,
  stats,
  tone,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sportKey: SportKey;
  onSportChange: (value: SportKey) => void;
  stats: [string, string][];
  tone: "predictions" | "live" | "matchups" | "watchlist";
}) {
  const activeSport = sport(sportKey);
  const tones = {
    predictions: {
      wash: "from-primary/95 via-[#253b75]/90 to-[#101a37]/45",
      glow: "bg-primary/50",
      tag: "bg-primary",
    },
    live: {
      wash: "from-[#087e91]/95 via-[#12677b]/85 to-[#101a37]/35",
      glow: "bg-cyan/55",
      tag: "bg-cyan",
    },
    matchups: {
      wash: "from-ai/95 via-[#4b347f]/85 to-[#101a37]/35",
      glow: "bg-ai/50",
      tag: "bg-ai",
    },
    watchlist: {
      wash: "from-[#137c5a]/95 via-[#155f56]/85 to-[#101a37]/35",
      glow: "bg-up/50",
      tag: "bg-up",
    },
  }[tone];
  return (
    <section className="relative isolate min-h-[310px] overflow-hidden rounded-[1.75rem] bg-[#111b38] p-5 text-white shadow-lift sm:min-h-[340px] sm:p-7">
      <img
        src={activeSport.img}
        alt={`${activeSport.name} action`}
        aria-hidden="true"
        className="absolute inset-y-0 right-0 z-0 h-full w-full object-cover object-[center_35%] opacity-95 sm:w-[72%]"
      />
      <div className={`absolute inset-0 z-10 bg-gradient-to-r ${tones.wash}`} />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#101a37]/75 via-transparent to-[#101a37]/5" />
      <div className="absolute -right-20 -top-28 z-10 h-80 w-80 rounded-full opacity-40 blur-3xl">
        <div className={`h-full w-full ${activeSport.grad}`} />
      </div>
      <div className="relative z-20 flex min-h-[260px] flex-col justify-between gap-6 lg:min-h-[280px] lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.18em] text-white/80 backdrop-blur">
            <span className={`h-2 w-2 rounded-full ${tones.tag}`} />
            {eyebrow} <span className="text-white/40">/</span> {activeSport.name}
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">{description}</p>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Choose a sport">
            {SPORTS.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={sportKey === item.key}
                onClick={() => onSportChange(item.key)}
                className={`rounded-full border px-3.5 py-2 text-xs font-extrabold transition hover:-translate-y-0.5 ${
                  sportKey === item.key
                    ? `${tones.tag} border-white/25 text-white shadow-lg`
                    : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.short}
              </button>
            ))}
          </div>
        </div>
        <div className="grid min-w-[240px] grid-cols-2 gap-2 self-start lg:self-end">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[.08] px-4 py-3 backdrop-blur"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/55">
                {label}
              </p>
              <p className="mt-1 text-lg font-black tabular-nums text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function dateKey(date: Date) {
  return (
    String(date.getFullYear()) +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0")
  );
}

function makeRange(kind: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  if (kind === "week") end.setDate(end.getDate() + 6);
  if (kind === "weekdays") {
    const daysUntilMonday = (8 - start.getDay()) % 7 || 7;
    start.setDate(start.getDay() === 0 || start.getDay() === 6 ? daysUntilMonday : 0);
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 4);
  }
  if (kind === "next") {
    start.setDate(start.getDate() + 7);
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 6);
  }
  if (kind === "weekend") {
    const offset = (6 - start.getDay() + 7) % 7 || (start.getDay() === 6 ? 0 : 7);
    start.setDate(start.getDate() + offset);
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 1);
  }
  return dateKey(start) + "-" + dateKey(end);
}

function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  useEffect(() => setSettings(readAppSettings()), []);
  const update = (next: AppSettings) => {
    setSettings(next);
    writeAppSettings(next);
  };
  return [settings, update] as const;
}

function EventCard({
  event,
  onPick,
  onRun,
  running,
  analyzed,
  runError,
}: {
  event: ScoreboardEvent;
  onPick: (event: ScoreboardEvent, pick: string) => void;
  onRun: (event: ScoreboardEvent) => void;
  running: boolean;
  analyzed: boolean;
  runError: string;
}) {
  const accent = sport(event.sport);
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent.grad}`} />
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <SportBadge grad={accent.grad} label={accent.short} size="sm" />
        <span>{event.league}</span>
        <span>·</span>
        <span>{event.startTime ? new Date(event.startTime).toLocaleString() : event.status}</span>
        <span className="ml-auto rounded-full bg-soft px-2 py-1">{event.status}</span>
      </div>
      <h3 className="mt-3 font-bold text-navy">{event.name}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {event.competitors.map((team, index) => {
          const chance = event.baseline?.[index] ?? team.probability;
          return (
            <div
              key={team.name}
              className="rounded-xl border border-border/70 bg-gradient-to-br from-soft to-card p-3"
            >
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-bold text-navy">{team.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {team.record ?? team.abbreviation}
                    {team.score ? " · " + team.score : ""}
                  </p>
                </div>
                {chance != null && <b className={`num ${accent.text}`}>{chance}%</b>}
              </div>
              {chance != null && (
                <div className="mt-2 h-1.5 rounded-full bg-muted">
                  <div
                    className={`h-1.5 rounded-full ${accent.grad}`}
                    style={{ width: chance + "%" }}
                  />
                </div>
              )}
              {event.state === "scheduled" && (
                <button
                  onClick={() => onPick(event, team.name)}
                  className="mt-3 flex items-center gap-1 text-xs font-bold text-primary"
                >
                  <Check className="h-3 w-3" />
                  Make this pick
                </button>
              )}
            </div>
          );
        })}
        {event.drawProbability != null && (
          <div className="rounded-xl bg-soft p-3">
            <div className="flex justify-between">
              <b className="text-navy">Draw</b>
              <b className="num text-primary">{event.drawProbability}%</b>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary"
                style={{ width: event.drawProbability + "%" }}
              />
            </div>
            <button
              onClick={() => onPick(event, "Draw")}
              className="mt-3 text-xs font-bold text-primary"
            >
              Pick draw
            </button>
          </div>
        )}
      </div>
      {event.baseline == null && event.competitors.every((team) => team.probability == null) && (
        <p className="mt-3 text-xs text-muted-foreground">
          No rating match was found for this event; your own pick can still be saved.
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
        <p className="text-[10px] text-muted-foreground">Model · {event.model}</p>
        {event.state === "scheduled" && (
          <button
            type="button"
            onClick={() => onRun(event)}
            disabled={running || !event.baseline}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${accent.grad}`}
            title={
              !event.baseline ? "The rating artifact has no forecast for this fixture" : undefined
            }
          >
            {running ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            {running ? "Running model…" : analyzed ? "Run again" : "Run prediction"}
          </button>
        )}
      </div>
      {runError && (
        <p role="alert" className="mt-2 text-xs font-semibold text-down">
          {runError}
        </p>
      )}
      {analyzed && <ForecastAnalysis event={event} />}
    </article>
  );
}

function ForecastAnalysis({ event }: { event: ScoreboardEvent }) {
  const chances = event.baseline ?? event.competitors.map((team) => team.probability ?? 0);
  const outcomes = event.competitors.map((team, index) => ({
    name: team.name,
    chance: chances[index] ?? 0,
  }));
  if (event.drawProbability != null) outcomes.push({ name: "Draw", chance: event.drawProbability });
  const leader = [...outcomes].sort((a, b) => b.chance - a.chance)[0];
  const ranked = [...outcomes].sort((a, b) => b.chance - a.chance);
  const edge = Math.abs((ranked[0]?.chance ?? 0) - (ranked[1]?.chance ?? 0));
  return (
    <section
      className="mt-4 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[.06] via-card to-cyan/[.06] p-4"
      aria-label="Prediction analysis"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-navy">
            <BarChart3 className="h-4 w-4 text-primary" /> Model outcome analysis
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Most likely: <b className="text-navy">{leader?.name}</b> · {leader?.chance}%
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
          {edge} pt {event.sport === "f1" ? "top-two gap" : "edge"}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {outcomes.map((outcome, index) => (
          <div key={outcome.name}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-semibold text-navy">{outcome.name}</span>
              <b className="num text-navy">{outcome.chance}%</b>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${index === 0 ? sport(event.sport).grad : "bg-gradient-to-r from-primary to-cyan"}`}
                style={{ width: `${Math.max(0, Math.min(100, outcome.chance))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
        {event.sport === "f1"
          ? "Historical driver Elo distribution; the gap compares the two highest driver probabilities."
          : "Historical Elo baseline; the edge compares the two competitor probabilities."}{" "}
        This is not a certainty or a betting recommendation.
      </p>
    </section>
  );
}

type SavedPick = { sport: SportKey; eventId: string; event: string; pick: string; savedAt: string };
function PredictionCopilot({
  sportKey,
  event,
}: {
  sportKey: SportKey;
  event: ScoreboardEvent | null;
}) {
  const [settings] = useSettings();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const context = event
    ? event.name +
      "; " +
      event.status +
      "; " +
      event.competitors
        .map(
          (team, index) =>
            team.name +
            ": " +
            (event.baseline?.[index] ?? team.probability ?? "no probability") +
            "%",
        )
        .join("; ") +
      "; draw=" +
      (event.drawProbability ?? "n/a") +
      "; model=" +
      event.model
    : "No fixture selected; explain only general model behavior.";
  const ask = async (value: string) => {
    const cleaned = value.trim();
    if (!cleaned || loading) return;
    const history = messages.slice(-6);
    setMessages((current) => [...current, { role: "user", content: cleaned }]);
    setQuestion("");
    setLoading(true);
    try {
      const response = await askSportsCopilot({
        data: { sport: sportKey, question: cleaned, context, history, ai: settings.ai },
      });
      setMessages((current) => [...current, { role: "assistant", content: response.answer }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "Copilot server request failed. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <SectionTitle
        title="Prediction Copilot"
        sub={`Ask about a selected fixture, its forecast, or the model limits. Active model: ${settings.ai.model || "not configured"}.`}
        right={<DemoTag label="MATCH CONTEXT" />}
      />
      <div
        className="mb-3 max-h-64 space-y-2 overflow-y-auto rounded-xl bg-soft p-3"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {event
              ? "Fixture context loaded: " + event.name
              : "Choose a fixture to attach match context."}
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={
                "max-w-[90%] rounded-xl p-3 text-sm " +
                (message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-card text-navy")
              }
            >
              {message.content}
            </div>
          ))
        )}
        {loading && <p className="text-xs text-muted-foreground">Copilot is thinking…</p>}
      </div>
      <form
        onSubmit={(form: FormEvent) => {
          form.preventDefault();
          void ask(question);
        }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(eventInput) => setQuestion(eventInput.target.value)}
          maxLength={600}
          placeholder="Ask about this fixture…"
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <Btn disabled={loading || !question.trim()}>
          <Send className="h-4 w-4" />
          Ask
        </Btn>
      </form>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Configure a provider and key in Settings. Copilot receives the selected fixture context and
        states when current player or injury information is unavailable.
      </p>
    </Card>
  );
}

export function PredictionsWorkspace() {
  const [sportKey, setSportKey] = useState<SportKey>("nba");
  const [windowKey, setWindowKey] = useState("week");
  const [events, setEvents] = useState<ScoreboardEvent[]>([]);
  const [provider, setProvider] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [picks, setPicks] = useState<SavedPick[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [runningPredictionId, setRunningPredictionId] = useState("");
  const [analyzedEventId, setAnalyzedEventId] = useState("");
  const [predictionRunError, setPredictionRunError] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const [settings] = useSettings();
  useEffect(() => {
    try {
      setPicks(JSON.parse(localStorage.getItem("sportz-picks-v1") ?? "[]"));
    } catch {
      setPicks([]);
    }
  }, []);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getSportSchedule({
        data: { sport: sportKey, dates: makeRange(windowKey), settings },
      });
      setEvents(result.events);
      setSelectedEventId((current) =>
        result.events.some((event) => event.id === current)
          ? current
          : (result.events[0]?.id ?? ""),
      );
      setProvider(result.provider);
      if (result.error) setError(result.error);
      else if (result.status === "unavailable") setError("Feed unavailable");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load fixtures");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [sportKey, windowKey, settings]);
  useEffect(() => {
    void load();
  }, [load]);
  const selected = events.find((event) => event.id === selectedEventId) ?? null;
  const savePick = (event: ScoreboardEvent, pick: string) => {
    const next = [
      {
        sport: sportKey,
        eventId: event.id,
        event: event.name,
        pick,
        savedAt: new Date().toISOString(),
      },
      ...picks.filter((item) => item.eventId !== event.id),
    ];
    setPicks(next);
    localStorage.setItem("sportz-picks-v1", JSON.stringify(next));
  };
  const runPrediction = async (event: ScoreboardEvent) => {
    if (!event.startTime) return;
    setRunningPredictionId(event.id);
    setPredictionRunError(null);
    try {
      const day = event.startTime.slice(0, 10).replaceAll("-", "");
      const result = await getSportSchedule({ data: { sport: event.sport, dates: day, settings } });
      const updated = result.events.find((fixture) => fixture.id === event.id);
      if (!updated?.baseline)
        throw new Error(result.error || "No model forecast was returned for this fixture.");
      setEvents((current) =>
        current.map((fixture) => (fixture.id === event.id ? updated : fixture)),
      );
      setAnalyzedEventId(event.id);
    } catch (reason) {
      setPredictionRunError({
        id: event.id,
        message: reason instanceof Error ? reason.message : "Unable to run this prediction.",
      });
    } finally {
      setRunningPredictionId("");
    }
  };
  return (
    <div className="mx-auto max-w-[1560px] space-y-5 px-4 md:px-8">
      <WorkspaceHero
        eyebrow="Forecast desk"
        title="Make your next pick"
        description="Explore upcoming fixtures, compare model probabilities, and save your calls as the season unfolds."
        sportKey={sportKey}
        onSportChange={setSportKey}
        tone="predictions"
        stats={[
          ["Fixtures", String(events.length)],
          ["Picks saved", String(picks.length)],
        ]}
      />
      <Card>
        <SectionTitle
          title="Choose a sport and make a pick"
          sub="Fixtures come from the selected provider. Probabilities use the historical Elo artifact."
          right={
            <Btn variant="ghost" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={"h-4 w-4 " + (loading ? "animate-spin" : "")} />
              Refresh
            </Btn>
          }
        />
        <div className="flex flex-wrap items-end gap-3">
          <label>
            <span className={labelClass}>Fixtures</span>
            <select
              value={windowKey}
              onChange={(event) => setWindowKey(event.target.value)}
              className={selectClass}
            >
              <option value="week">This week</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekend">This weekend</option>
              <option value="next">Next week</option>
            </select>
          </label>
          <span className="rounded-full border border-border bg-soft px-3 py-2 text-xs text-muted-foreground">
            Source: {provider || "loading"}
          </span>
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-down/10 p-3 text-sm text-down">
            {error}
          </p>
        )}
        {loading ? (
          <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading schedule…
          </p>
        ) : events.length ? (
          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPick={savePick}
                onRun={runPrediction}
                running={runningPredictionId === event.id}
                analyzed={analyzedEventId === event.id}
                runError={predictionRunError?.id === event.id ? predictionRunError.message : ""}
              />
            ))}
          </div>
        ) : (
          !error && (
            <p className="mt-5 rounded-xl bg-soft p-4 text-sm text-muted-foreground">
              No events in this date window. Try another window or sport.
            </p>
          )
        )}
      </Card>
      {events.length > 0 && (
        <label className="block max-w-2xl">
          <span className={labelClass}>Copilot fixture context</span>
          <select
            className={selectClass + " w-full"}
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} · {event.status}
              </option>
            ))}
          </select>
        </label>
      )}
      <PredictionCopilot sportKey={sportKey} event={selected} />
      <Card>
        <SectionTitle title="My picks" sub="Saved locally in this browser." />
        {picks.length ? (
          picks.slice(0, 12).map((pick) => (
            <div
              key={pick.eventId}
              className="flex flex-wrap justify-between gap-2 border-b border-border py-3 text-sm"
            >
              <b className="text-navy">
                {pick.event} · <span className="text-primary">{pick.pick}</span>
              </b>
              <span className="text-xs text-muted-foreground">
                {pick.sport.toUpperCase()} · {new Date(pick.savedAt).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Choose a fixture outcome to save your first pick.
          </p>
        )}
      </Card>
    </div>
  );
}

function ScheduleRow({ event }: { event: ScoreboardEvent }) {
  return (
    <div className="my-2 grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-border/70 bg-gradient-to-r from-soft to-card p-3 transition hover:border-primary/30">
      <div>
        <p className="text-sm font-bold text-navy">{event.name}</p>
        <p className="text-xs text-muted-foreground">
          {event.competitors
            .map((team) => team.name + (team.score != null ? " " + team.score : ""))
            .join(" · ")}
        </p>
      </div>
      <span className="self-center rounded-full bg-soft px-2 py-1 text-[10px] font-semibold">
        {event.status}
      </span>
    </div>
  );
}

function projectLeague(
  sportKey: SportKey,
  rows: LeagueRow[],
  iterations: number,
  settings: AppSettings,
) {
  const seasonLength: Record<SportKey, number> = { f1: 24, nba: 82, epl: 38, nfl: 17, mlb: 162 };
  const totals = rows.map((row) => ({ ...row, projected: 0, titles: 0 }));
  for (let run = 0; run < iterations && totals.length; run++) {
    const season = totals.map((row) => ({
      wins: row.wins,
      points: row.points,
      played: row.played,
      rating: row.rating ?? 1500,
    }));
    if (sportKey === "f1") {
      const count = Math.max(0, seasonLength.f1 - Math.min(...season.map((row) => row.played)));
      const points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
      for (let race = 0; race < count; race++) {
        const available = season.map((_, index) => index);
        for (const score of points) {
          if (!available.length) break;
          const weights = available.map((index) =>
            Math.exp((season[index]!.rating - 1500) / settings.f1Temperature),
          );
          let draw = Math.random() * weights.reduce((a, b) => a + b, 0);
          let slot = 0;
          for (let i = 0; i < weights.length; i++) {
            draw -= weights[i]!;
            if (draw <= 0) {
              slot = i;
              break;
            }
          }
          const chosen = available.splice(slot, 1)[0]!;
          season[chosen]!.points += score;
        }
      }
    } else {
      const planned = Math.floor(
        season.reduce((sum, row) => sum + Math.max(0, seasonLength[sportKey] - row.played), 0) / 2,
      );
      for (let game = 0; game < planned; game++) {
        const active = season
          .map((row, index) => ({ index, left: seasonLength[sportKey] - row.played }))
          .filter((row) => row.left > 0)
          .sort((a, b) => b.left - a.left);
        if (active.length < 2) break;
        const home = active[0]!.index;
        const away = active[1]!.index;
        const homeAdvantage =
          sportKey === "mlb" ? settings.homeAdvantage * 0.64 : settings.homeAdvantage;
        const probability =
          1 /
          (1 +
            10 **
              (-(season[home]!.rating - season[away]!.rating + homeAdvantage) /
                settings.probabilityScale));
        const draw = sportKey === "epl" ? settings.eplDrawRate : 0;
        const random = Math.random();
        if (random < draw) {
          season[home]!.points++;
          season[away]!.points++;
        } else if (random < draw + (1 - draw) * probability) {
          season[home]!.wins++;
          season[home]!.points += sportKey === "epl" ? 3 : 1;
        } else {
          season[away]!.wins++;
          season[away]!.points += sportKey === "epl" ? 3 : 1;
        }
        season[home]!.played++;
        season[away]!.played++;
      }
    }
    const rankByPoints = sportKey === "f1" || sportKey === "epl";
    const winner = season.reduce(
      (best, row, index) =>
        (rankByPoints ? row.points > season[best]!.points : row.wins > season[best]!.wins)
          ? index
          : best,
      0,
    );
    totals[winner]!.titles++;
    season.forEach((row, index) => {
      totals[index]!.projected += rankByPoints ? row.points : row.wins;
    });
  }
  return totals
    .map((row) => ({
      name: row.name,
      projected: row.projected / iterations,
      titlePct: (row.titles * 100) / iterations,
      current: sportKey === "epl" || sportKey === "f1" ? row.points : row.wins,
    }))
    .sort((a, b) => b.titlePct - a.titlePct)
    .slice(0, 12);
}

function SeasonSimulation({
  sportKey,
  rows,
  settings,
}: {
  sportKey: SportKey;
  rows: LeagueRow[];
  settings: AppSettings;
}) {
  const [iterations, setIterations] = useState(settings.defaultIterations);
  const [result, setResult] = useState<ReturnType<typeof projectLeague>>([]);
  useEffect(() => setIterations(settings.defaultIterations), [settings.defaultIterations]);
  return (
    <Card>
      <SectionTitle
        title="Season simulator"
        sub="Projects the remaining season from current standings and Elo ratings. Fixture pairings are sampled scenarios."
        right={<DemoTag label="SIMULATION" />}
      />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label>
          <span className={labelClass}>Runs</span>
          <select
            className={selectClass}
            value={iterations}
            onChange={(event) => setIterations(Number(event.target.value))}
          >
            {[250, 1000, 3000].map((count) => (
              <option key={count} value={count}>
                {count.toLocaleString()}
              </option>
            ))}
          </select>
        </label>
        <Btn
          disabled={!rows.length}
          onClick={() => setResult(projectLeague(sportKey, rows, iterations, settings))}
        >
          Simulate remaining league
        </Btn>
      </div>
      {result.length ? (
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="p-2">Projected leader</th>
                <th className="p-2">Title chance</th>
                <th className="p-2">Avg final</th>
                <th className="p-2">Current</th>
              </tr>
            </thead>
            <tbody>
              {result.map((row) => (
                <tr key={row.name} className="border-t border-border">
                  <td className="p-2 font-bold text-navy">{row.name}</td>
                  <td className="num p-2">{row.titlePct.toFixed(1)}%</td>
                  <td className="num p-2">{row.projected.toFixed(1)}</td>
                  <td className="num p-2">{row.current}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Choose a run count and simulate to see title chances and projected standings.
        </p>
      )}
    </Card>
  );
}

export function LiveWorkspace() {
  const [sportKey, setSportKey] = useState<SportKey>("nba");
  const [table, setTable] = useState<LeagueRow[]>([]);
  const [events, setEvents] = useState<ScoreboardEvent[]>([]);
  const [status, setStatus] = useState("Loading provider data…");
  const [settings] = useSettings();
  useEffect(() => {
    let active = true;
    const refresh = () => {
      const range =
        dateKey(new Date(Date.now() - 14 * 86400000)) +
        "-" +
        dateKey(new Date(Date.now() + 7 * 86400000));
      Promise.all([
        getLeagueTable({ data: { sport: sportKey } }),
        getSportSchedule({ data: { sport: sportKey, dates: range, settings } }),
      ])
        .then(([standings, schedule]) => {
          if (!active) return;
          setTable(standings.rows);
          setEvents(schedule.events);
          setStatus(
            [
              standings.status === "unavailable" ? standings.error : "",
              schedule.error ?? (schedule.status === "unavailable" ? "Event feed unavailable" : ""),
            ]
              .filter(Boolean)
              .join(" · ") ||
              "Standings: " + standings.provider + " · events: " + schedule.provider,
          );
        })
        .catch((error: unknown) => {
          if (active)
            setStatus(error instanceof Error ? error.message : "Provider data unavailable");
        });
    };
    refresh();
    const timer = window.setInterval(refresh, settings.refreshSeconds * 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [
    sportKey,
    settings,
    settings.homeAdvantage,
    settings.probabilityScale,
    settings.eplDrawRate,
    settings.f1Temperature,
    settings.refreshSeconds,
  ]);
  const results = events
    .filter((event) => event.state === "final")
    .sort((a, b) => Date.parse(b.startTime ?? "") - Date.parse(a.startTime ?? ""));
  const live = events.filter((event) => event.state === "live");
  const upcoming = events.filter((event) => event.state === "scheduled");
  return (
    <div className="mx-auto max-w-[1560px] space-y-5 px-4 md:px-8">
      <WorkspaceHero
        eyebrow="Live arena"
        title="The league, at a glance"
        description="Follow the table, catch live action, and see what is coming next across your selected sport."
        sportKey={sportKey}
        onSportChange={setSportKey}
        tone="live"
        stats={[
          ["Live now", String(live.length)],
          ["Upcoming", String(upcoming.length)],
        ]}
      />
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionTitle title={sport(sportKey).name + " league center"} sub={status} />
          </div>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
          <div>
            <SectionTitle
              title="League table"
              sub={
                sportKey === "f1"
                  ? "Current driver standings from Jolpica."
                  : "Current standings from the selected league feed."
              }
            />
            {table.length ? (
              <div className="max-h-[620px] overflow-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-soft text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">{sportKey === "f1" ? "Driver" : "Team"}</th>
                      <th className="p-2">W</th>
                      <th className="p-2">L</th>
                      <th className="p-2">PTS / PCT</th>
                      <th className="p-2">Elo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((row, index) => (
                      <tr
                        key={row.id}
                        className="border-t border-border transition hover:bg-soft/80"
                      >
                        <td className="num p-2">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${index < 3 ? `${sport(sportKey).grad} text-white` : "bg-soft text-muted-foreground"}`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-2">
                          <b className="text-navy">{row.name}</b>
                          <span className="ml-2 text-[10px] text-muted-foreground">
                            {row.group}
                          </span>
                        </td>
                        <td className="num p-2">{row.wins}</td>
                        <td className="num p-2">{row.losses}</td>
                        <td className="num p-2">
                          {row.points || (row.percentage * 100).toFixed(1) + "%"}
                        </td>
                        <td className="num p-2">
                          {settings.showElo ? (row.rating?.toFixed(0) ?? "—") : "Hidden"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-xl bg-soft p-4 text-sm text-muted-foreground">{status}</p>
            )}
          </div>
          <div className="space-y-5">
            <div>
              <SectionTitle
                title={"Latest results · " + results.length}
                sub="Completed events in the recent provider window."
              />
              {results.length ? (
                results.slice(0, 8).map((event) => <ScheduleRow key={event.id} event={event} />)
              ) : (
                <p className="rounded-xl bg-soft p-4 text-sm text-muted-foreground">
                  No completed results in this provider window.
                </p>
              )}
            </div>
            <div>
              <SectionTitle title={"Live now · " + live.length} />
              {live.length ? (
                live.map((event) => <ScheduleRow key={event.id} event={event} />)
              ) : (
                <p className="text-sm text-muted-foreground">No live games reported right now.</p>
              )}
            </div>
            <div>
              <SectionTitle title={"Coming up · " + upcoming.length} />
              {upcoming.length ? (
                upcoming.slice(0, 6).map((event) => <ScheduleRow key={event.id} event={event} />)
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events in this window.</p>
              )}
            </div>
          </div>
        </div>
      </Card>
      <SeasonSimulation sportKey={sportKey} rows={table} settings={settings} />
      <p className="px-2 text-xs text-muted-foreground">
        ESPN is an unofficial scoreboard source for NBA/EPL/NFL/MLB. F1 uses Jolpica. Public feeds
        may change or be unavailable.
      </p>
    </div>
  );
}

export function MatchupsWorkspace() {
  const [sportKey, setSportKey] = useState<SportKey>("nba");
  const [rows, setRows] = useState<LeagueRow[]>([]);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [h2h, setH2h] = useState<TeamGame[]>([]);
  const [rosterA, setRosterA] = useState<RosterPlayer[]>([]);
  const [rosterB, setRosterB] = useState<RosterPlayer[]>([]);
  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [info, setInfo] = useState("Loading current teams…");
  const [settings] = useSettings();
  const [matchupForecast, setMatchupForecast] = useState<{
    teamA: string;
    teamB: string;
    a: number;
    b: number;
    draw: number;
  } | null>(null);
  useEffect(() => {
    let active = true;
    getLeagueTable({ data: { sport: sportKey } })
      .then((result) => {
        if (!active) return;
        setRows(result.rows);
        setInfo(
          result.status === "ok"
            ? "Source: " + result.provider
            : (result.error ?? "Standings unavailable"),
        );
        setTeamA(result.rows[0]?.id ?? "");
        setTeamB(result.rows[1]?.id ?? result.rows[0]?.id ?? "");
      })
      .catch(() => setInfo("Standings provider unavailable"));
    return () => {
      active = false;
    };
  }, [sportKey]);
  const rowA = rows.find((row) => row.id === teamA);
  const rowB = rows.find((row) => row.id === teamB);
  useEffect(() => {
    if (sportKey === "f1" || !teamA || !teamB) {
      setH2h([]);
      return;
    }
    let active = true;
    Promise.all([
      getTeamSchedule({ data: { sport: sportKey, teamId: teamA } }),
      getTeamSchedule({ data: { sport: sportKey, teamId: teamB } }),
    ])
      .then(([a, b]) => {
        if (!active) return;
        const pair = new Set([teamA, teamB]);
        setH2h(
          [...a.games, ...b.games]
            .filter(
              (game, index, list) =>
                list.findIndex((other) => other.id === game.id) === index &&
                game.competitors.filter((item: { id: string }) => pair.has(item.id)).length === 2,
            )
            .sort((x, y) => Date.parse(y.date ?? "") - Date.parse(x.date ?? ""))
            .slice(0, 10),
        );
      })
      .catch(() => setH2h([]));
    return () => {
      active = false;
    };
  }, [sportKey, teamA, teamB]);
  useEffect(() => {
    if (sportKey === "f1" || !teamA || !teamB) {
      setRosterA([]);
      setRosterB([]);
      return;
    }
    let active = true;
    Promise.all([
      getTeamRoster({ data: { sport: sportKey, teamId: teamA } }),
      getTeamRoster({ data: { sport: sportKey, teamId: teamB } }),
    ])
      .then(([a, b]) => {
        if (!active) return;
        setRosterA(a.players);
        setRosterB(b.players);
        setPlayerA(a.players[0]?.id ?? "");
        setPlayerB(b.players[0]?.id ?? "");
      })
      .catch(() => {
        if (active) {
          setRosterA([]);
          setRosterB([]);
        }
      });
    return () => {
      active = false;
    };
  }, [sportKey, teamA, teamB]);
  const selectedA = rosterA.find((player) => player.id === playerA);
  const selectedB = rosterB.find((player) => player.id === playerB);
  return (
    <div className="mx-auto max-w-[1560px] space-y-5 px-4 md:px-8">
      <WorkspaceHero
        eyebrow="Head-to-head"
        title="Compare the contenders"
        description="Put teams, drivers, and roster players side by side with current form, season records, and recent meetings."
        sportKey={sportKey}
        onSportChange={setSportKey}
        tone="matchups"
        stats={[
          ["In league", String(rows.length)],
          ["Meetings", String(h2h.length)],
        ]}
      />
      <Card>
        <SectionTitle title="Team and driver comparison" sub={info} />
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr]">
          {[
            [teamA, setTeamA],
            [teamB, setTeamB],
          ].map(([value, setter], index) => (
            <label key={index}>
              <span className={labelClass}>
                {sportKey === "f1" ? "Driver " : "Team "}
                {index === 0 ? "A" : "B"}
              </span>
              <select
                className={selectClass + " w-full"}
                value={String(value)}
                onChange={(event) => (setter as (value: string) => void)(event.target.value)}
              >
                {rows.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <div className="self-center rounded-full bg-gradient-to-br from-primary to-ai px-3 py-2 text-xs font-black text-white shadow-lg shadow-primary/20">
            VS
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ai/15 bg-gradient-to-r from-ai/[.06] via-card to-primary/[.06] p-4">
          <div>
            <p className="text-sm font-extrabold text-navy">Run a neutral-site Elo comparison</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Uses current provider ratings and your probability scale; no home advantage is
              assumed.
            </p>
          </div>
          <button
            type="button"
            disabled={!rowA?.rating || !rowB?.rating}
            onClick={() => {
              if (rowA?.rating == null || rowB?.rating == null) return;
              const probabilityA =
                1 / (1 + 10 ** (-(rowA.rating - rowB.rating) / settings.probabilityScale));
              const drawRate = sportKey === "epl" ? settings.eplDrawRate : 0;
              const draw = Math.round(drawRate * 100);
              setMatchupForecast({
                teamA,
                teamB,
                a: Math.round(probabilityA * (1 - drawRate) * 100),
                b: Math.round((1 - probabilityA) * (1 - drawRate) * 100),
                draw,
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-ai to-primary px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-ai/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Run matchup analysis
          </button>
        </div>
        {matchupForecast?.teamA === teamA && matchupForecast.teamB === teamB && (
          <div className="mt-3 rounded-2xl border border-ai/15 bg-gradient-to-br from-ai/[.06] via-card to-primary/[.06] p-4">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-navy">
              <BarChart3 className="h-4 w-4 text-ai" /> Elo probability analysis
            </p>
            <div className="mt-4 space-y-3">
              {[
                {
                  name: rowA?.name ?? "Team A",
                  chance: matchupForecast.a,
                  color: "bg-gradient-to-r from-ai to-primary",
                },
                ...(matchupForecast.draw
                  ? [
                      {
                        name: "Draw",
                        chance: matchupForecast.draw,
                        color: "bg-gradient-to-r from-cyan to-epl",
                      },
                    ]
                  : []),
                {
                  name: rowB?.name ?? "Team B",
                  chance: matchupForecast.b,
                  color: "bg-gradient-to-r from-primary to-cyan",
                },
              ].map((outcome) => (
                <div key={outcome.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold text-navy">{outcome.name}</span>
                    <b className="num">{outcome.chance}%</b>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${outcome.color}`}
                      style={{ width: `${outcome.chance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
              Pairwise rating estimate, not a full event simulation. It uses the selected teams’
              current Elo values and does not account for injuries, lineup changes, or venue.
            </p>
          </div>
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[rowA, rowB].map((row, index) => (
            <div
              key={row?.id ?? index}
              className={`relative overflow-hidden rounded-2xl border p-4 ${index === 0 ? "border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card" : "border-ai/20 bg-gradient-to-br from-ai/10 via-card to-card"}`}
            >
              <div
                className={`mb-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white ${index === 0 ? "bg-gradient-to-r from-primary to-cyan" : "bg-gradient-to-r from-ai to-mlb"}`}
              >
                Side {index === 0 ? "A" : "B"}
              </div>
              <p className="text-lg font-black text-navy">{row?.name ?? "Choose a team"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{row?.group}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <span className="rounded-xl bg-white/70 p-2">
                  Record{" "}
                  <b>
                    {row ? row.wins + "-" + row.losses + (row.ties ? "-" + row.ties : "") : "—"}
                  </b>
                </span>
                <span className="rounded-xl bg-white/70 p-2">
                  Played <b>{row?.played ?? "—"}</b>
                </span>
                <span className="rounded-xl bg-white/70 p-2">
                  Points <b>{row?.points || "—"}</b>
                </span>
                <span className="rounded-xl bg-white/70 p-2">
                  Elo <b>{row?.rating?.toFixed(0) ?? "—"}</b>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle
          title="Recent head-to-head"
          sub="Pulled from each team's current-season schedule."
        />
        {sportKey === "f1" ? (
          <p className="text-sm text-muted-foreground">
            F1 driver points and Elo are compared above; race-by-race pair history is not supplied
            in this table.
          </p>
        ) : h2h.length ? (
          h2h.map((game) => (
            <div
              key={game.id}
              className="flex justify-between gap-3 border-b border-border py-3 last:border-0"
            >
              <div>
                <b className="text-sm text-navy">
                  {game.competitors.map((team) => team.name).join(" · ")}
                </b>
                <p className="text-xs text-muted-foreground">
                  {game.date ? new Date(game.date).toLocaleDateString() : "Date unavailable"} ·{" "}
                  {game.status}
                </p>
              </div>
              <b className="num self-center">
                {game.competitors.map((team) => team.score ?? "—").join(" – ")}
              </b>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No head-to-head events were found in the provider's current team schedules.
          </p>
        )}
      </Card>
      {sportKey !== "f1" && (
        <Card>
          <SectionTitle
            title="Player profile comparison"
            sub="Choose a roster player from either team. Only fields returned by the public roster feed are compared."
          />
          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className={labelClass}>{rowA?.name ?? "Team A"} player</span>
              <select
                className={selectClass + " w-full"}
                value={playerA}
                onChange={(event) => setPlayerA(event.target.value)}
              >
                {rosterA.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} · {player.position}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={labelClass}>{rowB?.name ?? "Team B"} player</span>
              <select
                className={selectClass + " w-full"}
                value={playerB}
                onChange={(event) => setPlayerB(event.target.value)}
              >
                {rosterB.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} · {player.position}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[selectedA, selectedB].map((player, index) => (
              <div key={player?.id ?? index} className="rounded-xl bg-soft p-4">
                <p className="font-bold text-navy">
                  {player?.name ?? "Roster profile unavailable"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Position: {player?.position ?? "—"} · Age: {player?.age ?? "—"} · Experience:{" "}
                  {player?.experience ?? "—"} years · Status: {player?.status ?? "—"}
                </p>
              </div>
            ))}
          </div>
          {(rosterA.length === 0 || rosterB.length === 0) && (
            <p className="mt-3 text-xs text-muted-foreground">
              One or both team rosters were unavailable.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

type WatchItem = { sport: SportKey; id: string; name: string };

function isWatchItem(value: unknown): value is WatchItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<WatchItem>;
  return isSportKey(item.sport) && typeof item.id === "string" && typeof item.name === "string";
}

export function WatchlistWorkspace() {
  const [sportKey, setSportKey] = useState<SportKey>("nba");
  const [rows, setRows] = useState<LeagueRow[]>([]);
  const [items, setItems] = useState<WatchItem[]>([]);
  const [events, setEvents] = useState<ScoreboardEvent[]>([]);
  const [candidate, setCandidate] = useState("");
  const [runningPredictionId, setRunningPredictionId] = useState("");
  const [analyzedEventId, setAnalyzedEventId] = useState("");
  const [predictionRunError, setPredictionRunError] = useState<{
    id: string;
    message: string;
  } | null>(null);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("sportz-watch-v2") ?? "[]");
      setItems(Array.isArray(saved) ? saved.filter(isWatchItem) : []);
    } catch {
      setItems([]);
    }
  }, []);
  useEffect(() => {
    let active = true;
    getLeagueTable({ data: { sport: sportKey } }).then((result) => {
      if (active) {
        setRows(result.rows);
        setCandidate(result.rows[0]?.id ?? "");
      }
    });
    return () => {
      active = false;
    };
  }, [sportKey]);
  useEffect(() => {
    let active = true;
    const keys = [...new Set(items.map((item: WatchItem) => item.sport))];
    const range = dateKey(new Date()) + "-" + dateKey(new Date(Date.now() + 14 * 86400000));
    Promise.all(keys.map((key) => getSportSchedule({ data: { sport: key, dates: range } })))
      .then((results) => {
        if (active) setEvents(results.flatMap((result) => result.events));
      })
      .catch(() => {
        if (active) setEvents([]);
      });
    return () => {
      active = false;
    };
  }, [items]);
  const save = (next: WatchItem[]) => {
    setItems(next);
    localStorage.setItem("sportz-watch-v2", JSON.stringify(next));
  };
  const add = () => {
    const row = rows.find((item) => item.id === candidate);
    if (row && !items.some((item) => item.id === row.id && item.sport === sportKey))
      save([...items, { sport: sportKey, id: row.id, name: row.name }]);
  };
  const runWatchedPrediction = async (event: ScoreboardEvent) => {
    if (!event.startTime) return;
    setRunningPredictionId(event.id);
    setPredictionRunError(null);
    try {
      const day = event.startTime.slice(0, 10).replaceAll("-", "");
      const result = await getSportSchedule({ data: { sport: event.sport, dates: day } });
      const updated = result.events.find((fixture) => fixture.id === event.id);
      if (!updated?.baseline)
        throw new Error(result.error || "No model forecast was returned for this fixture.");
      setEvents((current) =>
        current.map((fixture) => (fixture.id === event.id ? updated : fixture)),
      );
      setAnalyzedEventId(event.id);
    } catch (reason) {
      setPredictionRunError({
        id: event.id,
        message: reason instanceof Error ? reason.message : "Unable to run this prediction.",
      });
    } finally {
      setRunningPredictionId("");
    }
  };
  const saveWatchedPick = (event: ScoreboardEvent, pick: string) => {
    let saved: SavedPick[] = [];
    try {
      saved = JSON.parse(localStorage.getItem("sportz-picks-v1") ?? "[]") as SavedPick[];
    } catch {
      saved = [];
    }
    localStorage.setItem(
      "sportz-picks-v1",
      JSON.stringify([
        {
          sport: event.sport,
          eventId: event.id,
          event: event.name,
          pick,
          savedAt: new Date().toISOString(),
        },
        ...saved.filter((item) => item.eventId !== event.id),
      ]),
    );
  };
  const watched = events.filter((event) =>
    items.some(
      (item) =>
        item.sport === event.sport &&
        event.competitors.some((team) => team.name.toLowerCase() === item.name.toLowerCase()),
    ),
  );
  return (
    <div className="mx-auto max-w-[1560px] space-y-5 px-4 md:px-8">
      <WorkspaceHero
        eyebrow="Your sports universe"
        title="Keep your favorites close"
        description="Build a personal feed around the teams and drivers you care about, with their upcoming fixtures gathered in one place."
        sportKey={sportKey}
        onSportChange={setSportKey}
        tone="watchlist"
        stats={[
          ["Following", String(items.length)],
          ["On the schedule", String(watched.length)],
        ]}
      />
      <Card>
        <SectionTitle
          title="Build your watchlist"
          sub="Follow teams and drivers in this browser."
        />
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-56 flex-1">
            <span className={labelClass}>Team or driver</span>
            <select
              className={selectClass + " w-full"}
              value={candidate}
              onChange={(event) => setCandidate(event.target.value)}
            >
              {rows.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
          <Btn onClick={add}>Add follow</Btn>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.sport + item.id}
              className="flex items-center justify-between rounded-xl border border-border/70 border-l-4 bg-gradient-to-r from-soft to-card p-3 transition hover:-translate-y-0.5 hover:shadow-card"
              style={{ borderLeftColor: `var(--${item.sport})` }}
            >
              <div className="flex items-center gap-2">
                <SportBadge
                  grad={sport(item.sport).grad}
                  label={sport(item.sport).short}
                  size="sm"
                />
                <b className="text-navy">{item.name}</b>
              </div>
              <button
                aria-label={"Remove " + item.name}
                onClick={() =>
                  save(
                    items.filter(
                      (current) => current.id !== item.id || current.sport !== item.sport,
                    ),
                  )
                }
                className="rounded-full p-2 text-muted-foreground hover:text-down"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {items.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-primary/30 bg-gradient-to-r from-primary/5 via-cyan/5 to-ai/5 p-5 text-sm text-muted-foreground">
            <p className="font-bold text-navy">Your watchlist starts here</p>
            <p className="mt-1">
              Choose a {sport(sportKey).name} team or driver above and add it to your personal feed.
            </p>
          </div>
        )}
      </Card>
      <Card>
        <SectionTitle title="Watched fixtures · next 14 days" />
        {watched.length ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {watched.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPick={saveWatchedPick}
                onRun={runWatchedPrediction}
                running={runningPredictionId === event.id}
                analyzed={analyzedEventId === event.id}
                runError={predictionRunError?.id === event.id ? predictionRunError.message : ""}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No matching fixtures were returned for your watchlist.
          </p>
        )}
      </Card>
      <p className="px-2 text-xs text-muted-foreground">
        Follows and picks stay in this browser. Forecast and AI settings are session-scoped and
        clear when the browser session ends.
      </p>
    </div>
  );
}

export function SettingsWorkspace() {
  const [settings, setSettings] = useSettings();
  const patchSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setSettings({ ...settings, [key]: value });
  const patchAi = <K extends keyof AppSettings["ai"]>(key: K, value: AppSettings["ai"][K]) =>
    patchSetting("ai", { ...settings.ai, [key]: value });
  const controls = [
    {
      label: "Home advantage (Elo points)",
      key: "homeAdvantage" as const,
      min: 0,
      max: 120,
      step: 5,
    },
    {
      label: "Win probability scale",
      key: "probabilityScale" as const,
      min: 200,
      max: 800,
      step: 25,
    },
    { label: "EPL draw prior", key: "eplDrawRate" as const, min: 0.12, max: 0.38, step: 0.01 },
    { label: "F1 rating temperature", key: "f1Temperature" as const, min: 60, max: 400, step: 10 },
  ];
  return (
    <div className="mx-auto max-w-[1560px] space-y-5 px-4 md:px-8">
      <Card>
        <SectionTitle
          title="Forecast and app controls"
          sub="Settings last for this browser tab session and affect forecast inference and league simulations."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {controls.map((control) => (
            <label key={control.key}>
              <span className="flex justify-between text-sm font-bold text-navy">
                <span>{control.label}</span>
                <span className="num">
                  {control.key === "eplDrawRate"
                    ? Math.round(Number(settings[control.key]) * 100) + "%"
                    : settings[control.key]}
                </span>
              </span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={settings[control.key]}
                onChange={(event) => patchSetting(control.key, Number(event.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </label>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label>
            <span className={labelClass}>Refresh interval</span>
            <select
              className={selectClass + " w-full"}
              value={settings.refreshSeconds}
              onChange={(event) => patchSetting("refreshSeconds", Number(event.target.value))}
            >
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
              <option value={300}>5 minutes</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>Default simulation runs</span>
            <select
              className={selectClass + " w-full"}
              value={settings.defaultIterations}
              onChange={(event) => patchSetting("defaultIterations", Number(event.target.value))}
            >
              <option value={250}>250</option>
              <option value={1000}>1,000</option>
              <option value={3000}>3,000</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pt-5 text-sm font-semibold text-navy">
            <input
              type="checkbox"
              checked={settings.showElo}
              onChange={(event) => patchSetting("showElo", event.target.checked)}
            />
            Show Elo ratings
          </label>
        </div>
        <Btn variant="ghost" className="mt-5" onClick={() => setSettings(DEFAULT_APP_SETTINGS)}>
          Restore defaults
        </Btn>
      </Card>
      <Card id="ai-provider-settings">
        <SectionTitle
          title="Choose your AI provider"
          sub="Use your own API key with a supported provider or a public OpenAI-compatible endpoint. The selected model is used by Prediction Copilot."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className={labelClass}>Provider</span>
            <select
              className={selectClass + " w-full"}
              value={settings.ai.provider}
              onChange={(event) => {
                const provider = event.target.value as AIProvider;
                const preset = AI_PROVIDER_DEFAULTS[provider];
                patchSetting("ai", {
                  ...settings.ai,
                  provider,
                  model: preset.model,
                  baseUrl: preset.baseUrl,
                });
              }}
            >
              {Object.entries(AI_PROVIDER_DEFAULTS).map(([key, provider]) => (
                <option key={key} value={key}>
                  {provider.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Model ID</span>
            <input
              className={selectClass + " w-full"}
              value={settings.ai.model}
              onChange={(event) => patchAi("model", event.target.value)}
              placeholder="Provider model identifier"
              maxLength={120}
            />
          </label>
          <label className="md:col-span-2">
            <span className={labelClass}>API endpoint base URL</span>
            <input
              className={selectClass + " w-full disabled:cursor-not-allowed disabled:opacity-60"}
              value={settings.ai.baseUrl}
              onChange={(event) => patchAi("baseUrl", event.target.value)}
              placeholder="https://your-provider.example/v1"
              disabled={settings.ai.provider !== "custom"}
              maxLength={300}
              autoCapitalize="none"
              autoCorrect="off"
            />
            <span className="mt-1 block text-[11px] text-muted-foreground">
              Preset providers use their official endpoint. Custom endpoints must be public HTTPS
              OpenAI-compatible APIs; private, local, and link-local network addresses are blocked.
              Local Ollama works only with the development API and its explicit local-access flag.
            </span>
          </label>
          <label className="md:col-span-2">
            <span className={labelClass}>
              Provider API key {settings.ai.provider === "ollama" ? "(optional for Ollama)" : ""}
            </span>
            <input
              type="password"
              className={selectClass + " w-full"}
              value={settings.ai.apiKey}
              onChange={(event) => patchAi("apiKey", event.target.value)}
              placeholder="Paste your provider key"
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={4096}
            />
          </label>
          <label>
            <span className="flex justify-between text-sm font-bold text-navy">
              <span>Temperature</span>
              <span className="num">{settings.ai.temperature.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.ai.temperature}
              onChange={(event) => patchAi("temperature", Number(event.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </label>
          <label>
            <span className="flex justify-between text-sm font-bold text-navy">
              <span>Maximum response tokens</span>
              <span className="num">{settings.ai.maxTokens}</span>
            </span>
            <input
              type="range"
              min="64"
              max="4096"
              step="64"
              value={settings.ai.maxTokens}
              onChange={(event) => patchAi("maxTokens", Number(event.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-up/20 bg-up/5 p-3">
          <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
            AI settings, including the key, are stored in this tab’s session storage and are removed
            when the browser session ends. The key is sent to the SPORTZ_AI API only when you ask
            Copilot; it is forwarded to your selected provider and is not written to server storage
            or logs.
          </p>
          <Btn variant="ghost" onClick={() => patchSetting("ai", DEFAULT_AI_SETTINGS)}>
            Clear AI setup
          </Btn>
        </div>
      </Card>
      <Card id="model-settings">
        <SectionTitle
          title="Model lab"
          sub={
            "Artifact " +
            models.artifactVersion +
            " · generated " +
            new Date(models.generatedAt).toLocaleString()
          }
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {SPORTS.map((item) => {
            const model = models.models[item.key];
            return (
              <div key={item.key} className="rounded-xl bg-soft p-3">
                <div className="flex items-center gap-2">
                  <SportBadge grad={item.grad} label={item.short} size="sm" />
                  <b className="text-sm text-navy">{model.algorithm}</b>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {model.metrics.games.toLocaleString()} backtest events · Brier{" "}
                  {model.metrics.brierScore} · accuracy{" "}
                  {model.metrics.accuracy == null
                    ? "—"
                    : (model.metrics.accuracy * 100).toFixed(1) + "%"}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-xl border border-border p-4">
          <p className="text-sm font-bold text-navy">Refresh and train model artifact</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Run npm run models:train -- --refresh, review source terms in transform.md, then commit
            shared/sports-models.json and deploy. Inference controls above do not modify the
            published ratings.
          </p>
        </div>
      </Card>
      <Card id="backtest-settings">
        <SectionTitle
          title="Backtests"
          sub="Chronological scores recorded before each game updated Elo."
        />
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="p-2">Sport</th>
                <th className="p-2">Events</th>
                <th className="p-2">Brier</th>
                <th className="p-2">Log loss</th>
                <th className="p-2">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {SPORTS.map((item) => {
                const metric = models.models[item.key].metrics;
                return (
                  <tr key={item.key} className="border-t border-border">
                    <td className="p-2 font-bold text-navy">{item.name}</td>
                    <td className="num p-2">{metric.games.toLocaleString()}</td>
                    <td className="num p-2">{metric.brierScore}</td>
                    <td className="num p-2">{metric.logLoss}</td>
                    <td className="num p-2">
                      {metric.accuracy == null ? "—" : (metric.accuracy * 100).toFixed(1) + "%"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          F1, EPL, and two-outcome sports have different outcome spaces. Compare metrics only within
          the same sport. Elo models do not include player availability or probability calibration.
        </p>
      </Card>
      <Card>
        <SectionTitle
          title="Data and integrations"
          sub="Public read-only feeds need no account credentials."
        />
        {SPORTS.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-3 border-b border-border py-3 last:border-0"
          >
            <SportBadge grad={item.grad} label={item.short} size="sm" />
            <div>
              <p className="text-sm font-bold text-navy">
                {item.key === "f1" ? "Jolpica F1 API" : "ESPN scoreboard + standings"}
              </p>
              <p className="text-xs text-muted-foreground">
                Public endpoints; no production uptime guarantee.
              </p>
            </div>
          </div>
        ))}
        <div className="mt-3 rounded-xl bg-soft p-3 text-xs text-muted-foreground">
          Copilot uses the provider and model configured above. Server-side provider secrets are
          optional; user keys are sent only with the active Copilot request.
        </div>
      </Card>
    </div>
  );
}
