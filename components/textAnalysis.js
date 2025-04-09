"use client"

import styles from "./carousel.module.css"
import { Typography, Divider } from "@mui/joy"
import { Sentiment } from "./sentiment"
import { Readability } from "./readability"
import { Prejudice } from "./prejudice"

export function TextAnalysis({ data }) {
  if (!data)
    return (
      <main className={styles.loading}>
        <Typography level="h1" color="fff" style={{ marginBottom: 20 }}>
          NOT FOUND
        </Typography>
      </main>
    )

  return (
    <div>
      <Sentiment data={data.analysis.rilevazione_emozioni} />
      <Divider />
      <Readability data={data.analysis.analisi_leggibilita} />
      <Divider />
      <Prejudice data={data.analysis.rilevazione_di_pregiudizio} />
      <Divider />
    </div>
  )
}
