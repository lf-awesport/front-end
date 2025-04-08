"use client"

import dynamic from "next/dynamic"
import styles from "./carousel.module.css"
import { Typography } from "@mui/joy"

export function ArticleChat({ data }) {
  const articleId = data.id

  const DeepChat = dynamic(
    () => import("deep-chat-react").then((mod) => mod.DeepChat),
    {
      ssr: false
    }
  )

  return (
    <main className={styles.main}>
      <Typography level="h2" color="#000" style={{ margin: "50px 0" }}>
        Ask Eddy
      </Typography>

      <DeepChat
        style={{ borderRadius: "10px", width: "1080px", height: "600px" }}
        introMessage={{
          text: "Fai una domanda sull'articolo o sui correlati"
        }}
        connect={{
          url: `http://localhost:4000/askAgentAboutArticle?id=${articleId}`,
          method: "GET",
          query: { id: articleId } // per sicurezza
        }}
        textInput={{
          placeholder: { text: "Scrivi la tua domanda qui..." }
        }}
        requestBodyLimits={{ maxMessages: -1 }}
        requestInterceptor={(details) => {
          if (details.body && details.body.messages) {
            const lastMessage = details.body.messages.at(-1)?.text
            details.query = {
              id: articleId,
              q: lastMessage
            }
          }
          return details
        }}
        responseInterceptor={(response) => {
          console.log("🤖 Risposta AI:", response)
          return { text: response.answer }
        }}
      />
    </main>
  )
}
