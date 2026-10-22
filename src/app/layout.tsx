import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { THEME_STORAGE_KEY, themes } from "@/lib/themes";
import "./globals.css";
import "./app.css";
import "./experience.css";
import "./themes.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Doctor Tracker | Clinic admin",
  description: "A secure workspace for managing doctors, patients and clinic analytics.",
};

export const viewport: Viewport = { themeColor: "#1f3b2e" };

// Applies the saved theme before first paint so the page never flashes the default colors.
const themeScript = `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(${JSON.stringify(themes.map((theme) => theme.id))}.indexOf(t)>-1)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="forest" className={`${jakarta.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
