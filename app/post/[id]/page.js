"use client"

import { usePathname } from "next/navigation"
import styles from "./post.module.css"
import { TextAnalysis } from "@/components/textAnalysis"
import { WordCloud } from "@/components/wordcloud"
import { Takeaways } from "@/components/takeaways"
import Loading from "@/components/loading"

import { useState, useEffect } from "react"
import {
  Divider,
  Button,
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

  if (isLoading) return <Loading />
  if (!data) return <Loading />

  return (
    <main
      className={styles.main}
      style={{
        width: "100%",
        maxWidth: "1300px",
        margin: "auto"
      }}
    >
      <Tabs
        aria-label="Basic tabs"
        defaultValue={0}
        sx={{
          width: "100%",
          boxShadow: "0px 4px 8px rgba(92, 201, 250, 0.5)",
          border: "1px solid #5cc9fa",
          borderRadius: "8px",
          padding: 1
        }}
      >
        <TabList sx={{ width: "100%" }}>
          <Tab
            color="primary"
            sx={{
              '&[aria-selected="true"]': {
                backgroundColor: "#5cc9fa", // Replace with your desired color
                color: "#fff"
              }
            }}
          >
            Info
          </Tab>
        </TabList>

        {/* Tab 1 */}
        <TabPanel
          sx={{
            p: 0,
            boxSizing: "border-box",
            "--Tabs-spacing": "0px"
          }}
        >
          <Sheet
            sx={{
              mb: 4,
              p: 2,
              boxSizing: "border-box",
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              overflowX: "hidden", // optional safety net
              minWidth: 0 // 🛠️ this is key
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
    </main>
  )
}
