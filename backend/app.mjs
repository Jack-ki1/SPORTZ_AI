import { readFile } from "node:fs/promises";
import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { isIP } from "node:net";

const here = dirname(fileURLToPath(import.meta.url));
const models = JSON.parse(await readFile(resolve(here, "../shared/sports-models.json"), "utf8"));
const sports = {
  f1: { path: "racing/f1", league: "Formula 1" },
  nba: { path: "basketball/nba", league: "NBA" },
  epl: { path: "soccer/eng.1", league: "Premier League" },
  nfl: { path: "football/nfl", league: "NFL" },
  mlb: { path: "baseball/mlb", league: "MLB" },
};
const defaults = {
  homeAdvantage: 55,
  probabilityScale: 400,
  eplDrawRate: 0.24,
  f1Temperature: 170,
};
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:8080,http://127.0.0.1:8080")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const aiProviders = {
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  groq: "https://api.groq.com/openai/v1",
  together: "https://api.together.xyz/v1",
  mistral: "https://api.mistral.ai/v1",
  deepseek: "https://api.deepseek.com/v1",
  ollama: "http://127.0.0.1:11434/v1",
};

function json(data, status = 200, origin = "") {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  };
  if (origin && allowedOrigins.includes(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-credentials"] = "true";
    headers.vary = "Origin";
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function normalize(value) {
  const key = String(value)
    .toLowerCase()
    .replace(/\b(fc|afc)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
  return key === "wolves"
    ? "wolverhamptonwanderers"
    : key === "brightonandhovealbion"
      ? "brightonhovealbion"
      : key;
}

function teamRating(key, competitor) {
  const model = models.models[key];
  if (key === "nba") {
    const alias = Object.keys(model.aliases || {}).find(
      (id) => model.aliases[id]?.abbreviation === competitor.abbreviation,
    );
    if (alias) return model.ratings[alias];
  }
  const name = normalize(competitor.name);
  const id = Object.keys(model.teams || {}).find((item) => {
    const candidate = normalize(model.teams[item] || item);
    return candidate === name || candidate.includes(name) || name.includes(candidate);
  });
  return id ? model.ratings[id] : undefined;
}

function forecast(key, competitors, settings) {
  if (competitors.length !== 2) return null;
  const home = competitors.findIndex((team) => team.homeAway === "home");
  const away = competitors.findIndex((team) => team.homeAway === "away");
  const firstHome = home === 0 || (home === -1 && away !== 0);
  const homeTeam = competitors[firstHome ? 0 : 1];
  const awayTeam = competitors[firstHome ? 1 : 0];
  const homeRating = teamRating(key, homeTeam);
  const awayRating = teamRating(key, awayTeam);
  if (homeRating == null || awayRating == null) return null;
  const advantage = key === "mlb" ? settings.homeAdvantage * 0.64 : settings.homeAdvantage;
  const pHome =
    1 / (1 + 10 ** (-(homeRating - awayRating + advantage) / settings.probabilityScale));
  if (key === "epl") {
    const homeProbability = Math.round(pHome * (1 - settings.eplDrawRate) * 100);
    const awayProbability = Math.round((1 - pHome) * (1 - settings.eplDrawRate) * 100);
    return {
      values: firstHome ? [homeProbability, awayProbability] : [awayProbability, homeProbability],
      draw: Math.round(settings.eplDrawRate * 100),
    };
  }
  const values = [Math.round(pHome * 100), Math.round((1 - pHome) * 100)];
  return { values: firstHome ? values : values.reverse(), draw: null };
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: { accept: "application/json", ...headers },
    signal: AbortSignal.timeout(7000),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = (await response.text()).replace(/\s+/g, " ").slice(0, 180);
    throw new Error(`Provider returned ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  return response.json();
}

function expandDateRange(range) {
  if (!range) return [null];
  const [from, to = from] = range.split("-");
  const asDate = (value) => {
    if (!/^\d{8}$/.test(value ?? "")) return null;
    const date = new Date(
      `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00Z`,
    );
    return Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10).replaceAll("-", "") !== value
      ? null
      : date;
  };
  const start = asDate(from);
  const end = asDate(to);
  if (!start || !end || end < start) throw new Error("Invalid date range");
  const count = Math.floor((end - start) / 86400000) + 1;
  if (count > 31) throw new Error("Date ranges can include at most 31 days");
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + index);
    return day.toISOString().slice(0, 10).replaceAll("-", "");
  });
}

async function mapWithConcurrency(items, concurrency, action) {
  const results = new Array(items.length);
  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++;
        results[index] = await action(items[index]);
      }
    }),
  );
  return results;
}

function getSettings(searchParams) {
  const parsed = {};
  for (const [key, min, max] of [
    ["homeAdvantage", 0, 120],
    ["probabilityScale", 200, 800],
    ["eplDrawRate", 0.12, 0.38],
    ["f1Temperature", 60, 400],
  ]) {
    const value = Number(searchParams.get(key));
    parsed[key] = Number.isFinite(value) && value >= min && value <= max ? value : defaults[key];
  }
  return parsed;
}

async function getF1Schedule(dates, settings) {
  const fetchedAt = new Date().toISOString();
  try {
    const [calendar, currentStandings] = await Promise.all([
      fetchJson("https://api.jolpi.ca/ergast/f1/current.json?limit=100", {
        "user-agent": "SPORTZ_AI/1.0",
      }),
      fetchJson("https://api.jolpi.ca/ergast/f1/current/driverStandings.json?limit=100", {
        "user-agent": "SPORTZ_AI/1.0",
      }),
    ]);
    const races = calendar.MRData?.RaceTable?.Races ?? [];
    const [from, to] = dates?.split("-") ?? [];
    const start = from
      ? Date.parse(`${from.slice(0, 4)}-${from.slice(4, 6)}-${from.slice(6, 8)}T00:00:00Z`)
      : Date.now();
    const end = to
      ? Date.parse(`${to.slice(0, 4)}-${to.slice(4, 6)}-${to.slice(6, 8)}T23:59:59Z`)
      : Infinity;
    const race = races.find((item) => {
      const timestamp = item.date ? Date.parse(`${item.date}T23:59:59Z`) : 0;
      return timestamp >= start && timestamp <= end;
    });
    if (dates && !race)
      return { sport: "f1", provider: "Jolpica F1 API", fetchedAt, status: "ok", events: [] };
    const ratings = models.models.f1.ratings;
    const standings =
      currentStandings.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
    const drivers = standings.map((row) => ({
      id: row.Driver?.driverId,
      name: `${row.Driver?.givenName ?? ""} ${row.Driver?.familyName ?? ""}`.trim(),
      team: row.Constructors?.[0]?.name ?? "",
      rating: ratings[row.Driver?.driverId] ?? 1500,
    }));
    const weights = drivers.map((driver) =>
      Math.exp((driver.rating - 1500) / settings.f1Temperature),
    );
    const total = weights.reduce((sum, value) => sum + value, 0);
    const competitors = drivers.map((driver, index) => ({
      name: driver.name,
      abbreviation: driver.team,
      score: null,
      record: null,
      probability: total ? Math.round((weights[index] / total) * 100) : 0,
    }));
    const event = {
      id: `f1-${race?.round ?? "season"}`,
      sport: "f1",
      league: "Formula 1",
      name: race?.raceName ?? "Current F1 driver standings",
      shortName: race?.raceName ?? "F1 standings",
      status: race ? `Next race · ${race.date}` : "Current standings",
      state: "scheduled",
      startTime: race?.date ? `${race.date}T${race.time ?? "12:00:00Z"}` : null,
      competitors,
      baseline: competitors.map((driver) => driver.probability),
      model: `${models.artifactVersion} · pairwise driver Elo with seasonal regression`,
    };
    return { sport: "f1", provider: "Jolpica F1 API", fetchedAt, status: "ok", events: [event] };
  } catch (error) {
    return {
      sport: "f1",
      provider: "Jolpica F1 API",
      fetchedAt,
      status: "unavailable",
      error: error.message,
      events: [],
    };
  }
}

async function getSchedule(key, dates, settings) {
  if (key === "f1") return getF1Schedule(dates, settings);
  const info = sports[key];
  const fetchedAt = new Date().toISOString();
  try {
    const requestedDates = expandDateRange(dates);
    const results = await mapWithConcurrency(requestedDates, 5, async (date) => {
      const query = date ? `?dates=${date}` : "";
      try {
        const payload = await fetchJson(
          `https://site.api.espn.com/apis/site/v2/sports/${info.path}/scoreboard${query}`,
        );
        if (!Array.isArray(payload.events))
          throw new Error("Scoreboard response did not contain events");
        return { events: payload.events, error: null };
      } catch (error) {
        return { events: [], error: `${date ?? "current date"}: ${error.message}` };
      }
    });
    const failedDates = results.filter((result) => result.error).map((result) => result.error);
    const rawEvents = results.flatMap((result) => result.events);
    if (failedDates.length === requestedDates.length) {
      throw new Error(failedDates.slice(0, 3).join("; "));
    }
    const uniqueEvents = new Map(
      rawEvents.map((event) => [String(event.id ?? `${event.date}-${event.name}`), event]),
    );
    const events = [...uniqueEvents.values()]
      .map((event) => {
        const competition = event.competitions?.[0];
        const status = competition?.status?.type;
        const state =
          status?.state === "in" ? "live" : status?.state === "post" ? "final" : "scheduled";
        const competitors = (competition?.competitors ?? []).map((team) => ({
          name: team.team?.displayName ?? "Unknown team",
          abbreviation: team.team?.abbreviation ?? "—",
          ...(team.homeAway ? { homeAway: team.homeAway } : {}),
          score: team.score ?? null,
          record: team.records?.[0]?.summary ?? null,
        }));
        const prediction = state === "scheduled" ? forecast(key, competitors, settings) : null;
        return {
          id: event.id ?? `${key}-${event.name ?? "event"}`,
          sport: key,
          league: info.league,
          name: event.name ?? "Scheduled event",
          shortName: event.shortName ?? event.name ?? "Scheduled event",
          status: status?.detail ?? status?.name ?? "Scheduled",
          state,
          startTime: event.date ?? null,
          competitors,
          baseline: prediction?.values ?? null,
          drawProbability: prediction?.draw ?? null,
          model: `${models.artifactVersion} · ${models.models[key].algorithm}`,
        };
      })
      .sort((a, b) => Date.parse(a.startTime ?? "") - Date.parse(b.startTime ?? ""));
    return {
      sport: key,
      provider: "ESPN scoreboard (daily date queries)",
      fetchedAt,
      status: "ok",
      ...(failedDates.length
        ? {
            error: `${failedDates.length} of ${requestedDates.length} date requests failed; showing available results. ${failedDates.slice(0, 2).join("; ")}`,
          }
        : {}),
      events,
    };
  } catch (error) {
    return {
      sport: key,
      provider: "ESPN scoreboard",
      fetchedAt,
      status: "unavailable",
      error: error.message,
      events: [],
    };
  }
}

async function getStandings(key) {
  const fetchedAt = new Date().toISOString();
  try {
    if (key === "f1") {
      const payload = await fetchJson(
        "https://api.jolpi.ca/ergast/f1/current/driverStandings.json?limit=100",
        { "user-agent": "SPORTZ_AI/1.0" },
      );
      const list = payload.MRData?.StandingsTable?.StandingsLists?.[0];
      const rows = (list?.DriverStandings ?? []).map((item) => ({
        id: item.Driver?.driverId ?? "",
        name: `${item.Driver?.givenName ?? ""} ${item.Driver?.familyName ?? ""}`.trim(),
        abbreviation: item.Constructors?.[0]?.name ?? "—",
        group: item.Constructors?.[0]?.name ?? "Drivers",
        played: Number(list.round) || 0,
        wins: Number(item.wins) || 0,
        losses: 0,
        ties: 0,
        points: Number(item.points) || 0,
        percentage: 0,
        rating: models.models.f1.ratings[item.Driver?.driverId] ?? null,
        type: "driver",
      }));
      return { sport: key, provider: "Jolpica F1 API", fetchedAt, status: "ok", rows };
    }
    const payload = await fetchJson(
      `https://site.api.espn.com/apis/v2/sports/${sports[key].path}/standings`,
    );
    const entries = [];
    const visit = (node, group = "League") => {
      if (!node || typeof node !== "object") return;
      for (const entry of node.standings?.entries ?? [])
        entries.push({ entry, group: node.name ?? group });
      for (const child of node.children ?? []) visit(child, child.name ?? group);
    };
    visit(payload);
    const rows = entries.map(({ entry, group }, index) => {
      const stats = Object.fromEntries(
        (entry.stats ?? []).map((stat) => [
          String(stat.name ?? stat.abbreviation ?? "")
            .toLowerCase()
            .replace(/[^a-z]/g, ""),
          stat.value ?? stat.displayValue,
        ]),
      );
      const team = entry.team ?? {};
      const number = (...keys) => {
        for (const key of keys) {
          const value = Number(String(stats[key] ?? "").replace(/[^0-9.-]/g, ""));
          if (Number.isFinite(value) && String(stats[key] ?? "") !== "") return value;
        }
        return 0;
      };
      const wins = number("wins", "win");
      const losses = number("losses", "loss");
      const ties = number("ties", "tie");
      const name = team.displayName ?? team.name ?? "Unknown team";
      const ratingModel = models.models[key];
      const normalizeName = (text) =>
        String(text)
          .toLowerCase()
          .replace(/\b(fc|afc)\b/g, "")
          .replace(/[^a-z0-9]/g, "");
      const candidate = normalizeName(name);
      const ratingId =
        key === "nba"
          ? Object.keys(ratingModel.aliases ?? {}).find(
              (id) => ratingModel.aliases[id]?.abbreviation === team.abbreviation,
            )
          : Object.keys(ratingModel.teams ?? {}).find(
              (id) =>
                normalizeName(ratingModel.teams[id] ?? id).includes(candidate) ||
                candidate.includes(normalizeName(ratingModel.teams[id] ?? id)),
            );
      return {
        id: String(team.id ?? index),
        name,
        abbreviation: team.abbreviation ?? "—",
        group,
        played: number("gamesplayed", "played") || wins + losses + ties,
        wins,
        losses,
        ties,
        points: number("points", "point"),
        percentage: Math.min(1, number("winpercent", "winningpercentage", "pct")),
        rating: ratingId ? (ratingModel.ratings[ratingId] ?? null) : null,
        type: "team",
      };
    });
    if (!rows.length) throw new Error("The provider returned no standings rows");
    return { sport: key, provider: "ESPN standings", fetchedAt, status: "ok", rows };
  } catch (error) {
    return {
      sport: key,
      provider: key === "f1" ? "Jolpica F1 API" : "ESPN standings",
      fetchedAt,
      status: "unavailable",
      error: error.message,
      rows: [],
    };
  }
}

async function getRoster(key, id) {
  try {
    const payload = await fetchJson(
      `https://site.api.espn.com/apis/site/v2/sports/${sports[key].path}/teams/${id}/roster`,
    );
    const players = (payload.athletes ?? [])
      .flatMap((group) => group.items ?? [group])
      .map((item) => ({
        id: String(item.id ?? item.displayName),
        name: item.displayName ?? `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim(),
        position: item.position?.abbreviation ?? item.position?.name ?? "—",
        age: Number(item.age) || null,
        experience: Number(item.experience?.years) || null,
        status: item.status?.name ?? "Rostered",
      }))
      .filter((item) => item.name);
    return {
      provider: "ESPN team roster",
      status: "ok",
      team: payload.team?.displayName ?? "Team roster",
      players,
    };
  } catch (error) {
    return {
      provider: "ESPN team roster",
      status: "unavailable",
      team: "Roster unavailable",
      players: [],
      error: error.message,
    };
  }
}

async function getTeamSchedule(key, id) {
  try {
    const payload = await fetchJson(
      `https://site.api.espn.com/apis/site/v2/sports/${sports[key].path}/teams/${id}/schedule`,
    );
    const games = (payload.events ?? []).map((event) => {
      const competition = event.competitions?.[0];
      return {
        id: String(event.id ?? ""),
        name: event.shortName ?? event.name ?? "Game",
        date: event.date ?? null,
        status: competition?.status?.type?.detail ?? "Unknown",
        state: competition?.status?.type?.state ?? "pre",
        competitors: (competition?.competitors ?? []).map((team) => ({
          id: String(team.id ?? team.team?.id ?? ""),
          name: team.team?.displayName ?? "Unknown team",
          score: team.score ?? null,
          winner: team.winner ?? false,
        })),
      };
    });
    return { status: "ok", games };
  } catch (error) {
    return { status: "unavailable", error: error.message, games: [] };
  }
}

function isPublicAddress(address) {
  const family = isIP(address);
  if (family === 4) {
    const octets = address.split(".").map(Number);
    const [a, b] = octets;
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 0 || b === 168)) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51) ||
      (a === 203 && b === 0) ||
      (a === 192 && b === 88 && octets[2] === 99) ||
      a >= 224
    );
  }
  if (family === 6) {
    const normalized = address.toLowerCase();
    if (normalized.startsWith("::ffff:")) return isPublicAddress(normalized.slice(7));
    // Only globally routable IPv6 unicast addresses are accepted.
    return /^[23]/.test(normalized) && !normalized.startsWith("2001:db8:");
  }
  return false;
}

async function resolvePublicEndpoint(input, provider) {
  if (provider === "ollama") {
    if (
      process.env.NODE_ENV === "production" ||
      process.env.VERCEL === "1" ||
      process.env.AI_ALLOW_LOCAL_ENDPOINTS !== "true"
    )
      throw new Error(
        "Local AI endpoints require AI_ALLOW_LOCAL_ENDPOINTS=true in non-production development.",
      );
    const endpoint = new URL(aiProviders.ollama);
    endpoint.pathname = `${endpoint.pathname.replace(/\/$/, "")}/chat/completions`;
    return endpoint;
  }
  if (provider !== "custom") {
    const endpoint = new URL(aiProviders[provider]);
    endpoint.pathname = `${endpoint.pathname.replace(/\/$/, "")}/chat/completions`;
    return endpoint;
  }
  let endpoint;
  try {
    endpoint = new URL(input);
  } catch {
    throw new Error("Enter a valid custom endpoint URL.");
  }
  if (
    endpoint.protocol !== "https:" ||
    endpoint.username ||
    endpoint.password ||
    isIP(endpoint.hostname) ||
    endpoint.hostname === "localhost" ||
    endpoint.hostname.endsWith(".local") ||
    endpoint.hostname.endsWith(".internal")
  )
    throw new Error("Custom AI endpoints must use a public HTTPS hostname.");
  const addresses = await lookup(endpoint.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address)))
    throw new Error("Custom AI endpoint resolves to a non-public network address.");
  endpoint.pathname = `${endpoint.pathname.replace(/\/$/, "")}/chat/completions`;
  endpoint.search = "";
  endpoint.hash = "";
  Object.defineProperty(endpoint, "resolvedAddress", { value: addresses[0] });
  return endpoint;
}

function postAiJson(endpoint, apiKey, payload) {
  return new Promise((resolveResponse, rejectResponse) => {
    const address = endpoint.resolvedAddress;
    const requestFn = endpoint.protocol === "http:" ? httpRequest : httpsRequest;
    const request = requestFn(
      {
        hostname: endpoint.hostname,
        port: endpoint.port || (endpoint.protocol === "http:" ? 80 : 443),
        path: `${endpoint.pathname}${endpoint.search}`,
        method: "POST",
        servername: endpoint.hostname,
        lookup: address
          ? (_hostname, _options, callback) => callback(null, address.address, address.family)
          : undefined,
        headers: {
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
          "content-type": "application/json",
          accept: "application/json",
          "content-length": Buffer.byteLength(JSON.stringify(payload)),
        },
        timeout: 20000,
      },
      (response) => {
        const chunks = [];
        let size = 0;
        response.on("data", (chunk) => {
          size += chunk.length;
          if (size > 1_000_000) {
            request.destroy(new Error("AI provider response exceeded the size limit."));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          let data;
          try {
            data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          } catch {
            rejectResponse(new Error("AI provider returned invalid JSON."));
            return;
          }
          if (response.statusCode < 200 || response.statusCode >= 300) {
            rejectResponse(
              new Error(
                `AI provider returned HTTP ${response.statusCode}. Check provider, model, and API key.`,
              ),
            );
            return;
          }
          resolveResponse(data);
        });
      },
    );
    request.on("timeout", () => request.destroy(new Error("AI provider request timed out.")));
    request.on("error", rejectResponse);
    request.end(JSON.stringify(payload));
  });
}

async function copilot(body) {
  if (
    typeof body.question !== "string" ||
    !body.question.trim() ||
    body.question.length > 600 ||
    !sports[body.sport] ||
    typeof (body.context ?? "") !== "string" ||
    (body.context ?? "").length > 2400
  )
    return { status: 400, data: { error: "Invalid copilot request" } };
  const config = body.ai ?? {};
  const provider = typeof config.provider === "string" ? config.provider : "";
  const model = typeof config.model === "string" ? config.model.trim() : "";
  const apiKey = typeof config.apiKey === "string" ? config.apiKey.trim() : "";
  if (!apiKey && provider !== "ollama")
    return {
      status: 200,
      data: {
        mode: "unconfigured",
        answer:
          "Choose an AI provider, model, and API key in Settings to enable generated Copilot answers. Your settings stay in this browser session.",
      },
    };
  if (
    !(Object.hasOwn(aiProviders, provider) || provider === "custom") ||
    !model ||
    model.length > 120 ||
    !/^[a-zA-Z0-9._:/-]+$/.test(model) ||
    apiKey.length > 4096 ||
    (provider === "custom" && (typeof config.baseUrl !== "string" || config.baseUrl.length > 300))
  )
    return { status: 400, data: { error: "Invalid AI provider configuration" } };
  const temperature = Number(config.temperature);
  const maxTokens = Number(config.maxTokens);
  if (
    !Number.isFinite(temperature) ||
    temperature < 0 ||
    temperature > 2 ||
    !Number.isInteger(maxTokens) ||
    maxTokens < 64 ||
    maxTokens > 4096
  )
    return { status: 400, data: { error: "Invalid AI generation settings" } };
  try {
    const endpoint = await resolvePublicEndpoint(config.baseUrl, provider);
    const history = Array.isArray(body.history)
      ? body.history
          .slice(-8)
          .filter(
            (item) => ["user", "assistant"].includes(item.role) && typeof item.content === "string",
          )
          .map((item) => ({ role: item.role, content: item.content.slice(0, 600) }))
      : [];
    const result = await postAiJson(endpoint, apiKey, {
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content:
            "You are the SPORTZ_AI sports data copilot. Use only supplied context for current fixtures, teams, players, ratings, and results. State when context lacks evidence. Explain that Elo probabilities are model estimates, not certainty or betting advice. Never invent unavailable sports data. Keep responses concise.",
        },
        {
          role: "system",
          content: `Selected sport: ${body.sport}. Data context: ${body.context || "No selected match context."}`,
        },
        ...history,
        { role: "user", content: body.question.trim() },
      ],
    });
    const answer = result.choices?.[0]?.message?.content;
    const text = Array.isArray(answer) ? answer.map((part) => part.text ?? "").join("\n") : answer;
    if (typeof text !== "string" || !text.trim())
      throw new Error("AI provider returned no text output.");
    return { status: 200, data: { mode: provider, answer: text.slice(0, 8000) } };
  } catch (error) {
    return {
      status: 200,
      data: {
        mode: "provider-error",
        answer: `AI request failed: ${error instanceof Error ? error.message : "provider unavailable"}`,
      },
    };
  }
}

export async function handleApiRequest(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin") ?? "";
  if (request.method === "OPTIONS") {
    const headers = new Headers({
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type,authorization",
      "access-control-max-age": "86400",
    });
    if (origin && allowedOrigins.includes(origin))
      headers.set("access-control-allow-origin", origin);
    return new Response(null, { status: 204, headers });
  }
  if (request.method === "GET" && url.pathname === "/api/v1/health")
    return json(
      { status: "ok", service: "sportz-api", version: "v1", time: new Date().toISOString() },
      200,
      origin,
    );
  if (request.method === "GET" && url.pathname === "/api/v1/models")
    return json(
      {
        artifactVersion: models.artifactVersion,
        generatedAt: models.generatedAt,
        models: models.models,
      },
      200,
      origin,
    );
  if (request.method === "GET" && url.pathname === "/api/v1/scoreboards") {
    const results = await Promise.all(
      Object.keys(sports).map((key) => getSchedule(key, null, defaults)),
    );
    return json({ fetchedAt: new Date().toISOString(), results }, 200, origin);
  }
  // Sport identifiers include digits (for example `f1`), so permit both letters and numbers.
  const match = url.pathname.match(/^\/api\/v1\/sports\/([a-z0-9]+)(?:\/(.*))?$/);
  if (match) {
    const [, key, resource = ""] = match;
    if (!sports[key]) return json({ error: "Unknown sport" }, 404, origin);
    if (request.method === "GET" && resource === "schedule") {
      const dates = url.searchParams.get("dates") ?? undefined;
      try {
        expandDateRange(dates);
      } catch (error) {
        return json({ error: error.message }, 400, origin);
      }
      return json(await getSchedule(key, dates, getSettings(url.searchParams)), 200, origin);
    }
    if (request.method === "GET" && resource === "standings")
      return json(await getStandings(key), 200, origin);
    const team = resource.match(/^teams\/(\d+)\/(roster|schedule)$/);
    if (request.method === "GET" && team && key !== "f1")
      return json(
        team[2] === "roster" ? await getRoster(key, team[1]) : await getTeamSchedule(key, team[1]),
        200,
        origin,
      );
  }
  if (request.method === "POST" && url.pathname === "/api/v1/copilot") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Request body must be valid JSON" }, 400, origin);
    }
    const result = await copilot(body);
    return json(result.data, result.status, origin);
  }
  return json({ error: "API route not found" }, 404, origin);
}
