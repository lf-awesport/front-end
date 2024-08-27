"use client"

import styles from "./carousel.module.css"
import { useState, useEffect } from "react"
import { Typography, CircularProgress } from "@mui/joy"
import { getDailySummary } from "@/utils/api"

export function Daily({ date }) {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    getDailySummary(date, (res) => {
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
    <main className={styles.main}>
      <Typography level="h1" color="fff" style={{ margin: "50px 0" }}>
        {data.id}
      </Typography>
      <div className={styles.textContainer}>
        {data.body.map((p, index) => (
          <div className={styles.paragraph} key={index}>
            <Typography level="h4" color="fff">
              <a
                className={styles.link}
                href={data.urls[index]}
                target="_blank"
              >
                {p.title}
              </a>
            </Typography>
            <Typography level="body-sm" color="fff">
              {p.content}
            </Typography>
          </div>
        ))}
      </div>
    </main>
  )
}
