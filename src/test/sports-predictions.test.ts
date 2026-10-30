import { describe, expect, it } from "vitest";
import {
  DEFAULT_APP_SETTINGS,
  TUNING_PRESETS,
  readAppSettings,
  writeAppSettings,
} from "@/lib/app-settings";

describe("Sports Predictions & Tuning Engine", () => {
  it("provides comprehensive multi-factor default hyperparameters", () => {
    expect(DEFAULT_APP_SETTINGS.homeAdvantage).toBe(55);
    expect(DEFAULT_APP_SETTINGS.probabilityScale).toBe(400);
    expect(DEFAULT_APP_SETTINGS.formWeight).toBe(35);
    expect(DEFAULT_APP_SETTINGS.momentumFactor).toBe(20);
    expect(DEFAULT_APP_SETTINGS.convictionThreshold).toBe(14);
    expect(DEFAULT_APP_SETTINGS.nbaPaceFactor).toBe(100);
    expect(DEFAULT_APP_SETTINGS.mlbPitcherWeight).toBe(55);
  });

  it("includes high-conviction 70%+ accuracy tuning preset", () => {
    const highConviction = TUNING_PRESETS["highConviction"];
    expect(highConviction).toBeDefined();
    expect(highConviction?.badge).toContain("70%+");
    expect(highConviction?.settings.convictionThreshold).toBe(14);
    expect(highConviction?.settings.formWeight).toBe(45);
    expect(highConviction?.settings.momentumFactor).toBe(30);
  });

  it("correctly persists and restores tuned hyperparameters in session storage", () => {
    const customized = {
      ...DEFAULT_APP_SETTINGS,
      homeAdvantage: 75,
      formWeight: 50,
      convictionThreshold: 18,
      predictionMode: "ai" as const,
      useAiAsDefaultPredictor: true,
    };

    writeAppSettings(customized);
    const readBack = readAppSettings();

    expect(readBack.homeAdvantage).toBe(75);
    expect(readBack.formWeight).toBe(50);
    expect(readBack.convictionThreshold).toBe(18);
    expect(readBack.predictionMode).toBe("ai");
    expect(readBack.useAiAsDefaultPredictor).toBe(true);
  });
});
