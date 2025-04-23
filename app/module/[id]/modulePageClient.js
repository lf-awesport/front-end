"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import db from "@/utils/firestore"
import Loading from "@/components/loading"
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Typography,
  Card,
  CardContent,
  CardActions,
  Sheet,
  Radio,
  RadioGroup,
  Box,
  LinearProgress
} from "@mui/joy"
import styles from "../../posts.module.css"

export default function ModulePageClient() {
  const { id } = useParams()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(undefined)
  const [moduleData, setModuleData] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return router.push("/login")
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [mounted, router])

  useEffect(() => {
    if (!user || !id) return

    const ref = doc(db, "learningModules", "Sports Law", "lessons", id)
    getDoc(ref).then((snap) => {
      if (snap.exists()) setModuleData(snap.data())
    })

    const progressRef = doc(db, "learningProgress", user.uid, "modules", id)
    const unsubscribe = onSnapshot(progressRef, (snap) => {
      if (snap.exists()) setProgress(snap.data())
      else
        setProgress({
          answers: { 1: {}, 2: {}, 3: {} },
          completedLevels: []
        })
    })

    return () => unsubscribe()
  }, [user, id])

  const updateProgress = async (level, index, answer) => {
    const newAnswers = {
      ...progress.answers,
      [level]: {
        ...progress.answers[level],
        [index]: answer
      }
    }

    const levelKey = level === 1 ? "easy" : level === 2 ? "medium" : "hard"
    const cardList = moduleData.levels?.[levelKey]?.cards || []

    const correct = cardList[index]?.quiz?.correctAnswer

    const isFullyAnswered =
      Object.keys(newAnswers[level] || {}).length === cardList.length
    const allCorrect = cardList.every(
      (card, i) => newAnswers[level]?.[i] === card.quiz.correctAnswer
    )

    const completedLevel = isFullyAnswered && allCorrect
    const newCompleted = new Set(progress.completedLevels)
    if (completedLevel) newCompleted.add(level)

    const updatedProgress = {
      ...progress,
      answers: newAnswers,
      completedLevels: Array.from(newCompleted)
    }

    const ref = doc(db, "learningProgress", user.uid, "modules", id)
    await setDoc(ref, updatedProgress, { merge: true })

    if (completedLevel) {
      await setDoc(ref, { [`level${level}Completed`]: true }, { merge: true })
    }
  }

  if (!mounted || user === undefined || !moduleData || !progress)
    return <Loading message="Caricamento modulo..." />

  const levels = { 1: "easy", 2: "medium", 3: "hard" }
  const isUnlocked = (lvl) => {
    if (lvl === 1) return true
    return progress[`level${lvl - 1}Completed`] === true
  }

  return (
    <main
      className={styles.main}
      style={{ width: "100%", maxWidth: "1300px", margin: "0 auto" }}
    >
      <Tabs
        value={tabValue}
        onChange={(e, val) => setTabValue(val)}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          mb: 2,
          borderRadius: 2,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          p: 1
        }}
      >
        <TabList>
          {[1, 2, 3].map((lvl) => (
            <Tab
              key={lvl}
              disabled={!isUnlocked(lvl)}
              sx={{
                '&[aria-selected="true"]': {
                  backgroundColor: "#5cc9fa",
                  color: "#fff"
                }
              }}
              color="primary"
            >
              Lvl. {lvl}
            </Tab>
          ))}
        </TabList>

        {[1, 2, 3].map((lvl, i) => {
          const levelData = moduleData.levels[levels[lvl]] || {}
          const cards = levelData.cards || []
          const userAnswers = progress.answers?.[lvl] || {}
          const correctCount = Object.entries(userAnswers).filter(
            ([i, val]) => val === cards[i]?.quiz.correctAnswer
          ).length

          return (
            <TabPanel key={lvl} value={i} sx={{ px: 0 }}>
              {!isUnlocked(lvl) ? (
                <Typography level="body-sm" sx={{ mt: 2 }}>
                  🔒 Completa il livello {lvl - 1} per sbloccare questo
                  contenuto.
                </Typography>
              ) : (
                <>
                  <Typography level="h2" sx={{ mb: 1, fontWeight: 700 }}>
                    {levelData.levelTitle || `Lezione – Livello ${lvl}`}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography level="body-sm" sx={{ mb: 0.5 }}>
                      Progresso: {correctCount} / {cards.length}
                    </Typography>
                    <LinearProgress
                      determinate
                      value={(correctCount / cards.length) * 100}
                    />
                  </Box>

                  <Sheet
                    sx={{
                      mb: 4,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 3
                    }}
                  >
                    {cards.map((card, index) => {
                      const selected = userAnswers[index]
                      const correct = card.quiz.correctAnswer
                      const isCorrect = selected === correct

                      return (
                        <Card
                          key={index}
                          variant="outlined"
                          sx={{ borderRadius: 3, boxShadow: "sm" }}
                        >
                          <CardContent>
                            <Typography
                              level="title-md"
                              sx={{ fontWeight: 600 }}
                            >
                              {card.title}
                            </Typography>
                            <Typography
                              level="body-sm"
                              sx={{ mt: 1, mb: 2, color: "text.secondary" }}
                            >
                              {card.content}
                            </Typography>
                            <Typography
                              level="body-sm"
                              sx={{ fontWeight: "bold" }}
                            >
                              Quiz: {card.quiz.question}
                            </Typography>
                            <RadioGroup
                              value={selected || ""}
                              onChange={(e) =>
                                updateProgress(lvl, index, e.target.value)
                              }
                              sx={{ mt: 1 }}
                            >
                              {card.quiz.options.map((opt, i) => (
                                <Radio
                                  key={i}
                                  value={opt}
                                  label={opt}
                                  disabled={selected === correct}
                                />
                              ))}
                            </RadioGroup>
                            {selected && (
                              <Typography
                                level="body-sm"
                                sx={{
                                  mt: 1,
                                  color: isCorrect ? "green" : "red"
                                }}
                              >
                                {isCorrect
                                  ? "✅ Risposta corretta"
                                  : `❌ Risposta errata`}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </Sheet>
                </>
              )}
            </TabPanel>
          )
        })}
      </Tabs>
    </main>
  )
}
