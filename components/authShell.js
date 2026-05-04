import Link from "next/link"
import { Box, Typography } from "@mui/joy"
import { colors, gradients, layout, radii, shadows } from "@/utils/designTokens"
import { PageContainer, PageStatusBanner } from "@/components/pageShell"

export function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children
}) {
  return (
    <PageContainer width={layout.authWidth} padding="40px 0 72px">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1fr) minmax(420px, 0.92fr)"
          },
          gap: 3,
          alignItems: {
            xs: "stretch",
            md: "start"
          }
        }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            overflow: "hidden",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            minHeight: { xs: 240, md: 360 }
          }}
          style={{
            borderRadius: radii.xl,
            background: gradients.accent,
            color: colors.onPrimary,
            boxShadow: shadows.hero
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: "auto -12% -28% auto",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              filter: "blur(10px)"
            }}
          />
          <Box sx={{ maxWidth: 520, position: "relative" }}>
            <Typography
              level="body-sm"
              sx={{
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.78)"
              }}
            >
              {eyebrow}
            </Typography>
            <Typography
              level="h1"
              sx={{ mt: 1, color: "inherit", lineHeight: 0.98, letterSpacing: "-0.02em" }}
            >
              {title}
            </Typography>
            {description ? (
              <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.84)", lineHeight: 1.65 }}>
                {description}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
          style={{
            borderRadius: radii.xl,
            background: colors.surfaceStrong,
            border: "1px solid rgba(var(--app-primary-rgb), 0.14)",
            boxShadow: shadows.card
          }}
        >
          {children}
          {footer ? <Box sx={{ mt: 3 }}>{footer}</Box> : null}
        </Box>
      </Box>
    </PageContainer>
  )
}

export function AuthLink({ href, children }) {
  return (
    <Typography sx={{ color: colors.inkMuted }}>
      <Link href={href} style={{ color: "inherit", textDecoration: "underline" }}>
        {children}
      </Link>
    </Typography>
  )
}

export function AuthMessage({ tone, children }) {
  if (!children) {
    return null
  }

  return <PageStatusBanner tone={tone}>{children}</PageStatusBanner>
}