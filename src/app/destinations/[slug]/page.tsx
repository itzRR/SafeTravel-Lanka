import { destinations, getDestinationBySlug } from "@/lib/destinations-data";
import { DESTINATION_HISTORY } from "@/lib/history-data";
import { fetchCurrentWeather, fetchForecast } from "@/lib/weather";
import { calculateRiskScore } from "@/lib/risk-engine";
import { WEATHER_CODES, EMERGENCY_CONTACTS } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Thermometer, Wind, Droplets, Shield, Phone, Clock, ArrowLeft, AlertTriangle, CheckCircle, Info, Star } from "lucide-react";
import type { Metadata } from "next";

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) return { title: "Destination Not Found" };
  return {
    title: `${dest.name} - SafeTravel Lanka`,
    description: dest.description,
  };
}

export default async function DestinationDetailPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) notFound();

  const history = DESTINATION_HISTORY[slug];

  let weather = null;
  let forecast = null;
  try {
    [weather, forecast] = await Promise.all([
      fetchCurrentWeather(dest.lat, dest.lng),
      fetchForecast(dest.lat, dest.lng, 7),
    ]);
  } catch {
    // Weather fetch failed - will show without weather data
  }

  const risk = calculateRiskScore(weather, dest.district);

  const riskColor = risk.color;
  const weatherInfo = weather ? WEATHER_CODES[weather.weatherCode] : null;

  return (
    <div className="pt-20 pb-20">
      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 overflow-hidden bg-surface">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 flex items-center justify-center">
          <span className="text-8xl sm:text-9xl opacity-30">
            {dest.category === "beach" ? "🏖️" : dest.category === "hill-country" ? "⛰️" : dest.category === "cultural" ? "🏛️" : dest.category === "wildlife" ? "🐘" : "🏄"}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container-wide pb-8">
          <Link href="/destinations" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            All Destinations
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">{dest.name}</h1>
          <div className="flex items-center gap-3 text-sm text-muted">
            <MapPin className="w-4 h-4 text-primary" />
            {dest.district} District, {dest.province} Province
            {dest.elevation !== undefined && dest.elevation > 0 && (
              <span className="font-mono">| {dest.elevation}m elevation</span>
            )}
          </div>
        </div>
      </div>

      <div className="container-wide mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="glass p-6 rounded-2xl">
              <h2 className="font-heading text-xl font-semibold mb-3">About {dest.name}</h2>
              <p className="text-text-secondary leading-relaxed">{dest.longDescription}</p>
            </div>

            {/* Historical Context */}
            {history && (
              <div className="glass p-6 rounded-2xl">
                <h2 className="font-heading text-xl font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  History & Heritage
                </h2>
                <p className="text-text-secondary leading-relaxed mb-6">{history.culturalHistory}</p>

                {/* Historical Timeline */}
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Key Historical Events</h3>
                <div className="space-y-3">
                  {history.historicalEvents.map((event, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-16 text-right">
                        <span className="font-mono text-sm font-bold text-primary">
                          {event.year < 0 ? `${Math.abs(event.year)} BC` : event.year}
                        </span>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          event.type === "disaster" ? "bg-danger" :
                          event.type === "milestone" ? "bg-primary" :
                          event.type === "development" ? "bg-secondary" : "bg-accent"
                        }`} />
                        {i < history.historicalEvents.length - 1 && (
                          <div className="w-px h-8 bg-card-border" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm text-text-secondary">{event.event}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                          event.type === "disaster" ? "bg-danger/15 text-danger" :
                          event.type === "milestone" ? "bg-primary/15 text-primary" :
                          event.type === "development" ? "bg-secondary/15 text-secondary" : "bg-accent/15 text-accent"
                        }`}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk History */}
            {history && history.riskHistory.length > 0 && (
              <div className="glass p-6 rounded-2xl">
                <h2 className="font-heading text-xl font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Risk History
                </h2>
                <p className="text-sm text-muted mb-5">Past incidents and risk events recorded for this destination.</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-card-border">
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-muted uppercase">Date</th>
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-muted uppercase">Type</th>
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-muted uppercase">Severity</th>
                        <th className="text-left py-2 text-xs font-semibold text-muted uppercase">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.riskHistory.map((event, i) => (
                        <tr key={i} className="border-b border-card-border/50">
                          <td className="py-3 pr-4 font-mono text-xs whitespace-nowrap">
                            {event.month} {event.year}
                          </td>
                          <td className="py-3 pr-4 text-xs">{event.type}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              event.severity === "low" ? "bg-primary/15 text-primary" :
                              event.severity === "moderate" ? "bg-warning/15 text-warning" :
                              event.severity === "high" ? "bg-danger/15 text-danger" : "bg-danger/25 text-danger"
                            }`}>
                              {event.severity.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-muted">{event.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Safety Notes */}
            {history && history.safetyNotes.length > 0 && (
              <div className="glass p-6 rounded-2xl">
                <h2 className="font-heading text-xl font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-info" />
                  Safety Notes
                </h2>
                <ul className="space-y-3">
                  {history.safetyNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attractions */}
            <div className="glass p-6 rounded-2xl">
              <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-warning" />
                Top Attractions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dest.attractions.map((attraction) => (
                  <div key={attraction} className="flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-card-hover transition-colors">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{attraction}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div className="glass p-6 rounded-2xl">
              <h2 className="font-heading text-xl font-semibold mb-4">Recommended Activities</h2>
              <div className="flex flex-wrap gap-2">
                {dest.activities.map((activity) => (
                  <span key={activity} className="px-3 py-1.5 glass rounded-full text-xs font-medium text-text-secondary hover:text-primary transition-colors">
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Score */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Travel Safety Score</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--card-border)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={riskColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(risk.score / 100) * 264} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-2xl font-bold" style={{ color: riskColor }}>{risk.score}</span>
                    <span className="text-[10px] text-muted">/100</span>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-lg" style={{ color: riskColor }}>{risk.label}</div>
                  <p className="text-xs text-muted mt-1">Based on current weather, flood history, and reports</p>
                </div>
              </div>

              {/* Risk Factors */}
              {risk.factors.length > 0 && (
                <div className="mt-5 space-y-2">
                  {risk.factors.map((factor) => (
                    <div key={factor.name} className="flex items-center justify-between text-xs">
                      <span className="text-muted">{factor.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-card rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(100, factor.contribution * 5)}%`, backgroundColor: riskColor }}
                          />
                        </div>
                        <span className="font-mono w-8 text-right" style={{ color: riskColor }}>
                          {Math.round(factor.contribution)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current Weather */}
            {weather && (
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Current Weather</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{weatherInfo?.icon || "🌤"}</span>
                  <div>
                    <div className="font-mono text-3xl font-bold">{weather.temperature}°C</div>
                    <div className="text-xs text-muted">{weatherInfo?.description || "Clear"}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card text-xs">
                    <Droplets className="w-4 h-4 text-info" />
                    <div>
                      <div className="font-mono font-bold">{weather.humidity}%</div>
                      <div className="text-muted">Humidity</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card text-xs">
                    <Wind className="w-4 h-4 text-secondary" />
                    <div>
                      <div className="font-mono font-bold">{weather.windSpeed} km/h</div>
                      <div className="text-muted">Wind</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card text-xs">
                    <Thermometer className="w-4 h-4 text-warning" />
                    <div>
                      <div className="font-mono font-bold">{weather.apparentTemperature}°C</div>
                      <div className="text-muted">Feels Like</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card text-xs">
                    <Droplets className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-mono font-bold">{weather.precipitation} mm</div>
                      <div className="text-muted">Rain</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7-Day Forecast */}
            {forecast && forecast.length > 0 && (
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">7-Day Forecast</h3>
                <div className="space-y-2">
                  {forecast.map((day) => {
                    const dayWeather = WEATHER_CODES[day.weatherCode];
                    const dayName = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
                    return (
                      <div key={day.date} className="flex items-center justify-between py-2 border-b border-card-border/50 last:border-0">
                        <span className="text-xs text-muted w-10">{dayName}</span>
                        <span className="text-base">{dayWeather?.icon || "🌤"}</span>
                        <div className="flex items-center gap-1 font-mono text-xs">
                          <span className="text-text">{Math.round(day.temperatureMax)}°</span>
                          <span className="text-muted-dark">/</span>
                          <span className="text-muted">{Math.round(day.temperatureMin)}°</span>
                        </div>
                        <span className="text-xs text-info">{day.precipitationProbability}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Best Time to Visit */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Best Time to Visit</h3>
              <p className="text-sm font-medium text-primary">{dest.bestTimeToVisit}</p>
            </div>

            {/* Emergency Contacts */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-danger" />
                Emergency Contacts
              </h3>
              <div className="space-y-3">
                {dest.emergencyContacts.map((contact) => (
                  <div key={contact.number} className="text-sm">
                    <div className="text-muted text-xs">{contact.name}</div>
                    <a href={`tel:${contact.number}`} className="font-mono text-primary hover:text-primary-light transition-colors">
                      {contact.number}
                    </a>
                  </div>
                ))}
                <div className="pt-2 border-t border-card-border/50">
                  {EMERGENCY_CONTACTS.slice(0, 3).map((c) => (
                    <div key={c.number} className="flex justify-between text-xs py-1">
                      <span className="text-muted">{c.name}</span>
                      <a href={`tel:${c.number}`} className="font-mono text-danger">{c.number}</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hospitals */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Nearby Hospitals</h3>
              <ul className="space-y-2">
                {dest.hospitals.map((h) => (
                  <li key={h} className="text-sm text-text-secondary flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-danger" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <Link href="/planner" className="block btn-primary text-center py-4 rounded-2xl">
              Plan a Trip to {dest.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
