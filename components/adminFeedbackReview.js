"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { listFeedbackReviewEntries } from "@/utils/api"
import { formatDateTime } from "@/utils/helpers"
import { Button, Card, CardContent, Chip, Input, Option, Select, Sheet, Typography } from "@mui/joy"
import { AdminPageShell } from "@/components/adminPageShell"
import { PageSection, PageStatusBanner } from "@/components/pageShell"
import { colors, radii, shadows } from "@/utils/designTokens"

const fieldSx = {
  borderRadius: radii.md,
  minHeight: 52,
  backgroundColor: "rgba(247,250,255,0.9)"
}

function getLessonTypeLabel(entry) {
  return entry.collectionName === "caseStudyLessons" ? "Caso studio" : "Lezione"
}

export function AdminFeedbackReview() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [collectionFilter, setCollectionFilter] = useState("all")

  useEffect(() => {
    setIsLoading(true)
    setLoadError("")

    listFeedbackReviewEntries()
      .then(setEntries)
      .catch((error) => {
        console.error("Unable to load feedback entries", error)
        setLoadError("Non riesco a caricare i feedback in questo momento.")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return entries.filter((entry) => {
      const matchesCollection =
        collectionFilter === "all" || entry.collectionName === collectionFilter
      const matchesSearch =
        !normalizedSearch ||
        entry.title?.toLowerCase().includes(normalizedSearch) ||
        entry.moduleId?.toLowerCase().includes(normalizedSearch) ||
        entry.submittedBy?.email?.toLowerCase().includes(normalizedSearch)

      return matchesCollection && matchesSearch
    })
  }, [collectionFilter, entries, searchTerm])

  const caseStudyCount = entries.filter(
    (entry) => entry.collectionName === "caseStudyLessons"
  ).length
  const lessonCount = entries.filter((entry) => entry.collectionName === "lessons").length

  return (
    <AdminPageShell
      title="Revisione feedback lezioni"
      description="Rivedi i feedback sulle lezioni."
      stats={[
        { label: `${filteredEntries.length} feedback`, color: "primary" },
        { label: `${caseStudyCount} casi studio`, color: "neutral" },
        { label: `${lessonCount} lezioni`, color: "neutral" }
      ]}
    >
      <PageSection>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginTop: 0
          }}
        >
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cerca per lezione, id o autore del feedback"
            sx={fieldSx}
          />

          <Select
            value={collectionFilter}
            onChange={(_, value) => setCollectionFilter(value || "all")}
            sx={fieldSx}
          >
            <Option value="all">Tutti i tipi di lezione</Option>
            <Option value="lessons">Lezioni</Option>
            <Option value="caseStudyLessons">Casi studio</Option>
          </Select>
        </div>
      </PageSection>

      {isLoading ? (
        <PageSection>
          <Typography>Caricamento feedback...</Typography>
        </PageSection>
      ) : loadError ? (
        <PageStatusBanner tone="danger" sx={{ mt: 3 }}>
          {loadError}
        </PageStatusBanner>
      ) : filteredEntries.length === 0 ? (
        <PageSection>
          <Typography>Nessun feedback corrisponde ai filtri correnti.</Typography>
        </PageSection>
      ) : (
        <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
          {filteredEntries.map((entry) => (
            <Card
              key={`${entry.collectionName}-${entry.moduleId}-${entry.id}`}
              variant="outlined"
              sx={{
                borderRadius: radii.lg,
                boxShadow: shadows.card,
                border: "1px solid rgba(var(--app-primary-rgb), 0.08)",
                background: "rgba(255,255,255,0.86)"
              }}
            >
              <CardContent>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ maxWidth: "760px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                      <Chip variant="soft" color="primary" sx={{ borderRadius: radii.pill }}>
                        {getLessonTypeLabel(entry)}
                      </Chip>
                      {entry.lessonDate ? (
                        <Chip variant="soft" color="neutral" sx={{ borderRadius: radii.pill }}>
                          {entry.lessonDate}
                        </Chip>
                      ) : null}
                      <Chip variant="soft" color="warning" sx={{ borderRadius: radii.pill }}>
                        Valutazione {entry.overallRating || "-"}/5
                      </Chip>
                    </div>

                    <Typography level="title-lg" sx={{ color: colors.ink }}>
                      {entry.title || entry.moduleId}
                    </Typography>

                    <Typography sx={{ mt: 1, color: colors.inkMuted }}>
                      {entry.submittedBy?.email || "Autore sconosciuto"}
                      {entry.updatedAt ? ` · Aggiornato ${formatDateTime(entry.updatedAt, { fallback: "" })}` : ""}
                    </Typography>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <Link href={`/module/${entry.moduleId}`} style={{ textDecoration: "none" }}>
                      <Button variant="soft" color="primary" sx={{ borderRadius: radii.pill }}>
                        Apri
                      </Button>
                    </Link>
                  </div>
                </div>

                <Sheet
                  variant="soft"
                  sx={{ mt: 2, p: 2, borderRadius: radii.md, background: "rgba(239, 245, 255, 0.92)" }}
                >
                  <Typography level="body-sm" sx={{ letterSpacing: "0.12em", textTransform: "uppercase", color: colors.accent }}>
                    Suggerimento generale
                  </Typography>
                  <Typography sx={{ mt: 1.2, whiteSpace: "pre-wrap" }}>
                    {entry.overallSuggestion || "Nessun suggerimento generale inserito."}
                  </Typography>
                </Sheet>

                {Array.isArray(entry.sectionFeedback) && entry.sectionFeedback.length > 0 ? (
                  <div style={{ display: "grid", gap: "10px", marginTop: "16px" }}>
                    {entry.sectionFeedback.map((item, index) => (
                      <Sheet
                        key={`${item.targetKey}-${index}`}
                        variant="plain"
                        sx={{
                          p: 2,
                          borderRadius: radii.md,
                          border: "1px solid rgba(19, 53, 145, 0.1)",
                          background: "rgba(255,255,255,0.86)"
                        }}
                      >
                        <Typography level="body-sm" sx={{ fontWeight: 700 }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ mt: 0.8, whiteSpace: "pre-wrap" }}>
                          {item.suggestion}
                        </Typography>
                      </Sheet>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminPageShell>
  )
}