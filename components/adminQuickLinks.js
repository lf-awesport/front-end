"use client"

import Link from "next/link"
import { Box, Button, Card, CardContent, Sheet, Typography } from "@mui/joy"

const ADMIN_SECTIONS = [
  {
    href: "/admin/chat",
    eyebrow: "AI",
    title: "Chat admin",
    description: "Accedi alla chat interna riservata al team admin."
  },
  {
    href: "/admin/feedback",
    eyebrow: "Review",
    title: "Feedback",
    description: "Consulta tutti i feedback interni e riapri rapidamente le lezioni da rivedere."
  },
  {
    href: "/admin/invites",
    eyebrow: "Access",
    title: "Inviti",
    description: "Crea, copia e revoca inviti per il flusso di accesso riservato."
  },
  {
    href: "/admin/users",
    eyebrow: "Roles",
    title: "Utenti admin",
    description: "Promuovi o revoca i permessi admin direttamente dai profili utente." 
  }
]

export function AdminQuickLinks({
  title = "Area admin",
  description = "Gestisci le superfici riservate ad amministrazione, review interna e tooling AI.",
  showHeading = true
} = {}) {
  return (
    <Sheet
      sx={{
        p: 3,
        borderRadius: "28px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(238,244,255,0.98))",
        boxShadow: "0 22px 60px rgba(10, 47, 143, 0.1)"
      }}
    >
      {showHeading ? (
        <>
          <Typography
            level="body-sm"
            sx={{ letterSpacing: "0.14em", textTransform: "uppercase", color: "#0a63b3" }}
          >
            Admin
          </Typography>
          <Typography level="h1" sx={{ mt: 0.5 }}>
            {title}
          </Typography>
          <Typography sx={{ mt: 1.5, maxWidth: 760 }}>{description}</Typography>
        </>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 2,
          mt: showHeading ? 3 : 0
        }}
      >
        {ADMIN_SECTIONS.map((section) => (
          <Card
            key={section.href}
            variant="outlined"
            sx={{
              borderRadius: "24px",
              border: "1px solid rgba(12, 63, 172, 0.08)",
              boxShadow: "0 14px 32px rgba(10, 47, 143, 0.08)"
            }}
          >
            <CardContent>
              <Typography
                level="body-xs"
                sx={{ letterSpacing: "0.12em", textTransform: "uppercase", color: "#0a63b3" }}
              >
                {section.eyebrow}
              </Typography>
              <Typography level="title-lg" sx={{ mt: 0.8 }}>
                {section.title}
              </Typography>
              <Typography sx={{ mt: 1.2, color: "rgba(18, 36, 85, 0.72)" }}>
                {section.description}
              </Typography>
              <Link href={section.href} style={{ textDecoration: "none" }}>
                <Button sx={{ mt: 2, borderRadius: 999 }} color="primary">
                  Apri {section.title.toLowerCase()}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Sheet>
  )
}