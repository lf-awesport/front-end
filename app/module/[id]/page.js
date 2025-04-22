"use client"

import dynamic from "next/dynamic"
import Loading from "@/components/loading"

const ModulePageClient = dynamic(() => import("./modulePageClient.js"), {
  ssr: false,
  loading: () => <Loading message="Caricamento modulo..." />
})

export default function PageWrapper() {
  return <ModulePageClient />
}
