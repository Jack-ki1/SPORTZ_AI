import type { SportKey } from "@/lib/sportz-data";
import type { AISettings } from "@/lib/app-settings";

export type CustomAiPrediction = {
  predictedWinner: string;
  probabilities: number[];
  confidenceScore: number;
  convictionTier: string;
  projectedScore?: string;
  keyFactors?: string[];
  reasoning: string;
  predictedAt?: string;
  modelUsed?: string;
};

export type ScoreboardEvent = {
  id: string;
  sport: SportKey;
  league: string;
  name: string;
  shortName: string;
  status: string;
  state: "live" | "scheduled" | "final";
  startTime: string | null;
  competitors: {
    id?: string;
    name: string;
    abbreviation?: string;
    score: string | null;
    record?: string | null;
    probability?: number;
    homeAway?: "home" | "away";
  }[];
  baseline: number[] | null;
  drawProbability?: number | null;
  confidence?: number | null;
  convictionTier?: "high" | "moderate" | "lean";
  projectedSpread?: string | null;
  fairOdds?: { home: string; away: string } | null;
  factors?: string[];
  customAiPrediction?: CustomAiPrediction | null;
  model: string;
};

export type ScoreboardResult = {
  sport: SportKey;
  provider: string;
  fetchedAt: string;
  status: "ok" | "unavailable";
  error?: string;
  events: ScoreboardEvent[];
};

export type ForecastSettings = {
  homeAdvantage: number;
  probabilityScale: number;
  eplDrawRate: number;
  f1Temperature: number;
  formWeight: number;
  momentumFactor: number;
  restFatigueFactor: number;
  h2hWeight: number;
  convictionThreshold: number;
  nbaPaceFactor: number;
  nflTurnoverWeight: number;
  mlbPitcherWeight: number;
  eplXgWeight: number;
  f1AeroWeight: number;
};

export type LeagueRow = {
  id: string;
  name: string;
  abbreviation: string;
  group: string;
  played: number;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  percentage: number;
  rating: number | null;
  type: "team" | "driver";
};

export type TeamGame = {
  id: string;
  name: string;
  date: string | null;
  status: string;
  state: string;
  competitors: { id: string; name: string; score: string | null; winner: boolean }[];
};

export type RosterPlayer = {
  id: string;
  name: string;
  position: string;
  age: number | null;
  experience: number | null;
  status: string;
};

const API_BASE =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? `API request failed (${response.status})`);
  return data as T;
}

export function getScoreboards() {
  return request<{ fetchedAt: string; results: ScoreboardResult[] }>("/scoreboards");
}

export function getSportSchedule({
  data,
}: {
  data: { sport: SportKey; dates?: string; settings?: ForecastSettings };
}) {
  const params = new URLSearchParams();
  if (data.dates) params.set("dates", data.dates);
  for (const [key, value] of Object.entries(data.settings ?? {})) params.set(key, String(value));
  return request<ScoreboardResult>(
    `/sports/${data.sport}/schedule${params.size ? `?${params}` : ""}`,
  );
}

export function getLeagueTable({ data }: { data: { sport: SportKey } }) {
  return request<{
    sport: SportKey;
    provider: string;
    fetchedAt: string;
    status: "ok" | "unavailable";
    error?: string;
    rows: LeagueRow[];
  }>(`/sports/${data.sport}/standings`);
}

export function getTeamRoster({
  data,
}: {
  data: { sport: Exclude<SportKey, "f1">; teamId: string };
}) {
  return request<{
    provider: string;
    status: "ok" | "unavailable";
    team: string;
    players: RosterPlayer[];
    error?: string;
  }>(`/sports/${data.sport}/teams/${data.teamId}/roster`);
}

export function getTeamSchedule({
  data,
}: {
  data: { sport: Exclude<SportKey, "f1">; teamId: string };
}) {
  return request<{ status: "ok" | "unavailable"; games: TeamGame[]; error?: string }>(
    `/sports/${data.sport}/teams/${data.teamId}/schedule`,
  );
}

export function askSportsCopilot({
  data,
}: {
  data: {
    sport: SportKey;
    question: string;
    context: string;
    history: { role: "user" | "assistant"; content: string }[];
    ai: AISettings;
  };
}) {
  return request<{ mode: string; answer: string }>("/copilot", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function predictGameWithAi({
  data,
}: {
  data: {
    sport: SportKey;
    event: ScoreboardEvent;
    ai: AISettings;
    customPrompt?: string;
  };
}) {
  return request<CustomAiPrediction>("/predict-game-ai", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function testAiConnection({
  data,
}: {
  data: {
    ai: AISettings;
  };
}) {
  return request<{ ok: boolean; latencyMs: number; model: string; provider: string }>("/test-ai", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getModelsMetadata() {
  return request<{
    artifactVersion: string;
    generatedAt: string;
    models: Record<string, unknown>;
    highConvictionBenchmarks: Record<
      string,
      {
        target: string;
        accuracy?: number;
        podiumAccuracy?: number;
        topMatchupAccuracy?: number;
        brierScore?: number;
        threshold: string;
        validationSample: string;
        description: string;
      }
    >;
    defaultHyperparameters: ForecastSettings;
  }>("/models");
}
