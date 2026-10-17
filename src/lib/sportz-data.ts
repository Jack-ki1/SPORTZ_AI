import f1 from "@/assets/ath-f1.jpg";
import nba from "@/assets/ath-nba.jpg";
import epl from "@/assets/ath-epl.jpg";
import nfl from "@/assets/ath-nfl.jpg";
import mlb from "@/assets/ath-mlb.jpg";

export type SportKey = "f1" | "nba" | "epl" | "nfl" | "mlb";

export const SPORTS: {
  key: SportKey;
  short: string;
  name: string;
  tagline: string;
  athlete: string;
  img: string;
  grad: string;
  text: string;
  bg: string;
}[] = [
  {
    key: "f1",
    short: "F1",
    name: "Formula 1",
    tagline: "Race winner • Podium • Strategy",
    athlete: "Max Verstappen",
    img: f1,
    grad: "grad-f1",
    text: "text-f1",
    bg: "bg-f1",
  },
  {
    key: "nba",
    short: "NBA",
    name: "NBA",
    tagline: "Win • Score • Player Impact",
    athlete: "Luka Dončić",
    img: nba,
    grad: "grad-nba",
    text: "text-nba",
    bg: "bg-nba",
  },
  {
    key: "epl",
    short: "EPL",
    name: "Premier League",
    tagline: "1X2 • Goals • xG",
    athlete: "Bukayo Saka",
    img: epl,
    grad: "grad-epl",
    text: "text-epl",
    bg: "bg-epl",
  },
  {
    key: "nfl",
    short: "NFL",
    name: "NFL",
    tagline: "Win • Score • QB Impact",
    athlete: "Patrick Mahomes",
    img: nfl,
    grad: "grad-nfl",
    text: "text-nfl",
    bg: "bg-nfl",
  },
  {
    key: "mlb",
    short: "MLB",
    name: "MLB",
    tagline: "Win • Runs • Pitching Edge",
    athlete: "Shohei Ohtani",
    img: mlb,
    grad: "grad-mlb",
    text: "text-mlb",
    bg: "bg-mlb",
  },
];

export const sport = (k: SportKey) => SPORTS.find((s) => s.key === k)!;
export const isSportKey = (value: unknown): value is SportKey =>
  typeof value === "string" && SPORTS.some((item) => item.key === value);

export const FACTORS = [
  { name: "Form", v: 28 },
  { name: "Injuries", v: 18 },
  { name: "Opponent Strength", v: 16 },
  { name: "Venue", v: 12 },
  { name: "Rest / Weather", v: 8 },
];

export const DRIVERS = [
  { name: "Max Verstappen", team: "Red Bull", win: 33, podium: 71, quali: 31 },
  { name: "Lando Norris", team: "McLaren", win: 27, podium: 64, quali: 29 },
  { name: "Charles Leclerc", team: "Ferrari", win: 18, podium: 49, quali: 22 },
  { name: "Oscar Piastri", team: "McLaren", win: 11, podium: 41, quali: 11 },
  { name: "George Russell", team: "Mercedes", win: 7, podium: 28, quali: 5 },
];

export const GRID = [
  "Verstappen",
  "Norris",
  "Piastri",
  "Hamilton",
  "Russell",
  "Antonelli",
  "Leclerc",
  "Sainz",
  "Albon",
  "Gasly",
];

export const PLAYERS: Record<
  Exclude<SportKey, "f1">,
  { title: string; rows: { n: string; a: string; b: string }[]; foot: [string, string][] }
> = {
  nba: {
    title: "Top Players",
    rows: [
      { n: "Luka Dončić", a: "32.4 PPG", b: "9.1 APG" },
      { n: "Shai Gilgeous-Alexander", a: "31.2 PPG", b: "6.1 APG" },
      { n: "Nikola Jokić", a: "26.8 PPG", b: "12.4 RPG" },
    ],
    foot: [
      ["Model Impact", "87/100"],
      ["Pace", "101.2"],
      ["Injury", "None"],
    ],
  },
  epl: {
    title: "Top Players",
    rows: [
      { n: "Bukayo Saka", a: "14 G/A", b: "6.8 xG" },
      { n: "Erling Haaland", a: "22 G/A", b: "12.4 xG" },
      { n: "Alexander Isak", a: "17 G/A", b: "8.9 xG" },
    ],
    foot: [
      ["Model Impact", "82/100"],
      ["Lineup", "Healthy"],
      ["xG", "2.1"],
    ],
  },
  nfl: {
    title: "Top QBs",
    rows: [
      { n: "Patrick Mahomes", a: "94.8 QB Rtg", b: "4,620 yds" },
      { n: "Josh Allen", a: "102.4 QB Rtg", b: "4.8 EPA" },
      { n: "Lamar Jackson", a: "96.3 QB Rtg", b: "3.9 EPA" },
    ],
    foot: [
      ["Model Impact", "89/100"],
      ["Weather", "Mild"],
      ["Injury", "Minor"],
    ],
  },
  mlb: {
    title: "Top Players",
    rows: [
      { n: "Shohei Ohtani", a: "1.12 OPS", b: "1.02 WHIP" },
      { n: "Aaron Judge", a: ".312 AVG", b: "1.167 OPS" },
      { n: "Juan Soto", a: ".299 AVG", b: "1.015 OPS" },
    ],
    foot: [
      ["Model Impact", "91/100"],
      ["Edge", "Dodgers"],
      ["Park", "Yankee Stad."],
    ],
  },
};

// Season simulator strength inputs (demo)
export const SEASON: Record<SportKey, { label: string; teams: [string, number][] }> = {
  epl: {
    label: "Premier League title",
    teams: [
      ["Arsenal", 2.05],
      ["Manchester City", 1.95],
      ["Liverpool", 1.85],
      ["Chelsea", 1.6],
      ["Newcastle", 1.5],
    ],
  },
  f1: {
    label: "Drivers' championship",
    teams: [
      ["Verstappen", 2.0],
      ["Norris", 1.95],
      ["Leclerc", 1.75],
      ["Piastri", 1.7],
      ["Russell", 1.55],
    ],
  },
  nba: {
    label: "NBA title",
    teams: [
      ["Thunder", 2.0],
      ["Celtics", 1.9],
      ["Nuggets", 1.75],
      ["Lakers", 1.65],
      ["Knicks", 1.6],
    ],
  },
  nfl: {
    label: "Super Bowl",
    teams: [
      ["Chiefs", 1.95],
      ["Bills", 1.9],
      ["Eagles", 1.85],
      ["Ravens", 1.8],
      ["Lions", 1.75],
    ],
  },
  mlb: {
    label: "World Series",
    teams: [
      ["Dodgers", 2.0],
      ["Yankees", 1.8],
      ["Braves", 1.75],
      ["Phillies", 1.7],
      ["Astros", 1.6],
    ],
  },
};
