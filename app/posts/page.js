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

  const filterPosts = (newFilter) => {
    setSearchFilter(newFilter)
    if (newFilter) {
      setData(
        _.orderBy(
          defaultData.filter(
            (e) => e.title.includes(newFilter) || e.excerpt.includes(newFilter)
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
    getPosts((posts) => {
      setDefaultData(_.orderBy(posts, [sortOrder], ["desc"]))
      setData(_.orderBy(posts, [sortOrder], ["desc"]))
      setLoading(false)
    }, "posts")
  }, [])

  if (isLoading)
    return (
      <main className={styles.loading}>
        <CircularProgress variant="solid" size="lg" />
      </main>
    )
  if (!data) return <p>No profile data</p>

  return (
    <div className={styles.container}>
      <div>
        <Typography color="#fff" level="h1">
          Posts
        </Typography>
        <Button
          disabled={isLoading}
          style={{ margin: 10 }}
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
      </div>
      <Sheet>
        <div className={styles.formControl}>
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
        </div>
        <Table>
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Title</th>
              <th style={{ width: "35%" }}>Excerpt</th>
              <th>Date</th>
              <th>Author</th>
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
    </div>
  )
}
