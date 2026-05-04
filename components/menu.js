"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import { useAuth } from "@/utils/authContext"
import Link from "next/link"
import { Box, Button } from "@mui/joy"
import { colors, radii } from "@/utils/designTokens"

export default function ClientHeaderRight() {
  const [hasMounted, setHasMounted] = useState(false)
  const pathname = usePathname()
  const { user, viewer, isAuthReady, isSessionLoading } = useAuth()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || !isAuthReady || (user && isSessionLoading)) return null

  const showLoginButton = !user && pathname !== "/login"

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 1,
        flexWrap: "wrap"
      }}
    >
      {user && viewer?.isAdmin ? (
        <Link href="/admin" style={{ textDecoration: "none" }}>
          <Button
            size="sm"
            variant="soft"
            sx={{
              borderRadius: radii.pill,
              bgcolor: "rgba(255,255,255,0.16)",
              color: "#fff",
              '&:hover': { bgcolor: "rgba(255,255,255,0.24)" }
            }}
          >
            Area admin
          </Button>
        </Link>
      ) : null}

      {user ? (
        <Button
          size="sm"
          variant="solid"
          onClick={() => signOut(auth)}
          sx={{
            borderRadius: radii.pill,
            bgcolor: "#fff",
            color: colors.primary,
            '&:hover': { bgcolor: "rgba(255,255,255,0.92)" }
          }}
        >
          Esci
        </Button>
      ) : showLoginButton ? (
        <Link href="/login" style={{ textDecoration: "none" }}>
          <Button
            size="sm"
            variant="solid"
            sx={{
              borderRadius: radii.pill,
              bgcolor: "#fff",
              color: colors.primary,
              '&:hover': { bgcolor: "rgba(255,255,255,0.92)" }
            }}
          >
            Accedi
          </Button>
        </Link>
      ) : null}
    </Box>
  )
}
