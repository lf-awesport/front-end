import ThemeProvider from "../utils/theme"

export const metadata = {
  title: "AWE Eddy",
  description: "AI sport business assistant"
}

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: "0 auto" }}>
        <ThemeProvider>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
