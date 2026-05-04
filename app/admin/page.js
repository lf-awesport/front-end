import ProtectedRoute from "@/components/protectedRoute"
import { AdminQuickLinks } from "@/components/adminQuickLinks"
import { PageContainer } from "@/components/pageShell"

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <PageContainer>
        <AdminQuickLinks />
      </PageContainer>
    </ProtectedRoute>
  )
}