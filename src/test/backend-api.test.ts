import { describe, expect, it } from "vitest";
// @ts-expect-error app.mjs is native ESM JavaScript without declaration file
import { handleApiRequest } from "../../backend/app.mjs";

describe("Backend API & Multi-Factor Forecast Engine", () => {
  it("serves health status", async () => {
    const request = new Request("http://localhost:8787/api/v1/health");
    const response = await handleApiRequest(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.service).toBe("sportz-api");
  });

  it("serves model artifact with high conviction 70%+ accuracy benchmarks", async () => {
    const request = new Request("http://localhost:8787/api/v1/models");
    const response = await handleApiRequest(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.models).toBeDefined();
    expect(data.highConvictionBenchmarks).toBeDefined();
    expect(data.highConvictionBenchmarks.nba.accuracy).toBeGreaterThanOrEqual(0.7);
    expect(data.highConvictionBenchmarks.nfl.accuracy).toBeGreaterThanOrEqual(0.7);
    expect(data.highConvictionBenchmarks.mlb.accuracy).toBeGreaterThanOrEqual(0.7);
    expect(data.highConvictionBenchmarks.epl.accuracy).toBeGreaterThanOrEqual(0.7);
    expect(data.highConvictionBenchmarks.f1.podiumAccuracy).toBeGreaterThanOrEqual(0.7);
    expect(data.defaultHyperparameters.formWeight).toBe(35);
  });

  it("validates and rejects AI prediction requests without key or configuration safely", async () => {
    const request = new Request("http://localhost:8787/api/v1/predict-game-ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sport: "nba",
        event: { id: "123", name: "Team A vs Team B" },
        ai: { provider: "openai", apiKey: "" },
      }),
    });
    const response = await handleApiRequest(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("API key");
  });
});
