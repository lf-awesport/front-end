"use client"

import { usePathname } from "next/navigation"
import styles from "./daily.module.css"
import { useState, useEffect } from "react"
import { Typography, Button, ButtonGroup } from "@mui/joy"
import CircularProgress from "@mui/joy/CircularProgress"
import { getDailySummary, updateDailySummary } from "@/utils/api"

export default function Post({ params }) {
  const [data, setData] = useState(null)
  const [pathname, setPathname] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isEditing, setEditing] = useState(false)
  const [title, setTitle] = useState(false)
  const [content, setContent] = useState(false)

  useEffect(() => {
    let date

    if (!params.id) {
      setPathname(usePathname())
      date = pathname.split("/daily/")
    } else {
      date = params.id
    }

    setLoading(true)

    getDailySummary(date, (res) => {
      setData(res.data)
      setTitle(res.data.body.title)
      setContent(res.data.body.content)
      setLoading(false)
    })
  }, [])

  const updateCopy = (title, content) => {
    let updatedDailySummary = data
    updatedDailySummary.body.title = title
    updatedDailySummary.body.content = content
    setLoading(true)
    updateDailySummary(updatedDailySummary, (res) => {
      setData(res.data)
      setLoading(false)
    })
  }

  if (isLoading)
    return (
      <main className={styles.loading}>
        <CircularProgress variant="solid" size="lg" />
      </main>
    )
  if (!data) return <p>No profile data</p>

  return (
    <main className={styles.main}>
      <Typography level="h1" color="fff" style={{ marginBottom: 20 }}>
        {data.id}
      </Typography>
      {isEditing ? (
        <div className={styles.textContainer}>
          <textarea
            className={styles.dailyTitle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            cols="120"
            rows="10"
            className={styles.dailyContent}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      ) : (
        <div className={styles.textContainer}>
          <Typography level="h2" color="fff" style={{ marginBottom: 20 }}>
            {title}
          </Typography>
          <Typography level="body-sm" color="fff">
            {content}
          </Typography>
        </div>
      )}
      <ButtonGroup variant="solid" color="primary">
        {!isEditing ? (
          <Button
            className={styles.carouselButton}
            onClick={() => setEditing(!isEditing)}
          >
            Edit
          </Button>
        ) : (
          <Button
            className={styles.carouselButton}
            onClick={() => {
              setEditing(!isEditing)
              updateCopy(title, content)
            }}
          >
            Save
          </Button>
        )}
        <Button
          disabled={data.body.title === title && data.body.content === content}
          onClick={() => {
            setTitle(data.body.title)
            setContent(data.body.content)
          }}
        >
          Undo
        </Button>
      </ButtonGroup>
    </main>
  )
}
