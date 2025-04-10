"use client"

import dynamic from "next/dynamic"
import styles from "./carousel.module.css"
import { Typography } from "@mui/joy"
import { API_URL } from "@/utils/api"

export function ArticleChat() {
  const DeepChat = dynamic(
    () => import("deep-chat-react").then((mod) => mod.DeepChat),
    { ssr: false }
  )

  return (
    <main className={styles.main}>
      <Typography level="h2" color="#000" style={{ margin: "50px 0" }}>
        Ask Eddy
      </Typography>

      <DeepChat
        style={{ borderRadius: "10px", width: "1080px", height: "600px" }}
        introMessage={{
          text: "Chiedimi qualcosa su sport, finanza, calcio..."
        }}
        connect={{
          url: `${API_URL}/askAgent`, // ✅ solo endpoint
          method: "POST"
        }}
        textInput={{
          placeholder: { text: "Scrivi la tua domanda qui..." }
        }}
        requestBodyLimits={{ maxMessages: -1 }}
        requestInterceptor={(details) => {
          const lastMessage = details.body?.messages?.at(-1)?.text

          // 🔁 NON sovrascrivere il body, estendilo
          return {
            ...details,
            body: {
              ...details.body,
              q: lastMessage // ➕ aggiungi il campo
            }
          }
        }}
        responseInterceptor={(response) => {
          console.log("🤖 Risposta AI:", response)
          if (response && typeof response === "object" && response.answer) {
            return { text: response.answer }
          }
          return { text: "⚠️ Nessuna risposta ricevuta." }
        }}
      />
    </main>
  )
}
