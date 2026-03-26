"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

type SoilType = "sandy" | "clay" | "loamy" | "not sure";
type Season = "summer" | "winter" | "rainy";

const SOIL_TYPES: SoilType[] = ["sandy", "clay", "loamy", "not sure"];
const SEASONS: Season[] = ["summer", "winter", "rainy"];

// Simulation: crops widely cultivated in the user's region.
const HIGH_SATURATION_CROPS = ["Tomato", "Rice"] as const;
const HIGH_SATURATION_LOWER_SET = new Set(
  HIGH_SATURATION_CROPS.map((c) => c.toLowerCase()),
);

export default function ResultsContent() {
  const searchParams = useSearchParams();

  const location = searchParams.get("location");
  const soil = searchParams.get("soil");
  const season = searchParams.get("season");
  const cropsParam = searchParams.get("crops");
  const contractEnabled = searchParams.get("contract") === "1";
  const contractCropInput = searchParams.get("contractCrop")?.trim() ?? "";

  const parsedCrops = useMemo(() => {
    // Crops are passed as a comma-separated string.
    if (!cropsParam) return [] as string[];
    return cropsParam
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }, [cropsParam]);

  const detectedSoil = useMemo(() => {
    if (!soil) return null;
    const soilType = SOIL_TYPES.includes(soil as SoilType)
      ? (soil as SoilType)
      : null;
    if (!soilType) return null;
    if (soilType !== "not sure") return soilType;

    const crops = parsedCrops ?? [];
    const hasAny = (arr: string[]) => arr.some((c) => crops.includes(c));

    if (hasAny(["rice", "sugarcane"])) return "clay";
    if (hasAny(["wheat", "cotton"])) return "loamy";
    if (hasAny(["groundnut", "millet"])) return "sandy";

    return "not sure";
  }, [parsedCrops, soil]);

  const parsedSeason = useMemo(() => {
    if (!season) return null;
    return SEASONS.includes(season as Season) ? (season as Season) : null;
  }, [season]);

  const recommendationSet = useMemo(() => {
    const seasonVal = parsedSeason;
    const soilType = detectedSoil;

    type SoilKey = Exclude<SoilType, "not sure">;
    type SeasonKey = Exclude<Season, never>;

    const soilSeasonMapping: Record<
      SoilKey,
      Record<SeasonKey, string[]>
    > = {
      loamy: {
        summer: ["Tomato", "Corn", "Cotton"],
        winter: ["Wheat", "Mustard", "Potato"],
        rainy: ["Rice", "Soybean", "Maize"],
      },
      clay: {
        summer: ["Cotton", "Sugarcane", "Turmeric"],
        winter: ["Wheat", "Gram", "Mustard"],
        rainy: ["Rice", "Jute", "Soybean"],
      },
      sandy: {
        summer: ["Groundnut", "Bajra", "Watermelon"],
        winter: ["Carrot", "Potato", "Mustard"],
        rainy: ["Millet", "Pulses", "Sesame"],
      },
    };

    const fallbackBySoil: Record<SoilKey, string[]> = {
      loamy: ["Tomato", "Corn", "Cotton"],
      clay: ["Cotton", "Sugarcane", "Turmeric"],
      sandy: ["Groundnut", "Bajra", "Watermelon"],
    };

    if (soilType && soilType !== "not sure") {
      if (seasonVal) {
        const exact = soilSeasonMapping[soilType]?.[seasonVal];
        if (exact && exact.length) return exact;
      }
      return fallbackBySoil[soilType];
    }

    // If soil can't be inferred, fallback by season (last resort).
    if (seasonVal === "summer")
      return ["Tomato", "Corn", "Cotton"] as string[];
    if (seasonVal === "rainy") return ["Rice", "Soybean", "Maize"] as string[];
    if (seasonVal === "winter")
      return ["Wheat", "Mustard", "Potato"] as string[];

    return ["Tomato", "Corn", "Cotton"] as string[];
  }, [detectedSoil, parsedSeason]);

  const cropMeta: Partial<
    Record<
      string,
      { profitLow: number; profitHigh: number; risk: "Low" | "Medium" | "High" }
    >
  > = {
    Tomato: { profitLow: 40000, profitHigh: 65000, risk: "Medium" },
    Corn: { profitLow: 45000, profitHigh: 72000, risk: "Low" },
    Cotton: { profitLow: 42000, profitHigh: 78000, risk: "Medium" },
    Sunflower: { profitLow: 32000, profitHigh: 54000, risk: "Medium" },
    Rice: { profitLow: 52000, profitHigh: 85000, risk: "Low" },
    Sugarcane: { profitLow: 60000, profitHigh: 98000, risk: "Medium" },
    Soybean: { profitLow: 48000, profitHigh: 76000, risk: "Medium" },
    Groundnut: { profitLow: 42000, profitHigh: 68000, risk: "High" },
    Millet: { profitLow: 36000, profitHigh: 59000, risk: "Medium" },
    Wheat: { profitLow: 50000, profitHigh: 90000, risk: "Low" },
    Mustard: { profitLow: 30000, profitHigh: 60000, risk: "Medium" },
    Potato: { profitLow: 38000, profitHigh: 70000, risk: "Medium" },
    Maize: { profitLow: 48000, profitHigh: 80000, risk: "Medium" },
    Turmeric: { profitLow: 32000, profitHigh: 68000, risk: "High" },
    Gram: { profitLow: 34000, profitHigh: 62000, risk: "Medium" },
    Jute: { profitLow: 28000, profitHigh: 52000, risk: "Medium" },
    Bajra: { profitLow: 30000, profitHigh: 56000, risk: "Medium" },
    Watermelon: { profitLow: 25000, profitHigh: 43000, risk: "High" },
    Carrot: { profitLow: 28000, profitHigh: 52000, risk: "Medium" },
    Pulses: { profitLow: 33000, profitHigh: 58000, risk: "Medium" },
    Sesame: { profitLow: 27000, profitHigh: 50000, risk: "High" },
  };

  const defaultCropMeta = { profitLow: 0, profitHigh: 0, risk: "Medium" as const };

  const contractCropResolved = (() => {
    if (!contractEnabled) return null;
    if (!contractCropInput) return null;

    const lower = contractCropInput.toLowerCase();
    const known = Object.keys(cropMeta).find((k) => k.toLowerCase() === lower);
    return known ?? contractCropInput;
  })();

  const normalRecommendationLowerSet = useMemo(() => {
    return new Set((recommendationSet ?? []).map((c) => c.toLowerCase()));
  }, [recommendationSet]);

  const effectiveRecommendations = useMemo(() => {
    if (!contractCropResolved) return recommendationSet ?? [];

    const priorityLower = contractCropResolved.toLowerCase();
    const withoutPriority = (recommendationSet ?? []).filter(
      (c) => c.toLowerCase() !== priorityLower,
    );
    return [contractCropResolved, ...withoutPriority];
  }, [contractCropResolved, recommendationSet]);

  const highSaturationDetected = useMemo(() => {
    return effectiveRecommendations.some((c) =>
      HIGH_SATURATION_LOWER_SET.has(c.toLowerCase()),
    );
  }, [effectiveRecommendations]);

  const highSaturationTomatoDetected = useMemo(() => {
    return effectiveRecommendations.some(
      (c) => c.toLowerCase() === "tomato",
    );
  }, [effectiveRecommendations]);

  const highSaturationRiceDetected = useMemo(() => {
    return effectiveRecommendations.some(
      (c) => c.toLowerCase() === "rice",
    );
  }, [effectiveRecommendations]);

  const contractPriorityLower = contractCropResolved?.toLowerCase() ?? null;

  const displayRecommendations = useMemo(() => {
    const filtered = effectiveRecommendations.filter((c) => {
      const lower = c.toLowerCase();
      const isSaturated = HIGH_SATURATION_LOWER_SET.has(lower);
      if (!isSaturated) return true;
      // Keep the contract crop at the top even if it is saturated.
      if (contractPriorityLower && lower === contractPriorityLower) return true;
      return false;
    });

    // Avoid empty lists by falling back to the raw recommendations.
    if (filtered.length === 0) return effectiveRecommendations;

    // De-dupe (case-insensitive) to avoid repeated crops.
    const seen = new Set<string>();
    return filtered.filter((c) => {
      const lower = c.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  }, [contractPriorityLower, effectiveRecommendations]);

  const contractRiskLevel = (() => {
    if (!contractCropResolved) return "Medium";

    if (contractCropResolved.toLowerCase() === "tomato") return "High";

    const meta = cropMeta[contractCropResolved] ?? defaultCropMeta;
    return normalRecommendationLowerSet.has(contractCropResolved.toLowerCase())
      ? meta.risk
      : "Medium";
  })();

  const hasCoreData = Boolean(location && soil && season);

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-6 py-10 font-sans dark:from-black dark:to-zinc-950">
      <main className="w-full max-w-2xl rounded-2xl border border-zinc-200/70 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Results
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Recommended crops based on your inputs.
            </p>
            <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100">
              These recommendations help prevent price crashes and improve farmer income.
            </p>
          </div>

          <Link
            href="/analyze"
            className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
          >
            New Analysis
          </Link>
        </div>

        {!hasCoreData ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
            No analysis data found
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {/* Detected inputs */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Location
                </p>
                <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {location || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Detected soil type
                </p>
                <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Detected Soil Type: {detectedSoil ?? "—"}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:col-span-2">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Season
                </p>
                <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {parsedSeason || season}
                </p>
              </div>
            </div>

            {contractCropResolved && (
              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Contract Crop Priority
                </h2>

                <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                        {contractCropInput || contractCropResolved}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Recommended due to existing contract
                      </p>
                    </div>

                    <span
                      className={
                        contractRiskLevel === "Low"
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                          : contractRiskLevel === "Medium"
                            ? "rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                            : "rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
                      }
                    >
                      {contractRiskLevel} Risk
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Recommendations */}
            <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    Crop Recommendations
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Based on soil type and season.
                  </p>
                </div>
              </div>

              {highSaturationDetected && (
                <p className="mt-3 text-sm font-semibold text-rose-700 dark:text-rose-200">
                  High cultivation in your region detected
                </p>
              )}

              {displayRecommendations.length ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {displayRecommendations.map((crop) => {
                    const meta = cropMeta[crop] ?? defaultCropMeta;
                    const isTomato = crop.toLowerCase() === "tomato";
                    return (
                      <div
                        key={crop}
                        className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                              {crop}
                            </p>
                          </div>
                          {isTomato ? (
                            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
                              High Supply Risk
                            </span>
                          ) : (
                            <span
                              className={
                                meta.risk === "Low"
                                  ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                                  : meta.risk === "Medium"
                                    ? "rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                                    : "rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
                              }
                            >
                              {meta.risk} Risk
                            </span>
                          )}
                        </div>

                        <div className="mt-3 grid gap-2">
                          {isTomato && (
                            <p className="text-sm font-semibold text-rose-700 dark:text-rose-200">
                              Oversupply predicted. Price may drop.
                            </p>
                          )}
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                              Expected profit
                            </p>
                            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                              {meta.profitHigh > 0 ? (
                                <>
                                  ₹{meta.profitLow.toLocaleString("en-IN")}-
                                  {meta.profitHigh.toLocaleString("en-IN")}
                                </>
                              ) : (
                                "₹—"
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                  No recommendation found. Please try again.
                </div>
              )}
            </section>

            {/* Avoid list */}
            <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                Crops to Avoid
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Tomato is a common oversupply example.
              </p>

              {(highSaturationTomatoDetected || highSaturationRiceDetected) && (
                <p className="mt-3 text-sm font-semibold text-rose-700 dark:text-rose-200">
                  High cultivation in your region detected
                </p>
              )}

              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-900/20">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                    Tomato
                  </p>
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-zinc-950/40 dark:text-rose-200">
                    High Supply Risk
                  </span>
                </div>

                <p className="mt-3 text-sm font-semibold text-rose-800 dark:text-rose-200">
                  Estimated loss ₹8000
                </p>
                <p className="mt-1 text-sm font-semibold text-rose-700 dark:text-rose-200">
                  Oversupply predicted. Price may drop.
                </p>
              </div>

              {highSaturationRiceDetected && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-900/20">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                      Rice
                    </p>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-zinc-950/40 dark:text-rose-200">
                      High Supply Risk
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-rose-700 dark:text-rose-200">
                    High cultivation in your region detected
                  </p>
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
