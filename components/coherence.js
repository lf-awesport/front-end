"use client"

import styles from "./carousel.module.css"
import { Typography, Avatar } from "@mui/joy"

export function Coherence({ data }) {
  if (!data)
    return (
      <main className={styles.loading}>
        <Typography level="h1" color="fff" style={{ marginBottom: 20 }}>
          NOT FOUND
        </Typography>
      </main>
    )

  const color = (punteggio) => {
    if (punteggio < 5) return "danger"
    if (punteggio > 7) return "success"
    return "warning"
  }

  return (
    <div>
      <div className={styles.sentiment}>
        <div className={styles.chart}>
          <div className={styles.leftColumn}>
            <Typography level="h4" color="fff" style={{ marginBottom: 20 }}>
              Coerenza
            </Typography>
            <Avatar color={color(data.punteggio_coerenza)} size="lg">
              {data.punteggio_coerenza}
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
