"use client"

import { Box } from "@mui/joy"
import { API_URL } from "@/utils/api"
import dynamic from "next/dynamic"
import React from "react"
import { marked } from "marked"

const DeepChat = dynamic(
  () => import("deep-chat-react").then((mod) => mod.DeepChat),
  { ssr: false }
)

export function ArticleChat() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100dvh - 200px)",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        p: 0,
        scrollbarGutter: "stable"
      }}
    >
      <DeepChat
        style={{
          flex: 1,
          height: "calc(100dvh - 200px)",
          width: "100%",
          maxWidth: "800px",
          margin: "auto",
          borderRadius: "16px",
          border: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
        }}
        messageStyles={{
          default: {
            shared: {
              bubble: {
                fontFamily: "'Inter', sans-serif",
                fontSize: "16px",
                color: "#1a1a1a",
                backgroundColor: "#f9fafb",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                padding: "12px",
                marginTop: "10px",
                marginBottom: "10px",
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
        requestBodyLimits={{ maxMessages: -1 }}
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
              q: lastMessage
            }
          }
        }}
        introMessage={{
          text: "Ciao! Sono Eddy, il tuo assistente AI dedicato allo sport business. Posso aiutarti ad analizzare trend, capire concetti complessi, scoprire dati economici e finanziari, e rispondere alle tue domande su calcio, eventi, infrastrutture, marketing e molto altro."
        }}
        responseInterceptor={(response) => {
          if (response && typeof response === "object" && response.text) {
            const markdown = response.text.answer || response.text

            const htmlContent = marked.parse(markdown)
            const styledHtml = `
              <div style="font-family: 'Inter', sans-serif; font-size: 16px; color: #1a1a1a; line-height: 1.6;">
                <style>
                  h1, h2, h3 { font-weight: 600; margin: 1rem 0 0.5rem 0; }
                  ul, ol { padding-left: 1.25rem; margin-bottom: 1rem; }
                  li { margin-bottom: 0.25rem; }
                  p { margin-bottom: 1rem; }
                  strong { font-weight: 600; }
                </style>
                ${htmlContent}
              </div>
            `

            if (Array.isArray(response.sources)) {
              const sourcesLinks = response.sources
                .map(
                  (src, i) =>
                    `<a href="${src.url}" target="_blank" rel="noopener noreferrer">[${i + 1}]</a>`
                )
                .join(", ")
              return {
                html:
                  styledHtml +
                  `<br><br><span style='font-size: 8px;'>Fonti: ${sourcesLinks}</span>`
              }
            }

            return { html: styledHtml }
          }
          return { html: "<i>⚠️ Nessuna risposta ricevuta.</i>" }
        }}
      />
    </Box>
  )
}
