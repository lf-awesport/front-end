"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import db from "@/utils/firestore"
import { buildPdfFileName, exportElementAsPdf } from "@/utils/pdfExport"
import ModulePdfExport from "./modulePdfExport"
import {
  listenToLessonFeedback,
  upsertLessonFeedback
} from "@/utils/api"
import {
  getArrayOrEmpty,
  getCardDisplayModel,
  getCaseStudyCoverImageAlt,
  getCaseStudyCoverImageUrl,
  getCaseStudyFrameworkCountLabel,
  getCaseStudyFrameworks,
  getCaseStudySections,
  getCaseStudySourceSummaryLabel,
  getCaseStudyTheorySources,
  getLessonEyebrow,
  getLessonModeLabel,
  getLessonSubtitle,
  getLessonTitle,
  getModuleFeedbackTargets,
  getSourceCountLabel,
  getSourceGroups,
  formatLessonDate
} from "./moduleDataHelpers"
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
  Chip,
  Option,
  Select,
  Textarea
} from "@mui/joy"
import styles from "./modulePageClient.module.css"
import HomeIcon from "@mui/icons-material/Home"
import WestRoundedIcon from "@mui/icons-material/WestRounded"
import EastRoundedIcon from "@mui/icons-material/EastRounded"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded"

const EXIT_ANIMATION_MS = 220
const LESSON_COLLECTION = "lessons"
const CASE_STUDY_LESSON_COLLECTION = "caseStudyLessons"
const MODULE_COLLECTIONS = [LESSON_COLLECTION, CASE_STUDY_LESSON_COLLECTION]
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

function createEmptyProgress() {
  return {
    answers: { 1: {}, 2: {}, 3: {} },
    completedLevels: []
  }
}

function getModulePdfFileName(moduleData) {
  const isCaseStudyLesson = moduleData?.type === "case-study-lesson"
  const title = isCaseStudyLesson ? moduleData?.title : getLessonTitle(moduleData)
  const fallbackTitle = isCaseStudyLesson ? "case-study-lesson" : "lesson"

  return buildPdfFileName(title, moduleData?.lessonDate, fallbackTitle)
}

function getLearningModuleRef(moduleId, collectionName) {
  return doc(db, "learningModules", "Sport Management", collectionName, moduleId)
}

async function getModuleData(moduleId) {
  for (const collectionName of MODULE_COLLECTIONS) {
    const moduleSnap = await getDoc(getLearningModuleRef(moduleId, collectionName))

    if (moduleSnap.exists()) {
      return {
        id: moduleSnap.id,
        collectionName,
        ...moduleSnap.data()
      }
    }
  }

  return null
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function getModuleCards(moduleData) {
  if (Array.isArray(moduleData?.cards)) {
    return moduleData.cards
  }

  return moduleData?.levels?.easy?.cards || []
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

function ExportActionButton({ isBusy, onExport }) {
  return (
    <Button
      variant="solid"
      color="primary"
      startDecorator={<PictureAsPdfRoundedIcon />}
      onClick={onExport}
      disabled={isBusy}
      sx={{ borderRadius: 999 }}
    >
      {isBusy ? "Esporto PDF..." : "Esporta PDF"}
    </Button>
  )
}

function SourceCompactItem({ badge, badgeClassName, title, meta, href }) {
  return (
    <div className={styles.sourceCompactItem}>
      <span className={badgeClassName}>{badge}</span>
      <div className={styles.sourceCompactBody}>
        {href ? (
          <a
            className={styles.sourceCompactLink}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {title}
          </a>
        ) : (
          <Typography className={styles.sourceCompactTitle}>{title}</Typography>
        )}

        {meta ? <Typography className={styles.sourceCompactMeta}>{meta}</Typography> : null}
      </div>
    </div>
  )
}

function getAnswerStateMessage(answer, correctAnswer, isLastCard) {
  if (!answer) {
    return ""
  }

  if (answer !== correctAnswer) {
    return "Risposta errata. Rileggi la card e riprova."
  }

  if (isLastCard) {
    return "Risposta corretta. Hai completato l'ultima card."
  }

  return "Risposta corretta. Avanzo automaticamente alla prossima card."
}

function createEmptyFeedbackDraft() {
  return {
    overallRating: "",
    overallSuggestion: "",
    sectionFeedback: []
  }
}

function createSectionFeedbackEntry(target = null) {
  return {
    targetKey: target?.targetKey || "",
    targetType: target?.targetType || "",
    label: target?.label || "",
    suggestion: ""
  }
}

function buildFeedbackDraft(feedbackDoc, feedbackTargets) {
  if (!feedbackDoc) {
    return createEmptyFeedbackDraft()
  }

  const targetsByKey = new Map(
    feedbackTargets.map((target) => [target.targetKey, target])
  )

  return {
    overallRating: feedbackDoc?.overallRating ? String(feedbackDoc.overallRating) : "",
    overallSuggestion:
      typeof feedbackDoc?.overallSuggestion === "string"
        ? feedbackDoc.overallSuggestion
        : "",
    sectionFeedback: Array.isArray(feedbackDoc?.sectionFeedback)
      ? feedbackDoc.sectionFeedback
          .map((entry) => {
            const target = targetsByKey.get(entry.targetKey)

            return {
              targetKey: entry.targetKey || "",
              targetType: target?.targetType || entry.targetType || "",
              label: target?.label || entry.label || "",
              suggestion: typeof entry.suggestion === "string" ? entry.suggestion : ""
            }
          })
          .filter((entry) => entry.targetKey && entry.label)
      : []
  }
}

function getAvailableFeedbackTargets(feedbackTargets, sectionFeedback, currentTargetKey = "") {
  const usedTargets = new Set(
    sectionFeedback
      .filter((entry) => entry.targetKey && entry.targetKey !== currentTargetKey)
      .map((entry) => entry.targetKey)
  )

  return feedbackTargets.filter(
    (target) => !usedTargets.has(target.targetKey) || target.targetKey === currentTargetKey
  )
}

function LessonFeedbackPanel({
  className,
  isPreview,
  canSaveFeedback,
  feedbackDraft,
  feedbackTargets,
  isSaving,
  feedbackError,
  feedbackSavedMessage,
  onRatingChange,
  onOverallSuggestionChange,
  onAddSectionFeedback,
  onSectionTargetChange,
  onSectionSuggestionChange,
  onRemoveSectionFeedback,
  onSave
}) {
  const sectionFeedback = feedbackDraft?.sectionFeedback || []
  const canAddSectionFeedback = feedbackTargets.some(
    (target) => !sectionFeedback.some((entry) => entry.targetKey === target.targetKey)
  )
  const isSaveDisabled =
    !canSaveFeedback ||
    isSaving ||
    !feedbackDraft?.overallRating ||
    !feedbackDraft?.overallSuggestion?.trim()

  return (
    <Sheet className={`${styles.feedbackPanel} ${className || ""}`.trim()} variant="plain">
      <Typography className={styles.feedbackEyebrow}>Feedback interno</Typography>
      <Typography level="title-md" className={styles.feedbackTitle}>
        Valuta questa lezione e lascia suggerimenti
      </Typography>
      <Typography className={styles.feedbackDescription}>
        Le tue note vengono salvate sul tuo account e aiutano a migliorare le prossime iterazioni della lezione.
      </Typography>

      {!canSaveFeedback ? (
        <Typography className={styles.feedbackPreviewNote}>
          {isPreview
            ? "In anteprima il feedback viene salvato solo se sei autenticato. Accedi con il tuo account e riapri la lezione per inviarlo."
            : "Accedi con un account valido per inviare il feedback."}
        </Typography>
      ) : (
        <>
          <div className={styles.feedbackRatingRow}>
            {[1, 2, 3, 4, 5].map((value) => {
              const isActive = feedbackDraft?.overallRating === String(value)

              return (
                <Button
                  key={value}
                  size="sm"
                  variant={isActive ? "solid" : "soft"}
                  color={isActive ? "primary" : "neutral"}
                  onClick={() => onRatingChange(String(value))}
                  sx={{ borderRadius: 999, minWidth: 44 }}
                >
                  {value}
                </Button>
              )
            })}
          </div>

          <Textarea
            minRows={4}
            value={feedbackDraft?.overallSuggestion || ""}
            onChange={(event) => onOverallSuggestionChange(event.target.value)}
            placeholder="Cosa miglioreresti in questa lezione?"
            sx={{ mt: 1.5, borderRadius: "18px" }}
          />

          {feedbackTargets.length > 0 ? (
            <div className={styles.feedbackSectionList}>
              <div className={styles.feedbackSectionHeader}>
                <Typography className={styles.feedbackSectionTitle}>
                  Suggerimenti puntuali per sezione
                </Typography>
                <Typography className={styles.feedbackSectionHint}>
                  Opzionale, ma utile quando il problema riguarda una sezione specifica.
                </Typography>
              </div>

              {sectionFeedback.map((entry, index) => (
                <div key={`${entry.targetKey || "target"}-${index}`} className={styles.feedbackSectionCard}>
                  <Select
                    value={entry.targetKey || null}
                    onChange={(_, value) => onSectionTargetChange(index, value || "")}
                    placeholder="Seleziona una sezione della lezione"
                    sx={{ borderRadius: "16px" }}
                  >
                    {getAvailableFeedbackTargets(
                      feedbackTargets,
                      sectionFeedback,
                      entry.targetKey
                    ).map((target) => (
                      <Option key={target.targetKey} value={target.targetKey}>
                        {target.label}
                      </Option>
                    ))}
                  </Select>

                  <Textarea
                    minRows={3}
                    value={entry.suggestion}
                    onChange={(event) =>
                      onSectionSuggestionChange(index, event.target.value)
                    }
                    placeholder="Cosa cambieresti in questa sezione?"
                    sx={{ borderRadius: "16px" }}
                  />

                  <div className={styles.feedbackSectionActions}>
                    <Button
                      size="sm"
                      variant="plain"
                      color="danger"
                      onClick={() => onRemoveSectionFeedback(index)}
                    >
                      Rimuovi
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                size="sm"
                variant="soft"
                color="neutral"
                disabled={!canAddSectionFeedback}
                onClick={onAddSectionFeedback}
                sx={{ alignSelf: "flex-start", borderRadius: 999 }}
              >
                Aggiungi nota su una sezione
              </Button>
            </div>
          ) : null}

          {feedbackError ? (
            <Typography className={styles.feedbackStatusError}>{feedbackError}</Typography>
          ) : null}

          {!feedbackError && feedbackSavedMessage ? (
            <Typography className={styles.feedbackStatusSuccess}>
              {feedbackSavedMessage}
            </Typography>
          ) : null}

          <div className={styles.feedbackActions}>
            <Button
              variant="solid"
              color="primary"
              onClick={onSave}
              disabled={isSaveDisabled}
              sx={{ borderRadius: 999 }}
            >
              {isSaving ? "Salvataggio feedback..." : "Salva feedback"}
            </Button>
          </div>
        </>
      )}
    </Sheet>
  )
}

function CaseStudyLessonView({
  moduleData,
  isPreview,
  onHome,
  onExportPdf,
  isExportingPdf,
  feedbackPanel
}) {
  const frameworkCards = getCaseStudyFrameworks(moduleData)
  const theorySources = getCaseStudyTheorySources(moduleData)
  const sourceArticles = getArrayOrEmpty(moduleData?.sourceArticles)
  const coverImageUrl = getCaseStudyCoverImageUrl(moduleData)
  const coverImageAlt = getCaseStudyCoverImageAlt(moduleData)
  const lessonDateLabel = formatLessonDate(moduleData?.lessonDate)
  const frameworkCountLabel = getCaseStudyFrameworkCountLabel(frameworkCards)
  const sourceArticleCount = sourceArticles.length
  const caseStudySections = getCaseStudySections(moduleData)
  const hasSources = sourceArticleCount > 0 || theorySources.length > 0
  const sourceSummaryLabel = getCaseStudySourceSummaryLabel(sourceArticles, theorySources)

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} />

      <Box className={styles.shell}>
        <Box className={styles.topbar}>
          <div className={styles.topbarActions}>
            <Button
              variant="soft"
              color="primary"
              startDecorator={<HomeIcon />}
              onClick={onHome}
              sx={{ borderRadius: 999 }}
            >
              Home
            </Button>

            <ExportActionButton isBusy={isExportingPdf} onExport={onExportPdf} />
          </div>

          <div className={styles.topbarStatus}>
            <Chip color="primary" variant="soft" sx={{ borderRadius: 999 }}>
              Case Study
            </Chip>

            {isPreview ? (
              <Chip color="warning" variant="soft" sx={{ borderRadius: 999 }}>
                Preview Mode
              </Chip>
            ) : null}
          </div>
        </Box>

        <Box className={styles.deckSection}>
          <div className={`${styles.cardCanvas} ${styles.caseStudyCanvas}`}>
            <Box className={`${styles.mainColumn} ${styles.caseStudyMainColumn}`}>
              <Box className={`${styles.hero} ${styles.caseStudyHero}`}>
                <Sheet
                  className={`${styles.heroPrimary} ${styles.caseStudyHeroPrimary}`}
                  variant="plain"
                >
                  <Typography level="h1" className={styles.caseStudyTitle}>
                    {moduleData?.title}
                  </Typography>

                  {moduleData?.standfirst ? (
                    <Typography className={styles.subtitle}>{moduleData.standfirst}</Typography>
                  ) : null}

                  <div className={styles.heroMetaRow}>
                    {lessonDateLabel ? (
                      <Chip variant="soft" color="neutral" sx={{ borderRadius: 999 }}>
                        {lessonDateLabel}
                      </Chip>
                    ) : null}
                    {moduleData?.sourceShortlist?.candidateRank ? (
                      <Chip variant="soft" color="warning" sx={{ borderRadius: 999 }}>
                        Rank {moduleData.sourceShortlist.candidateRank}
                      </Chip>
                    ) : null}
                    {frameworkCards.length > 0 ? (
                      <Chip variant="soft" color="primary" sx={{ borderRadius: 999 }}>
                        {frameworkCountLabel}
                      </Chip>
                    ) : null}
                  </div>

                  {moduleData?.caseStudy?.hook ? (
                    <div className={styles.caseStudyLead}>
                      <span className={styles.caseStudyLeadAccent} aria-hidden="true" />
                      <Typography className={styles.caseStudyLeadText}>
                        {moduleData.caseStudy.hook}
                      </Typography>
                    </div>
                  ) : null}
                </Sheet>
              </Box>

              <div className={styles.caseStudyNarrativePanel}>
                <div className={styles.caseStudyColumnHeader}>
                  <Typography className={styles.caseStudyColumnEyebrow}>
                    Sequence
                  </Typography>
                </div>

                {caseStudySections.length > 0 ? (
                  <div className={styles.caseStudySectionGrid}>
                    {caseStudySections.map((section, index) => (
                      <Sheet
                        key={section.key}
                        className={`${styles.contentCard} ${styles.caseStudySectionCard}`}
                        variant="plain"
                      >
                        <div className={styles.caseStudySectionHeader}>
                          <span className={styles.caseStudySectionIndex}>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <Typography className={styles.caseStudySectionTitle}>
                            {section.label}
                          </Typography>
                        </div>
                        <Typography className={styles.cardParagraph}>
                          {section.content}
                        </Typography>
                      </Sheet>
                    ))}
                  </div>
                ) : (
                  <Sheet className={styles.caseStudyFallback} variant="plain">
                    <Typography className={styles.caseStudyFallbackText}>
                      This lesson has been drafted, but the case narrative is still empty.
                    </Typography>
                  </Sheet>
                )}
              </div>
            </Box>

            <aside
              className={`${styles.sideColumn} ${styles.caseStudyColumnPanel} ${styles.caseStudySideColumn}`}
            >
              <div className={styles.caseStudyCoverPanel}>
                <div className={styles.caseStudyCoverFrame}>
                  <Image
                    src={coverImageUrl}
                    alt={coverImageAlt}
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1160px) 80vw, 32vw"
                    className={styles.caseStudyCoverImage}
                  />
                </div>
              </div>

              {frameworkCards.length > 0 ? (
                <div className={styles.caseStudyFrameworkGrid}>
                  {frameworkCards.map((framework, index) => (
                    <div
                      key={`${framework.label}-${index}`}
                      className={styles.caseStudyFrameworkItem}
                    >
                      <span className={styles.caseStudyFrameworkIndex}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className={styles.sourceCompactBody}>
                        <Typography className={styles.caseStudyFrameworkTitle}>
                          {framework.label}
                        </Typography>
                        <Typography className={styles.caseStudyFrameworkText}>
                          {framework.explanation}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {hasSources ? (
                <details
                  className={`${styles.sourceDisclosure} ${styles.caseStudySourceDisclosure}`}
                >
                  <summary className={styles.sourceSummaryButton}>
                    <div>
                      <Typography className={styles.caseStudySourceTitle}>
                        Sources
                      </Typography>
                      <Typography className={styles.sourceSummaryText}>
                        {sourceSummaryLabel}
                      </Typography>
                    </div>
                    <span className={styles.sourceSummaryAction}>View</span>
                  </summary>

                  <div className={styles.sourceCompactGrid}>
                    {theorySources.map((source) => (
                      <SourceCompactItem
                        key={source.sourceId}
                        badge="Theory"
                        badgeClassName={styles.sourceTypeBadge}
                        title={source.lensTitle || source.lessonTitle}
                        meta={[source.subjectName, source.lessonTitle].filter(Boolean).join(" · ")}
                      />
                    ))}

                    {sourceArticles.map((source) => (
                      <SourceCompactItem
                        key={source.sourceId}
                        badge="Case"
                        badgeClassName={styles.sourceTypeBadgeNews}
                        title={source.title || "News source"}
                        meta={source.date ? formatLessonDate(source.date) : ""}
                        href={source.url}
                      />
                    ))}
                  </div>
                </details>
              ) : null}

              {feedbackPanel}
            </aside>
          </div>
        </Box>
      </Box>
    </main>
  )
}

export default function ModulePageClient() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPreview = searchParams.get("preview") === "1"
  const handleHome = () => router.push("/")

  const [user, setUser] = useState(null)
  const [moduleData, setModuleData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [cardIndex, setCardIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isCardTransitioning, setIsCardTransitioning] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [feedbackDoc, setFeedbackDoc] = useState(null)
  const [feedbackDraft, setFeedbackDraft] = useState(createEmptyFeedbackDraft())
  const [isSavingFeedback, setIsSavingFeedback] = useState(false)
  const [feedbackError, setFeedbackError] = useState("")
  const [feedbackSavedMessage, setFeedbackSavedMessage] = useState("")
  const touchStartXRef = useRef(null)
  const pointerStartXRef = useRef(null)
  const dragPointerIdRef = useRef(null)
  const autoAdvanceTimeoutRef = useRef(null)
  const animationTimeoutRef = useRef(null)
  const exportContentRef = useRef(null)
  const canSaveFeedback = Boolean(user && moduleData?.collectionName && moduleData?.id)

  const clearFeedbackStatus = () => {
    setFeedbackError("")
    setFeedbackSavedMessage("")
  }

  // Gestione autenticazione
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [isPreview, router])

  // Caricamento dati modulo + progresso
  useEffect(() => {
    if (!user || !id) return

    let isMounted = true

    const loadModule = async () => {
      const nextModuleData = await getModuleData(id)

      if (nextModuleData && isMounted) {
        setModuleData(nextModuleData)
      }
    }

    loadModule()

    if (isPreview) {
      setProgress(createEmptyProgress())

      return () => {
        isMounted = false
      }
    }

    const progressRef = doc(db, "learningProgress", user.uid, "modules", id)
    const unsubscribe = onSnapshot(progressRef, (snap) => {
      setProgress(
        snap.exists() ? snap.data() : createEmptyProgress()
      )
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [user, id, isPreview])

  useEffect(() => {
    setFeedbackDoc(null)
    clearFeedbackStatus()

    if (!canSaveFeedback) {
      return undefined
    }

    return listenToLessonFeedback(
      {
        collectionName: moduleData.collectionName,
        moduleId: moduleData.id,
        userId: user.uid
      },
      setFeedbackDoc
    )
  }, [canSaveFeedback, moduleData?.collectionName, moduleData?.id, user?.uid])

  useEffect(() => {
    if (!moduleData) {
      setFeedbackDraft(createEmptyFeedbackDraft())
      return
    }

    setFeedbackDraft(
      buildFeedbackDraft(feedbackDoc, getModuleFeedbackTargets(moduleData))
    )
  }, [feedbackDoc, moduleData])

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

  const handleExportPdf = async () => {
    if (!moduleData || isExportingPdf || !exportContentRef.current) return

    setIsExportingPdf(true)

    try {
      await exportElementAsPdf(exportContentRef.current, getModulePdfFileName(moduleData))
    } catch (error) {
      console.error("Unable to export lesson PDF", error)
      window.alert("Non sono riuscito a generare il PDF. Riprova tra qualche secondo.")
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handleFeedbackRatingChange = (nextValue) => {
    clearFeedbackStatus()
    setFeedbackDraft((current) => ({
      ...current,
      overallRating: nextValue
    }))
  }

  const handleOverallSuggestionChange = (nextValue) => {
    clearFeedbackStatus()
    setFeedbackDraft((current) => ({
      ...current,
      overallSuggestion: nextValue
    }))
  }

  const handleAddSectionFeedback = () => {
    const feedbackTargets = moduleData ? getModuleFeedbackTargets(moduleData) : []
    const nextTarget = feedbackTargets.find(
      (target) =>
        !feedbackDraft.sectionFeedback.some(
          (entry) => entry.targetKey === target.targetKey
        )
    )

    if (!nextTarget) {
      return
    }

    clearFeedbackStatus()
    setFeedbackDraft((current) => ({
      ...current,
      sectionFeedback: [
        ...current.sectionFeedback,
        createSectionFeedbackEntry(nextTarget)
      ]
    }))
  }

  const handleSectionTargetChange = (index, nextTargetKey) => {
    const feedbackTargets = moduleData ? getModuleFeedbackTargets(moduleData) : []
    const nextTarget = feedbackTargets.find(
      (target) => target.targetKey === nextTargetKey
    )

    clearFeedbackStatus()
    setFeedbackDraft((current) => ({
      ...current,
      sectionFeedback: current.sectionFeedback.map((entry, entryIndex) =>
        entryIndex === index
          ? {
              ...entry,
              targetKey: nextTarget?.targetKey || "",
              targetType: nextTarget?.targetType || "",
              label: nextTarget?.label || ""
            }
          : entry
      )
    }))
  }

  const handleSectionSuggestionChange = (index, nextSuggestion) => {
    clearFeedbackStatus()
    setFeedbackDraft((current) => ({
      ...current,
      sectionFeedback: current.sectionFeedback.map((entry, entryIndex) =>
        entryIndex === index
          ? { ...entry, suggestion: nextSuggestion }
          : entry
      )
    }))
  }

  const handleRemoveSectionFeedback = (index) => {
    clearFeedbackStatus()
    setFeedbackDraft((current) => ({
      ...current,
      sectionFeedback: current.sectionFeedback.filter(
        (_, entryIndex) => entryIndex !== index
      )
    }))
  }

  const handleSaveFeedback = async () => {
    if (!canSaveFeedback) {
      setFeedbackError(
        isPreview
          ? "Accedi con il tuo account per salvare il feedback anche in anteprima."
          : "Non riesco a identificare un account valido per salvare il feedback."
      )
      return
    }

    if (!feedbackDraft.overallRating) {
      setFeedbackError("Seleziona una valutazione complessiva prima di salvare il feedback.")
      return
    }

    if (!feedbackDraft.overallSuggestion.trim()) {
      setFeedbackError("Inserisci almeno un suggerimento generale prima di salvare.")
      return
    }

    setIsSavingFeedback(true)
    clearFeedbackStatus()

    try {
      await upsertLessonFeedback({
        collectionName: moduleData.collectionName,
        moduleId: moduleData.id,
        user,
        moduleData,
        overallRating: Number(feedbackDraft.overallRating),
        overallSuggestion: feedbackDraft.overallSuggestion,
        sectionFeedback: feedbackDraft.sectionFeedback
      })

      setFeedbackSavedMessage("Feedback salvato. Puoi aggiornarlo di nuovo in qualsiasi momento.")
    } catch (error) {
      console.error("Unable to save lesson feedback", error)
      setFeedbackError("Non sono riuscito a salvare il feedback. Riprova tra qualche secondo.")
    } finally {
      setIsSavingFeedback(false)
    }
  }

  if ((!user && !isPreview) || !moduleData || !progress)
    return <Loading message="Caricamento modulo..." />

  const feedbackTargets = getModuleFeedbackTargets(moduleData)
  const feedbackPanel = (
    <LessonFeedbackPanel
      className={
        moduleData?.type === "case-study-lesson"
          ? styles.feedbackPanelAside
          : styles.feedbackPanelStandalone
      }
      isPreview={isPreview}
      canSaveFeedback={canSaveFeedback}
      feedbackDraft={feedbackDraft}
      feedbackTargets={feedbackTargets}
      isSaving={isSavingFeedback}
      feedbackError={feedbackError}
      feedbackSavedMessage={feedbackSavedMessage}
      onRatingChange={handleFeedbackRatingChange}
      onOverallSuggestionChange={handleOverallSuggestionChange}
      onAddSectionFeedback={handleAddSectionFeedback}
      onSectionTargetChange={handleSectionTargetChange}
      onSectionSuggestionChange={handleSectionSuggestionChange}
      onRemoveSectionFeedback={handleRemoveSectionFeedback}
      onSave={handleSaveFeedback}
    />
  )

  if (moduleData?.type === "case-study-lesson") {
    return (
      <>
        <CaseStudyLessonView
          moduleData={moduleData}
          isPreview={isPreview}
          onHome={handleHome}
          onExportPdf={handleExportPdf}
          isExportingPdf={isExportingPdf}
          feedbackPanel={feedbackPanel}
        />

        <div ref={exportContentRef} className={styles.exportRoot} aria-hidden="true">
          <ModulePdfExport moduleData={moduleData} />
        </div>
      </>
    )
  }
  return (
    <>
      <main className={styles.page}>
        <div className={styles.backdrop} />

        <Box className={styles.shell}>
          <Box className={styles.topbar}>
            <div className={styles.topbarActions}>
              <Button
                variant="soft"
                color="primary"
                startDecorator={<HomeIcon />}
                onClick={handleHome}
                sx={{ borderRadius: 999 }}
              >
                Home
              </Button>

              <ExportActionButton isBusy={isExportingPdf} onExport={handleExportPdf} />
            </div>

            <div className={styles.topbarStatus}>
              <Chip color="primary" variant="soft" sx={{ borderRadius: 999 }}>
                {lessonModeLabel}
              </Chip>
            </div>
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
                                  <Typography className={styles.signalLabel}>Theory Anchor</Typography>
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
                                <SourceCompactItem
                                  key={source.sourceId}
                                  badge="Theory"
                                  badgeClassName={styles.sourceTypeBadge}
                                  title={source.subjectName}
                                  meta={[source.lessonCode, source.title].filter(Boolean).join(" · ")}
                                />
                              ))}

                              {sourceGroups.news.map((source) => (
                                <SourceCompactItem
                                  key={source.sourceId}
                                  badge="Case"
                                  badgeClassName={styles.sourceTypeBadgeNews}
                                  title={source.title || "News source"}
                                  meta={source.date ? formatLessonDate(source.date) : ""}
                                  href={source.url}
                                />
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
                          {getAnswerStateMessage(
                            answers[cardIndex],
                            currentCard?.quiz?.correctAnswer,
                            cardIndex === cards.length - 1
                          )}
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

              {feedbackPanel}
            </Box>
          )}
        </Box>
      </main>

      <div ref={exportContentRef} className={styles.exportRoot} aria-hidden="true">
        <ModulePdfExport moduleData={moduleData} cards={cards} />
      </div>
    </>
  )
}
