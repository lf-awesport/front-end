import "./globals.css"
import "@fontsource/inter"

export const metadata = {
  title: "Sport Dashboard",
  description: "Generated by LF"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
