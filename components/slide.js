"use client"

//TODO REFACTOR

import Image from "next/image"
import styles from "./carousel.module.css"
import { useState, useEffect } from "react"
import { Box, Button, ButtonGroup } from "@mui/joy"
import Highlighter from "react-multi-highlight"

export const Slide = ({
  defaultHeadline,
  defaultContent,
  uniqueId,
  updateCopy,
  slideNumber,
  addNewSlide,
  removeSlide,
  totalSlides,
  highlights
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

  if (slideNumber === 0)
    return (
      <Box>
        <div className={styles.carouselContainer}>
          <div id={uniqueId} className={styles.carousel}>
            <Image
              src="/logo_white.png"
              alt="awe Logo"
              className={styles.aweLogo}
              width={778}
              height={221}
              style={{ marginBottom: "130px" }}
              priority
            />
            {isEditing ? (
              <div className={styles.carouselText}>
                <textarea
                  className={styles.carouselHeadline}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>
            ) : (
              <div className={styles.carouselText}>
                <p className={styles.carouselHeadline}>{headline}</p>
              </div>
            )}
          </div>
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
                addNewSlide(slideNumber)
              }}
            >
              Add Slide
            </Button>
            <Button
              disabled={isEditing || totalSlides === 1 || slideNumber === 0}
              onClick={() => {
                removeSlide(slideNumber)
              }}
            >
              Remove Slide
            </Button>
          </ButtonGroup>
        </div>
      </Box>
    )
  if (slideNumber === totalSlides - 1)
    return (
      <Box>
        <div className={styles.carouselContainer}>
          <div id={uniqueId} className={styles.carousel}>
            <Image
              src="/icon_logo_white.png"
              alt="awe Logo"
              className={styles.aweLogo}
              width={221}
              height={221}
              style={{ marginBottom: "130px" }}
              priority
            />
            {isEditing ? (
              <div className={styles.carouselText}>
                <textarea
                  className={styles.carouselHeadline}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>
            ) : (
              <div className={styles.carouselText}>
                <p className={styles.carouselContent}>{content}</p>
              </div>
            )}
          </div>
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
                addNewSlide(slideNumber)
              }}
            >
              Add Slide
            </Button>
            <Button
              disabled={isEditing || totalSlides === 1 || slideNumber === 0}
              onClick={() => {
                removeSlide(slideNumber)
              }}
            >
              Remove Slide
            </Button>
          </ButtonGroup>
        </div>
      </Box>
    )
  else
    return (
      <Box>
        <div className={styles.carouselContainer}>
          <div id={uniqueId} className={styles.carousel}>
            {isEditing ? (
              <div className={styles.carouselText}>
                <textarea
                  className={styles.carouselContent}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value)
                  }}
                />
              </div>
            ) : (
              <div className={styles.carouselText}>
                <p className={styles.carouselContent}>
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
          </div>
          <Image
            src="/logo_white.png"
            alt="awe Logo"
            className={styles.aweLogo}
            width={778}
            height={221}
            style={{ marginTop: "130px" }}
            priority
          />
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
              disabled={defaultContent === content}
              onClick={() => {
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
                addNewSlide(slideNumber)
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
      </Box>
    )
}
