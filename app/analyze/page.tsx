"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

type SoilType = "sandy" | "clay" | "loamy" | "not sure";
type Season = "summer" | "winter" | "rainy";

const SOIL_TYPES: SoilType[] = ["sandy", "clay", "loamy", "not sure"];
const SEASONS: Season[] = ["summer", "winter", "rainy"];
const PREVIOUS_CROPS = [
  "rice",
  "wheat",
  "cotton",
  "sugarcane",
  "groundnut",
  "millet",
] as const;

export default function AnalyzePage() {
  const [location, setLocation] = useState("");
  const [soilType, setSoilType] = useState<SoilType>("sandy");
  const [season, setSeason] = useState<Season>("summer");
  const [previousCrops, setPreviousCrops] = useState<string[]>([]);
  const [hasContract, setHasContract] = useState(false);
  const [contractCrop, setContractCrop] = useState("");

  const showPreviousCrops = useMemo(() => soilType === "not sure", [soilType]);

  const togglePreviousCrop = (crop: string) => {
    setPreviousCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop],
    );
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const crops = showPreviousCrops ? previousCrops : [];
    const cropsParam = crops.join(",");

    const params = new URLSearchParams();
    params.set("location", location.trim());
    params.set("soil", soilType);
    params.set("season", season);
    params.set("crops", cropsParam);
    params.set("contract", hasContract ? "1" : "0");
    params.set("contractCrop", contractCrop.trim());

    window.location.href = `/results?${params.toString()}`;
  };

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-6 py-10 font-sans dark:from-black dark:to-zinc-950">
      <main className="w-full max-w-2xl rounded-2xl border border-zinc-200/70 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Crop Analysis
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Fill in your details to predict profitable crops and avoid oversupply.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:ring-offset-zinc-950"
          >
            Home
          </Link>
        </div>

        <form onSubmit={onSubmit} className="mt-7">
          <div className="grid gap-5 sm:grid-cols-1">
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Austin, TX"
                required
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="soilType"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Soil Type
                </label>
                <select
                  id="soilType"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as SoilType)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {SOIL_TYPES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="season"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Season
                </label>
                <select
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value as Season)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {SEASONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {showPreviousCrops && (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Previous Crops
                  </label>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Select any
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {PREVIOUS_CROPS.map((crop) => {
                    const checked = previousCrops.includes(crop);
                    return (
                      <label
                        key={crop}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePreviousCrop(crop)}
                          className="h-4 w-4 accent-emerald-600"
                        />
                        <span className="capitalize">{crop}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={hasContract}
                  onChange={(e) => setHasContract(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-emerald-600"
                />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Do you already have a contract for a crop?
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    If yes, we will prioritize that crop in the results.
                  </p>
                </div>
              </label>

              {hasContract && (
                <div className="mt-4">
                  <label
                    htmlFor="contractCrop"
                    className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    Enter crop name
                  </label>
                  <input
                    id="contractCrop"
                    type="text"
                    value={contractCrop}
                    onChange={(e) => setContractCrop(e.target.value)}
                    placeholder="e.g., Tomato"
                    required
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
              >
                Submit Analysis
              </button>
              <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
                We’ll use these inputs to generate recommended crops for your market.
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

