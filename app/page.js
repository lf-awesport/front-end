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
  CardActions
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
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import dayjs from "dayjs"

export default function PostsWrapper() {
  return (
    <Suspense>
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
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [tabValue, setTabValue] = useState(1)
  const [modules, setModules] = useState([])
  const [user, setUser] = useState(null)
  const [progressMap, setProgressMap] = useState({})
  const router = useRouter()

  const loadInitialPosts = async () => {
    setLoading(true)
    const res = await getPosts("sentiment", null)
    setDefaultData(res.posts)
    setData(_.orderBy(res.posts, [sortOrder], [sortAsc ? "asc" : "desc"]))
    setCursor(res.lastVisible)
    setHasMore(res.posts.length === 25)
    setLoading(false)
  }

  const loadMorePosts = async () => {
    if (!hasMore) return
    const res = await getPosts("sentiment", cursor)
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
    setTabValue(1)
  }

  useEffect(() => {
    loadInitialPosts()
  }, [])

  useEffect(() => {
    if (tabValue === 2) {
      onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser)
          const progresses = await getUserModuleProgress(
            currentUser.uid,
            "Sport Marketing"
          )
          setProgressMap(progresses)
        }
      })

      if (modules.length === 0) {
        getModulesFromFirestore("Sport Marketing")
          .then(setModules)
          .catch(console.error)
      }
    }
  }, [tabValue])

  if (isLoading || !data) return <Loading />

  return (
    <ProtectedRoute>
      <main
        className={styles.main}
        style={{ width: "100%", maxWidth: "1300px", margin: "0 auto" }}
      >
        <Tabs
          aria-label="Tabs"
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          sx={{
            width: "100%",
            boxShadow: "0px 4px 8px rgba(92, 201, 250, 0.5)",
            border: "1px solid #5cc9fa",
            borderRadius: "8px",
            padding: 1,
            flex: 1,
            boxSizing: "border-box"
          }}
        >
          <TabList>
            <Tab
              sx={{
                '&[aria-selected="true"]': {
                  backgroundColor: "#5cc9fa",
                  color: "#fff"
                }
              }}
              color="primary"
            >
              Chat
            </Tab>
            <Tab
              sx={{
                '&[aria-selected="true"]': {
                  backgroundColor: "#5cc9fa",
                  color: "#fff"
                }
              }}
              color="primary"
            >
              Feed
            </Tab>
            <Tab
              sx={{
                '&[aria-selected="true"]': {
                  backgroundColor: "#5cc9fa",
                  color: "#fff"
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
                flex: 1
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
              {/* Filters */}
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
                  <Option value="prejudice">Pregiudizio</Option>
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
                    date.isAfter(dayjs(), "day") ||
                    (toDate && date.isAfter(toDate, "day"))
                  }
                  shouldDisableToDate={(date) => date.isAfter(dayjs(), "day")}
                />
              </Sheet>

              {data.map((post) => (
                <Card
                  key={post.id}
                  variant="outlined"
                  sx={{ width: "100%", boxSizing: "border-box" }}
                >
                  {post.imgLink && (
                    <a href={`/post/${post.id}`}>
                      <img
                        src={post.imgLink}
                        alt={post.title}
                        style={{
                          width: "100%",
                          height: "auto",
                          objectFit: "cover",
                          borderTopLeftRadius: "8px",
                          borderTopRightRadius: "8px"
                        }}
                      />
                    </a>
                  )}
                  <CardContent>
                    <Typography level="title-lg">
                      <a href={`/post/${post.id}`} target="_blank">
                        {post.title}
                      </a>
                    </Typography>
                    <Typography level="body-sm" sx={{ mb: 1 }}>
                      {post.date} · {post.author}
                    </Typography>
                    <Typography level="body-md">{post.excerpt}</Typography>
                  </CardContent>
                  <CardActions
                    sx={{
                      justifyContent: "flex-start",
                      flexWrap: "wrap",
                      p: 0
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
                </Card>
              ))}
              {hasMore && (
                <Button
                  onClick={loadMorePosts}
                  sx={{ gridColumn: "1 / -1", mt: 3 }}
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
                    sx={{ width: "100%", boxSizing: "border-box" }}
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
