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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
