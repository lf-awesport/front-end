import "./globals.css"
import { AuthProvider } from "../utils/authContext"
import { colors, gradients } from "@/utils/designTokens"

export const metadata = {
  title: "AWE EDDY",
  description: "AI sport business assistant"
}

import { Header } from "@/components/header"

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>
          <div
            style={{
              minHeight: "100vh",
              background: gradients.canvas,
              color: colors.ink
            }}
          >
            <Header />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
