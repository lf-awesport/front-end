"use client"

import styles from "./carousel.module.css"
import { useState, useEffect } from "react"
import { Typography, CircularProgress, Avatar } from "@mui/joy"
import { getTakeaways } from "@/utils/api"

export function Takeaways({ postId }) {
  const [data, setData] = useState([])
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    getTakeaways(postId, (res) => {
      setData(res.data?.takeaways?.takeaways)
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
        Key Takeways
      </Typography>
      <div className={styles.textContainer}>
        {data.map((p, index) => (
          <div
            className={styles.paragraph}
            style={{ display: "flex" }}
            key={index}
          >
            <Avatar sx={{ marginRight: "25px" }}>{index + 1}</Avatar>
            <Typography level="body-sm" color="fff">
              {p}
            </Typography>
          </div>
        ))}
      </div>
    </main>
  )
}
