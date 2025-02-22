"use client"

import Image from "next/image"
import styles from "./carousel.module.css"
import { useState, useEffect } from "react"
import { Box, Button, ButtonGroup, CircularProgress, Slider } from "@mui/joy"
import Highlighter from "react-multi-highlight"

export const Slide = ({
  defaultContent,
  uniqueId,
  updateCopy,
  slideNumber,
  addNewSlide,
  removeSlide,
  totalSlides,
  highlights
}) => {
  const [content, setContent] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isEditing, setEditing] = useState(false)

  useEffect(() => {
    setContent(defaultContent)
    setLoading(false)
  }, [])

  if (isLoading)
    return (
      <main className={styles.loading}>
        <CircularProgress variant="solid" size="lg" />
      </main>
    )

  const renderTopImage = () => {
    if (slideNumber === 0)
      return (
        <Image
          src="/logo_white.png"
          alt="awe Logo"
          className={styles.aweLogo}
          width={778}
          height={221}
          style={{ marginBottom: "130px" }}
          priority
        />
      )
    if (slideNumber === totalSlides - 1)
      return (
        <Image
          src="/icon_logo_white.png"
          alt="awe Logo"
          className={styles.aweLogo}
          width={400}
          height={400}
          style={{ marginBottom: "130px" }}
          priority
        />
      )
    else return null
  }

  return (
    <Box>
      <div id={uniqueId} className={styles.carouselContainer}>
        <div
          className={
            slideNumber === 0 || slideNumber === totalSlides - 1
              ? styles.firstSlide
              : styles.contentSlide
          }
        >
          {renderTopImage()}
          {isEditing ? (
            <div className={styles.carouselText}>
              <textarea
                className={styles.carouselContent}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          ) : (
            <div className={styles.carouselText}>
              <p
                className={
                  slideNumber === 0 || slideNumber === totalSlides
                    ? styles.carouselHeadline
                    : styles.carouselContent
                }
              >
                <Highlighter
                  config={highlights.map((h) => ({
                    word: h,
                    className: "c",
                    style: {
                      backgroundColor: "yellow",
                      color: "#0f1b45"
                    }
                  }))}
                  highlightTag="span"
                  normalTag="span"
                  text={content}
                />
              </p>
            </div>
          )}
          {slideNumber !== 0 && slideNumber !== totalSlides - 1 && (
            <Image
              src="/logo_white.png"
              alt="awe Logo"
              className={styles.aweLogo}
              width={584}
              height={166}
              style={{
                marginTop: "130px"
              }}
              priority
            />
          )}
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <ButtonGroup variant="solid" color="primary">
          {!isEditing ? (
            <Button
              className={styles.carouselButton}
              onClick={() => setEditing(!isEditing)}
              sx={{
                color: "#fff",
                background: "#003399"
              }}
            >
              Edit
            </Button>
          ) : (
            <Button
              className={styles.carouselButton}
              onClick={() => {
                setEditing(!isEditing)
                updateCopy(content, slideNumber)
              }}
              sx={{
                color: "#fff",
                background: "#003399"
              }}
            >
              Save
            </Button>
          )}
          <Button
            disabled={defaultContent === content}
            onClick={() => {
              setContent(defaultContent)
            }}
            sx={{
              color: "#fff",
              background: "#003399"
            }}
          >
            Undo
          </Button>
        </ButtonGroup>
        <ButtonGroup variant="solid" color="primary">
          <Button
            disabled={isEditing}
            onClick={() => {
              addNewSlide(slideNumber)
            }}
            sx={{
              color: "#fff",
              background: "#003399"
            }}
          >
            Add Slide
          </Button>
          <Button
            disabled={isEditing || totalSlides === 1 || slideNumber === 0}
            onClick={() => {
              removeSlide(slideNumber)
            }}
            sx={{
              color: "#fff",
              background: "#003399"
            }}
          >
            Remove Slide
          </Button>
        </ButtonGroup>
      </div>
    </Box>
  )
}
