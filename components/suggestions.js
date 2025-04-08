"use client"

import styles from "./carousel.module.css"
import { Typography, Avatar } from "@mui/joy"

export function Suggestions({ data }) {
  if (!data || !data.relatedArticles) {
    return (
      <main className={styles.loading}>
        <Typography level="h1" color="neutral">
          NOT FOUND
        </Typography>
      </main>
    )
  }

  const getColor = (score) => {
    if (score > 80) return "success"
    if (score > 70) return "warning"
    return "danger"
  }

  return (
    <main className={styles.main}>
      <Typography level="h1" color="fff" style={{ margin: "50px 0" }}>
        Related Articles
      </Typography>
      <div className={styles.textContainer}>
        {data.relatedArticles.map((e, index) => (
          <div
            className={styles.paragraph}
            style={{ display: "flex", alignItems: "center" }}
            key={index}
          >
            <Avatar
              variant="solid"
              color={getColor((e.similarity || 0) * 100)}
              size="sm"
            >
              {Math.round((e.similarity || 0) * 100)}
            </Avatar>
            <Typography
              level="body-sm"
              color="fff"
              style={{ margin: "0 10px" }}
            >
              <a href={`/post/${e.id}`} target="blank">
                {e.title || "Untitled"}
              </a>
            </Typography>
          </div>
        ))}
      </div>
    </main>
  )
}
