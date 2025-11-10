"use client"

import { usePathname, useRouter } from "next/navigation"
import styles from "./post.module.css"
import { TextAnalysis } from "@/components/textAnalysis"
import { WordCloud } from "@/components/wordcloud"
import { Takeaways } from "@/components/takeaways"
import Loading from "@/components/loading"
import CrosswordTab from "@/components/crossword"
import HomeIcon from "@mui/icons-material/Home"

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
  const [tabValue, setTabValue] = useState(1)
  const router = useRouter()

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
        value={tabValue}
        defaultValue={1}
        onChange={(e, val) => {
          if (val === 0) router.push("/")
          else setTabValue(val)
        }}
        sx={{
          width: "100%",
          boxSizing: "border-box",
          boxShadow: "0px 4px 8px rgba(92, 201, 250, 0.5)",
          border: "1px solid #5cc9fa",
          borderRadius: "8px",
          padding: 1
        }}
      >
        <TabList sx={{ width: "100%" }}>
          <Tab
            value={0}
            color="primary"
            sx={{
              '&[aria-selected="true"]': {
                backgroundColor: "#5cc9fa",
                color: "#fff"
              }
            }}
          >
            <HomeIcon />
          </Tab>
          <Tab
            value={1}
            color="primary"
            sx={{
              '&[aria-selected="true"]': {
                backgroundColor: "#5cc9fa",
                color: "#fff"
              }
            }}
          >
            Info
          </Tab>
          <Tab
            value={2}
            color="primary"
            sx={{
              '&[aria-selected="true"]': {
                backgroundColor: "#5cc9fa",
                color: "#fff"
              }
            }}
          >
            Cruciverba
          </Tab>
        </TabList>

        {/* Tab 1: Info */}
        <TabPanel
          value={1}
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
              overflowX: "hidden",
              minWidth: 0
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
                    style={{ margin: "20px 0" }}
                  >
                    {data.date}
                  </Typography>
                  <Divider />
                  <Typography
                    level="body-sm"
                    color="fff"
                    style={{ margin: "20px 0" }}
                  >
                    {data.author}
                  </Typography>
                  <Divider />
                  <Typography
                    level="body-sm"
                    color="fff"
                    style={{ margin: "20px 0" }}
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
                            pointerEvents: "none",
                            margin: "20px 20px 0 20px"
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

        {/* Tab 2: Cruciverba */}
        <TabPanel
          value={2}
          sx={{
            p: 0,
            boxSizing: "border-box",
            "--Tabs-spacing": "0px"
          }}
        >
          <CrosswordTab postId={data.id} />
        </TabPanel>
      </Tabs>
    </main>
  )
}
