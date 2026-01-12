"use client"

import { Box } from "@mui/joy"
import { API_URL } from "@/utils/api"
import dynamic from "next/dynamic"
import React, { useRef } from "react"
import { marked } from "marked"
import { useAuth } from "../utils/authContext"

const DeepChat = dynamic(
  () => import("deep-chat-react").then((mod) => mod.DeepChat),
  { ssr: false }
)

export function ArticleChat() {
  // Simple buffer for concatenating all incoming text
  const aiTextBufferRef = useRef("")
  const { user } = useAuth()

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        overflow: "auto",
        p: 0,
        scrollbarGutter: "stable",
        flex: 1
      }}
    >
      <DeepChat
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "800px",
          height: "100%",
          margin: "auto",
          backgroundColor: "#fff",
          borderStyle: "hidden",
          border: "0px",
          boxShadow: "none",
          flex: 1
        }}
        messageStyles={{
          default: {
            shared: {
              bubble: {
                fontFamily: "'Inter', sans-serif",
                fontSize: "16px",
                color: "#1a1a1a",
                backgroundColor: "#f9fafb",
                padding: "10px",
                marginTop: "5px",
                marginBottom: "5px",
                maxWidth: "100%",
                overflowWrap: "anywhere"
              }
            },
            user: {
              bubble: {
                backgroundColor: "#5cc9fa",
                border: "1px solid #c3e5d6",
                color: "#1a1a1a"
              }
            },
            ai: {
              bubble: {
                backgroundColor: "#f4f4f4",
                border: "1px solid #ddd",
                color: "#1a1a1a"
              },
              outerContainer: {
                backgroundColor: "transparent"
              },
              innerContainer: {
                width: "calc(100% - 10px)"
              }
            }
          }
        }}
        allowHtml={{ ai: true, user: false }}
        avatars={{
          ai: { styles: { position: "left" } },
          user: { styles: { position: "right" } }
        }}
        textInput={{ placeholder: { text: "Scrivi la tua domanda qui..." } }}
        connect={{ url: `${API_URL}/askAgent`, method: "POST" }}
        requestBodyLimits={{ maxMessages: 1 }}
        requestInterceptor={(details) => {
          const lastMessage = details.body?.messages?.at(-1)?.text
          if (
            document.activeElement &&
            typeof document.activeElement.blur === "function"
          ) {
            document.activeElement.blur()
          }
          return {
            ...details,
            body: {
              ...details.body,
              q: lastMessage,
              userId: user?.uid || undefined
            }
          }
        }}
        introMessage={{
          text: "Ciao! Sono Eddy, il tuo assistente AI dedicato allo sport business. Posso aiutarti ad analizzare trend, capire concetti complessi, scoprire dati economici e finanziari, e rispondere alle tue domande su calcio, eventi, infrastrutture, marketing e molto altro."
        }}
        responseInterceptor={(response) => {
          // Mostra direttamente la risposta text come HTML
          let text = ""
          if (typeof response === "string") {
            text = response
          } else if (response && typeof response.text === "string") {
            text = response.text
          }
          if (!text || text.trim() === "") return null
          const htmlContent = marked.parse(text)
          return {
            html: `<div style="font-family: 'Inter', sans-serif; font-size: 16px; color: #1a1a1a; line-height: 1.6;">
              <style>
                h1, h2, h3 { font-weight: 600; margin: 1rem 0 0.5rem 0; }
                ul, ol { padding-left: 1.25rem; margin-bottom: 1rem; }
                li { margin-bottom: 0.25rem; }
                p { margin-bottom: 1rem; }
                strong { font-weight: 600; }
              </style>
              ${htmlContent}
            </div>`
          }
        }}
      />
    </Box>
  )
}
