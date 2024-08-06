"use client"

import axios from "axios"
import styles from "./posts.module.css"
import Typography from "@mui/joy/Typography"
import Table from "@mui/joy/Table"
import Sheet from "@mui/joy/Sheet"
import { useState, useEffect } from "react"
import FormControl from "@mui/joy/FormControl"
import Select from "@mui/joy/Select"
import Option from "@mui/joy/Option"
import FormLabel from "@mui/joy/FormLabel"
import _ from "lodash"
import CircularProgress from "@mui/joy/CircularProgress"

export default function Posts() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState("date")

  const sortPosts = (newValue) => {
    setSortOrder(newValue)
    setData(_.orderBy(data, [newValue], ["desc"]))
  }

  useEffect(() => {
    axios.get(`http://localhost:8000/calciofinanza/`).then((res) => {
      setData(res.data)
      setLoading(false)
    })
  }, [])

  if (isLoading) return <CircularProgress variant="solid" size="lg" />
  if (!data) return <p>No profile data</p>

  return (
    <div className={styles.container}>
      <Typography color="#fff" level="h1">
        Posts
      </Typography>
      <Sheet>
        <FormControl
          orientation="horizontal"
          sx={{ mb: 2, ml: 1, mt: 2 }}
          style={{ justifyContent: "center" }}
        >
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
                <td>{post.date.split("T")[0]}</td>
                <td>{post.author}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
    </div>
  )
}
