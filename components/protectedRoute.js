// components/ProtectedRoute.js
"use client"

import { useAuth } from "../utils/authContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Typography } from "@mui/joy"
import { PageContainer, PageSection } from "@/components/pageShell"
import { colors } from "@/utils/designTokens"

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
      <PageContainer width="min(720px, calc(100% - 32px))" padding="48px 0 0">
        <PageSection mt={0}>
          <Typography level="title-lg">Verifica accesso in corso</Typography>
          <Typography sx={{ mt: 1.2, color: colors.inkMuted, lineHeight: 1.7 }}>
            {sessionError || "Sto verificando la tua sessione per mostrarti i contenuti corretti."}
          </Typography>
        </PageSection>
      </PageContainer>
    )
  }

  if (requireAdmin && !viewer.isAdmin) {
    return (
      <PageContainer width="min(720px, calc(100% - 32px))" padding="48px 0 0">
        <PageSection mt={0}>
          <Typography level="title-lg">
            {hasRetriedAdminCheck ? "Area admin riservata" : "Verifica accesso admin in corso"}
          </Typography>
          <Typography sx={{ mt: 1.2, color: colors.inkMuted, lineHeight: 1.7 }}>
            {hasRetriedAdminCheck
              ? "Questa area e disponibile solo per gli account admin autorizzati. Se pensi sia un errore, contatta l'amministratore del workspace."
              : "Sto verificando i tuoi permessi admin prima di mostrarti questa sezione."}
          </Typography>
        </PageSection>
      </PageContainer>
    )
  }

  return children
}

export default ProtectedRoute
