"use client"

import ProtectedRoute from "@/components/protectedRoute"
import { ArticleChat } from "@/components/articleChat"
import { AdminPageShell } from "@/components/adminPageShell"
import { PageSection } from "@/components/pageShell"

export default function AdminChatPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminPageShell
        title="Chat interna"
        description="Analisi e supporto operativo."
        stats={[
          { label: "Solo admin", color: "primary" }
        ]}
      >
        <PageSection sx={{ minHeight: "72vh", p: { xs: 1.5, sm: 2.2 } }}>
          <ArticleChat />
        </PageSection>
      </AdminPageShell>
    </ProtectedRoute>
  )
}