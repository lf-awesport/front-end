"use client"

import { Suspense, useEffect, useState } from "react"
import styles from "./posts.module.css"
import {
  Sheet,
  Button,
  Typography,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Card,
  CardContent,
  CardActions
} from "@mui/joy"
import { getCategoryDetails } from "@/utils/helpers"
import { getPosts, getModulesFromFirestore } from "@/utils/api"
import { useAuth } from "@/utils/authContext"
import { AdminQuickLinks } from "@/components/adminQuickLinks"
import Loading from "@/components/loading"
import ProtectedRoute from "@/components/protectedRoute"

const LESSON_SUBJECT = "Sport Management"
const TAB_STYLES = {
  '&[aria-selected="true"]': {
    backgroundColor: "#00339a",
    color: "#fff"
  },
  '&[aria-selected="false"]': {
    color: "#00339a",
    backgroundColor: "#fff"
  }
}

export default function PostsWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedRoute>
        <PostsContent />
      </ProtectedRoute>
    </Suspense>
  )
}

function PostsContent() {
  const { viewer } = useAuth()
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [modules, setModules] = useState([])
  const canViewAdmin = Boolean(viewer?.isAdmin)

  const loadPosts = async () => {
    setLoading(true)

    try {
      const res = await getPosts("daily", null)
      setData(res.posts)
    } catch (error) {
      console.error(error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    if (tabValue !== 0 || modules.length > 0) {
      return
    }

    getModulesFromFirestore(LESSON_SUBJECT)
      .then(setModules)
      .catch(console.error)
  }, [modules.length, tabValue])

  useEffect(() => {
    if (!canViewAdmin && tabValue !== 0) {
      setTabValue(0)
    }
  }, [canViewAdmin, tabValue])

  if (isLoading || !data) return <Loading />

  return (
    <main
      className={styles.main}
      style={{
        width: "100%",
        maxWidth: "1300px",
        margin: "0 auto",
        backgroundColor: "#fff"
      }}
    >
      <Tabs
        aria-label="Tabs"
        value={tabValue}
        onChange={(e, val) => setTabValue(val)}
        sx={{
          width: "100%",
          boxShadow:
            "0 4px 24px 0 rgba(0, 51, 154, 0.18), 0 1.5px 6px 0 rgba(0,0,0,0.08)",
          minHeight: "88vh",
          padding: 1,
          flex: 1,
          boxSizing: "border-box"
        }}
      >
        <TabList>
          <Tab value={0} sx={TAB_STYLES} color="primary">
            Lezioni
          </Tab>
          {canViewAdmin ? (
            <Tab value={1} sx={TAB_STYLES} color="primary">
              Admin
            </Tab>
          ) : null}
        </TabList>

        <TabPanel value={0}>
          <Sheet
            sx={{
              mb: 4,
              p: 0,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr"
              },
              gap: 2
            }}
          >
            {modules.map((mod) => {
              const coverSrc = mod.coverImage?.url || mod.cover || "/testcover.jpeg"
              const coverAlt =
                mod.coverImage?.alt || mod.topic || mod.title || "Lesson cover"
              return (
                <Card
                  key={mod.id}
                  variant="outlined"
                  sx={{
                    width: "100%",
                    boxSizing: "border-box",
                    boxShadow:
                      "0 4px 24px 0 rgba(0, 51, 154, 0.18), 0 1.5px 6px 0 rgba(0,0,0,0.08)",
                    border: "none",
                    overflow: "hidden"
                  }}
                >
                  <a
                    href={`/module/${mod.id}`}
                    style={{
                      display: "block",
                      textDecoration: "none",
                      background:
                        "linear-gradient(180deg, rgba(237, 244, 255, 0.98), rgba(230, 239, 255, 0.92))"
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "300px",
                        padding: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box"
                      }}
                    >
                      <img
                        src={coverSrc}
                        alt={coverAlt}
                        style={{
                          width: "100%",
                          height: "100%",
                            borderTopLeftRadius: "8px",
                            borderTopRightRadius: "8px",
                            borderBottomLeftRadius: "8px",
                            borderBottomRightRadius: "8px",
                            objectFit: "contain",
                          objectFit: "contain",
                          display: "block"
                        }}
                      />
                    </div>
                  </a>

                  <CardContent sx={{ pb: 0 }}>
                    <Typography level="title-lg">
                      <a
                        href={`/module/${mod.id}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {mod.topic || mod.title || mod.id}
                      </a>
                    </Typography>

                    <Typography level="body-sm" sx={{ mt: 1, color: "rgba(18, 36, 85, 0.66)" }}>
                      {mod.materia || LESSON_SUBJECT}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                    <a href={`/module/${mod.id}`} style={{ textDecoration: "none", width: "100%" }}>
                      <Button fullWidth color="primary" sx={{ borderRadius: 999 }}>
                        Apri modulo
                      </Button>
                    </a>
                  </CardActions>
                </Card>
              )
            })}
          </Sheet>
        </TabPanel>

        {canViewAdmin ? (
          <TabPanel value={1}>
            <AdminQuickLinks
              title="Strumenti admin"
              description="Accedi rapidamente alle superfici riservate di chat, feedback e gestione inviti."
            />
          </TabPanel>
        ) : null}
      </Tabs>
    </main>
  )
}
