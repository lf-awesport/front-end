import ProtectedRoute from "@/components/protectedRoute"
import { AdminUsersManagement } from "@/components/adminUsersManagement"

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminUsersManagement />
    </ProtectedRoute>
  )
}