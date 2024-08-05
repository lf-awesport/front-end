"use client"

import axios from "axios"
import { usePathname } from "next/navigation"
import styles from "./post.module.css"
import { Carousel } from "@/components/carousel"
import { useState, useEffect } from "react"
import Box from "@mui/joy/Box"
import Divider from "@mui/joy/Divider"

export default function Post({ params }) {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  let postId

  if (!params.id) {
    const pathname = usePathname()
    postId = pathname.split("/post/")
  } else {
    postId = params.id
  }

  useEffect(() => {
    axios.get(`http://localhost:8000/calciofinanza/${postId}`).then((res) => {
      setData(res.data)
      setLoading(false)
    })
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No profile data</p>

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <a href="/posts">
          <code className={styles.code}>Back</code>
        </a>
        <a href={data.url} target="_blank">
          <code className={styles.code}>{data.title}</code>
        </a>
      </div>

      {data.copy.map((e, index) => {
        const headline = e.headline
        const content = e.content
        const key = `${e.id} + ${index}`
        return (
          <Box key={key}>
            <Carousel defaultHeadline={headline} defaultContent={content} />
            <Divider />
          </Box>
        )
      })}
    </main>
  )
}
