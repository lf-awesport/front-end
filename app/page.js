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
import Loading from "@/components/loading"
import ProtectedRoute from "@/components/protectedRoute"
import { ArticleChat } from "@/components/articleChat"

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
      <Posts />
    </Suspense>
  )
}

function Posts() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(1)
  const [modules, setModules] = useState([])

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
    if (tabValue !== 1 || modules.length > 0) {
      return
    }

    getModulesFromFirestore(LESSON_SUBJECT)
      .then(setModules)
      .catch(console.error)
  }, [modules.length, tabValue])

  if (isLoading || !data) return <Loading />

  return (
    <ProtectedRoute>
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
            <Tab sx={TAB_STYLES} color="primary">
              Chat
            </Tab>
            <Tab sx={TAB_STYLES} color="primary">
              Lezioni
            </Tab>
          </TabList>

          <TabPanel value={0} sx={{ padding: 0, display: "flex", flex: 1 }}>
            <Sheet
              sx={{
                mb: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
                flex: 1,
                backgroundColor: "white"
              }}
            >
              <ArticleChat data={data} />
            </Sheet>
          </TabPanel>

          <TabPanel value={1}>
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
                const coverSrc = mod.cover || "/testcover.jpeg"
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
                          alt={mod.topic || "Lesson cover"}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderTopLeftRadius: "8px",
                            borderTopRightRadius: "8px",
                            borderBottomLeftRadius: "8px",
                            borderBottomRightRadius: "8px",
                            objectFit: "contain",
                            objectPosition: "center top",
                            display: "block",
                            filter: "drop-shadow(0 16px 28px rgba(10, 47, 143, 0.14))"
                          }}
                        />
                      </div>
                    </a>
                    <CardContent>
                      <Typography level="title-lg">
                        <a href={`/module/${mod.id}`}>{mod.topic}</a>
                      </Typography>
                      <Typography level="body-sm" sx={{ mb: 1 }}>
                        {mod.materia}
                      </Typography>
                    </CardContent>
                    <CardActions
                      sx={{
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                        p: 0
                      }}
                    >
                      {mod.tags?.map((tag) => {
                        const cat = getCategoryDetails(tag)
                        return (
                          <Button
                            key={`${tag}-${mod.id}`}
                            size="sm"
                            sx={{
                              mr: 1,
                              mb: 1,
                              background: cat.color,
                              color: "#fff",
                              pointerEvents: "none",
                              width: "auto",
                              minWidth: "fit-content",
                              maxWidth: "50px"
                            }}
                          >
                            {cat.acronym}
                          </Button>
                        )
                      })}
                    </CardActions>
                  </Card>
                )
              })}
            </Sheet>
          </TabPanel>
        </Tabs>
      </main>
    </ProtectedRoute>
  )
}
