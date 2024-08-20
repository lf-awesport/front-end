"use client"

import { usePathname } from "next/navigation"
import styles from "./post.module.css"
import { Carousel } from "@/components/carousel"
import { useState, useEffect } from "react"
import { Box, Divider, Button, CircularProgress, Typography } from "@mui/joy"
import fileDownload from "js-file-download"
import { getCarousel, updateCarousel, downloadPDF } from "@/utils/api"

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

    getCarousel(postId, (res) => {
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
    setLoading(true)
    updateCarousel(updatedPost, (res) => {
      setData(res.data)
      setLoading(false)
    })
  }

  const addNewSlide = (slideNumber) => {
    let updatedCarousel = data.carousel
    updatedCarousel.splice(slideNumber + 1, 0, {
      headline: "headline",
      content: "content"
    })
    const updatedPost = {
      id: data.id,
      carousel: updatedCarousel
    }
    setLoading(true)
    updateCarousel(updatedPost, (res) => {
      setData(res.data)
      setIds(res.data.carousel.map((e, index) => `slide${index}`))
      setLoading(false)
    })
  }

  const removeSlide = (slideNumber) => {
    let updatedCarousel = data.carousel
    updatedCarousel.splice(slideNumber, 1)
    const updatedPost = {
      id: data.id,
      carousel: updatedCarousel
    }

    setLoading(true)
    updateCarousel(updatedPost, (res) => {
      setData(res.data)
      setIds(res.data.carousel.map((e, index) => `slide${index}`))
      setLoading(false)
    })
  }

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
        <div>
          <Button
            disabled={isDownloading}
            onClick={() => {
              setIsDownloading(true)
              downloadPDF(ids, data.id, (res) => {
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
              addNewSlide={addNewSlide}
              removeSlide={removeSlide}
              totalSlides={data.carousel.length}
            />
            <Divider />
          </Box>
        )
      })}
    </main>
  )
}
