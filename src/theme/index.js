// iSportOne design tokens
// Source of truth: SPORTFOLIO_SKILL.md (Section 5 — Design System)

export const colors = {
  // Dark theme base (default)
  bgPrimary: '#0a0d14',
  bgSecondary: '#11141f',
  bgTertiary: '#1a1d2e',
  bgCard: '#1e293b',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textFaint: '#475569',
  border: '#334155',
  navInactive: '#475569',
};

// Sport-specific color ramps — accent / dark / light / mid
// Apply to: hero band, stat boxes, badges, feed icons, active nav, follow button
export const sportColors = {
  football: { accent: '#22c55e', dark: '#14532d', light: '#86efac', mid: '#4ade80' },
  swimming: { accent: '#38bdf8', dark: '#0c4a6e', light: '#bae6fd', mid: '#7dd3fc' },
  tennis: { accent: '#f59e0b', dark: '#78350f', light: '#fde68a', mid: '#fbbf24' },
  athletics: { accent: '#f97316', dark: '#7c2d12', light: '#fed7aa', mid: '#fb923c' },
  cricket: { accent: '#a3e635', dark: '#365314', light: '#d9f99d', mid: '#84cc16' },
  badminton: { accent: '#fb923c', dark: '#7c2d12', light: '#fed7aa', mid: '#fdba74' },
  basketball: { accent: '#fb923c', dark: '#7c2d12', light: '#ffedd5', mid: '#f97316' },
  default: { accent: '#6366f1', dark: '#312e81', light: '#e0e7ff', mid: '#818cf8' },
};

export function getSportColors(sportKey) {
  const key = (sportKey || '').toLowerCase();
  return sportColors[key] || sportColors.default;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  pill: 100,
};

export const typography = {
  // Stats and numbers — scoreboard style, large and bold
  statNumber: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  statLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  // Names
  name: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  // Headings
  h1: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  h2: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  // Meta / labels
  meta: { fontSize: 12, fontWeight: '400' },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.7, textTransform: 'uppercase' },
  // Body
  body: { fontSize: 13, lineHeight: 19 },
  caption: { fontSize: 11 },
};

export default {
  colors,
  sportColors,
  getSportColors,
  spacing,
  radius,
  typography,
};
