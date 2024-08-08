"use client"

import Image from "next/image"
import styles from "./carousel.module.css"
import { useState, useEffect } from "react"
import Box from "@mui/joy/Box"
import Button from "@mui/joy/Button"
import ButtonGroup from "@mui/joy/ButtonGroup"

export const Carousel = ({
  defaultHeadline,
  defaultContent,
  uniqueId,
  updateCopy,
  slideNumber,
  addSlide,
  removeSlide,
  totalSlides
}) => {
  const [headline, setHeadline] = useState(null)
  const [content, setContent] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isEditing, setEditing] = useState(false)

  useEffect(() => {
    setHeadline(defaultHeadline)
    setContent(defaultContent)
    setLoading(false)
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!headline) return <p>No profile data</p>

  return (
    <Box>
      <div className={styles.carouselContainer}>
        <div id={uniqueId} className={styles.carousel}>
          <Image
            src="/LOGO-POS.png"
            alt="awe Logo"
            className={styles.aweLogo}
            width={778}
            height={221}
            priority
          />
          {isEditing ? (
            <div className={styles.carouselText}>
              <textarea
                className={styles.carouselHeadline}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
              <textarea
                className={styles.carouselContent}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          ) : (
            <div className={styles.carouselText}>
              <p className={styles.carouselHeadline}>{headline}</p>
              <p className={styles.carouselContent}>{content}</p>
            </div>
          )}
        </div>
        <div className={styles.buttonContainer}>
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
                  updateCopy(headline, content, slideNumber)
                }}
              >
                Save
              </Button>
            )}
            <Button
              disabled={
                defaultHeadline === headline && defaultContent === content
              }
              onClick={() => {
                setHeadline(defaultHeadline)
                setContent(defaultContent)
              }}
            >
              Undo
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="solid" color="primary">
            <Button
              disabled={isEditing}
              onClick={() => {
                addSlide(slideNumber)
              }}
            >
              Add Slide
            </Button>
            <Button
              disabled={isEditing || totalSlides === 1}
              onClick={() => {
                removeSlide(slideNumber)
              }}
            >
              Remove Slide
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </Box>
  )
}
