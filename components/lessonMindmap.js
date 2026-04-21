"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import styles from "./lessonMindmap.module.css"

const DEFAULT_V2_QUADRANTS = [
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

const DEFAULT_V3_CHECKPOINTS = [
  {
    label: "Meccanismo",
    fallback: "Isola il framework che governa il caso.",
    value: 86,
    icon: "mingcute/diamond-2-fill"
  },
  {
    label: "Perche conta",
    fallback: "Traduci il framework in implicazione manageriale.",
    value: 89,
    icon: "mingcute/chart-line-line"
  },
  {
    label: "Rischio",
    fallback: "Metti a fuoco il costo o il limite della scelta.",
    value: 84,
    icon: "mingcute/flash-fill"
  },
  {
    label: "Cue esame",
    fallback: "Porta il concetto su un altro caso o sul quiz.",
    value: 82,
    icon: "mingcute/rocket-line"
  }
]

const STUDY_SUPPORT_ORDER = [
  "what_happened",
  "business_move",
  "impact",
  "remember"
]

const V3_CHECKPOINT_ORDER = ["Meccanismo", "Perche conta", "Rischio", "Cue esame"]

const INFOGRAPHIC_THEME = {
  colorBg: "#00000000",
  palette: ["#0a2f8f", "#1397d6", "#1fb383", "#f59f00"],
  colorText: "#10204f",
  colorTextSecondary: "#35507d",
  base: {
    text: {
      "font-family": "Inter, sans-serif",
      "font-size": 9,
      fill: "#10204f",
      color: "#10204f"
    }
  }
}

const MAX_DIAGRAM_TITLE_LENGTH = 24
const MAX_DIAGRAM_DESC_LENGTH = 96

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

function getStudySnippet(text, maxLength = MAX_DIAGRAM_DESC_LENGTH) {
  const normalized = (text || "").replace(/[\n\r]+/g, " ").trim()
  if (!normalized) return ""

  const sentence = normalized.split(/(?<=[.!?])\s+/)[0]?.trim() || normalized
  return sanitizeSyntaxText(sentence, maxLength)
}

function toQuadrantItem(item, fallback, includeIllus = false) {
  return {
    label: sanitizeSyntaxText(item.label || fallback.label, MAX_DIAGRAM_TITLE_LENGTH),
    desc: getStudySnippet(item.text || item.desc || item.description || fallback.fallback),
    value: typeof item.value === "number" ? item.value : fallback.value,
    icon: item.icon || fallback.icon,
    ...(includeIllus ? { illus: item.illus || "" } : {})
  }
}

function getQuadrantItems(card, selectedAnswer) {
  if (!card) return []

  const isV3 = Boolean(card.explanation || card.theoryAnchor)
  const v3Checkpoints = card.studySupport?.checkpoints
  const studySupportQuadrants = card.studySupport?.quadrants
  const paragraphs = getParagraphs(card.explanation || card.content)
  const rawNodes = card.diagramSpec?.nodes || []

  if (v3Checkpoints?.length === 4) {
    return V3_CHECKPOINT_ORDER.map((label, index) => {
      const checkpoint = v3Checkpoints.find((item) => item.label === label) || {}
      return toQuadrantItem(checkpoint, DEFAULT_V3_CHECKPOINTS[index], true)
    })
  }

  if (studySupportQuadrants?.length === 4) {
    return [...studySupportQuadrants]
      .sort(
        (left, right) =>
          STUDY_SUPPORT_ORDER.indexOf(left.slot) -
          STUDY_SUPPORT_ORDER.indexOf(right.slot)
      )
      .map((quadrant, index) =>
        toQuadrantItem(quadrant, DEFAULT_V2_QUADRANTS[index], true)
      )
  }

  if (rawNodes.length >= 4) {
    return rawNodes
      .slice(0, 4)
      .map((node, index) => toQuadrantItem(node, DEFAULT_V2_QUADRANTS[index], true))
  }

  const fallbacks = isV3 ? DEFAULT_V3_CHECKPOINTS : DEFAULT_V2_QUADRANTS

  return fallbacks.map((item, index) => {
    const paragraph = paragraphs[index]
    const v3Fallbacks = [
      card.theoryAnchor?.concept || card.decisionFocus,
      card.managerLens || card.businessImplication,
      card.applicabilityLimits || card.tradeOff,
      selectedAnswer
        ? `Risposta scelta: ${selectedAnswer}`
        : card.learningObjective || card.quiz?.question
    ]
    const fallbackText = isV3
      ? v3Fallbacks[index] || paragraph || item.fallback
      : index === DEFAULT_V2_QUADRANTS.length - 1 && selectedAnswer
        ? `Risposta scelta: ${selectedAnswer}`
        : paragraph || item.fallback

    return {
      ...toQuadrantItem({ desc: fallbackText }, item),
      label: item.label
    }
  })
}

function buildInfographicSyntax(items) {
  if (!items.length) return ""

  return [
    "infographic quadrant-quarter-circular",
    "data",
    "  compares",
    ...items.flatMap((item) => [
      `    - label ${sanitizeSyntaxText(item.label, MAX_DIAGRAM_TITLE_LENGTH)}`,
      `      value ${item.value}`,
      `      desc ${sanitizeSyntaxText(item.desc, MAX_DIAGRAM_DESC_LENGTH)}`,
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

  const syntax = useMemo(() => buildInfographicSyntax(quadrantItems), [quadrantItems])

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