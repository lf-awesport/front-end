"use client"

import { usePathname } from "next/navigation"
import styles from "./daily.module.css"
import { useState, useEffect } from "react"
import Box from "@mui/joy/Box"
import Divider from "@mui/joy/Divider"
import Button from "@mui/joy/Button"
import { Typography, Stack } from "@mui/joy"
import CircularProgress from "@mui/joy/CircularProgress"
import { getDailySummary } from "@/utils/api"

export default function Post({ params }) {
  const [data, setData] = useState(null)
  const [pathname, setPathname] = useState(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    let date

    if (!params.id) {
      setPathname(usePathname())
      date = pathname.split("/daily/")
    } else {
      date = params.id
    }

    setLoading(true)

    getDailySummary(date, (res) => {
      setData(res.data)
      setLoading(false)
    })
  }, [])

  // const updateCopy = (headline, content, slideNumber) => {
  //   let updatedCarousel = data.carousel
  //   updatedCarousel[slideNumber] = { headline, content }
  //   const updatedPost = {
  //     id: data.id,
  //     carousel: updatedCarousel
  //   }
  //   setLoading(true)
  //   updateCarousel(updatedPost, (res) => {
  //     setData(res.data)
  //     setLoading(false)
  //   })
  // }

  if (isLoading)
    return (
      <main className={styles.loading}>
        <CircularProgress variant="solid" size="lg" />
      </main>
    )
  if (!data) return <p>No profile data</p>

  return (
    <main className={styles.main}>
      <Typography level="h1" color="fff">
        {data.body.title}
      </Typography>
      <Typography level="body-sm" color="fff">
        {data.body.content}
      </Typography>
    </main>
  )
}
