"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { marked } from "marked"
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
  Sheet,
  RadioGroup,
  Radio,
  Box,
  LinearProgress
} from "@mui/joy"
import styles from "../../posts.module.css"
import HomeIcon from "@mui/icons-material/Home"
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks"
import LooksOneIcon from "@mui/icons-material/LooksOne"
import LooksTwoIcon from "@mui/icons-material/LooksTwo"
import Looks3Icon from "@mui/icons-material/Looks3"

const getLevelIcon = (level) => {
  if (level === 1) return <LooksOneIcon />
  if (level === 2) return <LooksTwoIcon />
  if (level === 3) return <Looks3Icon />
}

export default function ModulePageClient() {
  const { id } = useParams()
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [moduleData, setModuleData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [tabValue, setTabValue] = useState(1)

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

  const updateProgress = async (level, index, answer) => {
    if (!moduleData || !progress) return

    const newAnswers = {
      ...progress.answers,
      [level]: { ...progress.answers[level], [index]: answer }
    }

    const levelKey = ["easy", "medium", "hard"][level - 1]
    const cards = moduleData.levels?.[levelKey]?.cards || []

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
  }

  if (!user || !moduleData || !progress)
    return <Loading message="Caricamento modulo..." />

  const isUnlocked = (lvl) => lvl === 1 || progress[`level${lvl - 1}Completed`]

  return (
    <main
      className={styles.main}
      style={{ width: "100%", maxWidth: "1300px", margin: "0 auto" }}
    >
      <Tabs
        value={tabValue}
        onChange={(e, val) => {
          if (val === 0) router.push("/")
          else setTabValue(val)
        }}
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
          <Tab
            value={0}
            color="primary"
            sx={{
              '&[aria-selected="true"]': {
                backgroundColor: "#5cc9fa",
                color: "#fff"
              }
            }}
          >
            <HomeIcon />
          </Tab>
          {[1, 2, 3].map((lvl) => (
            <Tab
              key={lvl}
              value={lvl}
              disabled={!isUnlocked(lvl)}
              color="primary"
              sx={{
                '&[aria-selected="true"]': {
                  backgroundColor: "#5cc9fa",
                  color: "#fff"
                }
              }}
            >
              {getLevelIcon(lvl)}
            </Tab>
          ))}
          <Tab
            value={4}
            color="primary"
            sx={{
              '&[aria-selected="true"]': {
                backgroundColor: "#5cc9fa",
                color: "#fff"
              }
            }}
          >
            <LibraryBooksIcon />
          </Tab>
        </TabList>

        {[1, 2, 3].map((lvl) => {
          const levelKey = ["easy", "medium", "hard"][lvl - 1]
          const cards = moduleData.levels?.[levelKey]?.cards || []
          const answers = progress.answers[lvl] || {}

          return (
            <TabPanel key={lvl} value={lvl}>
              {!isUnlocked(lvl) ? (
                <Typography level="body-sm" sx={{ mt: 2 }}>
                  🔒 Completa il livello {lvl - 1} per sbloccare questo
                  contenuto.
                </Typography>
              ) : (
                <>
                  <Typography level="h2" sx={{ mb: 1, fontWeight: 700 }}>
                    {moduleData.levels[levelKey]?.levelTitle ||
                      `Lezione – Livello ${lvl}`}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography level="body-sm" sx={{ mb: 0.5 }}>
                      Progresso:{" "}
                      {
                        Object.entries(answers).filter(
                          ([i, val]) => val === cards[i]?.quiz.correctAnswer
                        ).length
                      }
                      / {cards.length}
                    </Typography>
                    <LinearProgress
                      determinate
                      value={
                        cards.length
                          ? (Object.entries(answers).filter(
                              ([i, val]) => val === cards[i]?.quiz.correctAnswer
                            ).length /
                              cards.length) *
                            100
                          : 0
                      }
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
                      const selected = answers[index]
                      const isCorrect = selected === card.quiz.correctAnswer

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
                            <Typography level="body-sm" sx={{ mt: 1, mb: 2 }}>
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
                                  disabled={
                                    selected === card.quiz.correctAnswer
                                  }
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
                                  : "❌ Risposta errata"}
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
        <TabPanel value={4}>
          <Typography level="h2" sx={{ fontWeight: 700, mb: 2 }}>
            {moduleData.essay?.title || "Saggio introduttivo"}
          </Typography>
          <div
            dangerouslySetInnerHTML={{
              __html: marked.parse(moduleData.essay?.essay || "")
            }}
          />
        </TabPanel>
      </Tabs>
    </main>
  )
}
