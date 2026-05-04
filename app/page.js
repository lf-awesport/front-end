"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  Chip,
  Sheet,
  Typography,
  Box
} from "@mui/joy"
import { getModulesFromFirestore } from "@/utils/api"
import { useAuth } from "@/utils/authContext"
import Loading from "@/components/loading"
import ProtectedRoute from "@/components/protectedRoute"
import { PageActionLink, PageContainer, PageHero, PageSection } from "@/components/pageShell"
import { colors, radii, shadows } from "@/utils/designTokens"

const LESSON_SUBJECT = "Sport Management"

export default function PostsWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedRoute>
        <PostsContent />
      </ProtectedRoute>
    </Suspense>
  )
}

function PostsContent() {
  const { viewer } = useAuth()
  const [isLoading, setLoading] = useState(true)
  const [modules, setModules] = useState([])
  const canViewAdmin = Boolean(viewer?.isAdmin)

  useEffect(() => {
    if (modules.length > 0) {
      return
    }

    setLoading(true)

    getModulesFromFirestore(LESSON_SUBJECT)
      .then(setModules)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [modules.length])

  if (isLoading) return <Loading />

  return (
    <PageContainer>
      <PageHero
        eyebrow="AWE"
        title="Il tuo workspace"
        description="Scegli un modulo e continua."
        action={canViewAdmin ? <PageActionLink href="/admin" label="Area admin" variant="solid" /> : null}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap"
          }}
        >
          <Chip variant="soft" color="primary" sx={{ borderRadius: radii.pill }}>
            {modules.length} moduli
          </Chip>
        </Box>
      </PageHero>

      <PageSection>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography level="h2">Moduli</Typography>
          </Box>
        </Box>

        {modules.length === 0 ? (
          <Sheet
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: radii.lg,
              background: "rgba(239,245,255,0.92)",
              border: "1px solid rgba(var(--app-primary-rgb), 0.08)"
            }}
          >
            <Typography>Nessun modulo disponibile al momento.</Typography>
          </Sheet>
        ) : (
          <Sheet
            sx={{
              mt: 3,
              p: 0,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr"
              },
              gap: 2,
              background: "transparent",
              boxShadow: "none"
            }}
          >
            {modules.map((mod, index) => {
              const coverSrc = mod.coverImage?.url || mod.cover || "/testcover.jpeg"
              const coverAlt =
                mod.coverImage?.alt || mod.topic || mod.title || "Lesson cover"

              return (
                <Link
                  key={mod.id}
                  href={`/module/${mod.id}`}
                  style={{ display: "block", textDecoration: "none", height: "100%" }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      width: "100%",
                      height: "100%",
                      boxSizing: "border-box",
                      borderRadius: radii.lg,
                      border: "1px solid rgba(var(--app-primary-rgb), 0.12)",
                      boxShadow: shadows.card,
                      background: "rgba(247,250,255,0.84)",
                      overflow: "hidden",
                      transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                      cursor: "pointer",
                      '&:hover': {
                        transform: "translateY(-4px)",
                        boxShadow: shadows.hero,
                        borderColor: "rgba(var(--app-primary-rgb), 0.28)"
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "block",
                        background:
                          "linear-gradient(180deg, rgba(232, 239, 255, 0.98), rgba(224, 236, 255, 0.92))"
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "280px",
                          padding: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxSizing: "border-box"
                        }}
                      >
                        <img
                          src={coverSrc}
                          alt={coverAlt}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "16px",
                            objectFit: "contain",
                            display: "block"
                          }}
                        />
                      </div>
                    </div>

                    <CardContent>
                      <Typography
                        level="body-xs"
                        sx={{ letterSpacing: "0.14em", textTransform: "uppercase", color: colors.accent }}
                      >
                        Modulo {index + 1}
                      </Typography>
                      <Typography level="title-lg" sx={{ mt: 1, color: colors.ink }}>
                        {mod.topic || mod.title || mod.id}
                      </Typography>

                      <Typography level="body-sm" sx={{ mt: 0.8, color: colors.inkMuted }}>
                        {mod.materia || LESSON_SUBJECT}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </Sheet>
        )}
      </PageSection>
    </PageContainer>
  )
}
