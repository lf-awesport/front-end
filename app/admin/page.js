import ProtectedRoute from "@/components/protectedRoute"
import { AdminQuickLinks } from "@/components/adminQuickLinks"

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <main
        style={{
          width: "min(1200px, calc(100% - 32px))",
          margin: "0 auto",
          padding: "32px 0 64px"
        }}
      >
        <AdminQuickLinks />
      </main>
    </ProtectedRoute>
  )
}