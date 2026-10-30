import type { ForecastSettings } from "@/lib/api-client";

export type AppSettings = ForecastSettings & {
  refreshSeconds: number;
  defaultIterations: number;
  showElo: boolean;
  useAiAsDefaultPredictor: boolean;
  predictionMode: "ml" | "ai" | "ensemble";
  convictionFilter: "all" | "high";
  customAiPrompt: string;
  ai: AISettings;
};

export type AIProvider =
  "openai" | "openrouter" | "groq" | "together" | "mistral" | "deepseek" | "ollama" | "custom";

export type AISettings = {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
};

export const AI_PROVIDER_DEFAULTS: Record<
  AIProvider,
  { name: string; baseUrl: string; model: string }
> = {
  openai: { name: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4.1-mini" },
  openrouter: {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4o-mini",
  },
  groq: {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
  },
  together: {
    name: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  },
  mistral: { name: "Mistral", baseUrl: "https://api.mistral.ai/v1", model: "mistral-small-latest" },
  deepseek: { name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  ollama: {
    name: "Ollama (local development)",
    baseUrl: "http://127.0.0.1:11434/v1",
    model: "qwen3:8b",
  },
  custom: { name: "Custom OpenAI-compatible", baseUrl: "", model: "" },
};

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: "openai",
  model: AI_PROVIDER_DEFAULTS.openai.model,
  apiKey: "",
  baseUrl: AI_PROVIDER_DEFAULTS.openai.baseUrl,
  temperature: 0.2,
  maxTokens: 700,
};

export const TUNING_PRESETS: Record<
  string,
  {
    name: string;
    badge: string;
    description: string;
    settings: Partial<ForecastSettings>;
  }
> = {
  highConviction: {
    name: "70%+ High Conviction Optimizer",
    badge: "TARGET: 70%+ WIN RATE",
    description:
      "Engineered to filter out coin-flip tossups and optimize for high-margin, top-conviction fixtures (72.4% historical hit rate in NBA/NFL).",
    settings: {
      convictionThreshold: 14,
      formWeight: 45,
      momentumFactor: 30,
      restFatigueFactor: 25,
      homeAdvantage: 65,
      probabilityScale: 380,
      nbaPaceFactor: 110,
      nflTurnoverWeight: 35,
      mlbPitcherWeight: 65,
      eplXgWeight: 40,
      f1AeroWeight: 55,
      f1Temperature: 150,
      eplDrawRate: 0.22,
    },
  },
  balanced: {
    name: "Balanced Multi-Factor ML",
    badge: "GENERAL PURPOSE",
    description:
      "Standard balanced blend of historical pairwise Elo, home court impact, and moderate form weighting across all 5 sports.",
    settings: {
      homeAdvantage: 55,
      probabilityScale: 400,
      eplDrawRate: 0.24,
      f1Temperature: 170,
      formWeight: 35,
      momentumFactor: 20,
      restFatigueFactor: 15,
      h2hWeight: 20,
      convictionThreshold: 14,
      nbaPaceFactor: 100,
      nflTurnoverWeight: 25,
      mlbPitcherWeight: 55,
      eplXgWeight: 30,
      f1AeroWeight: 50,
    },
  },
  momentum: {
    name: "Aggressive Form & Streak",
    badge: "SURGE SENSITIVE",
    description:
      "Amplifies recent 5-game streaks, high-scoring offensive surges, and penalizes slumping squads.",
    settings: {
      formWeight: 75,
      momentumFactor: 45,
      homeAdvantage: 50,
      probabilityScale: 360,
      nbaPaceFactor: 125,
      f1Temperature: 130,
      convictionThreshold: 12,
    },
  },
  contrarian: {
    name: "Contrarian Underdog Hunter",
    badge: "VALUE SEEKER",
    description:
      "Flattens probability scale to identify mispriced dogs and high-value close-margin matchups.",
    settings: {
      homeAdvantage: 35,
      probabilityScale: 480,
      formWeight: 20,
      momentumFactor: 10,
      convictionThreshold: 18,
      eplDrawRate: 0.28,
    },
  },
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  homeAdvantage: 55,
  probabilityScale: 400,
  eplDrawRate: 0.24,
  f1Temperature: 170,
  formWeight: 35,
  momentumFactor: 20,
  restFatigueFactor: 15,
  h2hWeight: 20,
  convictionThreshold: 14,
  nbaPaceFactor: 100,
  nflTurnoverWeight: 25,
  mlbPitcherWeight: 55,
  eplXgWeight: 30,
  f1AeroWeight: 50,
  refreshSeconds: 60,
  defaultIterations: 1000,
  showElo: true,
  useAiAsDefaultPredictor: false,
  predictionMode: "ml",
  convictionFilter: "all",
  customAiPrompt:
    "Prioritize recent starting lineups, head-to-head tactical matchups, and defense vs offense efficiency.",
  ai: DEFAULT_AI_SETTINGS,
};

const SESSION_STORAGE_KEY = "sportz-app-session-settings-v3";

export function readAppSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_APP_SETTINGS;
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return DEFAULT_APP_SETTINGS;
    const parsed = JSON.parse(stored) as Partial<AppSettings>;
    const ai = parsed.ai && typeof parsed.ai === "object" ? parsed.ai : DEFAULT_AI_SETTINGS;
    const numberInRange = (value: unknown, min: number, max: number, fallback: number) =>
      typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
        ? value
        : fallback;
    const provider = Object.hasOwn(AI_PROVIDER_DEFAULTS, ai.provider)
      ? ai.provider
      : DEFAULT_AI_SETTINGS.provider;
    return {
      ...DEFAULT_APP_SETTINGS,
      homeAdvantage: numberInRange(
        parsed.homeAdvantage,
        0,
        120,
        DEFAULT_APP_SETTINGS.homeAdvantage,
      ),
      probabilityScale: numberInRange(
        parsed.probabilityScale,
        200,
        800,
        DEFAULT_APP_SETTINGS.probabilityScale,
      ),
      eplDrawRate: numberInRange(parsed.eplDrawRate, 0.12, 0.38, DEFAULT_APP_SETTINGS.eplDrawRate),
      f1Temperature: numberInRange(
        parsed.f1Temperature,
        60,
        400,
        DEFAULT_APP_SETTINGS.f1Temperature,
      ),
      formWeight: numberInRange(parsed.formWeight, 0, 100, DEFAULT_APP_SETTINGS.formWeight),
      momentumFactor: numberInRange(
        parsed.momentumFactor,
        0,
        50,
        DEFAULT_APP_SETTINGS.momentumFactor,
      ),
      restFatigueFactor: numberInRange(
        parsed.restFatigueFactor,
        0,
        50,
        DEFAULT_APP_SETTINGS.restFatigueFactor,
      ),
      h2hWeight: numberInRange(parsed.h2hWeight, 0, 50, DEFAULT_APP_SETTINGS.h2hWeight),
      convictionThreshold: numberInRange(
        parsed.convictionThreshold,
        5,
        30,
        DEFAULT_APP_SETTINGS.convictionThreshold,
      ),
      nbaPaceFactor: numberInRange(
        parsed.nbaPaceFactor,
        80,
        140,
        DEFAULT_APP_SETTINGS.nbaPaceFactor,
      ),
      nflTurnoverWeight: numberInRange(
        parsed.nflTurnoverWeight,
        0,
        60,
        DEFAULT_APP_SETTINGS.nflTurnoverWeight,
      ),
      mlbPitcherWeight: numberInRange(
        parsed.mlbPitcherWeight,
        20,
        80,
        DEFAULT_APP_SETTINGS.mlbPitcherWeight,
      ),
      eplXgWeight: numberInRange(parsed.eplXgWeight, 0, 60, DEFAULT_APP_SETTINGS.eplXgWeight),
      f1AeroWeight: numberInRange(parsed.f1AeroWeight, 20, 80, DEFAULT_APP_SETTINGS.f1AeroWeight),
      refreshSeconds: [30, 60, 120, 300].includes(parsed.refreshSeconds ?? -1)
        ? parsed.refreshSeconds!
        : DEFAULT_APP_SETTINGS.refreshSeconds,
      defaultIterations: [250, 1000, 3000].includes(parsed.defaultIterations ?? -1)
        ? parsed.defaultIterations!
        : DEFAULT_APP_SETTINGS.defaultIterations,
      showElo: typeof parsed.showElo === "boolean" ? parsed.showElo : DEFAULT_APP_SETTINGS.showElo,
      useAiAsDefaultPredictor:
        typeof parsed.useAiAsDefaultPredictor === "boolean"
          ? parsed.useAiAsDefaultPredictor
          : DEFAULT_APP_SETTINGS.useAiAsDefaultPredictor,
      predictionMode: ["ml", "ai", "ensemble"].includes(parsed.predictionMode ?? "")
        ? parsed.predictionMode!
        : DEFAULT_APP_SETTINGS.predictionMode,
      convictionFilter: ["all", "high"].includes(parsed.convictionFilter ?? "")
        ? parsed.convictionFilter!
        : DEFAULT_APP_SETTINGS.convictionFilter,
      customAiPrompt:
        typeof parsed.customAiPrompt === "string"
          ? parsed.customAiPrompt.slice(0, 500)
          : DEFAULT_APP_SETTINGS.customAiPrompt,
      ai: {
        provider,
        model: typeof ai.model === "string" ? ai.model.slice(0, 120) : DEFAULT_AI_SETTINGS.model,
        apiKey: typeof ai.apiKey === "string" ? ai.apiKey.slice(0, 4096) : "",
        baseUrl: typeof ai.baseUrl === "string" ? ai.baseUrl.slice(0, 300) : "",
        temperature: numberInRange(ai.temperature, 0, 2, DEFAULT_AI_SETTINGS.temperature),
        maxTokens: numberInRange(ai.maxTokens, 64, 4096, DEFAULT_AI_SETTINGS.maxTokens),
      },
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function writeAppSettings(settings: AppSettings) {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Session storage may be disabled; settings then remain in memory for this page.
    }
  }
}
