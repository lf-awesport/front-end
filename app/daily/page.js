"use client"

import { usePathname } from "next/navigation"
import styles from "./daily.module.css"
import { Carousel } from "@/components/carousel"
import { useState, useEffect } from "react"
import Box from "@mui/joy/Box"
import Divider from "@mui/joy/Divider"
import Button from "@mui/joy/Button"
import fileDownload from "js-file-download"
import CircularProgress from "@mui/joy/CircularProgress"
import {
  getCarousel,
  updateCarousel,
  downloadPDF,
  getDailySummary
} from "@/utils/api"

export default function Post({ params }) {
  const [data, setData] = useState(null)
  const [pathname, setPathname] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [ids, setIds] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    let date = "2024-06-03T23:00:00.000Z"

    // if (!params.id) {
    //   setPathname(usePathname())
    //   postId = pathname.split("/post/")
    // } else {
    //   postId = params.id
    // }
    setLoading(true)

    getDailySummary(date.split("T")[0], (res) => {
      setData(res.data)
      setLoading(false)
    })
  }, [])

  const updateCopy = (headline, content, slideNumber) => {
    let updatedCarousel = data.carousel
    updatedCarousel[slideNumber] = { headline, content }
    const updatedPost = {
      id: data.id,
      carousel: updatedCarousel
    }
    setLoading(true)
    updateCarousel(updatedPost, (res) => {
      setData(res.data)
      setLoading(false)
    })
  }

  if (isLoading)
    return (
      <main className={styles.loading}>
        <CircularProgress variant="solid" size="lg" />
      </main>
    )
  if (!data) return <p>No data</p>

  return (
    <main className={styles.main}>
      <p>{data}</p>
    </main>
  )
}
