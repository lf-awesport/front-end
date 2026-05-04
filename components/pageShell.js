import Link from "next/link"
import { Box, Button, Typography } from "@mui/joy"
import {
  colors,
  getBannerToneSx,
  layout,
  radii,
  shadows,
  surfaces
} from "@/utils/designTokens"

export function PageContainer({
  children,
  width = layout.pageWidth,
  padding = layout.pagePadding
}) {
  return (
    <main
      style={{
        width,
        margin: "0 auto",
        padding
      }}
    >
      {children}
    </main>
  )
}

export function PageHero({
  eyebrow,
  title,
  description,
  action,
  children,
  sx = {}
}) {
  return (
    <Box
      sx={{ p: surfaces.hero.p, ...sx }}
      style={{
        borderRadius: radii.xl,
        background: surfaces.hero.background,
        border: surfaces.hero.border,
        boxShadow: surfaces.hero.boxShadow
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "flex-start"
        }}
      >
        <Box sx={{ maxWidth: 760 }}>
          {eyebrow ? (
            <Typography
              level="body-sm"
              sx={{
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: colors.accent,
                fontWeight: 700
              }}
            >
              {eyebrow}
            </Typography>
          ) : null}
          {title ? (
            <Typography
              level="h1"
              sx={{
                mt: eyebrow ? 0.5 : 0,
                color: colors.ink,
                lineHeight: 0.98,
                letterSpacing: "-0.025em",
                maxWidth: 680
              }}
            >
              {title}
            </Typography>
          ) : null}
          {description ? (
            <Typography sx={{ mt: 1.2, color: colors.inkMuted, lineHeight: 1.65, maxWidth: 620 }}>
              {description}
            </Typography>
          ) : null}
        </Box>

        {action ? (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            {action}
          </Box>
        ) : null}
      </Box>

      {children ? <Box sx={{ mt: 3 }}>{children}</Box> : null}
    </Box>
  )
}

export function PageSection({ children, sx = {}, mt = 3, padding = surfaces.section.p }) {
  return (
    <Box
      sx={{
        p: padding,
        mt,
        ...sx
      }}
      style={{
        borderRadius: radii.lg,
        background: surfaces.section.background,
        border: surfaces.section.border,
        boxShadow: surfaces.section.boxShadow
      }}
    >
      {children}
    </Box>
  )
}

export function PageStatusBanner({ tone = "neutral", title, children, sx = {} }) {
  const toneStyle = getBannerToneSx(tone)

  return (
    <Box
      sx={{
        mt: 2.5,
        p: 2,
        ...sx
      }}
      style={{
        borderRadius: radii.md,
        boxShadow: shadows.soft,
        background: toneStyle.background,
        color: toneStyle.color,
        border: toneStyle.border
      }}
    >
      {title ? (
        <Typography level="title-sm" sx={{ color: "inherit" }}>
          {title}
        </Typography>
      ) : null}
      {children ? <Box sx={{ mt: title ? 1 : 0 }}>{children}</Box> : null}
    </Box>
  )
}

export function PageActionLink({ href, label, variant = "soft", color = "primary" }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Button
        variant={variant}
        color={color}
        sx={{
          borderRadius: radii.pill,
          boxShadow: variant === "solid" ? shadows.soft : "none"
        }}
      >
        {label}
      </Button>
    </Link>
  )
}