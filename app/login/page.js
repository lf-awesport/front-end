"use client"

import { useState, useEffect } from "react"
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import { useRouter } from "next/navigation"
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Typography
} from "@mui/joy"
import { useAuth } from "@/utils/authContext"
import { AuthLink, AuthMessage, AuthShell } from "@/components/authShell"
import { colors, radii } from "@/utils/designTokens"

const fieldSx = {
  borderRadius: radii.md,
  minHeight: 52,
  backgroundColor: "rgba(247,250,255,0.9)"
}

function getLoginErrorMessage(error) {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email o password non corretti."
    case "auth/too-many-requests":
      return "Troppi tentativi di accesso. Riprova tra qualche minuto."
    default:
      return error?.message || "Non riesco a completare il login in questo momento."
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { sessionError } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/")
    })
    return () => unsubscribe()
  }, [router])

  const handleLogin = async () => {
    setError("")

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/")
    } catch (err) {
      setError(getLoginErrorMessage(err))
    }
  }

  return (
    <AuthShell
      eyebrow="AWE"
      title="Accedi al tuo workspace"
      description="Entra e riprendi da dove avevi lasciato."
      footer={
        <AuthLink href="/signup">
          Hai un invito? Attiva l'account
        </AuthLink>
      }
    >
      <Typography level="h2">Accedi</Typography>
      <Typography sx={{ mt: 1, color: colors.inkMuted, lineHeight: 1.7 }}>
        Usa email e password.
      </Typography>

      <AuthMessage tone="warning">{sessionError}</AuthMessage>
      <AuthMessage tone="danger">{error}</AuthMessage>

      <Box sx={{ display: "grid", gap: 2.2, mt: 3 }}>
        <FormControl>
          <FormLabel sx={{ color: colors.ink, fontWeight: 600 }}>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@azienda.com"
            sx={fieldSx}
          />
        </FormControl>

        <FormControl>
          <FormLabel sx={{ color: colors.ink, fontWeight: 600 }}>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Inserisci la tua password"
            sx={fieldSx}
          />
        </FormControl>
      </Box>

      <Button
        fullWidth
        size="lg"
        disabled={!email || !password}
        onClick={handleLogin}
        sx={{ mt: 3, borderRadius: radii.pill }}
      >
        Accedi
      </Button>
    </AuthShell>
  )
}
