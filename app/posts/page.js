"use client"

import styles from "./posts.module.css"
import Typography from "@mui/joy/Typography"
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

export default function Posts() {
  const [defaultData, setDefaultData] = useState(null)
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState("date")
  const [searchFilter, setSearchFilter] = useState("")
  const [cursor, setCursor] = useState(null)

  const filterPosts = (newFilter) => {
    setSearchFilter(newFilter)
    if (newFilter) {
      setData(
        _.orderBy(
          defaultData.filter(
            (e) =>
              e.title.toLowerCase().includes(newFilter.toLowerCase()) ||
              e.excerpt.toLowerCase().includes(newFilter.toLowerCase())
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
    getPosts("posts", null, (posts, lastVisible) => {
      setDefaultData(posts)
      setData(_.orderBy(posts, [sortOrder], ["desc"]))
      setCursor(lastVisible)
      setLoading(false)
    })
  }, [])

  const nextPage = async () => {
    getPosts("posts", cursor, (posts, lastVisible) => {
      let newPosts = defaultData.concat(posts)
      setDefaultData(newPosts)
      setData(_.orderBy(newPosts, [sortOrder], ["desc"]))
      filterPosts(searchFilter)
      setCursor(lastVisible)
      setLoading(false)
    })
  }

  if (isLoading)
    return (
      <main className={styles.loading}>
        <CircularProgress variant="solid" size="lg" />
      </main>
    )
  if (!data) return <p>No profile data</p>

  return (
    <main className={styles.main}>
      <Typography color="#fff" level="h1">
        Posts
      </Typography>
      <Button
        disabled={isLoading}
        style={{ margin: 25 }}
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
      <Sheet
        variant="outlined"
        sx={{
          width: "100%",
          boxShadow: "sm",
          borderRadius: "sm",
          padding: "20px"
        }}
      >
        <FormControl orientation="horizontal" sx={{ mb: 2, ml: 1, mt: 2 }}>
          <FormLabel>Sort by:</FormLabel>
          <Select
            size="sm"
            value={sortOrder}
            onChange={(event, newValue) => sortPosts(newValue)}
          >
            {["date", "title", "author"].map((axis) => (
              <Option key={axis} value={axis}>
                {axis}
              </Option>
            ))}
          </Select>
        </FormControl>
        <FormControl orientation="horizontal" sx={{ mb: 2, ml: 1, mt: 2 }}>
          <FormLabel>Search</FormLabel>
          <Input
            placeholder="Type anything"
            value={searchFilter}
            onChange={(e) => filterPosts(e.target.value)}
          />
        </FormControl>
        <Table>
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Title</th>
              <th style={{ width: "35%" }}>Excerpt</th>
              <th style={{ width: "15%" }}>Date</th>
              <th style={{ width: "15%" }}>Author</th>
            </tr>
          </thead>
          <tbody>
            {data.map((post) => (
              <tr key={post.id}>
                <td>
                  <a href={`/post/${post.id}`}>{post.title}</a>
                </td>
                <td>{post.excerpt}</td>
                <td>{post.date}</td>
                <td>{post.author}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
      <Button
        style={{ margin: 25 }}
        disabled={isLoading}
        onClick={() => {
          nextPage()
        }}
      >
        Load More
      </Button>
    </main>
  )
}
