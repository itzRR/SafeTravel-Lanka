"use client";

import { motion } from "framer-motion";

const destinations = [
  { name: "Colombo", angle: 220, distance: 130, delay: 0 },
  { name: "Kandy", angle: 180, distance: 105, delay: 0.5 },
  { name: "Ella", angle: 195, distance: 120, delay: 1 },
  { name: "Galle", angle: 240, distance: 140, delay: 1.5 },
  { name: "Sigiriya", angle: 160, distance: 100, delay: 2 },
  { name: "Trinco", angle: 135, distance: 115, delay: 2.5 },
];

export function AnimatedGlobe() {
  return (
    <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px]">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-3xl" />

      {/* Orbital rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px solid rgba(0, 208, 132, ${0.08 + i * 0.04})`,
            transform: `rotateX(${60 + i * 10}deg) rotateZ(${i * 30}deg)`,
          }}
        />
      ))}

      {/* Main globe circle */}
      <div className="absolute inset-8 sm:inset-12 lg:inset-16 rounded-full overflow-hidden">
        {/* Globe background gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-surface via-background to-surface border border-card-border" />
        
        {/* Globe grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 200">
          {/* Longitude lines */}
          {[40, 70, 100, 130, 160].map((x) => (
            <ellipse
              key={`lon-${x}`}
              cx="100"
              cy="100"
              rx={Math.abs(x - 100) * 0.8}
              ry="90"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="0.5"
            />
          ))}
          {/* Latitude lines */}
          {[40, 65, 100, 135, 160].map((y) => (
            <ellipse
              key={`lat-${y}`}
              cx="100"
              cy={y}
              rx="90"
              ry={15}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="0.5"
            />
          ))}
        </svg>

        {/* Sri Lanka shape (simplified) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="60" height="90" viewBox="0 0 60 90" className="drop-shadow-lg">
            <defs>
              <linearGradient id="sriLankaGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--secondary)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M30 5 C35 5, 45 12, 48 20 C52 30, 55 40, 52 50 C48 60, 42 70, 38 78 C35 83, 32 88, 30 88 C28 88, 25 83, 22 78 C18 70, 12 60, 8 50 C5 40, 8 30, 12 20 C15 12, 25 5, 30 5Z"
              fill="url(#sriLankaGrad)"
              filter="url(#glow)"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* Pulsing center dot */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
        />
      </div>

      {/* Destination markers */}
      {destinations.map((dest) => {
        const radian = (dest.angle * Math.PI) / 180;
        const x = 50 + Math.cos(radian) * (dest.distance / 5) * 1.8;
        const y = 50 + Math.sin(radian) * (dest.distance / 5) * 1.8;
        return (
          <motion.div
            key={dest.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + dest.delay * 0.3, duration: 0.5 }}
            className="absolute flex items-center gap-1.5"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: dest.delay }}
              className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/40"
            />
            <span className="text-[10px] font-medium text-muted whitespace-nowrap hidden sm:inline">
              {dest.name}
            </span>
          </motion.div>
        );
      })}

      {/* Animated connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="url(#orbitGradient)"
          strokeWidth="0.5"
          strokeDasharray="5 10"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50% 50%" }}
        />
        <defs>
          <linearGradient id="orbitGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="var(--secondary)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
