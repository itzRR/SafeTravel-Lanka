"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Map,
  Shield,
  CloudRain,
  Route,
  Users,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Smart Risk Engine",
    description: "AI-calculated Travel Safety Scores from 0-100 based on rainfall, wind, flood history, and community reports.",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: Map,
    title: "Interactive Risk Map",
    description: "Color-coded Sri Lanka map showing real-time risk levels for all 25 districts with click-to-explore details.",
    gradient: "from-secondary/20 to-secondary/5",
    iconColor: "text-secondary",
  },
  {
    icon: CloudRain,
    title: "Live Weather Intel",
    description: "Real-time weather data from Open-Meteo for every destination - temperature, rainfall, wind, and 7-day forecasts.",
    gradient: "from-info/20 to-info/5",
    iconColor: "text-info",
  },
  {
    icon: Route,
    title: "AI Trip Planner",
    description: "Generate smart itineraries that consider weather risks, distances, and your interests for the safest journey.",
    gradient: "from-accent/20 to-accent/5",
    iconColor: "text-accent",
  },
  {
    icon: Users,
    title: "Community Reports",
    description: "Waze-style real-time reports from travelers - floods, road closures, landslides, and more.",
    gradient: "from-warning/20 to-warning/5",
    iconColor: "text-warning",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track risk trends, active alerts, incident patterns, and destination safety metrics in real-time.",
    gradient: "from-danger/20 to-danger/5",
    iconColor: "text-danger",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative" ref={ref}>
      <div className="container-wide">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 glass rounded-full text-xs font-medium text-primary mb-4">
            Core Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Everything you need for{" "}
            <span className="gradient-text">safer travel</span>
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            Six powerful modules working together to keep you informed and safe
            across Sri Lanka.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group glass glass-hover p-8 flex flex-col gap-4 cursor-default"
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>

                {/* Text */}
                <h3 className="text-xl font-semibold font-heading">
                  {feature.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative line */}
                <div className="mt-auto pt-4">
                  <div className="h-px bg-gradient-to-r from-card-border via-primary/30 to-transparent w-0 group-hover:w-full transition-all duration-500" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
