"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TEAM_MEMBERS } from "@/lib/constants";

export function TeamSection() {
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
          <span className="inline-block px-4 py-1.5 glass rounded-full text-xs font-medium text-secondary mb-4">
            Our Team
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Meet the <span className="gradient-text">minds</span> behind it
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            A passionate team of developers and researchers building the future of travel safety.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <TeamCard member={member} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member }: { member: typeof TEAM_MEMBERS[number] }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className="group glass glass-hover p-1 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image/Video Container */}
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4">
        {/* Static image */}
        <img
          src={member.image}
          alt={member.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Video (plays on hover) */}
        <video
          ref={videoRef}
          src={member.video}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

        {/* Play indicator */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="w-0 h-0 border-l-[8px] border-l-background border-y-[5px] border-y-transparent ml-0.5" />
        </motion.div>

        {/* Name overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-heading font-bold text-lg leading-tight">{member.name}</h3>
          <p className="text-xs text-primary font-medium">{member.role}</p>
        </div>
      </div>

      {/* Bio */}
      <div className="px-3 pb-3">
        <p className="text-xs text-muted leading-relaxed">{member.bio}</p>
      </div>
    </div>
  );
}
