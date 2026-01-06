"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { Text } from "@visx/text"
import { scaleLinear } from "@visx/scale"
import Wordcloud from "@visx/wordcloud/lib/Wordcloud"

export function WordCloud({ data }) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const updateSize = () => {
      setDims({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight || 450
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
      const word = w.toLowerCase().trim()
      if (word.length < 3) continue
      freqMap[word] = (freqMap[word] || 0) + 1
    }

    return Object.keys(freqMap)
      .map((word) => ({
        text: word,
        value: freqMap[word]
      }))
      .filter((w, index, self) => self.length < 80 || w.value > 1)
      .sort((a, b) => b.value - a.value)
  }, [data])

  // Palette originale blu + arancione per i nomi propri/manager
  const getWordColor = (word, index) => {
    const w = word.toLowerCase()

    // Lista dinamica dei protagonisti (nomi propri e manager)
    const isPerson =
      /sinner|marquez|vlahovic|gherardini|agnelli|elkann|malagò|chivu|lautaro|thuram|marini|ferri|abodi|tudor|sarri|baroni|inzaghi|donadoni|milan|juventus|inter/.test(
        w
      )

    if (isPerson) return "#E65100" // Arancione per i protagonisti

    // Palette Blu originale
    const bluePalette = ["#0D47A1", "#1976D2", "#2196F3"]
    return bluePalette[index % bluePalette.length]
  }

  const fontScale = useMemo(() => {
    if (words.length === 0) return null
    const minFreq = Math.min(...words.map((w) => w.value))
    const maxFreq = Math.max(...words.map((w) => w.value))

    return scaleLinear({
      domain: [minFreq, maxFreq],
      range: [12, dims.width > 200 ? 80 : 40]
    })
  }, [words, dims.width])

  if (words.length === 0 || dims.width === 0)
    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Wordcloud
        words={words}
        width={dims.width}
        height={dims.height}
        fontSize={(d) => fontScale(d.value)}
        font={"Inter, sans-serif"}
        padding={2} // Padding aumentato per maggiore chiarezza
        spiral="archimedean"
        rotate={0}
        random={() => 0.5}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={`${w.text}-${i}`}
              fill={getWordColor(w.text, i)}
              textAnchor={"middle"}
              transform={`translate(${w.x}, ${w.y})`}
              fontSize={w.size}
              fontWeight={w.size > 40 ? 550 : 250}
              fontFamily={w.font}
              style={{ cursor: "default" }}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
    </div>
  )
}
