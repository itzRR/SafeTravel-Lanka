"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CloudSun, ShieldCheck, Map, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: CloudSun,
    title: "Check Weather & Risks",
    description: "Get real-time weather forecasts and AI-calculated risk scores for any destination in Sri Lanka.",
    color: "text-secondary",
    bg: "from-secondary/15 to-secondary/5",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "View Safety Insights",
    description: "Explore our interactive risk map, read community reports, and understand the safety landscape.",
    color: "text-primary",
    bg: "from-primary/15 to-primary/5",
  },
  {
    number: "03",
    icon: Map,
    title: "Plan Your Safe Trip",
    description: "Use our AI planner to create weather-aware itineraries that route you through the safest paths.",
    color: "text-accent",
    bg: "from-accent/15 to-accent/5",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative" ref={ref}>
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 glass rounded-full text-xs font-medium text-accent mb-4">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Three steps to a{" "}
            <span className="gradient-text">safer journey</span>
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            SafeTravel Lanka makes travel planning effortless and safe.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-secondary/30 via-primary/30 to-accent/30" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="text-6xl font-heading font-bold text-card-border mb-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.bg} flex items-center justify-center mx-auto mb-5 relative z-10`}
                >
                  <Icon className={`w-8 h-8 ${step.color}`} />
                </div>

                {/* Text */}
                <h3 className="text-xl font-semibold font-heading mb-2">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>

                {/* Arrow (not on last item) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-24 -right-4 z-20">
                    <ArrowRight className="w-5 h-5 text-muted-dark" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
