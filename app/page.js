"use client"

import { Suspense, useEffect, useState } from "react"
import styles from "./posts.module.css"
import {
  Sheet,
  Input,
  Button,
  Typography,
  Select,
  Option,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Card,
  CardContent,
  CardActions,
  Avatar
} from "@mui/joy"
import { getCategoryDetails } from "@/utils/helpers"
import {
  getPosts,
  fetchSearchResults,
  getUserModuleProgress,
  getModulesFromFirestore
} from "@/utils/api"
import { useRouter } from "next/navigation"
import _ from "lodash"
import Loading from "@/components/loading"
import ProtectedRoute from "@/components/protectedRoute"
import DateFilterPanel from "@/components/dateFilterPanel"
import { ArticleChat } from "@/components/articleChat"
import { WordCloud } from "@/components/wordcloud"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import dayjs from "dayjs"

export default function PostsWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <Posts />
    </Suspense>
  )
}

function Posts() {
  const [defaultData, setDefaultData] = useState(null)
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState("date")
  const [sortAsc, setSortAsc] = useState(false)
  const [searchFilter, setSearchFilter] = useState("")
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [now, setNow] = useState(null)
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [tabValue, setTabValue] = useState(1)
  const [modules, setModules] = useState([])
  const [user, setUser] = useState(null)
  const [progressMap, setProgressMap] = useState({})
  const router = useRouter()

  const loadInitialPosts = async () => {
    setLoading(true)
    const res = await getPosts("daily", null)
    setDefaultData(res.posts)
    setData(_.orderBy(res.posts, [sortOrder], [sortAsc ? "asc" : "desc"]))
    setCursor(res.lastVisible)
    setHasMore(res.posts.length === 25)
    setLoading(false)
  }

  const loadMorePosts = async () => {
    if (!hasMore) return
    const res = await getPosts("daily", cursor)
    const newPosts = res.posts.filter(
      (p) => !defaultData.some((e) => e.id === p.id)
    )
    const updated = [...defaultData, ...newPosts]
    setDefaultData(updated)
    setData(_.orderBy(updated, [sortOrder], [sortAsc ? "asc" : "desc"]))
    setCursor(res.lastVisible)
    setHasMore(res.posts.length === 25)
  }

  const filterPosts = async () => {
    setLoading(true)

    const filters = {
      query: searchFilter.trim(),
      fromYear: fromDate?.year(),
      fromMonth: fromDate ? fromDate.month() + 1 : undefined,
      fromDay: fromDate?.date(),
      toYear: toDate?.year(),
      toMonth: toDate ? toDate.month() + 1 : undefined,
      toDay: toDate?.date()
    }

    const results = await fetchSearchResults(filters)
    setDefaultData(results)
    setData(_.orderBy(results, [sortOrder], [sortAsc ? "asc" : "desc"]))
    setHasMore(false)
    setLoading(false)
    setTabValue(1)
  }

  const sortPosts = (newField) => {
    setSortOrder(newField)
    setData(_.orderBy(data, [newField], [sortAsc ? "asc" : "desc"]))
  }

  const resetFilters = () => {
    setSearchFilter("")
    setFromDate(null)
    setToDate(null)
    loadInitialPosts()
    setTabValue(0)
  }

  useEffect(() => {
    loadInitialPosts()
    setNow(dayjs())
  }, [])

  useEffect(() => {
    if (tabValue === 2) {
      onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser)
          const progresses = await getUserModuleProgress(
            currentUser.uid,
            "Sport Management"
          )
          setProgressMap(progresses)
        }
      })

      if (modules.length === 0) {
        getModulesFromFirestore("Sport Management")
          .then(setModules)
          .catch(console.error)
      }
    }
  }, [tabValue])

  const color = (punteggio) => {
    if (punteggio > 70) return "success"
    if (punteggio > 40) return "warning"
    if (punteggio > 0) return "danger"
  }

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
            <Tab
              sx={{
                '&[aria-selected="true"]': {
                  backgroundColor: "#00339a",
                  color: "#fff"
                },
                '&[aria-selected="false"]': {
                  color: "#00339a",
                  backgroundColor: "#fff"
                }
              }}
              color="primary"
            >
              Chat
            </Tab>
            <Tab
              sx={{
                '&[aria-selected="true"]': {
                  backgroundColor: "#00339a",
                  color: "#fff"
                },
                '&[aria-selected="false"]': {
                  color: "#00339a",
                  backgroundColor: "#fff"
                }
              }}
              color="primary"
            >
              Feed
            </Tab>
            <Tab
              sx={{
                '&[aria-selected="true"]': {
                  backgroundColor: "#00339a",
                  color: "#fff"
                },
                '&[aria-selected="false"]': {
                  color: "#00339a",
                  backgroundColor: "#fff"
                }
              }}
              color="primary"
            >
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
              {/* TODO fix css Filters
              <Sheet
                sx={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  alignItems: "center"
                }}
              >
                <Input
                  placeholder="Cerca articoli..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && filterPosts()}
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <Button disabled={!searchFilter} onClick={filterPosts}>
                  Cerca
                </Button>
                <Button variant="outlined" onClick={resetFilters}>
                  Reset
                </Button>
                <Select
                  value={sortOrder}
                  onChange={(e, value) => sortPosts(value)}
                  size="sm"
                >
                  <Option value="date">Data</Option>
                  <Option value="title">Titolo</Option>
                  <Option value="author">Autore</Option>
                </Select>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => {
                    setSortAsc(!sortAsc)
                    setData(
                      _.orderBy(data, [sortOrder], [!sortAsc ? "asc" : "desc"])
                    )
                  }}
                >
                  {sortAsc ? "⬆️ ASC" : "⬇️ DESC"}
                </Button>
                <DateFilterPanel
                  fromDate={fromDate}
                  toDate={toDate}
                  setFromDate={setFromDate}
                  setToDate={setToDate}
                  shouldDisableFromDate={(date) =>
                    now &&
                    (date.isAfter(now, "day") ||
                      (toDate && date.isAfter(toDate, "day")))
                  }
                  shouldDisableToDate={(date) =>
                    now && date.isAfter(now, "day")
                  }
                />
              </Sheet> */}

              {data.map((post) => (
                <Card
                  key={post.id}
                  variant="outlined"
                  sx={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 0,
                    boxShadow:
                      "0 4px 24px 0 rgba(0, 51, 154, 0.18), 0 1.5px 6px 0 rgba(0,0,0,0.08)",
                    border: "none"
                  }}
                >
                  <Typography
                    level="title-lg"
                    sx={{
                      padding: 2,
                      backgroundColor: "#00339a",
                      textAlign: "center"
                    }}
                  >
                    <a
                      style={{
                        color: "#fff",
                        fontSize: "1.5rem",
                        textDecoration: "none",
                        textAlign: "center"
                      }}
                      href={`/post/${post.id}`}
                    >
                      {post.title.split("Report del ")[1] || post.title}
                    </a>
                  </Typography>
                  <CardContent sx={{ padding: 1, boxSizing: "border-box" }}>
                    {/* <Typography level="body-md">
                      {post.rerank_summary}
                    </Typography> */}
                    {/* <Typography level="body-sm">
                      {post.date} · {post.author}
                    </Typography> */}
                    <a href={`/post/${post.id}`} style={{ cursor: "pointer" }}>
                      <WordCloud data={post} />
                    </a>
                    {/* <CardActions
                      sx={{
                        justifyContent: "space-around",
                        flexWrap: "wrap",
                        p: "1.25rem 1rem"
                      }}
                    >
                      {post.tags.map((tag) => {
                        const cat = getCategoryDetails(tag)
                        return cat.acronym !== "UNK" ? (
                          <Button
                            key={`${tag}-${post.id}`}
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
                        ) : null
                      })}
                    </CardActions>
                    {post.similarityScore && (
                      <Avatar color={color(post.similarityScore)} size="lg">
                        {post.similarityScore}
                      </Avatar>
                    )} */}
                  </CardContent>
                </Card>
              ))}
              {hasMore && (
                <Button
                  onClick={loadMorePosts}
                  sx={{
                    gridColumn: "1 / -1",
                    mt: 3,
                    backgroundColor: "#00339a"
                  }}
                >
                  Carica altri
                </Button>
              )}
            </Sheet>
          </TabPanel>

          <TabPanel value={2}>
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
                const levels = mod.levels || {}
                return (
                  <Card
                    key={mod.id}
                    variant="outlined"
                    sx={{
                      width: "100%",
                      boxSizing: "border-box",
                      boxShadow:
                        "0 4px 24px 0 rgba(0, 51, 154, 0.18), 0 1.5px 6px 0 rgba(0,0,0,0.08)",
                      border: "none"
                    }}
                  >
                    {mod.cover && (
                      <a href={`/module/${mod.id}`}>
                        <img
                          src={mod.cover}
                          alt={mod.topic}
                          style={{
                            width: "100%",
                            height: "auto",
                            borderTopLeftRadius: "8px",
                            borderTopRightRadius: "8px",
                            objectFit: "cover"
                          }}
                        />
                      </a>
                    )}
                    <CardContent>
                      <Typography level="title-lg">
                        <a href={`/module/${mod.id}`}>{mod.topic}</a>
                      </Typography>
                      <Typography level="body-sm" sx={{ mb: 1 }}>
                        {mod.materia}
                      </Typography>
                      <Sheet
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          mt: 1
                        }}
                      >
                        {[1, 2, 3].map((lvl) => {
                          const isDone =
                            progressMap?.[mod.id]?.[`level${lvl}Completed`]
                          return (
                            <Button
                              key={`badge-${lvl}`}
                              size="sm"
                              variant="soft"
                              sx={{
                                backgroundColor: isDone ? "#2ecc71" : "#ccc",
                                color: "#fff",
                                pointerEvents: "none",
                                minWidth: 50,
                                fontWeight: "bold"
                              }}
                            >
                              LVL {lvl}
                            </Button>
                          )
                        })}
                      </Sheet>
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
