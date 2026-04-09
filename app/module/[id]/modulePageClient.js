"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import db from "@/utils/firestore"
import Loading from "@/components/loading"
import LessonMindmap from "@/components/lessonMindmap"
import {
  Typography,
  Card,
  CardContent,
  Sheet,
  RadioGroup,
  Radio,
  Box,
  LinearProgress,
  Button,
  Chip
} from "@mui/joy"
import styles from "./modulePageClient.module.css"
import HomeIcon from "@mui/icons-material/Home"
import WestRoundedIcon from "@mui/icons-material/WestRounded"
import EastRoundedIcon from "@mui/icons-material/EastRounded"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"

const EXIT_ANIMATION_MS = 220
const DRAG_HANDLE_SELECTOR = "[data-drag-handle='true']"
const INTERACTIVE_SELECTOR = [
  "button",
  "input",
  "label",
  "textarea",
  "select",
  "a",
  "[role='radio']",
  "[role='button']"
].join(",")

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function splitParagraphs(content) {
  return (content || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function getModuleCards(moduleData) {
  if (Array.isArray(moduleData?.cards)) {
    return moduleData.cards
  }

  return moduleData?.levels?.easy?.cards || []
}

function getLessonTitle(moduleData) {
  return (
    moduleData?.title ||
    moduleData?.levels?.easy?.levelTitle ||
    moduleData?.topic ||
    "News Deck"
  )
}

function getLessonEyebrow(moduleData) {
  return moduleData?.lessonType === "daily-edge"
    ? "Daily Edge"
    : "Daily Press Review"
}

function getLessonModeLabel(moduleData) {
  return moduleData?.framework === "theory-first" ? "Theory-first" : "News"
}

function getLessonSubtitle(moduleData) {
  if (moduleData?.framework === "theory-first") {
    return "Framework first, case second: ogni card parte dal principio manageriale, poi lo traduce nel caso del giorno, poi chiarisce implicazione e trade-off."
  }

  return ""
}

function formatLessonDate(dateString) {
  if (!dateString) return ""

  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateString

  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date)
}

function getSourceGroups(card) {
  return {
    theory: card?.sources?.theory || [],
    news: card?.sources?.news || []
  }
}

function getSourceCountLabel(sourceGroups) {
  const segments = []

  if (sourceGroups.theory.length > 0) {
    segments.push(`${sourceGroups.theory.length} theory`)
  }

  if (sourceGroups.news.length > 0) {
    segments.push(`${sourceGroups.news.length} case`)
  }

  return segments.join(" + ") || "Nessuna fonte"
}

function getCardDisplayModel(card) {
  const explanationParagraphs = splitParagraphs(card?.explanation || card?.content)

  return {
    isV3: Boolean(card?.explanation || card?.theoryAnchor),
    hook: card?.hook || "",
    explanationParagraphs,
    theoryAnchor: card?.theoryAnchor || null,
    caseBrief: card?.caseBrief || "",
    businessImplication: card?.businessImplication || "",
    tradeOff: card?.tradeOff || "",
    decisionFocus: card?.decisionFocus || "",
    managerLens: card?.managerLens || "",
    applicabilityLimits: card?.applicabilityLimits || "",
    learningObjective: card?.learningObjective || ""
  }
}

function buildHighlightPatterns(keywords) {
  if (!keywords?.length) {
    return { highlightPattern: null, highlightCheckPattern: null }
  }

  const source = keywords.map(escapeRegExp).join("|")

  return {
    highlightPattern: new RegExp(`(${source})`, "gi"),
    highlightCheckPattern: new RegExp(source, "i")
  }
}

export default function ModulePageClient() {
  const { id } = useParams()
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [moduleData, setModuleData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [cardIndex, setCardIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isCardTransitioning, setIsCardTransitioning] = useState(false)
  const touchStartXRef = useRef(null)
  const pointerStartXRef = useRef(null)
  const dragPointerIdRef = useRef(null)
  const autoAdvanceTimeoutRef = useRef(null)
  const animationTimeoutRef = useRef(null)

  // Gestione autenticazione
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) return router.push("/login")
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [router])

  // Caricamento dati modulo + progresso
  useEffect(() => {
    if (!user || !id) return

    const ref = doc(db, "learningModules", "Sport Management", "lessons", id)
    getDoc(ref).then((snap) => {
      if (snap.exists()) setModuleData(snap.data())
    })

    const progressRef = doc(db, "learningProgress", user.uid, "modules", id)
    const unsubscribe = onSnapshot(progressRef, (snap) => {
      setProgress(
        snap.exists()
          ? snap.data()
          : {
              answers: { 1: {}, 2: {}, 3: {} },
              completedLevels: []
            }
      )
    })

    return () => unsubscribe()
  }, [user, id])

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current)
      }

      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  const updateProgress = async (level, index, answer) => {
    if (!moduleData || !progress) return

    const newAnswers = {
      ...progress.answers,
      [level]: { ...progress.answers[level], [index]: answer }
    }

    const cards = level === 1 ? getModuleCards(moduleData) : []

    const isFullyAnswered =
      Object.keys(newAnswers[level]).length === cards.length
    const allCorrect = cards.every(
      (card, i) => newAnswers[level][i] === card.quiz.correctAnswer
    )

    const completedLevel = isFullyAnswered && allCorrect
    const completedLevels = new Set(progress.completedLevels)
    if (completedLevel) completedLevels.add(level)

    const updated = {
      ...progress,
      answers: newAnswers,
      completedLevels: Array.from(completedLevels),
      [`level${level}Completed`]: completedLevel
    }

    await setDoc(
      doc(db, "learningProgress", user.uid, "modules", id),
      updated,
      { merge: true }
    )

    const isCorrectAnswer = cards[index]?.quiz.correctAnswer === answer
    const canAdvance = index < cards.length - 1

    if (isCorrectAnswer && canAdvance) {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current)
      }

      autoAdvanceTimeoutRef.current = setTimeout(() => {
        if (cardIndex === index) {
          handleMoveCard("next")
        }
      }, 650)
    }
  }

  if (!user || !moduleData || !progress)
    return <Loading message="Caricamento modulo..." />

  const cards = getModuleCards(moduleData)
  const answers = progress.answers?.[1] || {}
  const currentCard = cards[cardIndex]
  const upcomingCards = cards.slice(cardIndex + 1, cardIndex + 3)
  const cardDisplay = getCardDisplayModel(currentCard)
  const correctCount = Object.entries(answers).filter(
    ([i, val]) => val === cards[i]?.quiz.correctAnswer
  ).length
  const answeredCount = Object.keys(answers).length
  const progressValue = cards.length ? (correctCount / cards.length) * 100 : 0
  const cardTransform = `translate3d(${dragOffset}px, 0, 0) rotate(${dragOffset * 0.04}deg)`
  const swipeOpacity = Math.max(0.72, 1 - Math.abs(dragOffset) / 420)
  const cardTransition = isDragging
    ? "none"
    : `transform ${EXIT_ANIMATION_MS}ms ease, opacity ${EXIT_ANIMATION_MS}ms ease, box-shadow 180ms ease`

  const handleMoveCard = (direction) => {
    if (isCardTransitioning || cards.length === 0) return

    const nextIndex =
      direction === "next"
        ? Math.min(cardIndex + 1, Math.max(cards.length - 1, 0))
        : Math.max(cardIndex - 1, 0)

    if (nextIndex === cardIndex) {
      setDragOffset(0)
      return
    }

    const exitDistance =
      typeof window === "undefined"
        ? 960
        : Math.max(window.innerWidth * 0.92, 540)

    setIsCardTransitioning(true)
    setDragOffset(direction === "next" ? -exitDistance : exitDistance)

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    animationTimeoutRef.current = setTimeout(() => {
      setCardIndex(nextIndex)
      setDragOffset(0)
      setIsCardTransitioning(false)
    }, EXIT_ANIMATION_MS)
  }

  const isInteractiveTarget = (target) => {
    if (!(target instanceof Element)) return false
    return Boolean(target.closest(INTERACTIVE_SELECTOR))
  }

  const isDragHandleTarget = (target) => {
    if (!(target instanceof Element)) return false
    return Boolean(target.closest(DRAG_HANDLE_SELECTOR))
  }

  const lessonTitle = getLessonTitle(moduleData)
  const lessonEyebrow = getLessonEyebrow(moduleData)
  const lessonModeLabel = getLessonModeLabel(moduleData)
  const lessonSubtitle = getLessonSubtitle(moduleData)
  const lessonDateLabel = formatLessonDate(moduleData?.lessonDate)
  const sourceGroups = getSourceGroups(currentCard)
  const sourceCountLabel = getSourceCountLabel(sourceGroups)
  const { highlightPattern, highlightCheckPattern } = buildHighlightPatterns(
    currentCard?.keywords
  )

  const renderHighlightedText = (text) => {
    if (!text) return null
    if (!highlightPattern || !highlightCheckPattern) return text

    const parts = text.split(highlightPattern)

    return parts
      .filter(Boolean)
      .map((part, index) =>
        highlightCheckPattern.test(part) ? (
          <span key={`${part}-${index}`} className={styles.highlightText}>
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )
  }

  const handleTouchStart = (event) => {
    if (isCardTransitioning) return
    if (isInteractiveTarget(event.target)) return

    setIsDragging(true)
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchMove = (event) => {
    if (touchStartXRef.current == null) return

    const currentX = event.touches[0]?.clientX ?? touchStartXRef.current
    setDragOffset(currentX - touchStartXRef.current)
  }

  const handleTouchEnd = (event) => {
    if (touchStartXRef.current == null) return

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartXRef.current
    const deltaX = touchEndX - touchStartXRef.current
    touchStartXRef.current = null
    setIsDragging(false)

    if (Math.abs(deltaX) < 50) {
      setDragOffset(0)
      return
    }

    if (deltaX < 0) {
      handleMoveCard("next")
      return
    }

    handleMoveCard("prev")
  }

  const handlePointerDown = (event) => {
    if (isCardTransitioning) return
    if (isInteractiveTarget(event.target)) return
    if (event.pointerType === "mouse" && !isDragHandleTarget(event.target)) {
      return
    }

    setIsDragging(true)
    pointerStartXRef.current = event.clientX
    dragPointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (pointerStartXRef.current == null) return
    if (dragPointerIdRef.current !== event.pointerId) return

    setDragOffset(event.clientX - pointerStartXRef.current)
  }

  const handlePointerEnd = (event) => {
    if (dragPointerIdRef.current !== event.pointerId) return

    const deltaX =
      pointerStartXRef.current == null ? 0 : event.clientX - pointerStartXRef.current

    pointerStartXRef.current = null
    dragPointerIdRef.current = null
    setIsDragging(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (Math.abs(deltaX) < 90) {
      setDragOffset(0)
      return
    }

    if (deltaX < 0) {
      handleMoveCard("next")
      return
    }

    handleMoveCard("prev")
  }

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} />

      <Box className={styles.shell}>
        <Box className={styles.topbar}>
          <Button
            variant="soft"
            color="primary"
            startDecorator={<HomeIcon />}
            onClick={() => router.push("/")}
            sx={{ borderRadius: 999 }}
          >
            Home
          </Button>

          <Chip color="primary" variant="soft" sx={{ borderRadius: 999 }}>
            {lessonModeLabel}
          </Chip>
        </Box>

        <Box className={styles.hero}>
          <Sheet className={styles.heroPrimary} variant="plain">
            <Typography className={styles.eyebrow}>{lessonEyebrow}</Typography>
            <Typography level="h1" className={styles.title}>
              {lessonTitle}
            </Typography>

            {lessonSubtitle ? (
              <Typography className={styles.subtitle}>{lessonSubtitle}</Typography>
            ) : null}

            <div className={styles.heroMetaRow}>
              {lessonDateLabel ? (
                <Chip variant="soft" color="neutral" sx={{ borderRadius: 999 }}>
                  {lessonDateLabel}
                </Chip>
              ) : null}
              {moduleData?.voiceProfile ? (
                <Chip variant="soft" color="warning" sx={{ borderRadius: 999 }}>
                  Eddy Mode
                </Chip>
              ) : null}
              <Chip variant="soft" color="primary" sx={{ borderRadius: 999 }}>
                {cards.length} cards curate
              </Chip>
            </div>
          </Sheet>

          <Sheet className={styles.heroSecondary} variant="soft">
            <div className={styles.heroSpotlightHeader}>
              <Typography className={styles.signalLabel}>Now Reading</Typography>
              <span className={styles.heroSpotlightIndex}>
                {String(cardIndex + 1).padStart(2, "0")}
              </span>
            </div>
            <Typography className={styles.heroSpotlightTitle}>
              {currentCard?.title}
            </Typography>
            {cardDisplay.decisionFocus ? (
              <Typography className={styles.heroSpotlightText}>
                {cardDisplay.decisionFocus}
              </Typography>
            ) : null}

            <div className={styles.heroMetricGrid}>
              <div className={styles.heroMetricCard}>
                <span className={styles.heroMetricLabel}>Completamento</span>
                <strong>{Math.round(progressValue)}%</strong>
              </div>
              <div className={styles.heroMetricCard}>
                <span className={styles.heroMetricLabel}>Quiz risolti</span>
                <strong>{answeredCount} / {cards.length}</strong>
              </div>
              <div className={styles.heroMetricCard}>
                <span className={styles.heroMetricLabel}>Corrette</span>
                <strong>{correctCount} / {cards.length}</strong>
              </div>
            </div>
            <LinearProgress determinate value={progressValue} sx={{ mt: 1.5 }} />
          </Sheet>
        </Box>

        {cards.length === 0 ? (
          <Card className={styles.emptyState} variant="outlined">
            <CardContent>
              <Typography level="title-lg">Nessuna card disponibile</Typography>
              <Typography>
                La lezione non contiene ancora contenuti da mostrare per questa giornata.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box className={styles.deckSection}>
            <Box className={styles.deckMeta}>
              <Chip variant="solid" color="primary" sx={{ borderRadius: 999 }}>
                Card {cardIndex + 1}
              </Chip>
            </Box>

            <Box className={styles.deckWrap}>
              <div className={styles.stackShadowOne} />
              <div className={styles.stackShadowTwo} />

              {upcomingCards.map((previewCard, previewIndex) => (
                <div
                  key={`${cardIndex + previewIndex + 1}-${previewCard.title}`}
                  className={
                    previewIndex === 0
                      ? styles.previewCardPrimary
                      : styles.previewCardSecondary
                  }
                >
                  <div className={styles.previewGlow} />
                  <div className={styles.previewInner}>
                    <span className={styles.previewIndex}>
                      {String(cardIndex + previewIndex + 2).padStart(2, "0")}
                    </span>
                    <strong className={styles.previewTitle}>{previewCard.title}</strong>
                  </div>
                </div>
              ))}

              <Card
                key={cardIndex}
                className={styles.lessonCard}
                variant="outlined"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                style={{
                  transform: cardTransform,
                  opacity: swipeOpacity,
                  transition: cardTransition
                }}
              >
                <CardContent className={styles.lessonCardContent}>
                  <Box className={styles.cardHeader}>
                    <div className={styles.cardHeaderMeta}>
                      <Chip
                        startDecorator={<LocalFireDepartmentRoundedIcon />}
                        color="warning"
                        variant="soft"
                        sx={{ borderRadius: 999 }}
                      >
                        Topic {cardIndex + 1}
                      </Chip>
                      {answers[cardIndex] === currentCard?.quiz.correctAnswer ? (
                        <Chip
                          startDecorator={<CheckCircleRoundedIcon />}
                          color="success"
                          variant="soft"
                          sx={{ borderRadius: 999 }}
                        >
                          Completata
                        </Chip>
                      ) : null}
                    </div>

                    <div
                      className={styles.dragHandle}
                      data-drag-handle="true"
                      aria-label="Trascina la card"
                      title="Trascina la card"
                    >
                      <span className={styles.dragHandleDots} aria-hidden="true" />
                      <span className={styles.dragHandleLabel}>Drag</span>
                    </div>
                  </Box>

                  <div className={styles.cardCanvas}>
                    <Box className={styles.mainColumn}>
                      <Box className={styles.readingBlock}>
                        <div className={styles.titleCluster}>
                          <Typography className={styles.sectionEyebrow}>
                            Briefing
                          </Typography>
                          <Typography level="h2" className={styles.cardTitle}>
                            {currentCard?.title}
                          </Typography>

                          <div className={styles.titleMetaRow}>
                            <span className={styles.metaPill}>{sourceCountLabel}</span>
                            {cardDisplay.learningObjective ? (
                              <span className={styles.metaPillMuted}>Focus didattico attivo</span>
                            ) : null}
                          </div>
                        </div>

                        {cardDisplay.hook ? (
                          <Sheet className={styles.hookCard} variant="plain">
                            <Typography className={styles.contextLabel}>Hook</Typography>
                            <Typography className={styles.contextParagraph}>
                              {renderHighlightedText(cardDisplay.hook)}
                            </Typography>
                          </Sheet>
                        ) : null}

                        {cardDisplay.isV3 ? (
                          <div className={styles.signalGrid}>
                            {cardDisplay.theoryAnchor ? (
                              <Sheet className={styles.signalCard} variant="plain">
                                <Typography className={styles.signalLabel}>
                                  Theory Anchor
                                </Typography>
                                <Typography className={styles.signalMeta}>
                                  {cardDisplay.theoryAnchor.subjectName}
                                </Typography>
                                <Typography className={styles.signalValue}>
                                  {renderHighlightedText(cardDisplay.theoryAnchor.concept)}
                                </Typography>
                                {cardDisplay.theoryAnchor.whyItApplies ? (
                                  <Typography className={styles.cardParagraph}>
                                    {renderHighlightedText(
                                      cardDisplay.theoryAnchor.whyItApplies
                                    )}
                                  </Typography>
                                ) : null}
                              </Sheet>
                            ) : null}

                            {cardDisplay.caseBrief ? (
                              <Sheet className={styles.signalCard} variant="plain">
                                <Typography className={styles.signalLabel}>
                                  Case Brief
                                </Typography>
                                <Typography className={styles.signalValue}>
                                  {renderHighlightedText(cardDisplay.caseBrief)}
                                </Typography>
                              </Sheet>
                            ) : null}

                            {cardDisplay.businessImplication ? (
                              <Sheet className={styles.signalCard} variant="plain">
                                <Typography className={styles.signalLabel}>
                                  Business Implication
                                </Typography>
                                <Typography className={styles.signalValue}>
                                  {renderHighlightedText(cardDisplay.businessImplication)}
                                </Typography>
                              </Sheet>
                            ) : null}

                            {cardDisplay.tradeOff ? (
                              <Sheet className={styles.signalCard} variant="plain">
                                <Typography className={styles.signalLabel}>
                                  Trade-off
                                </Typography>
                                <Typography className={styles.signalValue}>
                                  {renderHighlightedText(cardDisplay.tradeOff)}
                                </Typography>
                              </Sheet>
                            ) : null}
                          </div>
                        ) : null}

                        {cardDisplay.explanationParagraphs.length > 0 ? (
                          <Sheet className={styles.contentCard} variant="plain">
                            <Typography className={styles.contextLabel}>
                              {cardDisplay.isV3 ? "Explanation" : "Analisi"}
                            </Typography>

                            <div className={styles.cardBody}>
                              {cardDisplay.explanationParagraphs.map((paragraph, paragraphIndex) => (
                                <Typography key={paragraphIndex} className={styles.cardParagraph}>
                                  {renderHighlightedText(paragraph)}
                                </Typography>
                              ))}
                            </div>
                          </Sheet>
                        ) : null}
                      </Box>
                    </Box>

                    <aside className={styles.sideColumn}>
                      <Sheet className={styles.railPanel} variant="plain">
                        <Typography className={styles.signalLabel}>Decision Focus</Typography>
                        <Typography className={styles.railHeadline}>
                          {cardDisplay.decisionFocus || "Manca ancora un focus esplicito."}
                        </Typography>
                        {cardDisplay.managerLens ? (
                          <Typography className={styles.railBody}>
                            {renderHighlightedText(cardDisplay.managerLens)}
                          </Typography>
                        ) : null}
                      </Sheet>

                      {cardDisplay.learningObjective ? (
                        <Sheet className={styles.railPanelSoft} variant="plain">
                          <Typography className={styles.signalLabel}>Learning Objective</Typography>
                          <Typography className={styles.railBody}>
                            {renderHighlightedText(cardDisplay.learningObjective)}
                          </Typography>
                        </Sheet>
                      ) : null}

                      {currentCard?.keywords?.length ? (
                        <Sheet className={styles.railPanelSoft} variant="plain">
                          <Typography className={styles.signalLabel}>Key Signals</Typography>
                          <div className={styles.keywordRowCompact}>
                            {currentCard.keywords.map((keyword, keywordIndex) => (
                              <Chip
                                key={`${keyword}-${keywordIndex}`}
                                variant="soft"
                                color="primary"
                                sx={{ borderRadius: 999 }}
                              >
                                {keyword}
                              </Chip>
                            ))}
                          </div>
                        </Sheet>
                      ) : null}

                      {cardDisplay.isV3 && (sourceGroups.theory.length > 0 || sourceGroups.news.length > 0) ? (
                        <details className={styles.sourceDisclosure}>
                          <summary className={styles.sourceSummaryButton}>
                            <div>
                              <Typography className={styles.signalLabel}>Sources</Typography>
                              <Typography className={styles.sourceSummaryText}>
                                {sourceCountLabel}
                              </Typography>
                            </div>
                            <span className={styles.sourceSummaryAction}>Apri</span>
                          </summary>

                          <div className={styles.sourceCompactGrid}>
                            {sourceGroups.theory.map((source) => (
                              <div key={source.sourceId} className={styles.sourceCompactItem}>
                                <span className={styles.sourceTypeBadge}>Theory</span>
                                <div className={styles.sourceCompactBody}>
                                  <Typography className={styles.sourceCompactTitle}>
                                    {source.subjectName}
                                  </Typography>
                                  <Typography className={styles.sourceCompactMeta}>
                                    {[source.lessonCode, source.title].filter(Boolean).join(" · ")}
                                  </Typography>
                                </div>
                              </div>
                            ))}

                            {sourceGroups.news.map((source) => (
                              <div key={source.sourceId} className={styles.sourceCompactItem}>
                                <span className={styles.sourceTypeBadgeNews}>Case</span>
                                <div className={styles.sourceCompactBody}>
                                  {source.url ? (
                                    <a
                                      className={styles.sourceCompactLink}
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {source.title || "News source"}
                                    </a>
                                  ) : (
                                    <Typography className={styles.sourceCompactTitle}>
                                      {source.title || "News source"}
                                    </Typography>
                                  )}
                                  {source.date ? (
                                    <Typography className={styles.sourceCompactMeta}>
                                      {formatLessonDate(source.date)}
                                    </Typography>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      ) : null}

                      {cardDisplay.applicabilityLimits &&
                      cardDisplay.applicabilityLimits !== cardDisplay.tradeOff ? (
                        <Sheet className={styles.railPanelSoft} variant="plain">
                          <Typography className={styles.signalLabel}>Applicability Limits</Typography>
                          <Typography className={styles.railBody}>
                            {renderHighlightedText(cardDisplay.applicabilityLimits)}
                          </Typography>
                        </Sheet>
                      ) : null}

                      <LessonMindmap
                        card={currentCard}
                        cardIndex={cardIndex}
                        selectedAnswer={answers[cardIndex] || ""}
                      />
                    </aside>
                  </div>

                  <Sheet className={styles.quizBlock} variant="soft">
                    <Typography className={styles.sectionEyebrow}>
                      Quick Quiz
                    </Typography>

                    <Typography level="title-md" className={styles.quizTitle}>
                      {currentCard?.quiz?.question}
                    </Typography>

                    <RadioGroup
                      value={answers[cardIndex] || ""}
                      onChange={(event) =>
                        updateProgress(1, cardIndex, event.target.value)
                      }
                      sx={{ mt: 1.5, gap: 1.25 }}
                    >
                      {currentCard?.quiz?.options?.map((option, optionIndex) => (
                        <Radio
                          key={optionIndex}
                          value={option}
                          label={option}
                          disableIcon
                          disabled={answers[cardIndex] === currentCard?.quiz?.correctAnswer}
                          sx={{
                            p: 1.4,
                            borderRadius: "18px",
                            border: "1px solid rgba(19, 53, 145, 0.12)",
                            background: "rgba(255,255,255,0.82)",
                            transition: "none",
                            "&:hover": {
                              background: "rgba(255,255,255,0.82)"
                            },
                            "&::before": {
                              display: "none"
                            }
                          }}
                        />
                      ))}
                    </RadioGroup>

                    {answers[cardIndex] ? (
                      <Typography
                        className={styles.answerState}
                        sx={{
                          color:
                            answers[cardIndex] === currentCard?.quiz?.correctAnswer
                              ? "#0b8f5a"
                              : "#c2410c"
                        }}
                      >
                        {answers[cardIndex] === currentCard?.quiz?.correctAnswer
                          ? cardIndex === cards.length - 1
                            ? "Risposta corretta. Hai completato l'ultima card."
                            : "Risposta corretta. Avanzo automaticamente alla prossima card."
                          : "Risposta errata. Rileggi la card e riprova."}
                      </Typography>
                    ) : null}
                  </Sheet>
                </CardContent>
              </Card>
            </Box>

            <Box className={styles.controls}>
              <Button
                variant="soft"
                color="neutral"
                startDecorator={<WestRoundedIcon />}
                onClick={() => handleMoveCard("prev")}
                disabled={cardIndex === 0 || isCardTransitioning}
                sx={{ borderRadius: 999 }}
              >
                Precedente
              </Button>

              <div className={styles.pagination}>
                {cards.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Vai alla card ${index + 1}`}
                    className={index === cardIndex ? styles.paginationDotActive : styles.paginationDot}
                    onClick={() => setCardIndex(index)}
                  />
                ))}
              </div>

              <Button
                variant="solid"
                color="primary"
                endDecorator={<EastRoundedIcon />}
                onClick={() => handleMoveCard("next")}
                disabled={cardIndex === cards.length - 1 || isCardTransitioning}
                sx={{ borderRadius: 999 }}
              >
                Successiva
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </main>
  )
}
