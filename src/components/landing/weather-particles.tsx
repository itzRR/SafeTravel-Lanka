"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  icon: string;
  opacity: number;
}

export function WeatherParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const icons = ["💧", "🌤", "🌧", "⛅", "🌊", "💨", "🌦", "☀️", "🌿", "✨"];
    const generated: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 12 + Math.random() * 16,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
      icon: icons[Math.floor(Math.random() * icons.length)],
      opacity: 0.1 + Math.random() * 0.2,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 0 }}
          animate={{
            x: [`${p.x}vw`, `${(p.x + 20) % 100}vw`, `${p.x}vw`],
            y: [`${p.y}vh`, `${(p.y - 30 + 100) % 100}vh`, `${p.y}vh`],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute"
          style={{ fontSize: p.size }}
        >
          {p.icon}
        </motion.div>
      ))}
    </div>
  );
}
