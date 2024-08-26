"use client"

import styles from "./carousel.module.css"
import { Typography, Avatar } from "@mui/joy"

export function Prejudice({ data }) {
  if (!data)
    return (
      <main className={styles.loading}>
        <Typography level="h1" color="fff" style={{ marginBottom: 20 }}>
          NOT FOUND
        </Typography>
      </main>
    )

  const grado = (punteggio) => {
    if (punteggio === 0) return "Nessuno"
    if (punteggio === 1) return "Basso"
    if (punteggio === 2) return "Moderato"
    if (punteggio === 3) return "Alto"
  }

  const color = (punteggio) => {
    if (punteggio === 0) return "success"
    if (punteggio === 1) return "neutral"
    if (punteggio === 2) return "warning"
    if (punteggio === 3) return "danger"
  }

  return (
    <div>
      <div className={styles.sentiment}>
        <div className={styles.chart}>
          <div className={styles.leftColumn}>
            <Typography level="h4" color="fff" style={{ marginBottom: 20 }}>
              Pregiudizio
            </Typography>
            <Typography
              level="body-sm"
              color={color(data.grado_di_pregiudizio)}
            >
              {grado(data.grado_di_pregiudizio)}
            </Typography>
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
