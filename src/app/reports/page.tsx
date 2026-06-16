"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REPORT_TYPES } from "@/lib/constants";
import { CommunityReport } from "@/lib/types";
import { MapPin, ThumbsUp, Clock, Plus, X, Send, Filter, AlertTriangle, CheckCircle } from "lucide-react";

// Demo reports
const DEMO_REPORTS: CommunityReport[] = [
  { id: "1", type: "flood", location: "Colombo - Wellawatte", district: "Colombo", lat: 6.874, lng: 79.861, description: "Road completely submerged near Wellawatte junction. Water level approx 2ft. Vehicles cannot pass.", severity: 4, timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), upvotes: 24, verified: true, reporterName: "Kasun P." },
  { id: "2", type: "road-closure", location: "Kandy - Peradeniya Road", district: "Kandy", lat: 7.268, lng: 80.596, description: "Road closure due to tree fall near Peradeniya bridge. Traffic diverted via alternate route.", severity: 3, timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), upvotes: 18, verified: true, reporterName: "Nimal S." },
  { id: "3", type: "heavy-rain", location: "Ella - Town Center", district: "Badulla", lat: 6.867, lng: 81.047, description: "Very heavy rainfall since morning. Hiking trails extremely slippery. Nine Arch Bridge area foggy with zero visibility.", severity: 3, timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), upvotes: 31, verified: false, reporterName: "Sarah M." },
  { id: "4", type: "landslide", location: "Ratnapura - Eheliyagoda", district: "Ratnapura", lat: 6.844, lng: 80.267, description: "Minor landslide blocking single lane on Ratnapura-Eheliyagoda road. Cleanup crew on site.", severity: 4, timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), upvotes: 42, verified: true, reporterName: "Amal K." },
  { id: "5", type: "flood", location: "Galle - Baddegama", district: "Galle", lat: 6.225, lng: 80.182, description: "Gin River water level rising. Low-lying houses near Baddegama evacuated. Bridge still accessible.", severity: 5, timestamp: new Date(Date.now() - 18 * 3600000).toISOString(), upvotes: 67, verified: true, reporterName: "Chaminda R." },
  { id: "6", type: "accident", location: "Colombo - Marine Drive", district: "Colombo", lat: 6.91, lng: 79.85, description: "Multi-vehicle accident near Marine Drive roundabout. Emergency services on scene. Expect delays.", severity: 3, timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), upvotes: 15, verified: false, reporterName: "Dinesh W." },
  { id: "7", type: "heavy-rain", location: "Nuwara Eliya - Gregory Lake", district: "Nuwara Eliya", lat: 6.955, lng: 80.762, description: "Continuous heavy rainfall. Gregory Lake area waterlogged. Some hotels reporting power outages.", severity: 3, timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), upvotes: 22, verified: true, reporterName: "Lakshan F." },
  { id: "8", type: "road-closure", location: "Badulla - Ella Road", district: "Badulla", lat: 6.903, lng: 81.008, description: "Road partially blocked by fallen rocks near Ravana Falls. One lane open with traffic control.", severity: 2, timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), upvotes: 8, verified: false, reporterName: "Tourist" },
];

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<CommunityReport[]>(DEMO_REPORTS);
  const [filterType, setFilterType] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [newReport, setNewReport] = useState({ type: "flood", location: "", district: "", description: "", severity: 3 as 1|2|3|4|5 });

  const filtered = useMemo(() => {
    if (filterType === "all") return reports;
    return reports.filter((r) => r.type === filterType);
  }, [reports, filterType]);

  const handleUpvote = (id: string) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const report: CommunityReport = {
      id: Date.now().toString(),
      type: newReport.type as CommunityReport["type"],
      location: newReport.location,
      district: newReport.district || "Unknown",
      lat: 7.0 + Math.random(),
      lng: 80.0 + Math.random(),
      description: newReport.description,
      severity: newReport.severity,
      timestamp: new Date().toISOString(),
      upvotes: 0,
      verified: false,
      reporterName: "You",
    };
    setReports((prev) => [report, ...prev]);
    setShowForm(false);
    setNewReport({ type: "flood", location: "", district: "", description: "", severity: 3 });
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container-wide">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Community <span className="gradient-text">Reports</span></h1>
            <p className="text-muted">Real-time safety reports from travelers across Sri Lanka</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Submit Report
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Reports", value: reports.length, color: "text-primary" },
            { label: "Verified", value: reports.filter((r) => r.verified).length, color: "text-success" },
            { label: "Critical", value: reports.filter((r) => r.severity >= 4).length, color: "text-danger" },
            { label: "Last 24h", value: reports.filter((r) => Date.now() - new Date(r.timestamp).getTime() < 86400000).length, color: "text-warning" },
          ].map((s) => (
            <div key={s.label} className="glass p-4 rounded-xl text-center">
              <div className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${filterType === "all" ? "bg-primary/20 text-primary border border-primary/30" : "glass text-muted"}`}
          >
            <Filter className="w-3 h-3" /> All
          </button>
          {REPORT_TYPES.map((rt) => (
            <button
              key={rt.value}
              onClick={() => setFilterType(rt.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${filterType === rt.value ? "bg-primary/20 text-primary border border-primary/30" : "glass text-muted"}`}
            >
              <span>{rt.icon}</span> {rt.label}
            </button>
          ))}
        </div>

        {/* Report Feed */}
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((report) => {
              const rt = REPORT_TYPES.find((t) => t.value === report.type);
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass p-5 rounded-2xl"
                >
                  <div className="flex items-start gap-4">
                    {/* Type Icon */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: `${rt?.color || "#666"}20` }}>
                      {rt?.icon || "📝"}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${rt?.color || "#666"}20`, color: rt?.color }}>
                          {rt?.label || report.type}
                        </span>
                        {report.verified && (
                          <span className="text-xs text-primary flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        )}
                        {report.severity >= 4 && (
                          <span className="text-xs text-danger flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Severe
                          </span>
                        )}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary mb-2">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {report.location}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted leading-relaxed mb-3">{report.description}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-dark">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {timeAgo(report.timestamp)}
                          </span>
                          <span>by {report.reporterName}</span>
                        </div>
                        <button onClick={() => handleUpvote(report.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs text-muted hover:text-primary transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5" /> {report.upvotes}
                        </button>
                      </div>

                      {/* Severity Bar */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[10px] text-muted">Severity</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} className={`w-6 h-1.5 rounded-full ${s <= report.severity ? (report.severity >= 4 ? "bg-danger" : report.severity >= 3 ? "bg-warning" : "bg-primary") : "bg-card-border"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Submit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-strong w-full max-w-lg rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-xl font-semibold">Submit a Report</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-card"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-muted font-medium mb-1 block">Report Type</label>
                    <select value={newReport.type} onChange={(e) => setNewReport((p) => ({ ...p, type: e.target.value }))} className="w-full p-3 glass rounded-xl text-sm bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {REPORT_TYPES.map((rt) => (
                        <option key={rt.value} value={rt.value} className="bg-surface">{rt.icon} {rt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted font-medium mb-1 block">Location</label>
                    <input type="text" required placeholder="e.g., Colombo - Bambalapitiya" value={newReport.location} onChange={(e) => setNewReport((p) => ({ ...p, location: e.target.value }))} className="w-full p-3 glass rounded-xl text-sm bg-transparent text-text placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-xs text-muted font-medium mb-1 block">Description</label>
                    <textarea required rows={3} placeholder="Describe the situation..." value={newReport.description} onChange={(e) => setNewReport((p) => ({ ...p, description: e.target.value }))} className="w-full p-3 glass rounded-xl text-sm bg-transparent text-text placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-muted font-medium mb-2 block">Severity (1-5)</label>
                    <div className="flex gap-2">
                      {([1, 2, 3, 4, 5] as const).map((s) => (
                        <button key={s} type="button" onClick={() => setNewReport((p) => ({ ...p, severity: s }))} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${newReport.severity === s ? (s >= 4 ? "bg-danger text-white" : s >= 3 ? "bg-warning text-background" : "bg-primary text-background") : "glass text-muted"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full btn-primary justify-center py-3">
                    <Send className="w-4 h-4" /> Submit Report
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
