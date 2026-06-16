"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { destinations } from "@/lib/destinations-data";
import { generateDemoRiskScore } from "@/lib/risk-engine";
import { WEATHER_CODES } from "@/lib/constants";
import { MapPin, Calendar, Sparkles, ArrowRight, Shield, Loader2, CheckCircle, Cloud, Route } from "lucide-react";
import Link from "next/link";

const INTERESTS = [
  { value: "nature", label: "Nature", icon: "🌿" },
  { value: "adventure", label: "Adventure", icon: "🏄" },
  { value: "wildlife", label: "Wildlife", icon: "🐘" },
  { value: "culture", label: "Culture", icon: "🏛️" },
  { value: "beach", label: "Beach", icon: "🏖️" },
  { value: "hiking", label: "Hiking", icon: "🥾" },
  { value: "photography", label: "Photography", icon: "📸" },
  { value: "food", label: "Food", icon: "🍛" },
];

interface ItineraryDay {
  day: number;
  destination: typeof destinations[number];
  activities: string[];
  riskScore: number;
  riskLabel: string;
  riskColor: string;
  travelTime?: string;
}

export default function PlannerPage() {
  const [duration, setDuration] = useState(5);
  const [interests, setInterests] = useState<string[]>(["nature", "culture"]);
  const [generating, setGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);

  const toggleInterest = (i: string) => {
    setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  const generateItinerary = () => {
    setGenerating(true);

    setTimeout(() => {
      // Rule-based itinerary generation
      const interestMap: Record<string, string[]> = {
        nature: ["hill-country", "adventure"],
        adventure: ["adventure", "hill-country"],
        wildlife: ["wildlife"],
        culture: ["cultural"],
        beach: ["beach"],
        hiking: ["hill-country", "adventure"],
        photography: ["cultural", "hill-country", "beach"],
        food: ["cultural", "beach"],
      };

      const relevantCategories = new Set<string>();
      interests.forEach((i) => {
        (interestMap[i] || []).forEach((c) => relevantCategories.add(c));
      });

      // Score destinations based on interest match
      const scored = destinations.map((d) => {
        const risk = generateDemoRiskScore(d.district);
        let score = 0;
        if (relevantCategories.has(d.category)) score += 10;
        score -= risk.score * 0.1; // Penalize high-risk areas
        return { dest: d, score, risk };
      });

      // Sort by score (highest first) and pick top N
      scored.sort((a, b) => b.score - a.score);
      const selected = scored.slice(0, Math.min(duration, scored.length));

      const travelTimes = ["2h 30min", "3h 15min", "1h 45min", "4h", "2h", "3h 30min", "1h 30min"];

      const days: ItineraryDay[] = selected.map((item, i) => ({
        day: i + 1,
        destination: item.dest,
        activities: item.dest.activities.slice(0, 3),
        riskScore: item.risk.score,
        riskLabel: item.risk.label,
        riskColor: item.risk.color,
        travelTime: i > 0 ? travelTimes[i % travelTimes.length] : undefined,
      }));

      setItinerary(days);
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left - Form */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-4 py-1.5 glass rounded-full text-xs font-medium text-accent mb-4">
                <Sparkles className="w-3 h-3 inline mr-1" />
                AI-Powered
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Trip <span className="gradient-text">Planner</span>
              </h1>
              <p className="text-muted text-lg mb-10">
                Generate a weather-aware itinerary that considers safety risks, your interests, and travel distances.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
              {/* Duration */}
              <div>
                <label className="text-sm font-semibold text-text mb-3 block flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Trip Duration
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1} max={14}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="font-mono text-2xl font-bold text-primary w-12 text-center">{duration}</span>
                  <span className="text-sm text-muted">days</span>
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="text-sm font-semibold text-text mb-3 block">Your Interests</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest.value}
                      onClick={() => toggleInterest(interest.value)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all text-center ${
                        interests.includes(interest.value)
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "glass text-muted hover:text-text"
                      }`}
                    >
                      <span className="text-xl block mb-1">{interest.icon}</span>
                      {interest.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateItinerary}
                disabled={generating || interests.length === 0}
                className="w-full btn-primary justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Itinerary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Smart Itinerary
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Right - Generated Itinerary */}
          <div>
            <AnimatePresence mode="wait">
              {!itinerary && !generating && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-full">
                  <div className="text-center glass p-12 rounded-2xl">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="font-heading text-xl font-semibold mb-2">Your Itinerary</h3>
                    <p className="text-muted text-sm">Select your preferences and generate a smart travel plan.</p>
                  </div>
                </motion.div>
              )}

              {generating && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-full">
                  <div className="text-center glass p-12 rounded-2xl">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <h3 className="font-heading text-xl font-semibold mb-2">Building Your Itinerary</h3>
                    <p className="text-muted text-sm">Analyzing weather risks, distances, and your interests...</p>
                  </div>
                </motion.div>
              )}

              {itinerary && (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading text-2xl font-bold">Your {duration}-Day Journey</h2>
                    <button onClick={() => setItinerary(null)} className="text-xs text-muted hover:text-primary transition-colors">Reset</button>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    {itinerary.map((day, i) => (
                      <motion.div
                        key={day.day}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="glass p-5 rounded-2xl relative"
                      >
                        {/* Travel time connector */}
                        {day.travelTime && (
                          <div className="absolute -top-4 left-8 flex items-center gap-2 text-[10px] text-muted-dark">
                            <Route className="w-3 h-3" />
                            {day.travelTime} drive
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          {/* Day number */}
                          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                            <span className="font-mono text-lg font-bold text-primary">{day.day}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <Link href={`/destinations/${day.destination.slug}`} className="font-heading text-lg font-semibold hover:text-primary transition-colors">
                                {day.destination.name}
                              </Link>
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono" style={{ backgroundColor: `${day.riskColor}15`, color: day.riskColor }}>
                                <Shield className="w-3 h-3" />
                                {day.riskScore} - {day.riskLabel}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
                              <MapPin className="w-3 h-3" />
                              {day.destination.district} District
                              {day.destination.elevation ? ` - ${day.destination.elevation}m` : ""}
                            </div>

                            {/* Activities */}
                            <div className="flex flex-wrap gap-1.5">
                              {day.activities.map((act) => (
                                <span key={act} className="px-2.5 py-1 rounded-full text-[10px] font-medium glass">
                                  {act}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-6 glass p-5 rounded-2xl">
                    <h3 className="text-sm font-semibold mb-3">Trip Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-mono text-xl font-bold text-primary">{itinerary.length}</div>
                        <div className="text-xs text-muted">Destinations</div>
                      </div>
                      <div>
                        <div className="font-mono text-xl font-bold text-secondary">
                          {Math.round(itinerary.reduce((s, d) => s + d.riskScore, 0) / itinerary.length)}
                        </div>
                        <div className="text-xs text-muted">Avg Risk</div>
                      </div>
                      <div>
                        <div className="font-mono text-xl font-bold text-accent">
                          {itinerary.filter((d) => d.riskScore <= 40).length}
                        </div>
                        <div className="text-xs text-muted">Safe Stops</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
