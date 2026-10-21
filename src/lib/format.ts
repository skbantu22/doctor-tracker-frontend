const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

export function formatDate(value: string) {
  return dateFormat.format(new Date(value));
}

export function initials(name: string) {
  return name.replace(/^dr\.?\s+/i, "").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

/** Stable avatar tint per name, so a person keeps their color across pages. */
export function avatarTone(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % 5;
}
