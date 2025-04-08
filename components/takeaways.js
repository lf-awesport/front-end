"use client"

import styles from "./carousel.module.css"
import { Typography, Avatar } from "@mui/joy"

export function Takeaways({ data }) {
  if (!data)
    return (
      <main className={styles.loading}>
        <Typography level="h1" color="#000" style={{ marginBottom: 20 }}>
          NOT FOUND
        </Typography>
      </main>
    )

  return (
    <main className={styles.main}>
      <Typography level="h2" color="#000" style={{ margin: "50px 0" }}>
        Key Takeways
      </Typography>
      <div className={styles.textContainer}>
        {data.analysis.takeaways.map((p, index) => (
          <div
            className={styles.paragraph}
            style={{ display: "flex" }}
            key={index}
          >
            <Avatar sx={{ marginRight: "25px" }}>{index + 1}</Avatar>
            <Typography
              level="body-sm"
              color="fff"
              style={{ margin: "auto 0" }}
            >
              {p}
            </Typography>
          </div>
        ))}
      </div>
    </main>
  )
}
