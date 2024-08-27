"use client"

import styles from "./carousel.module.css"
import { Slide } from "@/components/slide"
import { useState, useEffect } from "react"
import { Box, Divider, Button, CircularProgress, Typography } from "@mui/joy"
import fileDownload from "js-file-download"
import {
  getCarousel,
  updateCarousel,
  downloadPDF,
  updateHighlights
} from "@/utils/api"

export function Carousel({ postId }) {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [ids, setIds] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    getCarousel(postId, (res) => {
      setData(res.data)
      setIds(res.data.carousel.map((e, index) => `slide${index}`))
      setLoading(false)
    })
  }, [])

  const updateCopy = (content, slideNumber) => {
    let updatedCarousel = data.carousel
    updatedCarousel[slideNumber] = { content }
    const updatedPost = {
      id: data.id,
      carousel: updatedCarousel
    }
    setLoading(true)
    updateCarousel(updatedPost, () => {
      setData(res.data)
      setLoading(false)
      // updateHighlights(updatedPost.id, (res) => {}) TODO fix this
    })
  }

  const addNewSlide = (slideNumber) => {
    let updatedCarousel = data.carousel
    updatedCarousel.splice(slideNumber + 1, 0, {
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
    <div className={styles.sentiment} id="carousel">
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
      {data.carousel.map((e, index) => {
        const content = e.content
        const key = ids[index]
        return (
          <Box key={key}>
            <Slide
              slideNumber={index}
              uniqueId={key}
              defaultContent={content}
              updateCopy={updateCopy}
              addNewSlide={addNewSlide}
              removeSlide={removeSlide}
              totalSlides={data.carousel.length}
              highlights={data?.highlights[index]?.highlights || []}
            />
            <Divider />
          </Box>
        )
      })}
    </div>
  )
}
