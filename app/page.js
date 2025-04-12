"use client"

import styles from "./posts.module.css"
import Table from "@mui/joy/Table"
import Sheet from "@mui/joy/Sheet"
import { useState, useEffect } from "react"
import Select from "@mui/joy/Select"
import Option from "@mui/joy/Option"
import _ from "lodash"
import CircularProgress from "@mui/joy/CircularProgress"
import Input from "@mui/joy/Input"
import Button from "@mui/joy/Button"
import { Header } from "@/components/header"
import { getCategoryDetails } from "@/utils/helpers"
import { Avatar, Tab, Tabs, TabList, TabPanel } from "@mui/joy"
import { ArticleChat } from "@/components/articleChat"
import { getPosts, fetchSearchResults } from "@/utils/api"

export default function Posts() {
  const [defaultData, setDefaultData] = useState(null)
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState("date")
  const [sortAsc, setSortAsc] = useState(false)
  const [searchFilter, setSearchFilter] = useState("")
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)

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
    const results = searchFilter.trim()
      ? await fetchSearchResults(searchFilter)
      : await getPosts("sentiment", null).then((res) => res.posts)
    setDefaultData(results)
    setData(_.orderBy(results, [sortOrder], [sortAsc ? "asc" : "desc"]))
    setHasMore(false)
    setLoading(false)
  }

  const sortPosts = (newField) => {
    setSortOrder(newField)
    setData(_.orderBy(data, [newField], [sortAsc ? "asc" : "desc"]))
  }

  const resetFilters = () => {
    setSearchFilter("")
    loadInitialPosts()
  }

  const colorP = (punteggio) => {
    if (punteggio === 0) return "neutral"
    if (punteggio < 25) return "success"
    if (punteggio > 59) return "danger"
    if (punteggio > 25) return "warning"
  }

  useEffect(() => {
    loadInitialPosts()
  }, [])

  if (isLoading || !data)
    return (
      <main className={styles.loading}>
        <CircularProgress variant="solid" size="lg" />
      </main>
    )

  return (
    <main className={styles.main}>
      <Header />
      <Tabs aria-label="Basic tabs" defaultValue={0}>
        <TabList>
          <Tab>Chat</Tab>
          <Tab>Search</Tab>
        </TabList>
        <TabPanel sx={{ width: "1180px", padding: "50px" }} value={0}>
          <ArticleChat data={data} />
        </TabPanel>
        <TabPanel sx={{ width: "1180px", padding: "50px" }} value={1}>
          <Sheet
            variant="outlined"
            sx={{
              width: "100%",
              boxShadow: "sm",
              borderRadius: "sm",
              padding: "20px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "12px",
                marginBottom: 20,
                marginLeft: 10
              }}
            >
              <Input
                placeholder="Cerca articoli"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
              <Button onClick={filterPosts}>Cerca</Button>
              <Button variant="outlined" onClick={resetFilters}>
                Reset
              </Button>
              <Select
                placeholder="Ordina per"
                size="sm"
                value={sortOrder}
                onChange={(e, value) => sortPosts(value)}
              >
                <Option value="date">Data</Option>
                <Option value="title">Titolo</Option>
                <Option value="author">Autore</Option>
                <Option value="prejudice">Pregiudizio</Option>
              </Select>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => {
                  setSortAsc(!sortAsc)
                  setData(
                    _.orderBy(data, [sortOrder], [!sortAsc ? "asc" : "desc"])
                  )
                }}
              >
                {sortAsc ? "⬆️ ASC" : "⬇️ DESC"}
              </Button>
            </div>

            <Table>
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>Titolo</th>
                  <th style={{ width: "10%" }}>Pregiudizio</th>
                  <th style={{ width: "15%" }}>Data</th>
                  <th style={{ width: "15%" }}>Autore</th>
                  <th style={{ textAlign: "center", width: "20%" }}>Tags</th>
                </tr>
              </thead>
              <tbody>
                {data.map((post) => (
                  <tr key={post.id}>
                    <td style={{ textAlign: "left" }}>
                      <a href={`/post/${post.id}`}>{post.title}</a>
                    </td>
                    <td>
                      <Avatar
                        color={colorP(post.prejudice)}
                        sx={{ margin: "auto" }}
                        size="md"
                      >
                        {post.prejudice}
                      </Avatar>
                    </td>
                    <td>{post.date}</td>
                    <td>{post.author}</td>
                    <td className={styles.tags}>
                      {post.tags.map((tag) =>
                        getCategoryDetails(tag).acronym !== "UNK" ? (
                          <Button
                            key={`${tag} + ${post.id}`}
                            size="sm"
                            sx={{
                              color: "#fff",
                              background: getCategoryDetails(tag).color,
                              pointerEvents: "none"
                            }}
                          >
                            {getCategoryDetails(tag).acronym}
                          </Button>
                        ) : null
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {hasMore && (
              <Button onClick={loadMorePosts} sx={{ mt: 3 }}>
                Carica altri
              </Button>
            )}
          </Sheet>
        </TabPanel>
      </Tabs>
    </main>
  )
}
