"use client"

import { usePathname } from "next/navigation"
import styles from "./post.module.css"
import { TextAnalysis } from "@/components/textAnalysis"
import { WordCloud } from "@/components/wordcloud"
import { Takeaways } from "@/components/takeaways"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState, useEffect } from "react"
import {
  Divider,
  Button,
  CircularProgress,
  Typography,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  Sheet
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
    <main
      className={styles.main}
      style={{
        width: "100%",
        maxWidth: "100%",
        padding: "2rem 0"
      }}
    >
      <Header>
        <a href="/">
          <code className={styles.code}>Home</code>
        </a>
      </Header>
      <Tabs aria-label="Basic tabs" defaultValue={0}>
        <TabList>
          <Tab>Info</Tab>
        </TabList>

        {/* Tab 1 */}
        <TabPanel>
          <Sheet
            sx={{
              mb: 4,
              p: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center"
            }}
          >
            <div className={styles.summary}>
              <a href={data.url} target="_blank">
                <Typography level="h2" color="fff" style={{ marginBottom: 20 }}>
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
                    {data.tags.map((tag) => {
                      const cat = getCategoryDetails(tag)
                      return cat.acronym !== "UNK" ? (
                        <Button
                          key={`${tag}-${data.id}`}
                          size="sm"
                          sx={{
                            color: "#fff",
                            background: cat.color,
                            pointerEvents: "none"
                          }}
                        >
                          {cat.acronym}
                        </Button>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            </div>
            <WordCloud data={data} />
            <Takeaways data={data} />
            <TextAnalysis data={data} />
          </Sheet>
        </TabPanel>
      </Tabs>
      <Footer />
    </main>
  )
}
