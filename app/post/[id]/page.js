"use client"

import axios from "axios"
import { usePathname } from "next/navigation"
import styles from "./post.module.css"
import { Carousel } from "@/components/carousel"
import { useState, useEffect } from "react"
import Box from "@mui/joy/Box"
import Divider from "@mui/joy/Divider"
import Button from "@mui/joy/Button"
import fileDownload from "js-file-download"

export default function Post({ params }) {
  const [data, setData] = useState(null)
  const [pathname, setPathname] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [ids, setIds] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)

  let postId

  if (!params.id) {
    setPathname(usePathname())
    postId = pathname.split("/post/")
  } else {
    postId = params.id
  }

  useEffect(() => {
    axios.get(`http://localhost:8000/calciofinanza/${postId}`).then((res) => {
      setData(res.data)
      setIds(res.data.copy.map((e, index) => `slide${index}`))
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
        <Button
          disabled={isDownloading}
          onClick={() => {
            setIsDownloading(true)
            axios
              .get(`http://localhost:4000/screenshot`, {
                responseType: "blob",
                params: {
                  url: `http://localhost:3000/post/${data.id}`,
                  ids: ids,
                  title: data.id
                }
              })
              .then((res) => {
                fileDownload(res.data, `${data.id}.pdf`)
                setIsDownloading(false)
              })
          }}
        >
          Save PDF
        </Button>
      </div>

      {data.copy.map((e, index) => {
        const headline = e.headline
        const content = e.content
        const key = ids[index]
        return (
          <Box key={key} id="carousel">
            <Carousel
              uniqueId={key}
              defaultHeadline={headline}
              defaultContent={content}
            />
            <Divider />
          </Box>
        )
      })}
    </main>
  )
}
