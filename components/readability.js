"use client"

import styles from "./carousel.module.css"
import { Typography, Avatar } from "@mui/joy"

export function Readability({ data }) {
  if (!data)
    return (
      <main className={styles.loading}>
        <Typography level="h1" color="fff" style={{ marginBottom: 20 }}>
          NOT FOUND
        </Typography>
      </main>
    )

  const color = (punteggio) => {
    if (punteggio > 64) return "success"
    if (punteggio > 33) return "warning"
    if (punteggio > 0) return "danger"
  }

  return (
    <div>
      <div className={styles.sentiment}>
        <div className={styles.chart}>
          <div className={styles.leftColumn}>
            <Typography level="h4" color="fff" style={{ marginBottom: 20 }}>
              Leggibilità
            </Typography>
            <Avatar color={color(data.punteggio_flesch_kincaid)} size="lg">
              {data.punteggio_flesch_kincaid}
            </Avatar>
          </div>
          <div className={styles.explanationContainer}>
            <Typography
              level="body-sm"
              color="fff"
              style={{ marginBottom: 20 }}
            >
              {data.spiegazione}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}
