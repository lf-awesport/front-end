import { AuthProvider } from "../utils/authContext"

export const metadata = {
  title: "AWE EDDY",
  description: "AI sport business assistant"
}

import { Header } from "@/components/header"

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: "0 auto", backgroundColor: "#E3EFFF" }}>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
