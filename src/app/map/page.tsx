"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { destinations } from "@/lib/destinations-data";
import { generateDemoRiskScore } from "@/lib/risk-engine";
import { getRiskLevel, WEATHER_CODES } from "@/lib/constants";
import { WeatherData } from "@/lib/types";
import { X, Thermometer, Wind, Droplets, MapPin, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

// All 25 Sri Lankan districts with center coordinates
const DISTRICTS = [
  { name: "Colombo", lat: 6.9271, lng: 79.8612 },
  { name: "Gampaha", lat: 7.0840, lng: 80.0098 },
  { name: "Kalutara", lat: 6.5854, lng: 80.1141 },
  { name: "Kandy", lat: 7.2906, lng: 80.6337 },
  { name: "Matale", lat: 7.4675, lng: 80.6234 },
  { name: "Nuwara Eliya", lat: 6.9497, lng: 80.7891 },
  { name: "Galle", lat: 6.0535, lng: 80.2200 },
  { name: "Matara", lat: 5.9549, lng: 80.5550 },
  { name: "Hambantota", lat: 6.1429, lng: 81.1212 },
  { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
  { name: "Kilinochchi", lat: 9.3803, lng: 80.3770 },
  { name: "Mannar", lat: 8.9810, lng: 79.9044 },
  { name: "Mullaitivu", lat: 9.2671, lng: 80.5880 },
  { name: "Vavuniya", lat: 8.7514, lng: 80.4971 },
  { name: "Trincomalee", lat: 8.5874, lng: 81.2152 },
  { name: "Batticaloa", lat: 7.7310, lng: 81.6747 },
  { name: "Ampara", lat: 7.2976, lng: 81.6720 },
  { name: "Kurunegala", lat: 7.4863, lng: 80.3647 },
  { name: "Puttalam", lat: 8.0362, lng: 79.8283 },
  { name: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
  { name: "Polonnaruwa", lat: 7.9403, lng: 81.0188 },
  { name: "Badulla", lat: 6.9934, lng: 81.0550 },
  { name: "Monaragala", lat: 6.8728, lng: 81.3507 },
  { name: "Ratnapura", lat: 6.6828, lng: 80.3992 },
  { name: "Kegalle", lat: 7.2513, lng: 80.3464 },
];

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const riskScores = useCallback(() => {
    const scores: Record<string, ReturnType<typeof generateDemoRiskScore>> = {};
    DISTRICTS.forEach((d) => {
      scores[d.name] = generateDemoRiskScore(d.name);
    });
    return scores;
  }, [])();

  const selectedDistrictData = DISTRICTS.find((d) => d.name === selectedDistrict);
  const selectedRisk = selectedDistrict ? riskScores[selectedDistrict] : null;

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            paint: {
              "raster-saturation": -0.5,
              "raster-brightness-min": 0.4,
              "raster-brightness-max": 0.8,
              "raster-opacity": 0.8,
            },
          },
        ],
      },
      center: [80.7718, 7.8731],
      zoom: 7.5,
      minZoom: 6,
      maxZoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");

    map.on("load", () => {
      // Add district markers with risk-colored circles
      DISTRICTS.forEach((district) => {
        const risk = riskScores[district.name];
        const el = document.createElement("div");
        el.className = "district-marker";
        el.style.cssText = `
          width: 32px; height: 32px; border-radius: 50%;
          background: ${risk.color}30;
          border: 2px solid ${risk.color};
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 0 12px ${risk.color}40;
        `;
        el.innerHTML = `<span style="font-size: 10px; font-weight: 700; color: ${risk.color}; font-family: 'JetBrains Mono', monospace;">${risk.score}</span>`;
        
        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.3)";
          el.style.boxShadow = `0 0 24px ${risk.color}60`;
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
          el.style.boxShadow = `0 0 12px ${risk.color}40`;
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([district.lng, district.lat])
          .addTo(map);

        el.addEventListener("click", () => {
          setSelectedDistrict(district.name);
          map.flyTo({ center: [district.lng, district.lat], zoom: 10, duration: 1000 });
        });
      });
    });

    mapRef.current = map;
    return () => map.remove();
  }, [riskScores]);

  // Fetch weather when district is selected
  useEffect(() => {
    if (!selectedDistrictData) return;
    setLoadingWeather(true);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${selectedDistrictData.lat}&longitude=${selectedDistrictData.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day&timezone=Asia/Colombo`
    )
      .then((res) => res.json())
      .then((data) => {
        const c = data.current;
        setWeather({
          temperature: c.temperature_2m,
          humidity: c.relative_humidity_2m,
          apparentTemperature: c.apparent_temperature,
          precipitation: c.precipitation,
          weatherCode: c.weather_code,
          windSpeed: c.wind_speed_10m,
          windDirection: c.wind_direction_10m,
          isDay: c.is_day === 1,
        });
      })
      .catch(() => setWeather(null))
      .finally(() => setLoadingWeather(false));
  }, [selectedDistrictData]);

  const filteredDistricts = filterLevel === "all"
    ? DISTRICTS
    : DISTRICTS.filter((d) => riskScores[d.name].level === filterLevel);

  const nearbyDestinations = selectedDistrict
    ? destinations.filter((d) => d.district === selectedDistrict || 
        Math.abs(d.lat - (selectedDistrictData?.lat ?? 0)) < 0.5 && 
        Math.abs(d.lng - (selectedDistrictData?.lng ?? 0)) < 0.5)
    : [];

  return (
    <div className="h-screen pt-16 md:pt-20 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-96 bg-surface/80 backdrop-blur-xl border-r border-card-border overflow-y-auto flex-shrink-0 z-10">
        <div className="p-5">
          <h1 className="font-heading text-2xl font-bold mb-1">Risk Map</h1>
          <p className="text-sm text-muted mb-5">Real-time safety intelligence for all 25 districts</p>

          {/* Filter */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {["all", "safe", "low", "moderate", "high", "critical"].map((level) => {
              const lvl = level === "all" ? null : getRiskLevel(level === "safe" ? 10 : level === "low" ? 30 : level === "moderate" ? 50 : level === "high" ? 70 : 90);
              return (
                <button
                  key={level}
                  onClick={() => setFilterLevel(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterLevel === level
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "glass text-muted hover:text-text"
                  }`}
                >
                  {lvl && <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: lvl.color }} />}
                  {level === "all" ? "All" : lvl?.label}
                </button>
              );
            })}
          </div>

          {/* District List */}
          <div className="space-y-1.5">
            {filteredDistricts.map((district) => {
              const risk = riskScores[district.name];
              const isSelected = selectedDistrict === district.name;
              return (
                <button
                  key={district.name}
                  onClick={() => {
                    setSelectedDistrict(district.name);
                    mapRef.current?.flyTo({ center: [district.lng, district.lat], zoom: 10, duration: 1000 });
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all ${
                    isSelected
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-card"
                  }`}
                >
                  <span className="font-medium">{district.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold" style={{ color: risk.color }}>
                      {risk.score}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ backgroundColor: `${risk.color}20`, color: risk.color }}
                    >
                      {risk.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 glass rounded-xl">
            <h3 className="text-xs font-semibold text-muted mb-3 uppercase tracking-wider">Risk Legend</h3>
            <div className="space-y-2">
              {[
                { range: "0-20", label: "Safe", color: "#00d084" },
                { range: "21-40", label: "Low Risk", color: "#38bdf8" },
                { range: "41-60", label: "Moderate", color: "#f59e0b" },
                { range: "61-80", label: "High Risk", color: "#ef4444" },
                { range: "81-100", label: "Critical", color: "#dc2626" },
              ].map((item) => (
                <div key={item.range} className="flex items-center gap-3 text-xs">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                  <span className="font-mono text-muted">{item.range}</span>
                  <span className="text-text-secondary">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Selected District Popup */}
        <AnimatePresence>
          {selectedDistrict && selectedRisk && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute top-4 right-4 w-80 glass-strong rounded-2xl overflow-hidden z-20"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold">{selectedDistrict}</h3>
                    <p className="text-xs text-muted">District Overview</p>
                  </div>
                  <button onClick={() => setSelectedDistrict(null)} className="p-1.5 rounded-lg hover:bg-card transition-colors">
                    <X className="w-4 h-4 text-muted" />
                  </button>
                </div>

                {/* Risk Score */}
                <div className="flex items-center gap-4 p-3 rounded-xl mb-4" style={{ backgroundColor: `${selectedRisk.color}10` }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedRisk.color}20` }}>
                    <span className="font-mono text-2xl font-bold" style={{ color: selectedRisk.color }}>
                      {selectedRisk.score}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4" style={{ color: selectedRisk.color }} />
                      <span className="font-semibold" style={{ color: selectedRisk.color }}>{selectedRisk.label}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">Travel Safety Score</p>
                  </div>
                </div>

                {/* Weather */}
                {loadingWeather ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 skeleton rounded-lg" />
                    ))}
                  </div>
                ) : weather ? (
                  <div className="space-y-2 mb-4">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Current Weather</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-card">
                        <Thermometer className="w-4 h-4 text-warning" />
                        <div>
                          <div className="font-mono text-sm font-bold">{weather.temperature}°C</div>
                          <div className="text-[10px] text-muted">Temperature</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-card">
                        <Wind className="w-4 h-4 text-secondary" />
                        <div>
                          <div className="font-mono text-sm font-bold">{weather.windSpeed} km/h</div>
                          <div className="text-[10px] text-muted">Wind</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-card">
                        <Droplets className="w-4 h-4 text-info" />
                        <div>
                          <div className="font-mono text-sm font-bold">{weather.humidity}%</div>
                          <div className="text-[10px] text-muted">Humidity</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-card">
                        <span className="text-lg">{WEATHER_CODES[weather.weatherCode]?.icon || "🌤"}</span>
                        <div>
                          <div className="text-xs font-medium">{WEATHER_CODES[weather.weatherCode]?.description || "Clear"}</div>
                          <div className="text-[10px] text-muted">Condition</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Nearby Destinations */}
                {nearbyDestinations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Nearby Destinations</h4>
                    <div className="space-y-1.5">
                      {nearbyDestinations.slice(0, 3).map((dest) => (
                        <Link
                          key={dest.slug}
                          href={`/destinations/${dest.slug}`}
                          className="flex items-center gap-2 p-2 rounded-lg bg-card hover:bg-card-hover transition-colors text-sm"
                        >
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span>{dest.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Travel Advice */}
                {selectedRisk.score > 60 && (
                  <div className="mt-4 p-3 rounded-xl bg-danger/10 border border-danger/20">
                    <div className="flex items-center gap-2 text-danger text-xs font-semibold mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Travel Advisory
                    </div>
                    <p className="text-xs text-muted">
                      Elevated risk detected. Check weather conditions before traveling. Consider alternative destinations.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
