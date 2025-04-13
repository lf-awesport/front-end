import ThemeProvider from "../utils/theme"

export const metadata = {
  title: "AWE Eddy",
  description: "AI sport business assistant"
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: 0 }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
