"use client"

import { useEffect, useMemo, useState } from "react"
import { listFeedbackReviewEntries } from "@/utils/api"
import { formatDateTime } from "@/utils/helpers"
import { Button, Card, CardContent, Chip, Input, Option, Select, Sheet, Typography } from "@mui/joy"

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

  return (
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
              Revisione feedback lezioni
            </Typography>
            <Typography sx={{ mt: 1.5, maxWidth: 720 }}>
              Consulta i feedback interni raccolti sulle lezioni e riapri rapidamente i moduli da migliorare.
            </Typography>
          </div>

          <a href="/admin" style={{ textDecoration: "none" }}>
            <Button variant="soft" color="primary" sx={{ borderRadius: 999 }}>
              Torna ad admin
            </Button>
          </a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginTop: "24px"
          }}
        >
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cerca per lezione, id o autore del feedback"
            sx={{ borderRadius: "16px" }}
          />

          <Select
            value={collectionFilter}
            onChange={(_, value) => setCollectionFilter(value || "all")}
            sx={{ borderRadius: "16px" }}
          >
            <Option value="all">Tutti i tipi di lezione</Option>
            <Option value="lessons">Lezioni</Option>
            <Option value="caseStudyLessons">Casi studio</Option>
          </Select>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
          <Chip variant="soft" color="primary" sx={{ borderRadius: 999 }}>
            {filteredEntries.length} feedback
          </Chip>
          <Chip variant="soft" color="neutral" sx={{ borderRadius: 999 }}>
            {entries.filter((entry) => entry.collectionName === "caseStudyLessons").length} casi studio
          </Chip>
          <Chip variant="soft" color="neutral" sx={{ borderRadius: 999 }}>
            {entries.filter((entry) => entry.collectionName === "lessons").length} lezioni
          </Chip>
        </div>
      </Sheet>

      {isLoading ? (
        <Sheet sx={{ mt: 3, p: 3, borderRadius: "24px", background: "rgba(255,255,255,0.9)" }}>
          <Typography>Caricamento feedback...</Typography>
        </Sheet>
      ) : loadError ? (
        <Sheet sx={{ mt: 3, p: 3, borderRadius: "24px", background: "rgba(255,255,255,0.9)" }}>
          <Typography sx={{ color: "#c2410c" }}>{loadError}</Typography>
        </Sheet>
      ) : filteredEntries.length === 0 ? (
        <Sheet sx={{ mt: 3, p: 3, borderRadius: "24px", background: "rgba(255,255,255,0.9)" }}>
          <Typography>Nessun feedback corrisponde ai filtri correnti.</Typography>
        </Sheet>
      ) : (
        <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
          {filteredEntries.map((entry) => (
            <Card
              key={`${entry.collectionName}-${entry.moduleId}-${entry.id}`}
              variant="outlined"
              sx={{ borderRadius: "24px", boxShadow: "0 14px 32px rgba(10, 47, 143, 0.08)" }}
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
                      <Chip variant="soft" color="primary" sx={{ borderRadius: 999 }}>
                        {getLessonTypeLabel(entry)}
                      </Chip>
                      {entry.lessonDate ? (
                        <Chip variant="soft" color="neutral" sx={{ borderRadius: 999 }}>
                          {entry.lessonDate}
                        </Chip>
                      ) : null}
                      <Chip variant="soft" color="warning" sx={{ borderRadius: 999 }}>
                        Valutazione {entry.overallRating || "-"}/5
                      </Chip>
                    </div>

                    <Typography level="title-lg">{entry.title || entry.moduleId}</Typography>

                    <Typography sx={{ mt: 1, color: "rgba(18, 36, 85, 0.68)" }}>
                      {entry.submittedBy?.email || "Autore sconosciuto"}
                      {entry.updatedAt ? ` · Aggiornato ${formatDateTime(entry.updatedAt, { fallback: "" })}` : ""}
                    </Typography>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <a href={`/module/${entry.moduleId}`} style={{ textDecoration: "none" }}>
                      <Button variant="soft" color="primary" sx={{ borderRadius: 999 }}>
                        Apri lezione
                      </Button>
                    </a>
                  </div>
                </div>

                <Sheet
                  variant="soft"
                  sx={{ mt: 2, p: 2, borderRadius: "18px", background: "rgba(239, 245, 255, 0.92)" }}
                >
                  <Typography level="body-sm" sx={{ letterSpacing: "0.12em", textTransform: "uppercase", color: "#0a63b3" }}>
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
                          borderRadius: "18px",
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
    </main>
  )
}