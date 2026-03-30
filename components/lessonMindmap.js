"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Chip, Typography } from "@mui/joy"
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded"
import styles from "./lessonMindmap.module.css"

const DEFAULT_QUADRANTS = [
  {
    label: "Cosa succede",
    fallback: "Il contesto chiave della notizia.",
    value: 78,
    icon: "mingcute/diamond-2-fill"
  },
  {
    label: "Mossa business",
    fallback: "La mossa strategica o decisione principale.",
    value: 86,
    icon: "mingcute/code-fill"
  },
  {
    label: "Impatto",
    fallback: "L'impatto economico o competitivo da ricordare.",
    value: 89,
    icon: "mingcute/wallet-4-line"
  },
  {
    label: "Da ricordare",
    fallback: "Il punto che devi saper riconoscere nel quiz.",
    value: 82,
    icon: "mingcute/rocket-line"
  }
]

const INFOGRAPHIC_THEME = {
  colorBg: "#00000000",
  palette: ["#0a2f8f", "#1397d6", "#1fb383", "#f59f00"],
  colorText: "#10204f",
  colorTextSecondary: "#35507d",
  base: {
    text: {
      "font-family": "Inter, sans-serif",
      fill: "#10204f",
      color: "#10204f"
    }
  }
}

function clampText(text, maxLength) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}…`
}

function getParagraphs(content) {
  return (content || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function sanitizeSyntaxText(text, maxLength = 120) {
  return clampText(text || "", maxLength)
    .replace(/[\n\r]+/g, " ")
    .replace(/[:]/g, " -")
    .replace(/"/g, "'")
    .trim()
}

function getStudySnippet(text, maxLength = 72) {
  const normalized = (text || "").replace(/[\n\r]+/g, " ").trim()
  if (!normalized) return ""

  const sentence = normalized.split(/(?<=[.!?])\s+/)[0]?.trim() || normalized
  return sanitizeSyntaxText(sentence, maxLength)
}

function getQuadrantItems(card, selectedAnswer) {
  if (!card) return []

  const paragraphs = getParagraphs(card.content)
  const rawNodes = card.diagramSpec?.nodes || []

  if (rawNodes.length >= 4) {
    return rawNodes.slice(0, 4).map((node, index) => ({
      label: sanitizeSyntaxText(node.label || DEFAULT_QUADRANTS[index].label, 40),
      desc: getStudySnippet(node.description || "", 76),
      value:
        typeof node.value === "number" ? node.value : DEFAULT_QUADRANTS[index].value,
      icon: node.icon || DEFAULT_QUADRANTS[index].icon,
      illus: node.illus || ""
    }))
  }

  return DEFAULT_QUADRANTS.map((item, index) => {
    const paragraph = paragraphs[index]
    const fallbackText =
      index === DEFAULT_QUADRANTS.length - 1 && selectedAnswer
        ? `Risposta scelta: ${selectedAnswer}`
        : paragraph || item.fallback

    return {
      label: item.label,
      desc: getStudySnippet(fallbackText, 76),
      value: item.value,
      icon: item.icon
    }
  })
}

function buildInfographicSyntax(title, items) {
  if (!items.length) return ""

  return [
    "infographic quadrant-quarter-circular",
    "data",
    `  title ${sanitizeSyntaxText(title || "Study quadrants", 80)}`,
    "  compares",
    ...items.flatMap((item) => [
      `    - label ${sanitizeSyntaxText(item.label, 44)}`,
      `      value ${item.value}`,
      `      desc ${sanitizeSyntaxText(item.desc, 76)}`,
      `      icon ${item.icon}`,
      ...(item.illus ? [`      illus ${item.illus}`] : [])
    ])
    ,
    "theme light",
    "  palette antv"
  ].join("\n")
}

function renderFallbackQuadrants(items) {
  return (
    <div className={styles.quadrantGrid}>
      {items.map((item, index) => (
        <article key={`${item.label}-${index}`} className={styles.quadrantCard}>
          <span className={styles.quadrantIndex}>{String(index + 1).padStart(2, "0")}</span>
          <strong className={styles.quadrantLabel}>{item.label}</strong>
          <p className={styles.quadrantText}>{item.desc}</p>
        </article>
      ))}
    </div>
  )
}

export default function LessonMindmap({ card, cardIndex, selectedAnswer }) {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)
  const [renderMode, setRenderMode] = useState("fallback")

  const quadrantItems = useMemo(
    () => getQuadrantItems(card, selectedAnswer),
    [card, selectedAnswer]
  )

  const title = card?.diagramSpec?.title || "Study quadrants"

  const syntax = useMemo(
    () => buildInfographicSyntax(title, quadrantItems),
    [title, quadrantItems]
  )

  useEffect(() => {
    let disposed = false

    async function renderInfographic() {
      if (!containerRef.current || !syntax) {
        setRenderMode("fallback")
        return
      }

      try {
        const { Infographic } = await import("@antv/infographic")

        if (disposed || !containerRef.current) {
          return
        }

        if (!instanceRef.current) {
          instanceRef.current = new Infographic({
            container: containerRef.current,
            width: "100%",
            height: 360,
            padding: 8,
            editable: false,
            themeConfig: INFOGRAPHIC_THEME
          })
        }

        await instanceRef.current.render(syntax)

        if (!disposed) {
          setRenderMode("antv")
        }
      } catch {
        if (!disposed) {
          setRenderMode("fallback")
        }
      }
    }

    setRenderMode("loading")
    renderInfographic()

    return () => {
      disposed = true
    }
  }, [syntax])

  if (!card) return null

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <Chip
          startDecorator={<GridViewRoundedIcon />}
          color="primary"
          variant="soft"
          sx={{ borderRadius: 999 }}
        >
          Quadrants • Card {cardIndex + 1}
        </Chip>
      </div>

      <div className={styles.mapSurface}>
        <div className={styles.diagramCanvas}>
          <div
            ref={containerRef}
            className={`${styles.antvCanvas} ${renderMode === "antv" ? styles.antvCanvasVisible : ""}`}
          />

          {renderMode !== "antv" ? renderFallbackQuadrants(quadrantItems) : null}
        </div>
      </div>
    </section>
  )
}