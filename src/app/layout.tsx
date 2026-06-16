import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SafeTravel Lanka - AI-Powered Tourism Safety Platform",
  description:
    "Explore Sri Lanka with confidence through real-time weather intelligence, disaster risk awareness, and smart travel recommendations. Plan safer trips with live risk maps and community reports.",
  keywords: [
    "Sri Lanka travel",
    "travel safety",
    "weather forecast",
    "disaster alerts",
    "tourism",
    "risk map",
    "travel planner",
  ],
  authors: [{ name: "SafeTravel Lanka Team" }],
  openGraph: {
    title: "SafeTravel Lanka - Travel Smarter, Stay Safer",
    description:
      "Real-time weather intelligence, disaster awareness, and tourism guidance for Sri Lanka.",
    type: "website",
    locale: "en_US",
    siteName: "SafeTravel Lanka",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <div className="mesh-gradient" />
        <div className="noise-overlay" />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
