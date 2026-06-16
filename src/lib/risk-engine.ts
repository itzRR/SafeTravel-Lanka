import { RiskScore, RiskFactor, WeatherData, CommunityReport } from "./types";
import { getRiskLevel } from "./constants";

interface FloodHistory {
  district: string;
  floodFrequency: number; // 0-10 scale
  lastFloodYear: number;
}

// Historical flood risk data for Sri Lankan districts
const FLOOD_HISTORY: Record<string, FloodHistory> = {
  Colombo: { district: "Colombo", floodFrequency: 8, lastFloodYear: 2024 },
  Gampaha: { district: "Gampaha", floodFrequency: 7, lastFloodYear: 2024 },
  Kalutara: { district: "Kalutara", floodFrequency: 7, lastFloodYear: 2023 },
  Kandy: { district: "Kandy", floodFrequency: 5, lastFloodYear: 2023 },
  Matale: { district: "Matale", floodFrequency: 4, lastFloodYear: 2022 },
  "Nuwara Eliya": { district: "Nuwara Eliya", floodFrequency: 3, lastFloodYear: 2021 },
  Galle: { district: "Galle", floodFrequency: 6, lastFloodYear: 2023 },
  Matara: { district: "Matara", floodFrequency: 5, lastFloodYear: 2023 },
  Hambantota: { district: "Hambantota", floodFrequency: 3, lastFloodYear: 2022 },
  Jaffna: { district: "Jaffna", floodFrequency: 4, lastFloodYear: 2023 },
  Kilinochchi: { district: "Kilinochchi", floodFrequency: 5, lastFloodYear: 2022 },
  Mannar: { district: "Mannar", floodFrequency: 4, lastFloodYear: 2021 },
  Mullaitivu: { district: "Mullaitivu", floodFrequency: 5, lastFloodYear: 2022 },
  Vavuniya: { district: "Vavuniya", floodFrequency: 3, lastFloodYear: 2021 },
  Trincomalee: { district: "Trincomalee", floodFrequency: 6, lastFloodYear: 2023 },
  Batticaloa: { district: "Batticaloa", floodFrequency: 7, lastFloodYear: 2024 },
  Ampara: { district: "Ampara", floodFrequency: 5, lastFloodYear: 2023 },
  Kurunegala: { district: "Kurunegala", floodFrequency: 5, lastFloodYear: 2023 },
  Puttalam: { district: "Puttalam", floodFrequency: 4, lastFloodYear: 2022 },
  Anuradhapura: { district: "Anuradhapura", floodFrequency: 4, lastFloodYear: 2022 },
  Polonnaruwa: { district: "Polonnaruwa", floodFrequency: 5, lastFloodYear: 2023 },
  Badulla: { district: "Badulla", floodFrequency: 6, lastFloodYear: 2024 },
  Monaragala: { district: "Monaragala", floodFrequency: 4, lastFloodYear: 2022 },
  Ratnapura: { district: "Ratnapura", floodFrequency: 9, lastFloodYear: 2024 },
  Kegalle: { district: "Kegalle", floodFrequency: 8, lastFloodYear: 2024 },
};

// Landslide-prone districts
const LANDSLIDE_RISK: Record<string, number> = {
  Ratnapura: 9,
  Kegalle: 8,
  Badulla: 7,
  "Nuwara Eliya": 7,
  Kandy: 6,
  Matale: 5,
  Kalutara: 4,
  Galle: 3,
  Matara: 3,
  Colombo: 2,
};

const WEIGHTS = {
  rainfall: 0.30,
  wind: 0.15,
  flood: 0.25,
  landslide: 0.15,
  reports: 0.15,
};

export function calculateRiskScore(
  weather: WeatherData | null,
  district: string,
  recentReports: CommunityReport[] = []
): RiskScore {
  const factors: RiskFactor[] = [];

  // 1. Rainfall risk factor
  const rainScore = weather ? Math.min(100, (weather.precipitation / 50) * 100) : 20;
  factors.push({
    name: "Rainfall",
    value: weather?.precipitation ?? 0,
    weight: WEIGHTS.rainfall,
    contribution: rainScore * WEIGHTS.rainfall,
    description: `Current precipitation: ${weather?.precipitation ?? 0}mm`,
  });

  // 2. Wind risk factor
  const windScore = weather ? Math.min(100, (weather.windSpeed / 80) * 100) : 10;
  factors.push({
    name: "Wind Speed",
    value: weather?.windSpeed ?? 0,
    weight: WEIGHTS.wind,
    contribution: windScore * WEIGHTS.wind,
    description: `Wind speed: ${weather?.windSpeed ?? 0} km/h`,
  });

  // 3. Flood history factor
  const floodData = FLOOD_HISTORY[district];
  const floodScore = floodData ? (floodData.floodFrequency / 10) * 100 : 20;
  factors.push({
    name: "Flood History",
    value: floodData?.floodFrequency ?? 0,
    weight: WEIGHTS.flood,
    contribution: floodScore * WEIGHTS.flood,
    description: `Historical flood frequency: ${floodData?.floodFrequency ?? 0}/10`,
  });

  // 4. Landslide risk factor
  const landslideRisk = LANDSLIDE_RISK[district] ?? 1;
  const landslideScore = (landslideRisk / 10) * 100;
  factors.push({
    name: "Landslide Risk",
    value: landslideRisk,
    weight: WEIGHTS.landslide,
    contribution: landslideScore * WEIGHTS.landslide,
    description: `Landslide susceptibility: ${landslideRisk}/10`,
  });

  // 5. Community reports factor
  const recentCount = recentReports.filter((r) => {
    const reportAge = Date.now() - new Date(r.timestamp).getTime();
    return reportAge < 24 * 60 * 60 * 1000; // last 24 hours
  }).length;
  const reportScore = Math.min(100, recentCount * 20);
  factors.push({
    name: "Community Reports",
    value: recentCount,
    weight: WEIGHTS.reports,
    contribution: reportScore * WEIGHTS.reports,
    description: `${recentCount} reports in the last 24 hours`,
  });

  // Calculate total score
  const totalScore = Math.round(factors.reduce((sum, f) => sum + f.contribution, 0));
  const clampedScore = Math.max(0, Math.min(100, totalScore));
  const level = getRiskLevel(clampedScore);

  return {
    score: clampedScore,
    level: clampedScore <= 20 ? "safe" : clampedScore <= 40 ? "low" : clampedScore <= 60 ? "moderate" : clampedScore <= 80 ? "high" : "critical",
    label: level.label,
    color: level.color,
    factors,
  };
}

// Generate simulated risk scores for demo
export function generateDemoRiskScore(district: string): RiskScore {
  const floodData = FLOOD_HISTORY[district];
  const landslideRisk = LANDSLIDE_RISK[district] ?? 1;

  // Create a deterministic but varied score based on district characteristics
  const baseScore = ((floodData?.floodFrequency ?? 3) * 5 + landslideRisk * 3);
  const variation = (district.charCodeAt(0) % 10) * 2;
  const score = Math.max(5, Math.min(85, baseScore + variation));

  const level = getRiskLevel(score);

  return {
    score,
    level: score <= 20 ? "safe" : score <= 40 ? "low" : score <= 60 ? "moderate" : score <= 80 ? "high" : "critical",
    label: level.label,
    color: level.color,
    factors: [],
  };
}
