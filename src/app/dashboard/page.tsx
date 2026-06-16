"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { destinations } from "@/lib/destinations-data";
import { generateDemoRiskScore } from "@/lib/risk-engine";
import { getRiskLevel } from "@/lib/constants";
import { BarChart3, Shield, AlertTriangle, MapPin, TrendingUp, TrendingDown, Activity, Eye } from "lucide-react";

// Generate demo analytics data
function generateTrendData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      avgRisk: 25 + Math.sin(i * 0.3) * 15 + Math.random() * 10,
      reports: Math.floor(Math.random() * 8 + 2),
      alerts: Math.floor(Math.random() * 3),
    });
  }
  return data;
}

const DEMO_ALERTS = [
  { id: "1", type: "weather", severity: "warning" as const, title: "Heavy Rainfall Warning", description: "Southwest monsoon expected to intensify over Western and Sabaragamuwa provinces", district: "Colombo", timestamp: new Date(Date.now() - 1800000).toISOString(), active: true },
  { id: "2", type: "flood", severity: "danger" as const, title: "Flood Alert - Kelani River", description: "Water level rising at Nagalagam Street gauge. Minor flood level reached.", district: "Colombo", timestamp: new Date(Date.now() - 5400000).toISOString(), active: true },
  { id: "3", type: "landslide", severity: "critical" as const, title: "Landslide Warning", description: "High landslide risk in Ratnapura and Kegalle districts due to saturated soil", district: "Ratnapura", timestamp: new Date(Date.now() - 7200000).toISOString(), active: true },
  { id: "4", type: "weather", severity: "info" as const, title: "Wind Advisory", description: "Strong winds expected along southern coast. Fishing boats advised to stay in harbor.", district: "Galle", timestamp: new Date(Date.now() - 14400000).toISOString(), active: false },
];

export default function DashboardPage() {
  const trendData = useMemo(() => generateTrendData(), []);

  const districtRisks = useMemo(() => {
    return destinations.map((d) => {
      const risk = generateDemoRiskScore(d.district);
      return { name: d.name, district: d.district, ...risk };
    }).sort((a, b) => b.score - a.score);
  }, []);

  const safeCount = districtRisks.filter((d) => d.score <= 40).length;
  const alertCount = DEMO_ALERTS.filter((a) => a.active).length;
  const avgRisk = Math.round(districtRisks.reduce((s, d) => s + d.score, 0) / districtRisks.length);
  const maxRisk = Math.max(...trendData.map((d) => d.avgRisk));
  const totalReports = trendData.reduce((s, d) => s + d.reports, 0);

  return (
    <div className="pt-24 pb-20">
      <div className="container-wide">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Safety <span className="gradient-text">Dashboard</span></h1>
          <p className="text-muted">Real-time risk monitoring, alerts, and analytics across Sri Lanka</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Alerts", value: alertCount, icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10", trend: "+2 today", trendUp: true },
            { label: "Safe Destinations", value: safeCount, icon: Shield, color: "text-primary", bg: "bg-primary/10", trend: `of ${districtRisks.length}`, trendUp: false },
            { label: "Avg Risk Score", value: avgRisk, icon: Activity, color: "text-warning", bg: "bg-warning/10", trend: "across all", trendUp: false },
            { label: "Reports (30d)", value: totalReports, icon: Eye, color: "text-secondary", bg: "bg-secondary/10", trend: "community", trendUp: true },
          ].map((metric, i) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-5 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${metric.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  {metric.trendUp ? (
                    <TrendingUp className="w-4 h-4 text-danger" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="font-mono text-3xl font-bold mb-1">{metric.value}</div>
                <div className="text-xs text-muted">{metric.label}</div>
                <div className="text-[10px] text-muted-dark mt-1">{metric.trend}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Trend Chart */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary" />
                Risk Trend (30 Days)
              </h2>
              <span className="text-xs text-muted font-mono">AVG: {avgRisk}</span>
            </div>

            {/* Simple bar chart */}
            <div className="flex items-end gap-[3px] h-48">
              {trendData.map((d, i) => {
                const height = (d.avgRisk / maxRisk) * 100;
                const level = getRiskLevel(d.avgRisk);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 glass px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap z-10 transition-opacity">
                      {d.date}: {Math.round(d.avgRisk)}
                    </div>
                    <div
                      className="w-full rounded-t transition-all duration-200 group-hover:opacity-80 min-h-[4px]"
                      style={{ height: `${height}%`, backgroundColor: level.color, opacity: 0.7 }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-[9px] text-muted-dark">
              <span>{trendData[0]?.date}</span>
              <span>{trendData[14]?.date}</span>
              <span>{trendData[29]?.date}</span>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              Active Alerts
            </h2>
            <div className="space-y-3">
              {DEMO_ALERTS.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-xl border ${
                  alert.severity === "critical" ? "bg-danger/10 border-danger/20" :
                  alert.severity === "danger" ? "bg-danger/5 border-danger/15" :
                  alert.severity === "warning" ? "bg-warning/5 border-warning/15" : "bg-info/5 border-info/15"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      alert.active ? "animate-pulse" : ""
                    } ${
                      alert.severity === "critical" ? "bg-danger" :
                      alert.severity === "danger" ? "bg-danger" :
                      alert.severity === "warning" ? "bg-warning" : "bg-info"
                    }`} />
                    <span className="text-xs font-semibold">{alert.title}</span>
                  </div>
                  <p className="text-[10px] text-muted leading-relaxed mb-1">{alert.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-dark">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {alert.district}
                    </span>
                    <span>{new Date(alert.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* District Risk Table */}
        <div className="glass p-6 rounded-2xl mt-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Destination Risk Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 pr-4 text-xs font-semibold text-muted uppercase">Destination</th>
                  <th className="text-left py-3 pr-4 text-xs font-semibold text-muted uppercase">District</th>
                  <th className="text-center py-3 pr-4 text-xs font-semibold text-muted uppercase">Score</th>
                  <th className="text-left py-3 pr-4 text-xs font-semibold text-muted uppercase">Level</th>
                  <th className="text-left py-3 text-xs font-semibold text-muted uppercase">Risk Bar</th>
                </tr>
              </thead>
              <tbody>
                {districtRisks.map((d) => (
                  <tr key={d.name} className="border-b border-card-border/30 hover:bg-card/50 transition-colors">
                    <td className="py-3 pr-4 font-medium">{d.name}</td>
                    <td className="py-3 pr-4 text-muted text-xs">{d.district}</td>
                    <td className="py-3 pr-4 text-center">
                      <span className="font-mono font-bold" style={{ color: d.color }}>{d.score}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${d.color}15`, color: d.color }}>
                        {d.label}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="w-full max-w-[120px] h-2 bg-card rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${d.score}%`, backgroundColor: d.color }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
