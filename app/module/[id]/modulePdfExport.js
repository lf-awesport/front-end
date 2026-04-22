import styles from "./modulePageClient.module.css"
import {
  getArrayOrEmpty,
  getCardDisplayModel,
  getCaseStudyCoverImageAlt,
  getCaseStudyCoverImageExportUrl,
  getCaseStudyFrameworks,
  getCaseStudySections,
  getCaseStudyTheorySources,
  getLessonEyebrow,
  getLessonModeLabel,
  getLessonSubtitle,
  getLessonTitle,
  getSourceGroups,
  formatLessonDate
} from "./moduleDataHelpers"

function PdfInfoItem({ label, title, meta, body }) {
  if (!title && !body) return null

  return (
    <div className={styles.exportInsightCard}>
      <p className={styles.exportBlockLabel}>{label}</p>
      {meta ? <p className={styles.exportInsightMeta}>{meta}</p> : null}
      {title ? <p className={styles.exportInsightTitle}>{title}</p> : null}
      {body ? <p className={styles.exportParagraph}>{body}</p> : null}
    </div>
  )
}

function PdfSourceList({ theorySources, newsSources }) {
  const theoryItems = getArrayOrEmpty(theorySources)
  const newsItems = getArrayOrEmpty(newsSources)

  if (theoryItems.length === 0 && newsItems.length === 0) {
    return null
  }

  return (
    <div className={styles.exportSourceList}>
      {theoryItems.map((source, index) => {
        const title =
          source?.lensTitle || source?.lessonTitle || source?.subjectName || "Theory source"
        const meta = [source?.subjectName, source?.lessonCode, source?.title]
          .filter(Boolean)
          .join(" · ")

        return (
          <div
            key={source?.sourceId || `${title}-${index}`}
            className={styles.exportSourceItem}
          >
            <span className={styles.exportSourceType}>Theory</span>
            <div className={styles.exportSourceBody}>
              <p className={styles.exportSourceTitle}>{title}</p>
              {meta ? <p className={styles.exportSourceMeta}>{meta}</p> : null}
            </div>
          </div>
        )
      })}

      {newsItems.map((source, index) => {
        const title = source?.title || "News source"
        const meta = formatLessonDate(source?.date) || source?.url || ""

        return (
          <div
            key={source?.sourceId || `${title}-${index}`}
            className={styles.exportSourceItem}
          >
            <span className={`${styles.exportSourceType} ${styles.exportSourceTypeNews}`}>
              Case
            </span>
            <div className={styles.exportSourceBody}>
              <p className={styles.exportSourceTitle}>{title}</p>
              {meta ? <p className={styles.exportSourceMeta}>{meta}</p> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CaseStudyPdfDocument({ moduleData }) {
  const frameworkCards = getCaseStudyFrameworks(moduleData)
  const theorySources = getCaseStudyTheorySources(moduleData)
  const sourceArticles = getArrayOrEmpty(moduleData?.sourceArticles)
  const coverImageUrl = getCaseStudyCoverImageExportUrl(moduleData)
  const coverImageAlt = getCaseStudyCoverImageAlt(moduleData)
  const lessonDateLabel = formatLessonDate(moduleData?.lessonDate)
  const caseStudySections = getCaseStudySections(moduleData)

  return (
    <div className={`${styles.exportDocument} ${styles.exportDocumentCaseStudy}`}>
      <header className={styles.exportHeader}>
        <p className={styles.exportEyebrow}>Case Study</p>
        <h1 className={styles.exportTitle}>{moduleData?.title || "Case Study"}</h1>
        {moduleData?.standfirst ? (
          <p className={styles.exportLead}>{moduleData.standfirst}</p>
        ) : null}

        <div className={styles.exportMetaRow}>
          {lessonDateLabel ? <span className={styles.exportMetaPill}>{lessonDateLabel}</span> : null}
          {moduleData?.sourceShortlist?.candidateRank ? (
            <span className={styles.exportMetaPill}>
              Rank {moduleData.sourceShortlist.candidateRank}
            </span>
          ) : null}
          {frameworkCards.length > 0 ? (
            <span className={styles.exportMetaPill}>
              {frameworkCards.length} framework{frameworkCards.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </header>

      <section className={styles.exportCard}>
        <div className={styles.exportCaseStudyCover}>
          <img
            src={coverImageUrl}
            alt={coverImageAlt}
            className={styles.exportCoverImage}
          />
        </div>

        {moduleData?.caseStudy?.hook ? (
          <div className={styles.exportQuoteBlock}>
            <p className={styles.exportBlockLabel}>Hook</p>
            <p className={styles.exportQuoteText}>{moduleData.caseStudy.hook}</p>
          </div>
        ) : null}

        {caseStudySections.length > 0 ? (
          <div className={styles.exportStepGrid}>
            {caseStudySections.map((section, index) => (
              <div key={section.key} className={styles.exportStepCard}>
                <div className={styles.exportStepHeader}>
                  <span className={styles.exportStepIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className={styles.exportStepTitle}>{section.label}</h2>
                </div>
                <p className={styles.exportParagraph}>{section.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.exportEmptyState}>
            This lesson has been drafted, but the case narrative is still empty.
          </div>
        )}
      </section>

      {frameworkCards.length > 0 ? (
        <section className={styles.exportCard}>
          <p className={styles.exportBlockLabel}>Frameworks in Play</p>
          <div className={styles.exportFrameworkGrid}>
            {frameworkCards.map((framework, index) => (
              <div key={`${framework.label}-${index}`} className={styles.exportFrameworkCard}>
                <span className={styles.exportFrameworkIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className={styles.exportFrameworkTitle}>{framework.label}</h2>
                  <p className={styles.exportFrameworkText}>{framework.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {theorySources.length > 0 || sourceArticles.length > 0 ? (
        <section className={styles.exportCard}>
          <p className={styles.exportBlockLabel}>Sources</p>
          <PdfSourceList theorySources={theorySources} newsSources={sourceArticles} />
        </section>
      ) : null}
    </div>
  )
}

function LessonPdfDocument({ moduleData, cards }) {
  const lessonTitle = getLessonTitle(moduleData)
  const lessonEyebrow = getLessonEyebrow(moduleData)
  const lessonModeLabel = getLessonModeLabel(moduleData)
  const lessonSubtitle = getLessonSubtitle(moduleData)
  const lessonDateLabel = formatLessonDate(moduleData?.lessonDate)

  return (
    <div className={styles.exportDocument}>
      <header className={styles.exportHeader}>
        <p className={styles.exportEyebrow}>{lessonEyebrow}</p>
        <h1 className={styles.exportTitle}>{lessonTitle}</h1>
        {lessonSubtitle ? <p className={styles.exportLead}>{lessonSubtitle}</p> : null}

        <div className={styles.exportMetaRow}>
          {lessonDateLabel ? <span className={styles.exportMetaPill}>{lessonDateLabel}</span> : null}
          <span className={styles.exportMetaPill}>{lessonModeLabel}</span>
          <span className={styles.exportMetaPill}>{cards.length} cards</span>
        </div>
      </header>

      {cards.length === 0 ? (
        <div className={styles.exportEmptyState}>
          La lezione non contiene ancora contenuti da esportare.
        </div>
      ) : (
        cards.map((card, cardIndex) => {
          const cardDisplay = getCardDisplayModel(card)
          const sourceGroups = getSourceGroups(card)
          const keywords = getArrayOrEmpty(card?.keywords)
          const quizOptions = getArrayOrEmpty(card?.quiz?.options)
          const hasPrimaryInsights = Boolean(
            cardDisplay.theoryAnchor ||
              cardDisplay.caseBrief ||
              cardDisplay.businessImplication ||
              cardDisplay.tradeOff
          )
          const hasSecondaryInsights = Boolean(
            cardDisplay.managerLens ||
              cardDisplay.learningObjective ||
              cardDisplay.applicabilityLimits
          )
          const hasSources = sourceGroups.theory.length > 0 || sourceGroups.news.length > 0

          return (
            <section key={`${card?.title || "card"}-${cardIndex}`} className={styles.exportCard}>
              <div className={styles.exportCardHeader}>
                <span className={styles.exportCardIndex}>
                  {String(cardIndex + 1).padStart(2, "0")}
                </span>

                <div className={styles.exportCardHeaderBody}>
                  <h2 className={styles.exportCardTitle}>
                    {card?.title || `Card ${cardIndex + 1}`}
                  </h2>
                  {cardDisplay.decisionFocus ? (
                    <p className={styles.exportCardFocus}>{cardDisplay.decisionFocus}</p>
                  ) : null}
                </div>
              </div>

              {cardDisplay.hook ? (
                <div className={styles.exportQuoteBlock}>
                  <p className={styles.exportBlockLabel}>Hook</p>
                  <p className={styles.exportQuoteText}>{cardDisplay.hook}</p>
                </div>
              ) : null}

              {cardDisplay.explanationParagraphs.length > 0 ? (
                <div className={styles.exportSectionBlock}>
                  <p className={styles.exportBlockLabel}>Explanation</p>
                  <div className={styles.exportParagraphGroup}>
                    {cardDisplay.explanationParagraphs.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex} className={styles.exportParagraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              {hasPrimaryInsights ? (
                <div className={styles.exportInsightGrid}>
                  {cardDisplay.theoryAnchor ? (
                    <PdfInfoItem
                      label="Theory Anchor"
                      meta={cardDisplay.theoryAnchor.subjectName}
                      title={cardDisplay.theoryAnchor.concept}
                      body={cardDisplay.theoryAnchor.whyItApplies}
                    />
                  ) : null}

                  <PdfInfoItem label="Case Brief" title={cardDisplay.caseBrief} />
                  <PdfInfoItem
                    label="Business Implication"
                    title={cardDisplay.businessImplication}
                  />
                  <PdfInfoItem label="Trade-off" title={cardDisplay.tradeOff} />
                </div>
              ) : null}

              {hasSecondaryInsights ? (
                <div className={styles.exportInsightGrid}>
                  <PdfInfoItem label="Manager Lens" title={cardDisplay.managerLens} />
                  <PdfInfoItem
                    label="Learning Objective"
                    title={cardDisplay.learningObjective}
                  />
                  <PdfInfoItem
                    label="Applicability Limits"
                    title={cardDisplay.applicabilityLimits}
                  />
                </div>
              ) : null}

              {keywords.length > 0 ? (
                <div className={styles.exportSectionBlock}>
                  <p className={styles.exportBlockLabel}>Key Signals</p>
                  <div className={styles.exportTagRow}>
                    {keywords.map((keyword, keywordIndex) => (
                      <span
                        key={`${keyword}-${keywordIndex}`}
                        className={styles.exportTag}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {hasSources ? (
                <div className={styles.exportSectionBlock}>
                  <p className={styles.exportBlockLabel}>Sources</p>
                  <PdfSourceList
                    theorySources={sourceGroups.theory}
                    newsSources={sourceGroups.news}
                  />
                </div>
              ) : null}

              {card?.quiz?.question ? (
                <div className={styles.exportQuizBlock}>
                  <p className={styles.exportBlockLabel}>Quick Quiz</p>
                  <h3 className={styles.exportQuizTitle}>{card.quiz.question}</h3>
                  {quizOptions.length > 0 ? (
                    <ol className={styles.exportQuizList}>
                      {quizOptions.map((option, optionIndex) => (
                        <li key={`${option}-${optionIndex}`} className={styles.exportQuizOption}>
                          {option}
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </div>
              ) : null}
            </section>
          )
        })
      )}
    </div>
  )
}

export default function ModulePdfExport({ moduleData, cards = [] }) {
  if (!moduleData) return null

  if (moduleData?.type === "case-study-lesson") {
    return <CaseStudyPdfDocument moduleData={moduleData} />
  }

  return <LessonPdfDocument moduleData={moduleData} cards={cards} />
}