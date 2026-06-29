import { createContext, useContext } from "react";

export const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

export const ACCENT_OPTIONS = [
  { key: "green",  label: "Green",  color: "#16A97C" },
  { key: "blue",   label: "Blue",   color: "#3B82F6" },
  { key: "purple", label: "Purple", color: "#8B5CF6" },
  { key: "orange", label: "Orange", color: "#F97316" },
];

const ACCENTS = {
  green:  { primary: "#16A97C", dark: "#0D7A59", light: "#E8F8F2", darkLight: "#0A2318" },
  blue:   { primary: "#3B82F6", dark: "#1D4ED8", light: "#EFF6FF", darkLight: "#091628" },
  purple: { primary: "#8B5CF6", dark: "#6D28D9", light: "#EDE9FE", darkLight: "#15082C" },
  orange: { primary: "#F97316", dark: "#C2410C", light: "#FFF4ED", darkLight: "#2B1000" },
};

export function buildTheme(mode, accentKey) {
  const a    = ACCENTS[accentKey] || ACCENTS.green;
  const dark = mode === "dark";

  return {
    bg:          dark ? "#0F0F10" : "#F5F5F0",
    surface:     dark ? "#1C1C1E" : "#FFFFFF",
    surface2:    dark ? "#2C2C2E" : "#F5F5F0",
    green:       a.primary,
    greenDark:   a.dark,
    greenLight:  dark ? a.darkLight : a.light,
    orange:      "#F97316",
    orangeLight: dark ? "#2B1000" : "#FFF4ED",
    text1:       dark ? "#F2F2F7" : "#111111",
    text2:       dark ? "#8E8E93" : "#6B7280",
    text3:       dark ? "#48484A" : "#9CA3AF",
    border:      dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)",
    inputBorder: dark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.18)",
    red:         "#EF4444",
    redLight:    dark ? "#2D0A0A" : "#FEF2F2",
    isDark:      dark,
    mode,
    accentKey,
  };
}

const DEFAULT_THEME = buildTheme("light", "green");
export const ThemeContext = createContext(DEFAULT_THEME);

export function useTheme() {
  return useContext(ThemeContext);
}
