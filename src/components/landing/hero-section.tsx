"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Shield, ArrowRight } from "lucide-react";
import { AnimatedGlobe } from "./animated-globe";
import { WeatherParticles } from "./weather-particles";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <WeatherParticles />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10 pointer-events-none" />

      <div className="container-wide relative z-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-12">
        {/* Left - Text */}
        <div className="flex-1 text-center lg:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs font-medium text-muted mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            AI-Powered Travel Safety Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tight mb-6"
          >
            Travel
            <br />
            <span className="gradient-text">Smarter.</span>
            <br />
            Stay{" "}
            <span className="gradient-text">Safer.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg sm:text-xl text-muted max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
          >
            Real-time weather intelligence, disaster awareness, and tourism
            guidance for Sri Lanka. Make every journey safer with data-driven
            insights.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
          >
            <Link href="/destinations" className="btn-primary text-base px-8 py-3.5 group">
              <MapPin className="w-5 h-5" />
              Explore Destinations
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/map" className="btn-secondary text-base px-8 py-3.5 group">
              <Shield className="w-5 h-5" />
              View Live Risk Map
            </Link>
          </motion.div>

          {/* Mini stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex items-center gap-8 mt-12 justify-center lg:justify-start"
          >
            {[
              { value: "25", label: "Districts Monitored" },
              { value: "15+", label: "Destinations" },
              { value: "24/7", label: "Live Monitoring" },
            ].map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <div className="font-mono text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-dark mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right - Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex-1 flex justify-center items-center"
        >
          <AnimatedGlobe />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-muted-dark">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border-2 border-muted-dark rounded-full flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 bg-muted-dark rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
