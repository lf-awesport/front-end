// theme.js
"use client"

import { CssVarsProvider } from "@mui/joy/styles"
import { extendTheme } from "@mui/joy/styles"
import { Box } from "@mui/joy"

const aweTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        secondary: {
          solidBg: "#5cc9fa",
          solidColor: "#00339a",
          plainColor: "#5cc9fa",
          outlinedColor: "#5cc9fa",
          outlinedBorder: "#5cc9fa",
          softBg: "#e0f7ff",
          softColor: "#00339a"
        },
        primary: {
          solidBg: "#00339a",
          solidHoverBg: "#002a82",
          solidActiveBg: "#001f66",
          plainColor: "#00339a",
          plainHoverBg: "#e6f0ff",
          outlinedBorder: "#00339a",
          outlinedColor: "#00339a",
          outlinedHoverBg: "#e6f0ff",
          softBg: "#f5f9ff",
          softColor: "#00339a"
        },
        neutral: {
          solidBg: "#5cc9fa",
          solidColor: "#00339a",
          plainColor: "#1a1a1a"
        },
        text: {
          primary: "#1a1a1a",
          secondary: "#444"
        },
        background: {
          body: "#00339a", // sfondo principale
          surface: "#ffffff", // sfondi di card o container
          popup: "#ffffff" // menu, modali ecc.
        }
      }
    }
  },
  fontFamily: {
    body: "'Inter', sans-serif",
    display: "'Inter', sans-serif"
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(0,0,0,0.2)",
    "0px 1px 5px rgba(0,0,0,0.3)",
    "0px 1px 8px rgba(0,0,0,0.3)",
    "0px 2px 4px rgba(0,0,0,0.4)",
    "0px 3px 5px rgba(0,0,0,0.4)",
    "0px 4px 6px rgba(0,0,0,0.4)",
    "0px 5px 7px rgba(0,0,0,0.4)",
    "0px 6px 8px rgba(0,0,0,0.4)",
    "0px 7px 9px rgba(0,0,0,0.4)",
    "0px 8px 10px rgba(0,0,0,0.4)"
  ]
})

export default function ThemeProvider({ children }) {
  return (
    <CssVarsProvider theme={aweTheme} defaultMode="light">
      <Box
        sx={{
          bgcolor: "background.body",
          color: "text.primary",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {children}
      </Box>
    </CssVarsProvider>
  )
}
