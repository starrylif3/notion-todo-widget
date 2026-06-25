import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Notion Todo Widget",
  description: "A cute personal todo widget for Notion embed"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
