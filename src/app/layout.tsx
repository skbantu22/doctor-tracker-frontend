import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./app.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Doctor Tracker | Clinic admin",
  description: "A secure workspace for managing doctors, patients and clinic analytics.",
};

export const viewport: Viewport = { themeColor: "#548c72" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
