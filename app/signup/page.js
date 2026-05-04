"use client"

import { Suspense, useState, useEffect } from "react"
import {
  onAuthStateChanged,
  signInWithCustomToken
} from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import { previewInvite, registerWithInvite } from "@/utils/api"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Box,
  Button,
  Chip,
  Input,
  FormControl,
  FormLabel,
  Typography,
  Sheet
} from "@mui/joy"
import Loading from "@/components/loading"
import { AuthLink, AuthMessage, AuthShell } from "@/components/authShell"
import { colors, radii } from "@/utils/designTokens"

const fieldSx = {
  borderRadius: radii.md,
  minHeight: 52,
  backgroundColor: "rgba(247,250,255,0.9)"
}

function SignupPageContent() {
  const [inviteToken, setInviteToken] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [invite, setInvite] = useState(null)
  const [isCheckingInvite, setIsCheckingInvite] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/")
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const inviteFromQuery = searchParams.get("invite")?.trim() || ""

    if (!inviteFromQuery || inviteFromQuery === inviteToken) {
      return
    }

    setInviteToken(inviteFromQuery)
    setError("")
    setInfo("")
    setIsCheckingInvite(true)

    previewInvite(inviteFromQuery)
      .then((preview) => {
        setInvite(preview)
        setInfo(`Invito valido per ${preview.email}`)
      })
      .catch((err) => {
        setInvite(null)
        setError(err.message)
      })
      .finally(() => setIsCheckingInvite(false))
  }, [inviteToken, searchParams])

  const handlePreviewInvite = async () => {
    if (!inviteToken.trim()) {
      setInvite(null)
      setInfo("")
      setError("Inserisci il token ricevuto via invito")
      return
    }

    setIsCheckingInvite(true)
    setError("")
    setInfo("")

    try {
      const preview = await previewInvite(inviteToken.trim())
      setInvite(preview)
      setInfo(`Invito valido per ${preview.email}`)
    } catch (err) {
      setInvite(null)
      setError(err.message)
    } finally {
      setIsCheckingInvite(false)
    }
  }

  const handleSignup = async () => {
    if (!invite) {
      setError("Verifica prima il tuo invito")
      return
    }

    setIsSubmitting(true)
    setError("")
    setInfo("")

    try {
      const registration = await registerWithInvite({
        token: inviteToken.trim(),
        password
      })
      await signInWithCustomToken(auth, registration.customToken)
      router.push("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="AWE"
      title="Attiva il tuo account"
      description="Inserisci il token e completa l'accesso."
      footer={<AuthLink href="/login">Hai gia un account? Accedi</AuthLink>}
    >
      <Typography level="h2">Completa la registrazione</Typography>
      <Typography sx={{ mt: 1, color: colors.inkMuted, lineHeight: 1.7 }}>
        Incolla il token ricevuto.
      </Typography>

      <AuthMessage tone="danger">{error}</AuthMessage>
      <AuthMessage tone="success">{info}</AuthMessage>

      <Box sx={{ display: "grid", gap: 2.2, mt: 3 }}>
        <FormControl>
          <FormLabel sx={{ color: colors.ink, fontWeight: 600 }}>Token invito</FormLabel>
          <Input
            value={inviteToken}
            onChange={(e) => {
              setInviteToken(e.target.value)
              setInvite(null)
              setError("")
              setInfo("")
            }}
            placeholder="Incolla qui il token ricevuto"
            sx={fieldSx}
          />
        </FormControl>

        <Button
          fullWidth
          variant="soft"
          loading={isCheckingInvite}
          onClick={handlePreviewInvite}
          sx={{ borderRadius: radii.pill }}
        >
          Verifica invito
        </Button>

        <Sheet
          variant="soft"
          sx={{
            p: 2.2,
            borderRadius: radii.lg,
            background: invite ? "var(--app-success-bg)" : "rgba(239,245,255,0.92)",
            border: invite
              ? "1px solid rgba(var(--app-success-rgb), 0.18)"
              : "1px solid rgba(var(--app-primary-rgb), 0.08)"
          }}
        >
          <Typography level="title-sm">
            {invite ? "Email confermata" : "Email collegata"}
          </Typography>
          <Typography sx={{ mt: 0.6, color: colors.inkMuted }}>
            {invite?.email || "Verifica il token per vedere l'email collegata."}
          </Typography>
        </Sheet>

        <FormControl>
          <FormLabel sx={{ color: colors.ink, fontWeight: 600 }}>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Scegli una password"
            sx={fieldSx}
          />
        </FormControl>
      </Box>

      <Button
        fullWidth
        size="lg"
        loading={isSubmitting}
        disabled={!invite || !password}
        onClick={handleSignup}
        sx={{ mt: 3, borderRadius: radii.pill }}
      >
        Crea account
      </Button>
    </AuthShell>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SignupPageContent />
    </Suspense>
  )
}
