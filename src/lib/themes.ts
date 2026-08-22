export interface ThemeColors {
  primary: string;
  onPrimary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  borderRadius: string;
  swatch: string[];
}

export const DEFAULT_THEMES: ThemeConfig[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Épuré, typographique, beaucoup d'air.",
    colors: {
      primary: "#111111",
      onPrimary: "#FFFFFF",
      background: "#FFFFFF",
      surface: "#F6F6F5",
      text: "#111111",
      muted: "#6B7280",
      border: "#E5E5E3",
      accent: "#111111",
    },
    fonts: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
    borderRadius: "0.5rem",
    swatch: ["#111111", "#F6F6F5", "#FFFFFF"],
  },
  {
    id: "warm",
    name: "Chaleureux",
    description: "Tons terre et serif élégante, artisanat et restauration.",
    colors: {
      primary: "#9A3412",
      onPrimary: "#FFF7ED",
      background: "#FFFBF5",
      surface: "#FDF0E2",
      text: "#3B1E10",
      muted: "#8A6A55",
      border: "#EEDCC8",
      accent: "#C2410C",
    },
    fonts: { heading: "'Playfair Display', serif", body: "'Lora', serif" },
    borderRadius: "1rem",
    swatch: ["#9A3412", "#FDF0E2", "#FFFBF5"],
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Sérieux et lisible, pour les services aux entreprises.",
    colors: {
      primary: "#1D4ED8",
      onPrimary: "#FFFFFF",
      background: "#FFFFFF",
      surface: "#F1F5F9",
      text: "#0F172A",
      muted: "#64748B",
      border: "#E2E8F0",
      accent: "#0EA5E9",
    },
    fonts: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
    borderRadius: "0.375rem",
    swatch: ["#1D4ED8", "#F1F5F9", "#FFFFFF"],
  },
  {
    id: "bold",
    name: "Audacieux",
    description: "Fond sombre, contraste fort, accents lumineux.",
    colors: {
      primary: "#A78BFA",
      onPrimary: "#12101E",
      background: "#0E0D16",
      surface: "#1A1826",
      text: "#F5F3FF",
      muted: "#A5A0BC",
      border: "#2A2740",
      accent: "#FBBF24",
    },
    fonts: { heading: "'Space Grotesk', sans-serif", body: "'DM Sans', sans-serif" },
    borderRadius: "0.875rem",
    swatch: ["#A78BFA", "#1A1826", "#0E0D16"],
  },
];

export function getThemeConfig(id: string): ThemeConfig {
  return DEFAULT_THEMES.find((t) => t.id === id) ?? DEFAULT_THEMES[0];
}

/** Turns a stored theme row into inline CSS custom properties. */
export function themeStyle(theme: { colors: unknown; fonts: unknown; borderRadius: string | null }) {
  const colors = theme.colors as ThemeColors;
  const fonts = theme.fonts as ThemeFonts;
  return {
    "--c-primary": colors.primary,
    "--c-on-primary": colors.onPrimary ?? "#fff",
    "--c-bg": colors.background,
    "--c-surface": colors.surface,
    "--c-text": colors.text,
    "--c-muted": colors.muted,
    "--c-border": colors.border,
    "--c-accent": colors.accent,
    "--f-heading": fonts.heading,
    "--f-body": fonts.body,
    "--radius": theme.borderRadius ?? "0.5rem",
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: fonts.body,
  } as React.CSSProperties;
}
