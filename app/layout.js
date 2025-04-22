import ThemeProvider from "../utils/theme"
import { AuthProvider } from "../utils/authContext"

export const metadata = {
  title: "AWE EDDY",
  description: "AI sport business assistant"
}

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: "0 auto" }}>
        <AuthProvider>
          <ThemeProvider>
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
