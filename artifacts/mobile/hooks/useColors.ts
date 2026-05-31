import { useTheme } from "@/context/ThemeContext";

import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current color scheme.
 *
 * Uses ThemeContext which supports both system preference and manual override
 * (dark mode toggle in Settings).
 */
export function useColors() {
  const { isDark } = useTheme();
  const palette =
    isDark && "dark" in colors
      ? (colors as unknown as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
