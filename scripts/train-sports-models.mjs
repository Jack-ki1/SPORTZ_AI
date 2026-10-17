import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { asyncBufferFromFile, parquetReadObjects } from "hyparquet";
import { compressors } from "hyparquet-compressors";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cache = join(root, ".cache", "sports-data");
const out = join(root, "shared", "sports-models.json");
const seasonNow = new Date().getUTCFullYear();
const refresh = process.argv.includes("--refresh");

await mkdir(cache, { recursive: true });

function download(url, file) {
  try {
    execFileSync(
      "curl",
      ["-fLsS", "--retry", "2", "--max-time", "45", "-A", "SPORTZ_AI/1.0", "-o", file, url],
      {
        stdio: "ignore",
      },
    );
  } catch (error) {
    throw new Error(`Could not download ${url}: ${error.message}`);
  }
}

function csvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && source[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows.shift()?.map((value) => value.trim()) ?? [];
  return rows.map((values) =>
    Object.fromEntries(headers.map((header, i) => [header, values[i]?.trim() ?? ""])),
  );
}

function parseDate(value) {
  if (!value) return null;
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return new Date(value).getTime() || null;
  const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
  return Date.UTC(fullYear, month - 1, day);
}

function logistic(delta) {
  return 1 / (1 + 10 ** (-delta / 400));
}

function scoreMetrics(count, squaredError, logLoss, correct) {
  return {
    games: count,
    brierScore: count ? Number((squaredError / count).toFixed(4)) : null,
    logLoss: count ? Number((logLoss / count).toFixed(4)) : null,
    accuracy: count ? Number((correct / count).toFixed(4)) : null,
    method: "chronological Elo walk-forward; prediction recorded before game update",
  };
}

function fitBinaryGames(games, options = {}) {
  const ratings = new Map();
  const names = new Map();
  let n = 0;
  let brier = 0;
  let loss = 0;
  let correct = 0;
  for (const game of games.sort((a, b) => a.date - b.date || a.id.localeCompare(b.id))) {
    if (
      !game.home ||
      !game.away ||
      !Number.isFinite(game.homeScore) ||
      !Number.isFinite(game.awayScore)
    )
      continue;
    const homeRating = ratings.get(game.home) ?? 1500;
    const awayRating = ratings.get(game.away) ?? 1500;
    const outcome =
      game.homeScore === game.awayScore ? 0.5 : game.homeScore > game.awayScore ? 1 : 0;
    const marginFactor = options.margin
      ? Math.min(2.5, Math.log1p(Math.abs(game.homeScore - game.awayScore)))
      : 1;
    const p = logistic(
      homeRating - awayRating + (game.neutral ? 0 : (options.homeAdvantage ?? 55)),
    );
    brier += (p - outcome) ** 2;
    loss -= outcome * Math.log(Math.max(1e-8, p)) + (1 - outcome) * Math.log(Math.max(1e-8, 1 - p));
    if ((p >= 0.5 && outcome >= 0.5) || (p < 0.5 && outcome < 0.5)) correct++;
    n++;
    const change = (options.k ?? 20) * marginFactor * (outcome - p);
    ratings.set(game.home, homeRating + change);
    ratings.set(game.away, awayRating - change);
    names.set(game.home, game.homeName ?? game.home);
    names.set(game.away, game.awayName ?? game.away);
  }
  return {
    ratings: Object.fromEntries(
      [...ratings].map(([key, rating]) => [key, Number(rating.toFixed(2))]),
    ),
    teams: Object.fromEntries([...names].map(([key, name]) => [key, name])),
    metrics: scoreMetrics(n, brier, loss, correct),
  };
}

function fitEplGames(games) {
  const ratings = new Map();
  const names = new Map();
  let drawRate = 0.24;
  let played = 0;
  let brier = 0;
  let loss = 0;
  let correct = 0;
  for (const game of games.sort((a, b) => a.date - b.date)) {
    if (!game.home || !game.away || !["H", "D", "A"].includes(game.result)) continue;
    const homeRating = ratings.get(game.home) ?? 1500;
    const awayRating = ratings.get(game.away) ?? 1500;
    const pDraw = Math.max(0.12, Math.min(0.34, drawRate));
    const homeWin = (1 - pDraw) * logistic(homeRating - awayRating + 60);
    const probs = [homeWin, pDraw, 1 - pDraw - homeWin];
    const actual = game.result === "H" ? 0 : game.result === "D" ? 1 : 2;
    const oneHot = probs.map((_, i) => (i === actual ? 1 : 0));
    brier += probs.reduce((sum, p, i) => sum + (p - oneHot[i]) ** 2, 0) / 2;
    loss -= Math.log(Math.max(1e-8, probs[actual]));
    if (probs.indexOf(Math.max(...probs)) === actual) correct++;
    played++;
    const outcome = game.result === "H" ? 1 : game.result === "D" ? 0.5 : 0;
    const delta = 20 * (outcome - logistic(homeRating - awayRating + 60));
    ratings.set(game.home, homeRating + delta);
    ratings.set(game.away, awayRating - delta);
    names.set(game.home, game.home);
    names.set(game.away, game.away);
    drawRate = (drawRate * (played - 1) + (game.result === "D" ? 1 : 0)) / played;
  }
  return {
    ratings: Object.fromEntries(
      [...ratings].map(([key, rating]) => [key, Number(rating.toFixed(2))]),
    ),
    teams: Object.fromEntries([...names].map(([key, name]) => [key, name])),
    drawRate,
    metrics: scoreMetrics(played, brier, loss, correct),
  };
}

function fitF1(races) {
  const ratings = new Map();
  const drivers = new Map();
  let raceCount = 0;
  let brier = 0;
  let loss = 0;
  let correct = 0;
  let position = 0;
  for (const race of races.sort(
    (a, b) => a.date - b.date || a.season - b.season || a.round - b.round,
  )) {
    if (position && race.season !== position) {
      for (const [id, rating] of ratings) ratings.set(id, 1500 + (rating - 1500) * 0.75);
    }
    position = race.season;
    const finishers = race.results
      .filter((result) => Number.isInteger(result.position) && result.position > 0)
      .sort((a, b) => a.position - b.position);
    if (finishers.length < 2) continue;
    const strength = finishers.map((driver) => ratings.get(driver.id) ?? 1500);
    const exponents = strength.map((rating) =>
      Math.exp(Math.max(-20, Math.min(20, (rating - 1500) / 170))),
    );
    const total = exponents.reduce((sum, value) => sum + value, 0);
    const probs = exponents.map((value) => value / total);
    const winnerIndex = finishers.findIndex((driver) => driver.position === 1);
    if (winnerIndex < 0) continue;
    brier += probs.reduce((sum, p, index) => sum + (p - (index === winnerIndex ? 1 : 0)) ** 2, 0);
    loss -= Math.log(Math.max(1e-8, probs[winnerIndex]));
    if (probs.indexOf(Math.max(...probs)) === winnerIndex) correct++;
    raceCount++;
    const snapshot = new Map(
      finishers.map((driver) => [driver.id, ratings.get(driver.id) ?? 1500]),
    );
    const changes = new Map();
    for (const driver of finishers) {
      const id = driver.id;
      const old = snapshot.get(id) ?? 1500;
      const opponents = finishers.filter((other) => other.id !== id);
      const pairwiseScore =
        opponents.reduce((sum, other) => sum + (driver.position < other.position ? 1 : 0), 0) /
        opponents.length;
      const expected =
        opponents.reduce(
          (sum, other) => sum + logistic(old - (snapshot.get(other.id) ?? 1500)),
          0,
        ) / opponents.length;
      changes.set(id, old + 20 * (pairwiseScore - expected));
      drivers.set(id, driver.name);
    }
    for (const [id, rating] of changes) ratings.set(id, rating);
  }
  return {
    ratings: Object.fromEntries(
      [...ratings].map(([key, rating]) => [key, Number(rating.toFixed(2))]),
    ),
    teams: Object.fromEntries([...drivers]),
    metrics: scoreMetrics(raceCount, brier, loss, correct),
  };
}

async function getText(name, url) {
  const path = join(cache, name);
  try {
    if (refresh) throw new Error("refresh requested");
    await readFile(path);
  } catch {
    console.log(`Downloading ${name}`);
    download(url, path);
  }
  return readFile(path, "utf8");
}

async function getJson(name, url) {
  return JSON.parse(await getText(name, url));
}

function parseOpenFootball(text, startYear) {
  const games = [];
  let month = null;
  let day = null;
  for (const line of text.split(/\r?\n/)) {
    const dateMatch = line.match(
      /^\s*(?:\w{3}\s+)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:,?\s+(\d{4}))?\s*$/i,
    );
    if (dateMatch) {
      month = new Date(`${dateMatch[1]} 1, 2000`).getMonth();
      day = Number(dateMatch[2]);
      if (dateMatch[3]) startYear = Number(dateMatch[3]) - (month < 6 ? 1 : 0);
      continue;
    }
    const modern = line.match(
      /^\s*(?:\d{1,2}:\d{2}\s+)?(.+?)\s+v\s+(.+?)\s+(\d+)\s*[-–:]\s*(\d+)(?:\s+\([^)]*\))?\s*$/,
    );
    const legacy = line.match(
      /^\s*(?:\d{1,2}:\d{2}\s+)?(.+?)\s+(\d+)\s*[-–:]\s*(\d+)(?:\s+\([^)]*\))?\s+(.+?)\s*$/,
    );
    if ((!modern && !legacy) || month === null || day === null) continue;
    const home = modern?.[1]?.trim() ?? legacy?.[1]?.trim();
    const away = modern?.[2]?.trim() ?? legacy?.[4]?.trim();
    const homeGoals = Number(modern?.[3] ?? legacy?.[2]);
    const awayGoals = Number(modern?.[4] ?? legacy?.[3]);
    if (!home || !away) continue;
    const date = Date.UTC(startYear + (month < 6 ? 1 : 0), month, day);
    const canonicalTeam = (name) =>
      name
        .trim()
        .replace(/^AFC\s+/i, "")
        .replace(/\s+(?:FC|AFC)$/i, "")
        .replace(/^Wolves$/i, "Wolverhampton Wanderers")
        .replace(/^Brighton and Hove Albion$/i, "Brighton & Hove Albion");
    games.push({
      date,
      home: canonicalTeam(home),
      away: canonicalTeam(away),
      result: homeGoals === awayGoals ? "D" : homeGoals > awayGoals ? "H" : "A",
    });
  }
  return games;
}

async function getParquet(name, url, columns) {
  const path = join(cache, name);
  try {
    if (refresh) throw new Error("refresh requested");
    await readFile(path);
  } catch {
    console.log(`Downloading ${name}`);
    download(url, path);
  }
  return parquetReadObjects({ file: await asyncBufferFromFile(path), columns, compressors });
}

const sources = {
  f1: "Jolpica F1 results API (Ergast-compatible)",
  nba: "Bill Mill's public NBA team-game Parquet dataset (2009-10 onward)",
  epl: "OpenFootball England Premier League results (public domain / CC0)",
  nfl: "nflverse released schedule and result CSV",
  mlb: "MLB Stats API schedule results",
};

console.log("Loading F1 race results from Jolpica…");
const f1Races = [];
for (let season = 2010; season <= seasonNow; season++) {
  let offset = 0;
  let total = Infinity;
  const races = new Map();
  while (offset < total) {
    const payload = await getJson(
      `f1-${season}-${offset}.json`,
      `https://api.jolpi.ca/ergast/f1/${season}/results.json?limit=100&offset=${offset}`,
    );
    total = Number(payload.MRData?.total ?? 0);
    for (const race of payload.MRData?.RaceTable?.Races ?? [])
      races.set(`${race.season}-${race.round}`, race);
    if (!payload.MRData?.RaceTable?.Races?.length) break;
    offset += 100;
  }
  for (const race of races.values()) {
    f1Races.push({
      season: Number(race.season),
      round: Number(race.round),
      date: Date.parse(race.date),
      results: (race.Results ?? []).map((row) => ({
        id: row.Driver?.driverId,
        name: `${row.Driver?.givenName ?? ""} ${row.Driver?.familyName ?? ""}`.trim(),
        position: Number.parseInt(row.position, 10),
      })),
    });
  }
}

console.log("Loading EPL match results from OpenFootball…");
const eplGames = [];
for (let startYear = 2000; startYear <= seasonNow; startYear++) {
  const season = `${startYear}-${String(startYear + 1).slice(-2)}`;
  const text = await getText(
    `openfootball-epl-${season}.txt`,
    `https://raw.githubusercontent.com/openfootball/england/master/${season}/1-premierleague.txt`,
  );
  const seasonGames = parseOpenFootball(text, startYear);
  eplGames.push(...seasonGames);
  if (seasonGames.length === 0) console.warn(`No completed EPL matches parsed from ${season}`);
}
console.log(`Parsed ${eplGames.length} completed EPL matches`);

console.log("Loading NFL historical schedules and results…");
const nflRows = csvRows(
  await getText(
    "nfl-games.csv",
    "https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv",
  ),
);
const nflGames = nflRows
  .filter((row) => row.game_type === "REG" && row.home_score !== "" && row.away_score !== "")
  .map((row) => ({
    id: row.game_id,
    date: Date.parse(row.gameday),
    home: row.home_team,
    homeName: row.home_team,
    away: row.away_team,
    awayName: row.away_team,
    homeScore: Number(row.home_score),
    awayScore: Number(row.away_score),
  }));

console.log("Loading MLB game results…");
const mlbGames = [];
for (let season = 2010; season < seasonNow; season++) {
  const payload = await getJson(
    `mlb-${season}.json`,
    `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${season}&gameType=R`,
  );
  for (const day of payload.dates ?? []) {
    for (const game of day.games ?? []) {
      if (game.status?.abstractGameState !== "Final") continue;
      const home = game.teams?.home;
      const away = game.teams?.away;
      if (!home?.team?.id || !away?.team?.id) continue;
      mlbGames.push({
        id: String(game.gamePk),
        date: Date.parse(game.officialDate ?? game.gameDate),
        home: String(home.team.id),
        homeName: home.team.name,
        away: String(away.team.id),
        awayName: away.team.name,
        homeScore: Number(home.score),
        awayScore: Number(away.score),
      });
    }
  }
}

console.log("Loading NBA historical team-game logs…");
const nbaGames = [];
const nbaTeams = {};
for (let season = 2010; season <= seasonNow; season++) {
  const [logs, teams] = await Promise.all([
    getParquet(
      `nba-games-${season}.parquet`,
      `https://basketball-data.billmill.org/nba/stats/team_game_logs/season=${season}/data.parquet`,
      ["game_id", "game_date", "team_id", "opp_team_id", "home", "win", "pts"],
    ),
    getParquet(
      `nba-teams-${season}.parquet`,
      `https://basketball-data.billmill.org/nba/stats/team_seasons/season=${season}/data.parquet`,
      ["team_id", "nba_abbrev", "full_name", "is_nba"],
    ),
  ]);
  for (const team of teams) {
    if (team.is_nba)
      nbaTeams[String(team.team_id)] = { name: team.full_name, abbreviation: team.nba_abbrev };
  }
  const games = new Map();
  for (const row of logs) {
    // NBA game type prefix 002 is regular season. Ignore preseason, All-Star and playoffs.
    if (!String(row.game_id).startsWith("002")) continue;
    const game = games.get(row.game_id) ?? {
      id: row.game_id,
      date: new Date(row.game_date).getTime(),
      teams: [],
    };
    game.teams.push(row);
    games.set(row.game_id, game);
  }
  for (const game of games.values()) {
    if (game.teams.length !== 2) continue;
    const home = game.teams.find((team) => team.home === true);
    const away = game.teams.find((team) => team.home === false);
    const first = home ?? game.teams[0];
    const second = away ?? game.teams[1];
    nbaGames.push({
      id: String(game.id),
      date: game.date,
      home: String(first.team_id),
      homeName: nbaTeams[String(first.team_id)]?.name ?? String(first.team_id),
      away: String(second.team_id),
      awayName: nbaTeams[String(second.team_id)]?.name ?? String(second.team_id),
      homeScore: Number(first.pts),
      awayScore: Number(second.pts),
      neutral: home == null,
    });
  }
}

const f1 = fitF1(f1Races);
const epl = fitEplGames(eplGames);
const nfl = fitBinaryGames(nflGames, { homeAdvantage: 55, k: 22 });
const mlb = fitBinaryGames(mlbGames, { homeAdvantage: 35, k: 14, margin: true });
const nba = fitBinaryGames(nbaGames, { homeAdvantage: 55, k: 18 });

const result = {
  generatedAt: new Date().toISOString(),
  artifactVersion: "elo-v1",
  trainingWindow: { from: 2000, to: seasonNow },
  sources,
  models: {
    f1: {
      algorithm: "pairwise driver Elo with seasonal regression",
      metrics: f1.metrics,
      ratings: f1.ratings,
      teams: f1.teams,
    },
    nba: {
      algorithm: "team Elo; regular season only",
      metrics: nba.metrics,
      ratings: nba.ratings,
      teams: nba.teams,
      aliases: nbaTeams,
    },
    epl: {
      algorithm: "home-adjusted Elo with walk-forward league draw rate",
      metrics: epl.metrics,
      ratings: epl.ratings,
      teams: epl.teams,
      drawRate: Number(epl.drawRate.toFixed(4)),
    },
    nfl: {
      algorithm: "regular-season team Elo",
      metrics: nfl.metrics,
      ratings: nfl.ratings,
      teams: nfl.teams,
    },
    mlb: {
      algorithm: "home-adjusted team Elo; margin-of-victory update",
      metrics: mlb.metrics,
      ratings: mlb.ratings,
      teams: mlb.teams,
    },
  },
};

await mkdir(dirname(out), { recursive: true });
await writeFile(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote ${out}`);
for (const [key, model] of Object.entries(result.models)) {
  console.log(
    `${key}: ${model.metrics.games} events; Brier ${model.metrics.brierScore}; accuracy ${model.metrics.accuracy}`,
  );
}
