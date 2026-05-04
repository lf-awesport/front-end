"use client"

import Link from "next/link"
import { Box, Card, CardContent, Sheet, Typography } from "@mui/joy"
import { colors, radii, shadows } from "@/utils/designTokens"
import { PageHero } from "@/components/pageShell"

const ADMIN_SECTIONS = [
  {
    href: "/admin/chat",
    eyebrow: "AI",
    title: "Chat admin",
    description: "Chat interna."
  },
  {
    href: "/admin/feedback",
    eyebrow: "Review",
    title: "Feedback",
    description: "Rivedi i feedback."
  },
  {
    href: "/admin/invites",
    eyebrow: "Access",
    title: "Inviti",
    description: "Crea e revoca inviti."
  },
  {
    href: "/admin/users",
    eyebrow: "Roles",
    title: "Utenti admin",
    description: "Gestisci i ruoli."
  }
]

export function AdminQuickLinks({
  title = "Area admin",
  description = "Strumenti interni.",
  showHeading = true
} = {}) {
  const content = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 2,
        mt: showHeading ? 0 : 0
      }}
    >
      {ADMIN_SECTIONS.map((section) => (
        <Link key={section.href} href={section.href} style={{ display: "block", textDecoration: "none" }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: radii.lg,
              border: "1px solid rgba(var(--app-primary-rgb), 0.12)",
              boxShadow: shadows.soft,
              background: "rgba(247,250,255,0.84)",
              transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
              cursor: "pointer",
              '&:hover': {
                transform: "translateY(-3px)",
                boxShadow: shadows.card,
                borderColor: "rgba(var(--app-primary-rgb), 0.24)"
              }
            }}
          >
            <CardContent>
              <Typography
                level="body-xs"
                sx={{ letterSpacing: "0.14em", textTransform: "uppercase", color: colors.accent }}
              >
                {section.eyebrow}
              </Typography>
              <Typography level="title-lg" sx={{ mt: 0.8, color: colors.ink }}>
                {section.title}
              </Typography>
              <Typography sx={{ mt: 0.9, color: colors.inkMuted, lineHeight: 1.6 }}>
                {section.description}
              </Typography>
            </CardContent>
          </Card>
        </Link>
      ))}
    </Box>
  )

  if (!showHeading) {
    return (
      <Sheet
        sx={{
          p: 0,
          background: "transparent",
          boxShadow: "none"
        }}
      >
        {content}
      </Sheet>
    )
  }

  return (
    <PageHero
      eyebrow="Admin"
      title={title}
      description={description}
      sx={{ p: { xs: 2.5, sm: 3.5 } }}
    >
      {content}
    </PageHero>
  )
}