import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "CycleStar — Clockwise or Counter-Clockwise?",
  description:
    "Drop a GPX file, set your start time and pace, and see whether to ride your loop clockwise or counter-clockwise based on wind.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

const themeBootScript = `try{var t=localStorage.getItem("cyclestar-theme");document.documentElement.classList.add(t==="light"?"light":"dark")}catch(e){document.documentElement.classList.add("dark")}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
