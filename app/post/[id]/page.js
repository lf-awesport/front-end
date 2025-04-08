"use client"

import { usePathname } from "next/navigation"
import styles from "./post.module.css"
import { TextAnalysis } from "@/components/textAnalysis"
import { WordCloud } from "@/components/wordcloud"
import { Takeaways } from "@/components/takeaways"
import { Suggestions } from "@/components/suggestions"
import { Header } from "@/components/header"
import { ArticleChat } from "@/components/articleChat"
import { useState, useEffect } from "react"
import {
  Divider,
  Button,
  CircularProgress,
  Typography,
  Tab,
  Tabs,
  TabList,
  TabPanel
} from "@mui/joy"
import { getPost } from "@/utils/api"
import { getCategoryDetails } from "@/utils/helpers"

export default function Post({ params }) {
  const [data, setData] = useState(null)
  const [getPathname, setPathname] = useState(null)
  const [isLoading, setLoading] = useState(true)

  const pathname = usePathname()

  useEffect(() => {
    let postId

    if (!params.id) {
      setPathname(pathname)
      postId = pathname.split("/")
    } else {
      postId = params.id
    }

    getPost(postId, (res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (isLoading)
    return (
      <main className={styles.loading}>
        <CircularProgress variant="solid" size="lg" />
      </main>
    )
  if (!data)
    return (
      <main className={styles.loading}>
        <Typography level="h1" color="fff" style={{ marginBottom: 20 }}>
          NOT FOUND
        </Typography>
      </main>
    )

  return (
    <main className={styles.main}>
      <Header>
        <a href="/">
          <code className={styles.code}>Home</code>
        </a>
      </Header>
      <Tabs aria-label="Basic tabs" defaultValue={0}>
        <TabList>
          <Tab>Info</Tab>
          <Tab>Key Takeaways</Tab>
          <Tab>Related Articles</Tab>
          <Tab>Chat</Tab>
        </TabList>
        <TabPanel
          sx={{
            width: "1180px",
            padding: " 0 50px"
          }}
          value={0}
        >
          <div className={styles.summary}>
            <a href={data.url} target="_blank">
              <Typography level="h1" color="fff" style={{ marginBottom: 20 }}>
                {data.title}
              </Typography>
            </a>
            <div className={styles.subSummary}>
              <img className={styles.img} src={data.imgLink} />
              <div className={styles.summaryText}>
                <Typography
                  level="body-sm"
                  color="fff"
                  style={{ marginBottom: 20 }}
                >
                  {data.date}
                </Typography>
                <Divider />
                <Typography
                  level="body-sm"
                  color="fff"
                  style={{ marginBottom: 20 }}
                >
                  {data.author}
                </Typography>
                <Divider />
                <Typography
                  level="body-sm"
                  color="fff"
                  style={{ marginBottom: 20 }}
                >
                  {data.excerpt}
                </Typography>
                <Divider />
                <div className={styles.tags}>
                  {data.tags.map((tag) => (
                    <Button
                      key={`${tag} + ${data.id}`}
                      size="sm"
                      sx={{
                        color: "#fff",
                        background: getCategoryDetails(tag).color,
                        pointerEvents: "none"
                      }}
                    >
                      {getCategoryDetails(tag).acronym}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Divider />
          <WordCloud data={data} />
          <Divider />
          <TextAnalysis data={data} />
        </TabPanel>
        <TabPanel
          sx={{
            width: "1180px",
            padding: "0 50px"
          }}
          value={1}
        >
          <Takeaways data={data} />
        </TabPanel>
        <Divider />
        <TabPanel
          sx={{
            width: "1180px",
            padding: "0 50px"
          }}
          value={2}
        >
          <Suggestions data={data} />
        </TabPanel>
        <TabPanel
          sx={{
            width: "1180px",
            padding: "0 50px"
          }}
          value={3}
        >
          <ArticleChat data={data} />
        </TabPanel>
      </Tabs>
    </main>
  )
}
