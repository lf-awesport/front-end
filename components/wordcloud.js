"use client"

import styles from "./carousel.module.css"
import { useState, useEffect } from "react"
import { CircularProgress, Typography } from "@mui/joy"
import { getWordCloud } from "@/utils/api"
import { Text } from "@visx/text"
import { scaleLog } from "@visx/scale"
import Wordcloud from "@visx/wordcloud/lib/Wordcloud"

export function WordCloud({ postId }) {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [spiralType, setSpiralType] = useState("archimedean")
  const [withRotation, setWithRotation] = useState(false)

  useEffect(() => {
    getWordCloud(postId, (res) => {
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

  const width = 1080
  const height = 450
  const words = wordFreq(data.text.text)
  const colors = ["#0D47A1", "#1976D2", "#2196F3", "#BBDEFB", "#FFFFFF"]
  function wordFreq(text) {
    const words = text.replace(/\./g, "").split(/\s/)
    const freqMap = {}

    for (const w of words) {
      if (!freqMap[w]) freqMap[w] = 0
      freqMap[w] += 1
    }
    return Object.keys(freqMap).map((word) => ({
      text: word,
      value: freqMap[word]
    }))
  }
  function getRotationDegree() {
    const rand = Math.random()
    const degree = rand > 0.5 ? 60 : -60
    return rand * degree
  }
  const fontScale = scaleLog({
    domain: [
      Math.min(...words.map((w) => w.value)),
      Math.max(...words.map((w) => w.value))
    ],
    range: [10, 100]
  })
  const fontSizeSetter = (datum) => fontScale(datum.value)
  const fixedValueGenerator = () => 0.5

  return (
    <div className={styles.sentiment}>
      <Typography level="h2" color="fff" style={{ marginBottom: 20 }}>
        WordCloud
      </Typography>
      <div className="wordcloud">
        <Wordcloud
          words={words}
          width={width}
          height={height}
          fontSize={fontSizeSetter}
          font={"Inter"}
          padding={2}
          spiral={spiralType}
          rotate={withRotation ? getRotationDegree : 0}
          random={fixedValueGenerator}
        >
          {(cloudWords) =>
            cloudWords.map((w, i) => (
              <Text
                key={w.text}
                fill={colors[i % colors.length]}
                textAnchor={"middle"}
                transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                fontSize={w.size}
                fontFamily={w.font}
              >
                {w.text}
              </Text>
            ))
          }
        </Wordcloud>
        <style jsx>{`
          .wordcloud {
            display: flex;
            flex-direction: column;
            user-select: none;
          }
          .wordcloud svg {
            margin: 1rem 0;
            cursor: pointer;
          }

          .wordcloud label {
            display: inline-flex;
            align-items: center;
            font-size: 14px;
            margin-right: 8px;
          }
          .wordcloud textarea {
            min-height: 100px;
          }
        `}</style>
      </div>
    </div>
  )
}
