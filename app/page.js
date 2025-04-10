"use client"

import styles from "./posts.module.css"
import Table from "@mui/joy/Table"
import Sheet from "@mui/joy/Sheet"
import { useState, useEffect } from "react"
import FormControl from "@mui/joy/FormControl"
import Select from "@mui/joy/Select"
import Option from "@mui/joy/Option"
import _ from "lodash"
import CircularProgress from "@mui/joy/CircularProgress"
import FormLabel from "@mui/joy/FormLabel"
import Input from "@mui/joy/Input"
import { getPosts, scrapePosts } from "@/utils/api"
import Button from "@mui/joy/Button"
import { Header } from "@/components/header"
import { getCategoryDetails } from "@/utils/helpers"
import { Avatar, Tab, Tabs, TabList, TabPanel } from "@mui/joy"
import { ArticleChat } from "@/components/articleChat"

export default function Posts() {
  const [defaultData, setDefaultData] = useState(null)
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [sortOrder, setSortOrder] = useState("date")
  const [searchFilter, setSearchFilter] = useState("")
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)

  const filterPosts = (newFilter) => {
    setSearchFilter(newFilter)
    if (newFilter) {
      setData(
        _.orderBy(
          defaultData.filter(
            (e) =>
              e.title.toLowerCase().includes(newFilter.toLowerCase()) ||
              e.tags.some((t) =>
                t.toLowerCase().includes(newFilter.toLowerCase())
              )
          ),
          [sortOrder],
          ["desc"]
        )
      )
    } else {
      setData(_.orderBy(defaultData, [sortOrder], ["desc"]))
    }
  }

  const sortPosts = (newValue) => {
    setSortOrder(newValue)
    setData(_.orderBy(data, [newValue], ["desc"]))
  }

  useEffect(() => {
    getPosts("sentiment", null).then((res) => {
      setDefaultData(res.posts)
      setData(_.orderBy(res.posts, [sortOrder], ["desc"]))
      setCursor(res.lastVisible)
      setLoading(false)
    })
  }, [])

  const nextPage = async () => {
    const res = await getPosts("sentiment", cursor)

    if (res.posts.length === 0) {
      setHasMore(false)
      return // Exit if no more posts are available
    }

    const newPosts = res.posts.filter(
      (newPost) =>
        !defaultData.some((existingPost) => existingPost.id === newPost.id)
    )
    const updatedPosts = defaultData.concat(newPosts)

    setDefaultData(updatedPosts)

    const filteredData = searchFilter
      ? updatedPosts.filter(
          (e) =>
            e.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
            e.tags.some((t) =>
              t.toLowerCase().includes(searchFilter.toLowerCase())
            )
        )
      : updatedPosts

    setData(_.orderBy(filteredData, [sortOrder], ["desc"]))
    setCursor(res.lastVisible) // Update cursor for pagination
  }

  const colorP = (punteggio) => {
    if (punteggio === 0) return "neutral"
    if (punteggio < 25) return "success"
    if (punteggio > 59) return "danger"
    if (punteggio > 25) return "warning"
  }

  const color = (punteggio) => {
    if (punteggio > 64) return "success"
    if (punteggio > 33) return "warning"
    if (punteggio > 0) return "danger"
  }

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
        <TabPanel
          sx={{
            width: "1180px",
            padding: "0 50px"
          }}
          value={0}
        >
          <ArticleChat data={data} />
        </TabPanel>
        <TabPanel
          sx={{
            width: "1180px",
            padding: "50px"
          }}
          value={1}
        >
          <Sheet
            variant="outlined"
            sx={{
              width: "100%",
              boxShadow: "sm",
              borderRadius: "sm",
              padding: "20px"
            }}
          >
            <FormControl
              orientation="horizontal"
              sx={{
                mb: 2,
                ml: 1,
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                height: "50px",
                alignItems: "center"
              }}
            >
              <div>
                <FormLabel>Articoli Caricati: {data.length}</FormLabel>

                <FormLabel>Sort by:</FormLabel>
                <Select
                  size="sm"
                  value={sortOrder}
                  onChange={(event, newValue) => sortPosts(newValue)}
                >
                  {["date", "title", "author", "readability", "prejudice"].map(
                    (axis) => (
                      <Option key={axis} value={axis}>
                        {axis}
                      </Option>
                    )
                  )}
                </Select>
              </div>
            </FormControl>
            <FormControl
              orientation="horizontal"
              sx={{
                mb: 2,
                ml: 1,
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                height: "50px",
                alignItems: "center"
              }}
            >
              <div>
                <FormLabel>Search</FormLabel>
                <Input
                  placeholder="Type anything"
                  value={searchFilter}
                  onChange={(e) => filterPosts(e.target.value)}
                />
              </div>
              <Button
                disabled={isLoading}
                sx={{
                  color: "#fff",
                  background: "#003399"
                }}
                onClick={() => {
                  setLoading(true)
                  scrapePosts(() => {
                    setLoading(false)
                    getPosts((posts) => {
                      setDefaultData(_.orderBy(posts, [sortOrder], ["desc"]))
                      setData(_.orderBy(posts, [sortOrder], ["desc"]))
                      setLoading(false)
                    }, "posts")
                  })
                }}
              >
                Update
              </Button>
            </FormControl>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: "45%" }}>Titolo</th>
                  <th style={{ width: "7.5%", textAlign: "center" }}>
                    Leggibilità
                  </th>
                  <th style={{ width: "7.5%", textAlign: "center" }}>
                    Pregiudizio
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>Data</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Autore</th>
                  <th style={{ width: "20%", textAlign: "center" }}>Tags</th>
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
                        color={color(post.readability)}
                        sx={{ margin: "auto" }}
                        size="md"
                      >
                        {post.readability}
                      </Avatar>
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
          </Sheet>
          <Button
            disabled={!hasMore}
            style={{ margin: 25 }}
            onClick={() => {
              nextPage()
            }}
            sx={{
              color: "#fff",
              background: "#003399"
            }}
          >
            Load More
          </Button>
        </TabPanel>
      </Tabs>
    </main>
  )
}
