"use client"

import styles from "./carousel.module.css"
import { Typography, Avatar, Divider } from "@mui/joy"

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
    <div style={{ width: "100%" }}>
      <Divider />
      <div className={styles.sentiment}>
        <Typography level="h2" color="#000" style={{ marginBottom: "20px" }}>
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
      </div>
      <Divider />
    </div>
  )
}
