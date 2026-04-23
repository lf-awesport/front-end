const CASE_STUDY_SECTION_CONFIG = [
  { key: "whatHappened", label: "What Happened" },
  { key: "whyThisMatters", label: "Why This Matters" },
  { key: "theRealDecision", label: "The Real Decision" },
  { key: "whatCouldBreak", label: "What Could Break" },
  { key: "whatToWatch", label: "What To Watch" }
]

function joinNonEmptySegments(segments) {
  return segments.filter(Boolean).join(" + ")
}

export function getArrayOrEmpty(value) {
  return Array.isArray(value) ? value : []
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

function compactFeedbackTargetLabel(value, fallback) {
  const normalizedValue = (value || "").replace(/\s+/g, " ").trim()

  if (!normalizedValue) {
    return fallback
  }

  if (normalizedValue.length <= 64) {
    return normalizedValue
  }

  return `${normalizedValue.slice(0, 61).trimEnd()}...`
}

export function getLessonTitle(moduleData) {
  return (
    moduleData?.title ||
    moduleData?.levels?.easy?.levelTitle ||
    moduleData?.topic ||
    "News Deck"
  )
}

export function getLessonEyebrow(moduleData) {
  return moduleData?.lessonType === "daily-edge"
    ? "Daily Edge"
    : "Daily Press Review"
}

export function getLessonModeLabel(moduleData) {
  return moduleData?.framework === "theory-first" ? "Theory-first" : "News"
}

export function getLessonSubtitle(moduleData) {
  if (moduleData?.framework === "theory-first") {
    return "Framework first, case second: ogni card parte dal principio manageriale, poi lo traduce nel caso del giorno, poi chiarisce implicazione e trade-off."
  }

  return ""
}

export function getCaseStudyFrameworks(moduleData) {
  return getArrayOrEmpty(moduleData?.theoryBlend?.frameworksInPlay)
}

export function getCaseStudyTheorySources(moduleData) {
  return getArrayOrEmpty(moduleData?.meta?.theoryPack)
}

export function getCaseStudyFrameworkCountLabel(frameworkCards) {
  return `${frameworkCards.length} lens${frameworkCards.length === 1 ? "" : "es"}`
}

export function getCaseStudySourceSummaryLabel(sourceArticles, theorySources) {
  return joinNonEmptySegments([
    sourceArticles.length > 0 ? `${sourceArticles.length} article` : null,
    theorySources.length > 0 ? `${theorySources.length} theory` : null
  ])
}

export function getCaseStudySections(moduleData) {
  return CASE_STUDY_SECTION_CONFIG
    .map(({ key, label }) => ({
      key,
      label,
      content: moduleData?.caseStudy?.[key] || ""
    }))
    .filter((section) => section.content)
}

export function getModuleFeedbackTargets(moduleData) {
  if (moduleData?.type === "case-study-lesson") {
    return getCaseStudySections(moduleData).map((section) => ({
      targetKey: section.key,
      label: section.label,
      targetType: "case-study-section"
    }))
  }

  return getModuleCards(moduleData).map((card, index) => ({
    targetKey: `card-${index}`,
    label: compactFeedbackTargetLabel(
      card?.hook || card?.quiz?.question || card?.learningObjective,
      `Card ${index + 1}`
    ),
    targetType: "lesson-card",
    cardIndex: index
  }))
}

export function getCaseStudyCoverImageUrl(moduleData) {
  const coverImageUrl = moduleData?.coverImage?.url
  return typeof coverImageUrl === "string" && coverImageUrl.trim()
    ? coverImageUrl
    : "/testcover.jpeg"
}

export function getCaseStudyCoverImageExportUrl(moduleData) {
  const coverImageUrl = getCaseStudyCoverImageUrl(moduleData)

  if (!/^https?:\/\//i.test(coverImageUrl)) {
    return coverImageUrl
  }

  return `/_next/image?url=${encodeURIComponent(coverImageUrl)}&w=2048&q=75`
}

export function getCaseStudyCoverImageAlt(moduleData) {
  const coverImageAlt = moduleData?.coverImage?.alt
  return typeof coverImageAlt === "string" && coverImageAlt.trim()
    ? coverImageAlt
    : `Cover for ${moduleData?.title || "case study lesson"}`
}

export function formatLessonDate(dateString) {
  if (!dateString) return ""

  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateString

  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date)
}

export function getSourceGroups(card) {
  return {
    theory: card?.sources?.theory || [],
    news: card?.sources?.news || []
  }
}

export function getSourceCountLabel(sourceGroups) {
  const label = joinNonEmptySegments([
    sourceGroups.theory.length > 0 ? `${sourceGroups.theory.length} theory` : null,
    sourceGroups.news.length > 0 ? `${sourceGroups.news.length} case` : null
  ])

  return label || "Nessuna fonte"
}

export function getCardDisplayModel(card) {
  const explanationParagraphs = splitParagraphs(card?.explanation || card?.content)
  const decisionFocus =
    card?.decisionFocus || card?.businessImplication || card?.hook || ""
  const managerLens =
    card?.managerLens || card?.theoryAnchor?.whyItApplies || ""
  const learningObjective =
    card?.learningObjective || card?.quiz?.question || ""

  return {
    isV3: Boolean(card?.explanation || card?.theoryAnchor),
    hook: card?.hook || "",
    explanationParagraphs,
    theoryAnchor: card?.theoryAnchor || null,
    caseBrief: card?.caseBrief || "",
    businessImplication: card?.businessImplication || "",
    tradeOff: card?.tradeOff || "",
    decisionFocus,
    managerLens,
    applicabilityLimits: card?.applicabilityLimits || "",
    learningObjective
  }
}