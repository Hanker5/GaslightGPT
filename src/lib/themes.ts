/**
 * Theme configuration for GaslightGPT
 * Each theme defines HSL color values for all CSS custom properties
 */

export type ThemeName =
  | 'default-dark'
  | 'default-light'
  | 'midnight-galaxy'
  | 'ocean-breeze'
  | 'sunset-glow'

export interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
  radius: string
}

export interface Theme {
  name: ThemeName
  displayName: string
  description: string
  colors: ThemeColors
}

export const themes: Record<ThemeName, Theme> = {
  'default-dark': {
    name: 'default-dark',
    displayName: 'Default Dark',
    description: 'Classic dark theme with purple accents',
    colors: {
      background: '0 0% 10%',
      foreground: '0 0% 88%',
      card: '0 0% 14%',
      cardForeground: '0 0% 88%',
      popover: '0 0% 14%',
      popoverForeground: '0 0% 88%',
      primary: '270 91% 65%',
      primaryForeground: '0 0% 100%',
      secondary: '0 0% 18%',
      secondaryForeground: '0 0% 88%',
      muted: '0 0% 18%',
      mutedForeground: '0 0% 60%',
      accent: '270 91% 65%',
      accentForeground: '0 0% 100%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '0 0% 24%',
      input: '0 0% 24%',
      ring: '270 91% 65%',
      radius: '0.5rem',
    },
  },
  'default-light': {
    name: 'default-light',
    displayName: 'Default Light',
    description: 'Clean light theme with purple accents',
    colors: {
      background: '0 0% 98%',
      foreground: '0 0% 10%',
      card: '0 0% 100%',
      cardForeground: '0 0% 10%',
      popover: '0 0% 100%',
      popoverForeground: '0 0% 10%',
      primary: '270 91% 55%',
      primaryForeground: '0 0% 100%',
      secondary: '0 0% 94%',
      secondaryForeground: '0 0% 10%',
      muted: '0 0% 94%',
      mutedForeground: '0 0% 40%',
      accent: '270 91% 55%',
      accentForeground: '0 0% 100%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '0 0% 88%',
      input: '0 0% 88%',
      ring: '270 91% 55%',
      radius: '0.5rem',
    },
  },
  'midnight-galaxy': {
    name: 'midnight-galaxy',
    displayName: 'Midnight Galaxy',
    description: 'Deep cosmic theme with purple and blue hues',
    colors: {
      background: '260 30% 12%',
      foreground: '240 20% 95%',
      card: '260 25% 16%',
      cardForeground: '240 20% 95%',
      popover: '260 25% 16%',
      popoverForeground: '240 20% 95%',
      primary: '270 40% 55%',
      primaryForeground: '0 0% 100%',
      secondary: '235 30% 35%',
      secondaryForeground: '240 20% 95%',
      muted: '260 20% 22%',
      mutedForeground: '240 10% 65%',
      accent: '270 40% 65%',
      accentForeground: '0 0% 100%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '260 20% 25%',
      input: '260 20% 25%',
      ring: '270 40% 65%',
      radius: '0.5rem',
    },
  },
  'ocean-breeze': {
    name: 'ocean-breeze',
    displayName: 'Ocean Breeze',
    description: 'Calm blues and teals for a refreshing look',
    colors: {
      background: '200 25% 12%',
      foreground: '200 15% 92%',
      card: '200 20% 16%',
      cardForeground: '200 15% 92%',
      popover: '200 20% 16%',
      popoverForeground: '200 15% 92%',
      primary: '185 70% 50%',
      primaryForeground: '0 0% 100%',
      secondary: '200 20% 22%',
      secondaryForeground: '200 15% 92%',
      muted: '200 15% 20%',
      mutedForeground: '200 10% 60%',
      accent: '175 65% 55%',
      accentForeground: '0 0% 100%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '200 15% 25%',
      input: '200 15% 25%',
      ring: '185 70% 50%',
      radius: '0.5rem',
    },
  },
  'sunset-glow': {
    name: 'sunset-glow',
    displayName: 'Sunset Glow',
    description: 'Warm oranges and pinks for a vibrant atmosphere',
    colors: {
      background: '20 20% 12%',
      foreground: '30 15% 92%',
      card: '20 18% 16%',
      cardForeground: '30 15% 92%',
      popover: '20 18% 16%',
      popoverForeground: '30 15% 92%',
      primary: '15 85% 60%',
      primaryForeground: '0 0% 100%',
      secondary: '25 25% 22%',
      secondaryForeground: '30 15% 92%',
      muted: '20 15% 20%',
      mutedForeground: '30 10% 60%',
      accent: '340 75% 65%',
      accentForeground: '0 0% 100%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '20 15% 25%',
      input: '20 15% 25%',
      ring: '15 85% 60%',
      radius: '0.5rem',
    },
  },
}

export const defaultTheme: ThemeName = 'default-dark'

/**
 * Apply a theme by setting CSS custom properties on the document element
 */
export function applyTheme(themeName: ThemeName): void {
  const theme = themes[themeName]
  if (!theme) {
    console.error(`Theme "${themeName}" not found`)
    return
  }

  const root = document.documentElement
  const { colors } = theme

  // Set data attribute for theme identification
  root.setAttribute('data-theme', themeName)

  // Apply all color values as CSS custom properties
  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    root.style.setProperty(cssVar, value)
  })
}

/**
 * Get the current theme name from the document element
 */
export function getCurrentTheme(): ThemeName {
  const themeName = document.documentElement.getAttribute('data-theme')
  return (themeName as ThemeName) || defaultTheme
}
