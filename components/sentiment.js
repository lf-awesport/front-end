"use client"

import styles from "./carousel.module.css"
import { useState, useEffect } from "react"
import { CircularProgress, Typography } from "@mui/joy"
import { getSentimentAnalysis } from "@/utils/api"
import { Pie } from "@visx/shape"
import { Group } from "@visx/group"

export function Sentiment({ postId }) {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    getSentimentAnalysis(postId, (res) => {
      setData(res.data)
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

  const values = Object.keys(data.analysis).map((e) => ({
    sentiment: e,
    frequency: data.analysis[e].percentuale,
    explanation: data.analysis[e].spiegazione
  }))
  const getFrequency = (e) => e.frequency
  const width = 350
  const height = 350
  const margin = { top: 20, right: 20, bottom: 20, left: 20 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const radius = Math.min(innerWidth, innerHeight) / 2
  const centerY = innerHeight / 2
  const centerX = innerWidth / 2
  const top = centerY + margin.top
  const left = centerX + margin.left
  const pieSortValues = (a, b) => b - a
  function getEmotionColor(emotion) {
    const emotionColors = {
      gioia: "#FFD700", // Gold for Joy (Gioia)
      tristezza: "#1E90FF", // DodgerBlue for Sadness (Tristezza)
      rabbia: "#FF4500", // OrangeRed for Anger (Rabbia)
      paura: "#8B008B" // DarkMagenta for Fear (Paura)
    }
    return emotionColors[emotion.toLowerCase()] || "#000000" // Default to black if emotion is not found
  }

  return (
    <div className={styles.sentiment}>
      <Typography level="h2" color="fff" style={{ marginBottom: 20 }}>
        Sentimento
      </Typography>
      <div className={styles.chart}>
        <svg width={width} height={height}>
          <Group top={top} left={left}>
            <Pie
              data={values}
              pieValue={getFrequency}
              pieSortValues={pieSortValues}
              outerRadius={radius}
              padAngle="0.05"
              stroke="#fff"
            >
              {(pie) => {
                return pie.arcs.map((arc, index) => {
                  const { sentiment } = arc.data
                  const [centroidX, centroidY] = pie.path.centroid(arc)
                  const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1
                  const arcPath = pie.path(arc)
                  const arcFill = getEmotionColor(sentiment)
                  return (
                    <g key={`arc-${sentiment}-${index}`}>
                      <path d={arcPath} fill={arcFill} />
                      {hasSpaceForLabel && (
                        <text
                          x={centroidX}
                          y={centroidY}
                          dy=".13em"
                          fill="#000"
                          fontSize={11}
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {sentiment}
                        </text>
                      )}
                    </g>
                  )
                })
              }}
            </Pie>
          </Group>
        </svg>
        <div className={styles.explanationContainer}>
          {values.map((e) => (
            <div className={styles.emotion} key={e.sentiment}>
              <p className={styles.explanation}>
                <span
                  style={{ color: getEmotionColor(e.sentiment) }}
                  className={styles.sentimentLabel}
                >
                  {e.sentiment}
                </span>
                : {e.frequency}%
              </p>
              <p className={styles.explanation}>{e.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
