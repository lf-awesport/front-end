'use client'

import axios from "axios"
import Image from "next/image";
import styles from "./page.module.css";
import { Carousel } from "@/components/carousel";
import { useState, useEffect } from 'react'


export default function Home() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
 
  useEffect(() => {
    axios.get("http://localhost:8000/calciofinanza")
      .then((res) => {
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
          <code className={styles.code}>app/page.js</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div>
        { data[1].copy.map((e, index) => {
          const headline = e.headline 
          const content = e.content
          const key = `${e.id} + ${index}` 
         return <Carousel key={key} defaultHeadline={headline} defaultContent={content} />
       })}
      </div>
    </main>
  );
}
