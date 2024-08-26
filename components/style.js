"use client"

import styles from "./carousel.module.css"
import { Typography } from "@mui/joy"

export function Style({ data }) {
  if (!data)
    return (
      <main className={styles.loading}>
        <Typography level="h1" color="fff" style={{ marginBottom: 20 }}>
          NOT FOUND
        </Typography>
      </main>
    )

  const tono = (punteggio) => {
    if (punteggio === 1) return "Formale"
    if (punteggio === 2) return "Informale"
    return "Neutrale"
  }

  const stile = (punteggio) => {
    if (punteggio === 1) return "Descrittivo"
    if (punteggio === 2) return "Narrativo"
    return "Espositivo"
  }

  return (
    <div>
      <div className={styles.sentiment}>
        <div className={styles.chart}>
          <div className={styles.leftColumn}>
            <Typography level="h4" color="fff" style={{ marginBottom: 20 }}>
              Tono
            </Typography>
            <Typography
              level="body-sm"
              color="fff"
              style={{ marginBottom: 20 }}
            >
              {tono(data.tono)}
            </Typography>
            <Typography level="h4" color="fff" style={{ marginBottom: 20 }}>
              Stile
            </Typography>
            <Typography
              level="body-sm"
              color="fff"
              style={{ marginBottom: 20 }}
            >
              {stile(data.stile)}
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
