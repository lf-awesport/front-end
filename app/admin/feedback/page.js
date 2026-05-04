import ProtectedRoute from "@/components/protectedRoute"
import { AdminFeedbackReview } from "@/components/adminFeedbackReview"

export default function AdminFeedbackPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminFeedbackReview />
    </ProtectedRoute>
  )
}