"use client"

import styles from "./carousel.module.css"
import { useState, useEffect } from "react"
import { CircularProgress, Typography, Divider } from "@mui/joy"
import { getSentimentAnalysis } from "@/utils/api"
import { Sentiment } from "./sentiment"
import { Readability } from "./readability"
import { Prejudice } from "./prejudice"

export function TextAnalysis({ postId }) {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    getSentimentAnalysis(postId, (res) => {
      setData(res.data)
      setLoading(false)
    })
  }, [])

  if (isLoading)
    return (
      <main className={styles.loading}>
        <CircularProgress variant="solid" size="lg" />
      </main>
    )
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
      <Readability data={data.analysis.analisi_leggibilità} />
      <Divider />
      <Prejudice data={data.analysis.rilevazione_di_pregiudizio} />
      <Divider />
    </div>
  )
}
