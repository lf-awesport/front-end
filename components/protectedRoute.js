// components/ProtectedRoute.js
"use client"

import { useAuth } from "../utils/authContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const {
    user,
    viewer,
    isAuthReady,
    isSessionLoading,
    sessionError,
    refreshViewerSession
  } = useAuth()
  const router = useRouter()
  const [hasRetriedAdminCheck, setHasRetriedAdminCheck] = useState(false)

  useEffect(() => {
    if (isAuthReady && !isSessionLoading && user === null) {
      router.push("/login")
    }
  }, [isAuthReady, isSessionLoading, router, user])

  useEffect(() => {
    setHasRetriedAdminCheck(false)
  }, [requireAdmin, user?.uid])

  useEffect(() => {
    if (
      !requireAdmin ||
      !isAuthReady ||
      isSessionLoading ||
      !user ||
      !viewer ||
      viewer.isAdmin ||
      hasRetriedAdminCheck
    ) {
      return
    }

    setHasRetriedAdminCheck(true)
    refreshViewerSession(true)
  }, [
    hasRetriedAdminCheck,
    isAuthReady,
    isSessionLoading,
    refreshViewerSession,
    requireAdmin,
    user,
    viewer
  ])

  if (!isAuthReady || isSessionLoading) {
    return null
  }

  if (!user) {
    return null
  }

  if (!viewer) {
    return (
      <main
        style={{
          width: "min(720px, calc(100% - 32px))",
          margin: "48px auto",
          padding: "24px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.94)",
          boxShadow: "0 18px 48px rgba(10, 47, 143, 0.1)"
        }}
      >
        <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.6 }}>
          {sessionError || "Sto verificando il tuo accesso..."}
        </p>
      </main>
    )
  }

  if (requireAdmin && !viewer.isAdmin) {
    return (
      <main
        style={{
          width: "min(720px, calc(100% - 32px))",
          margin: "48px auto",
          padding: "24px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.94)",
          boxShadow: "0 18px 48px rgba(10, 47, 143, 0.1)"
        }}
      >
        <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.6 }}>
          {hasRetriedAdminCheck
            ? "Questa area e riservata agli admin autorizzati."
            : "Sto verificando il tuo accesso admin..."}
        </p>
      </main>
    )
  }

  return children
}

export default ProtectedRoute
