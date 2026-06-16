"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative" ref={ref}>
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl glass p-12 md:p-20 text-center"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs font-medium text-primary mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Start Your Safe Journey
            </motion.div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 max-w-3xl mx-auto leading-tight">
              Ready to explore Sri Lanka{" "}
              <span className="gradient-text">with confidence?</span>
            </h2>

            <p className="text-muted text-lg max-w-xl mx-auto mb-10">
              Join thousands of travelers who use SafeTravel Lanka to plan safer, smarter trips across the island.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link href="/planner" className="btn-primary text-base px-10 py-4 group">
                <Sparkles className="w-5 h-5" />
                Plan Your Trip Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/map" className="btn-secondary text-base px-10 py-4">
                Explore Risk Map
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
