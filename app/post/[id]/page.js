"use client"

import axios from "axios"
import { usePathname } from "next/navigation"
import styles from "./post.module.css"
import { Carousel } from "@/components/carousel"
import { useState, useEffect } from "react"
import Box from "@mui/joy/Box"
import Divider from "@mui/joy/Divider"
import Button from "@mui/joy/Button"
import fileDownload from "js-file-download"
import CircularProgress from "@mui/joy/CircularProgress"

export default function Post({ params }) {
  const [data, setData] = useState(null)
  const [pathname, setPathname] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [ids, setIds] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    let postId

    if (!params.id) {
      setPathname(usePathname())
      postId = pathname.split("/post/")
    } else {
      postId = params.id
    }

    axios
      .get(`http://localhost:4000/getCarousel`, {
        params: {
          id: postId
        }
      })
      .then((res) => {
        setData(res.data)
        setIds(res.data.carousel.map((e, index) => `slide${index}`))
        setLoading(false)
      })
  }, [])

  const updateCopy = (headline, content, slideNumber) => {
    let updatedCarousel = data.carousel
    updatedCarousel[slideNumber] = { headline, content }
    const updatedPost = {
      id: data.id,
      carousel: updatedCarousel
    }

    axios
      .patch(`http://localhost:8000/carousels/${data.id}`, updatedPost, {
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then((res) => {
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
      <div className={styles.description}>
        <a href="/posts">
          <code className={styles.code}>Back</code>
        </a>
        <a href={data.url} target="_blank">
          <code className={styles.code}>{data.title}</code>
        </a>
        <div>
          <Button
            disabled={isDownloading}
            onClick={() => {
              setIsDownloading(true)
              axios
                .get(`http://localhost:4000/screenshot`, {
                  responseType: "blob",
                  params: {
                    ids: ids,
                    id: data.id
                  }
                })
                .then((res) => {
                  fileDownload(res.data, `${data.id}.pdf`)
                  setIsDownloading(false)
                })
            }}
          >
            Save PDF
          </Button>
        </div>
      </div>

      {data.carousel.map((e, index) => {
        const headline = e.headline
        const content = e.content
        const key = ids[index]
        return (
          <Box key={key} id="carousel">
            <Carousel
              slideNumber={index}
              uniqueId={key}
              defaultHeadline={headline}
              defaultContent={content}
              updateCopy={updateCopy}
            />
            <Divider />
          </Box>
        )
      })}
    </main>
  )
}
