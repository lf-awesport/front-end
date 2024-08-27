"use client"

import styles from "./carousel.module.css"
import { Slide } from "@/components/slide"
import { useState, useEffect } from "react"
import {
  Box,
  Divider,
  Button,
  CircularProgress,
  Typography,
  ButtonGroup
} from "@mui/joy"
import fileDownload from "js-file-download"
import {
  getCarousel,
  updateCarousel,
  downloadPDF,
  generateHighlights,
  deleteHighlights,
  getHighlights
} from "@/utils/api"

export function Carousel({ postId }) {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [ids, setIds] = useState(null)
  const [highlights, setHighlights] = useState([])
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    getCarousel(postId, (res) => {
      setData(res.data)
      setIds(res.data.carousel.map((e, index) => `slide${index}`))
      getHighlights(res.data.id, (res) => {
        console.log(res.data)
        setHighlights(res.data().highlights || [])
        setLoading(false)
      })
    })
  }, [])

  const updateCopy = (content, slideNumber) => {
    let updatedCarousel = data.carousel
    updatedCarousel[slideNumber] = { content }
    setLoading(true)
    updateCarousel(data.id, { carousel: updatedCarousel }, (res) => {
      setData(res.data)
      setLoading(false)
    })
  }

  const createHighlights = () => {
    setLoading(true)
    generateHighlights(data.id, (res) => {
      console.log(res.data)
      setHighlights(res.data.highlights)
      setLoading(false)
    })
  }

  const removeHighlights = () => {
    setLoading(true)
    deleteHighlights(data.id, (res) => {
      setHighlights([])
      setLoading(false)
    })
  }

  const addNewSlide = (slideNumber) => {
    let updatedCarousel = data.carousel
    updatedCarousel.splice(slideNumber + 1, 0, {
      content: "Write here..."
    })
    const updatedPost = {
      carousel: updatedCarousel
    }
    setLoading(true)
    updateCarousel(data.id, updatedPost, (res) => {
      setData(res.data)
      setIds(res.data.carousel.map((e, index) => `slide${index}`))
      setLoading(false)
    })
  }

  const removeSlide = (slideNumber) => {
    let updatedCarousel = data.carousel
    updatedCarousel.splice(slideNumber, 1)
    const updatedPost = {
      carousel: updatedCarousel
    }

    setLoading(true)
    updateCarousel(data.id, updatedPost, (res) => {
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
      <ButtonGroup variant="solid" color="primary">
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
        {highlights.length === 0 && (
          <Button disabled={isDownloading} onClick={createHighlights}>
            Add Highlights
          </Button>
        )}
        {highlights.length > 0 && (
          <Button disabled={isDownloading} onClick={removeHighlights}>
            Remove Highlights
          </Button>
        )}
      </ButtonGroup>
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
              highlights={highlights}
            />
            <Divider />
          </Box>
        )
      })}
    </div>
  )
}
