import { TeamMember } from "./types";

export const SITE_NAME = "SafeTravel Lanka";
export const SITE_TAGLINE = "Explore Sri Lanka with confidence through real-time weather intelligence, disaster risk awareness, and smart travel recommendations.";

export const SRI_LANKA_CENTER = { lat: 7.8731, lng: 80.7718 };
export const SRI_LANKA_BOUNDS: [[number, number], [number, number]] = [
  [79.4, 5.7],
  [82.1, 10.0],
];
export const DEFAULT_MAP_ZOOM = 7.5;

export const RISK_LEVELS = {
  safe: { min: 0, max: 20, label: "Safe", color: "#00d084", bgColor: "rgba(0, 208, 132, 0.15)" },
  low: { min: 21, max: 40, label: "Low Risk", color: "#38bdf8", bgColor: "rgba(56, 189, 248, 0.15)" },
  moderate: { min: 41, max: 60, label: "Moderate", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.15)" },
  high: { min: 61, max: 80, label: "High Risk", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.15)" },
  critical: { min: 81, max: 100, label: "Critical", color: "#dc2626", bgColor: "rgba(220, 38, 38, 0.15)" },
} as const;

export const RISK_COLORS_ARRAY = ["#00d084", "#38bdf8", "#f59e0b", "#ef4444", "#dc2626"];

export function getRiskLevel(score: number) {
  if (score <= 20) return RISK_LEVELS.safe;
  if (score <= 40) return RISK_LEVELS.low;
  if (score <= 60) return RISK_LEVELS.moderate;
  if (score <= 80) return RISK_LEVELS.high;
  return RISK_LEVELS.critical;
}

export const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mainly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Foggy", icon: "🌫️" },
  48: { description: "Rime fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Moderate drizzle", icon: "🌦️" },
  55: { description: "Dense drizzle", icon: "🌧️" },
  61: { description: "Slight rain", icon: "🌧️" },
  63: { description: "Moderate rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  71: { description: "Slight snowfall", icon: "❄️" },
  73: { description: "Moderate snowfall", icon: "❄️" },
  75: { description: "Heavy snowfall", icon: "❄️" },
  80: { description: "Rain showers", icon: "🌦️" },
  81: { description: "Moderate showers", icon: "🌧️" },
  82: { description: "Violent showers", icon: "⛈️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm with hail", icon: "⛈️" },
  99: { description: "Heavy thunderstorm", icon: "⛈️" },
};

export const EMERGENCY_CONTACTS = [
  { name: "Police Emergency", number: "119", type: "police" as const },
  { name: "Ambulance / Fire", number: "110", type: "ambulance" as const },
  { name: "Disaster Management Center", number: "117", type: "disaster" as const },
  { name: "Tourist Police", number: "+94 11 242 1052", type: "police" as const },
  { name: "National Hospital Colombo", number: "+94 11 269 1111", type: "hospital" as const },
];

export const REPORT_TYPES = [
  { value: "flood", label: "Flood", icon: "🌊", color: "#38bdf8" },
  { value: "road-closure", label: "Road Closure", icon: "🚧", color: "#f59e0b" },
  { value: "heavy-rain", label: "Heavy Rain", icon: "🌧️", color: "#6366f1" },
  { value: "accident", label: "Accident", icon: "⚠️", color: "#ef4444" },
  { value: "landslide", label: "Landslide", icon: "⛰️", color: "#a855f7" },
  { value: "other", label: "Other", icon: "📝", color: "#94a3b8" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Risk Map" },
  { href: "/destinations", label: "Destinations" },
  { href: "/reports", label: "Reports" },
  { href: "/planner", label: "Trip Planner" },
  { href: "/dashboard", label: "Dashboard" },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Rehan",
    role: "Lead Developer & AI Engineer",
    image: "/pics about/rehan.webp",
    video: "/pics about/Rehan.mp4",
    bio: "Full-stack developer passionate about building intelligent systems for public safety.",
  },
  {
    name: "Thimira",
    role: "Backend & Data Engineer",
    image: "/pics about/thimira.webp",
    video: "/pics about/Thimira.mp4",
    bio: "Specializes in data pipelines and real-time weather intelligence systems.",
  },
  {
    name: "Frank",
    role: "Frontend & UX Designer",
    image: "/pics about/frank.webp",
    video: "/pics about/Frank.mp4",
    bio: "Crafts intuitive, award-winning interfaces with a focus on accessibility.",
  },
  {
    name: "Oshadi",
    role: "Research & Analytics",
    image: "/pics about/oshadi.webp",
    video: "/pics about/Oshadi.mp4",
    bio: "Drives data-driven insights for disaster risk modeling and tourism analytics.",
  },
  {
    name: "Madara",
    role: "QA & DevOps Engineer",
    image: "/pics about/madara.webp",
    video: "/pics about/Madara.mp4",
    bio: "Ensures platform reliability, testing, and seamless deployment workflows.",
  },
];

export const SUPABASE_URL = "https://wxvbhjabzystincqmhyn.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dmJoamFienlzdGluY3FtaHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Nzk3MDIsImV4cCI6MjA5NzE1NTcwMn0.8gq8LrZMz4Lu8moJGy0HZyltytChdnDHD4k3Q2KyEeg";
