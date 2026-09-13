import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CycleStar — Clockwise or Counter-Clockwise?",
  description:
    "Drop a GPX file, set your start time and pace, and see whether to ride your loop clockwise or counter-clockwise based on wind.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
