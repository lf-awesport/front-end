"use client"

import { usePathname } from "next/navigation"
import styles from "./post.module.css"
import { Carousel } from "@/components/carousel"
import { Sentiment } from "@/components/sentiment"
import { WordCloud } from "@/components/wordcloud"
import { useState, useEffect } from "react"
import { Divider, CircularProgress, Typography } from "@mui/joy"
import { getPost } from "@/utils/api"

export default function Post({ params }) {
  const [data, setData] = useState(null)
  const [pathname, setPathname] = useState(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    let postId

    if (!params.id) {
      setPathname(usePathname())
      postId = pathname.split("/post/")
    } else {
      postId = params.id
    }

    getPost(postId, (res) => {
      setData(res)
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
      <div className={styles.description}>
        <a href="/posts">
          <code className={styles.code}>Back</code>
        </a>
        <a href={data.url} target="_blank">
          <code className={styles.code}>{data.title}</code>
        </a>
      </div>
      <div className={styles.summary}>
        <Typography level="h1" color="fff" style={{ marginBottom: 20 }}>
          {data.title}
        </Typography>
        <div className={styles.subSummary}>
          <img className={styles.img} src={data.imgLink} />
          <div className={styles.summaryText}>
            <Typography
              level="body-sm"
              color="fff"
              style={{ marginBottom: 20 }}
            >
              {data.date}
            </Typography>
            <Divider />
            <Typography
              level="body-sm"
              color="fff"
              style={{ marginBottom: 20 }}
            >
              {data.author}
            </Typography>
            <Divider />
            <Typography
              level="body-sm"
              color="fff"
              style={{ marginBottom: 20 }}
            >
              {data.excerpt}
            </Typography>
          </div>
        </div>
      </div>
      <Divider />
      <WordCloud postId={data.id} />
      <Divider />
      <Sentiment postId={data.id} />
      <Divider />
      <Carousel postId={data.id} />
    </main>
  )
}
