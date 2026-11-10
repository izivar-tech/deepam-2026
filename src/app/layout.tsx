import type { Metadata } from "next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karthigai Deepam 2026 — Help Center",
  description:
    "Smart Pilgrim Help Center for Karthigai Deepam 2026, Tiruvannamalai. Find police, medical, toilets, water, hotels and help desks near you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
