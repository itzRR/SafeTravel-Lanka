"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { destinations, CATEGORIES } from "@/lib/destinations-data";
import { generateDemoRiskScore } from "@/lib/risk-engine";
import { MapPin, Thermometer, Shield, Search, ArrowRight } from "lucide-react";

export default function DestinationsPage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = destinations.filter((d) => {
    const matchesCategory = category === "all" || d.category === category;
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.district.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-24 pb-20">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 glass rounded-full text-xs font-medium text-primary mb-4">
            Explore Sri Lanka
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Discover <span className="gradient-text">Destinations</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            15 curated destinations with real-time weather, safety scores, and historical insights.
          </p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-10"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-transparent text-text placeholder:text-muted-dark"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  category === cat.value
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "glass text-muted hover:text-text"
                }`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <p className="text-sm text-muted-dark mb-6">{filtered.length} destinations found</p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest, i) => {
            const risk = generateDemoRiskScore(dest.district);
            return (
              <motion.div
                key={dest.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/destinations/${dest.slug}`} className="block group">
                  <div className="glass glass-hover overflow-hidden">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-surface">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-6xl">
                          {dest.category === "beach" ? "🏖️" : dest.category === "hill-country" ? "⛰️" : dest.category === "cultural" ? "🏛️" : dest.category === "wildlife" ? "🐘" : "🏄"}
                        </span>
                      </div>
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                      {/* Risk Badge */}
                      <div
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 backdrop-blur-md"
                        style={{ backgroundColor: `${risk.color}20`, color: risk.color, border: `1px solid ${risk.color}30` }}
                      >
                        <Shield className="w-3 h-3" />
                        {risk.score}
                      </div>

                      {/* Category */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-medium glass uppercase tracking-wider">
                        {dest.category.replace("-", " ")}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-heading text-lg font-semibold group-hover:text-primary transition-colors">
                          {dest.name}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
                        <MapPin className="w-3 h-3" />
                        {dest.district} District, {dest.province} Province
                      </div>

                      <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4">
                        {dest.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {dest.elevation !== undefined && dest.elevation > 0 && (
                            <span className="text-[10px] font-mono text-muted-dark flex items-center gap-1">
                              <Thermometer className="w-3 h-3" />
                              {dest.elevation}m
                            </span>
                          )}
                          <span className="text-[10px] text-muted-dark">
                            {dest.attractions.length} attractions
                          </span>
                        </div>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${risk.color}15`, color: risk.color }}
                        >
                          {risk.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted text-lg">No destinations found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
