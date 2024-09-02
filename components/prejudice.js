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

  const color = (punteggio) => {
    if (punteggio === 0) return "neutral"
    if (punteggio < 25) return "success"
    if (punteggio > 59) return "danger"
    if (punteggio > 25) return "warning"
  }

  return (
    <div>
      <div className={styles.sentiment}>
        <div className={styles.chart}>
          <div className={styles.leftColumn}>
            <Typography level="h4" color="fff" style={{ marginBottom: 20 }}>
              Pregiudizio
            </Typography>
            <Avatar color={color(data.grado_di_pregiudizio)} size="lg">
              {data.grado_di_pregiudizio}
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
