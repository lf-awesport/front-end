function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

export function getFeedbackEditorEmails() {
  return (process.env.NEXT_PUBLIC_FEEDBACK_EDITOR_EMAILS || "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean)
}

export function isFeedbackEditor(user) {
  const userEmail = normalizeEmail(user?.email)

  if (!userEmail) {
    return false
  }

  return getFeedbackEditorEmails().includes(userEmail)
}