export const colors = {
  canvas: "var(--app-canvas)",
  canvasDeep: "var(--app-canvas-deep)",
  surface: "var(--app-surface)",
  surfaceStrong: "var(--app-surface-strong)",
  ink: "var(--app-ink)",
  inkMuted: "var(--app-ink-muted)",
  primary: "var(--app-primary)",
  primaryStrong: "var(--app-primary-strong)",
  accent: "var(--app-accent)",
  accentSoft: "var(--app-accent-soft)",
  onPrimary: "var(--app-on-primary)",
  successText: "var(--app-success-text)",
  warningText: "var(--app-warning-text)",
  dangerText: "var(--app-danger-text)"
}

export const radii = {
  xl: "var(--app-radius-xl)",
  lg: "var(--app-radius-lg)",
  md: "var(--app-radius-md)",
  pill: "var(--app-radius-pill)"
}

export const layout = {
  pageWidth: "var(--app-page-width)",
  authWidth: "var(--app-auth-width)",
  pagePadding: "var(--app-page-padding)"
}

export const shadows = {
  hero:
    "0 28px 90px rgba(var(--app-primary-rgb), 0.18), 0 12px 30px rgba(var(--app-primary-rgb), 0.1)",
  card:
    "0 20px 44px rgba(var(--app-primary-rgb), 0.12), 0 8px 20px rgba(var(--app-primary-rgb), 0.06)",
  soft: "0 12px 28px rgba(var(--app-primary-rgb), 0.1)"
}

export const gradients = {
  canvas:
    "radial-gradient(circle at top left, rgba(var(--app-primary-rgb), 0.18), rgba(255,255,255,0) 32%), radial-gradient(circle at top right, rgba(var(--app-accent-rgb), 0.18), rgba(255,255,255,0) 24%), linear-gradient(180deg, var(--app-canvas), var(--app-canvas-deep))",
  hero:
    "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(233,241,255,0.98) 60%, rgba(224,244,255,0.9))",
  section:
    "linear-gradient(180deg, rgba(248,250,255,0.94), rgba(236,242,255,0.98))",
  accent:
    "linear-gradient(145deg, rgba(var(--app-primary-rgb), 1), rgba(7, 85, 205, 0.96) 60%, rgba(var(--app-accent-rgb), 0.88))"
}

export const surfaces = {
  hero: {
    p: { xs: 2.5, sm: 3.5 },
    borderRadius: radii.xl,
    background: gradients.hero,
    border: "1px solid rgba(var(--app-primary-rgb), 0.16)",
    boxShadow: shadows.hero
  },
  section: {
    p: { xs: 2, sm: 3 },
    borderRadius: radii.lg,
    background: gradients.section,
    border: "1px solid rgba(var(--app-primary-rgb), 0.14)",
    boxShadow: shadows.card
  },
  panel: {
    p: 2,
    borderRadius: radii.md,
    background: colors.surfaceStrong,
    border: "1px solid rgba(var(--app-primary-rgb), 0.14)",
    boxShadow: shadows.soft
  }
}

export const tabStyles = {
  '&[aria-selected="true"]': {
    backgroundColor: colors.primary,
    color: colors.onPrimary
  },
  '&[aria-selected="false"]': {
    backgroundColor: "rgba(255,255,255,0.72)",
    color: colors.primary
  }
}

export function getBannerToneSx(tone = "neutral") {
  switch (tone) {
    case "success":
      return {
        background: "var(--app-success-bg)",
        color: colors.successText,
        border: "1px solid rgba(var(--app-success-rgb), 0.18)"
      }
    case "warning":
      return {
        background: "var(--app-warning-bg)",
        color: colors.warningText,
        border: "1px solid rgba(var(--app-warning-rgb), 0.18)"
      }
    case "danger":
      return {
        background: "var(--app-danger-bg)",
        color: colors.dangerText,
        border: "1px solid rgba(var(--app-danger-rgb), 0.18)"
      }
    default:
      return {
        background: "rgba(255,255,255,0.9)",
        color: colors.ink,
        border: "1px solid rgba(var(--app-primary-rgb), 0.14)"
      }
  }
}