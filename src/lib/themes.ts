export const THEME_STORAGE_KEY = "doctor-tracker-theme";

/** Swatch colors mirror the --brand-* tokens in app/themes.css. */
export const themes = [
  { id: "forest", label: "Forest", swatch: ["#1d3529", "#3f8a66", "#8cc5a5"] },
  { id: "ocean", label: "Ocean", swatch: ["#0f2340", "#2f6fd6", "#8db8f5"] },
  { id: "royal", label: "Royal", swatch: ["#1e1846", "#6d5ae6", "#b7acf6"] },
  { id: "sunset", label: "Sunset", swatch: ["#3a1022", "#d4456b", "#f4a6b8"] },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
