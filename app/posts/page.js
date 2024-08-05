"use client"

import axios from "axios"
import styles from "./posts.module.css"
import { Carousel } from "@/components/carousel"
import { useState, useEffect } from "react"

export default function Post({ params }) {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`http://localhost:8000/calciofinanza/`).then((res) => {
      setData(res.data)
      setLoading(false)
    })
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No profile data</p>

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          <code className={styles.code}>Posts</code>
        </p>
        <a href={data.url}>
          {" "}
          <code className={styles.code}>{data.title}</code>
        </a>
      </div>

      <div>
        {data.map((e) => {
          const key = `${e.id}`
          return <p>{e.title}</p>
        })}
      </div>
    </main>
  )
}
