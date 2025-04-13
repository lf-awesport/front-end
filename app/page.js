"use client"

import { Suspense } from "react"
import styles from "./posts.module.css"
import { useState, useEffect } from "react"
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
import { ArticleChat } from "@/components/articleChat"
import { getPosts, fetchSearchResults } from "@/utils/api"
import { useSearchParams, useRouter } from "next/navigation"
import _ from "lodash"
import Loading from "@/components/loading"

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
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [tabValue, setTabValue] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()

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
    if (searchFilter.trim()) {
      router.push(`?tab=search&q=${encodeURIComponent(searchFilter)}`)
    } else {
      router.push("?tab=search")
    }

    const results = searchFilter.trim()
      ? await fetchSearchResults(searchFilter)
      : await getPosts("sentiment", null).then((res) => res.posts)
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
    router.push("/")
    loadInitialPosts()
    setTabValue(1)
  }

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    const queryParam = searchParams.get("q") || ""

    if (tabParam === "search") {
      setSearchFilter(queryParam)
      setTabValue(1)
      setLoading(true)
      fetchSearchResults(queryParam).then((results) => {
        setDefaultData(results)
        setData(_.orderBy(results, [sortOrder], [sortAsc ? "asc" : "desc"]))
        setHasMore(false)
        setLoading(false)
      })
    } else {
      loadInitialPosts()
    }
  }, [searchParams])

  if (isLoading) return <Loading />
  if (!data) return <Loading />

  return (
    <main
      className={styles.main}
      style={{
        width: "100%",
        maxWidth: "1300px",
        margin: "auto"
      }}
    >
      <Tabs
        aria-label="Tabs"
        value={tabValue}
        onChange={(e, val) => setTabValue(val)}
        sx={{ width: "100%" }}
      >
        <TabList sx={{ width: "100%" }}>
          <Tab>Chat</Tab>
          <Tab>Search</Tab>
        </TabList>
        <TabPanel value={0} sx={{ padding: 0 }}>
          <Sheet
            sx={{
              mb: 4,
              p: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center"
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
            <Button onClick={filterPosts} sx={{ background: "#5cc9fa" }}>
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
            {data.map((post) => (
              <Card
                key={post.id}
                variant="outlined"
                sx={{ mb: 2, width: "100%" }}
              >
                <CardContent>
                  <Typography level="title-lg">
                    <a href={`/post/${post.id}`}>{post.title}</a>
                  </Typography>
                  <Typography level="body-sm" sx={{ mb: 1 }}>
                    {post.date} · {post.author}
                  </Typography>
                  <Typography level="body-md">{post.excerpt}</Typography>
                </CardContent>
                <CardActions
                  sx={{ justifyContent: "flex-start", flexWrap: "wrap", p: 0 }}
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
                sx={{ background: "#5cc9fa", mt: 3 }}
              >
                Carica altri
              </Button>
            )}
          </Sheet>
        </TabPanel>
      </Tabs>
    </main>
  )
}
