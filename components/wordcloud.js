"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { Text } from "@visx/text"
import { scaleLinear } from "@visx/scale"
import Wordcloud from "@visx/wordcloud/lib/Wordcloud"

export function WordCloud({ data }) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  // Monitoriamo la grandezza del componente genitore
  useEffect(() => {
    if (!containerRef.current) return

    const updateSize = () => {
      setDims({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight || 400 // Altezza di fallback
      })
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  const words = useMemo(() => {
    const text = data?.analysis?.cleanText || ""
    if (!text) return []
    const rawWords = text.split(/\s+/)
    const freqMap = {}
    for (const w of rawWords) {
      if (w.length < 3) continue
      freqMap[w] = (freqMap[w] || 0) + 1
    }
    return Object.keys(freqMap).map((word) => ({
      text: word,
      value: freqMap[word]
    }))
  }, [data])

  const fontScale = useMemo(() => {
    if (words.length === 0) return null
    return scaleLinear({
      domain: [
        Math.min(...words.map((w) => w.value)),
        Math.max(...words.map((w) => w.value))
      ],
      range: [12, dims.width > 500 ? 80 : 40] // Font più piccolo se il contenitore è stretto
    })
  }, [words, dims.width])

  if (words.length === 0 || dims.width === 0)
    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: "300px" }}
    >
      <Wordcloud
        words={words}
        width={dims.width}
        height={dims.height}
        fontSize={(d) => fontScale(d.value)}
        font={"Inter, sans-serif"}
        padding={2}
        spiral="archimedean"
        rotate={0}
        random={() => 0.5}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={`${w.text}-${i}`}
              fill={["#0D47A1", "#1976D2", "#2196F3"][i % 3]}
              textAnchor={"middle"}
              transform={`translate(${w.x}, ${w.y})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
    </div>
  )
}
