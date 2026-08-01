import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OncoRT Academy — Comprendre, raisonner, maîtriser",
    template: "%s · OncoRT Academy",
  },
  description:
    "Plateforme modulaire de formation active en oncologie-radiothérapie, des fondations à la RCP experte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
