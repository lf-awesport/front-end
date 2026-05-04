"use client"

import ProtectedRoute from "@/components/protectedRoute"
import { ArticleChat } from "@/components/articleChat"
import { Button, Sheet, Typography } from "@mui/joy"

export default function AdminChatPage() {
  return (
    <ProtectedRoute requireAdmin>
      <main
        style={{
          width: "min(1200px, calc(100% - 32px))",
          margin: "0 auto",
          padding: "32px 0 64px"
        }}
      >
        <Sheet
          sx={{
            p: 3,
            borderRadius: "28px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(238,244,255,0.98))",
            boxShadow: "0 22px 60px rgba(10, 47, 143, 0.1)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center"
            }}
          >
            <div>
              <Typography level="body-sm" sx={{ letterSpacing: "0.14em", textTransform: "uppercase", color: "#0a63b3" }}>
                Admin
              </Typography>
              <Typography level="h1" sx={{ mt: 0.5 }}>
                Chat interna
              </Typography>
              <Typography sx={{ mt: 1.5, maxWidth: 760 }}>
                Usa Eddy in modalita riservata per analisi e domande operative del team admin.
              </Typography>
            </div>

            <a href="/admin" style={{ textDecoration: "none" }}>
              <Button variant="soft" color="primary" sx={{ borderRadius: 999 }}>
                Torna ad admin
              </Button>
            </a>
          </div>
        </Sheet>

        <Sheet
          sx={{
            mt: 3,
            p: 2,
            minHeight: "72vh",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 16px 36px rgba(10, 47, 143, 0.08)"
          }}
        >
          <ArticleChat />
        </Sheet>
      </main>
    </ProtectedRoute>
  )
}