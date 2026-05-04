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
  Input,
  FormControl,
  FormLabel,
  Typography,
  Link as JoyLink,
  Sheet
} from "@mui/joy"
import Link from "next/link"
import styles from "../posts.module.css"

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

    previewInvite(inviteFromQuery)
      .then((preview) => {
        setInvite(preview)
        setInfo(`Invito valido per ${preview.email}`)
      })
      .catch((err) => {
        setInvite(null)
        setError(err.message)
      })
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
    <main
      className={styles.main}
      style={{
        width: "100%",
        maxWidth: "1300px",
        margin: "0 auto"
      }}
    >
      <Sheet
        sx={{
          width: "100%",
          boxShadow: "0px 4px 8px rgba(92, 201, 250, 0.5)",
          border: "1px solid #5cc9fa",
          borderRadius: "8px",
          boxSizing: "border-box",
          padding: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          flex: 1
        }}
      >
        <Box sx={{ maxWidth: 400, margin: "auto", background: "#fff" }}>
          <Typography level="h3" gutterBottom>
            Registrazione su invito
          </Typography>
          <Typography sx={{ mb: 1.5 }}>
            Completa la registrazione usando il link o il token ricevuto dal team.
          </Typography>
          {error && <Typography color="danger">{error}</Typography>}
          {info && <Typography color="success">{info}</Typography>}

          <FormControl sx={{ my: 2 }}>
            <FormLabel>Token invito</FormLabel>
            <Input
              value={inviteToken}
              onChange={(e) => {
                setInviteToken(e.target.value)
                setInvite(null)
                setError("")
                setInfo("")
              }}
            />
          </FormControl>

          <Button
            fullWidth
            variant="soft"
            loading={isCheckingInvite}
            onClick={handlePreviewInvite}
          >
            Verifica invito
          </Button>

          <FormControl sx={{ my: 2 }}>
            <FormLabel>Email invitata</FormLabel>
            <Input type="email" value={invite?.email || ""} readOnly />
          </FormControl>

          <FormControl sx={{ my: 2 }}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Almeno 10 caratteri con lettere e numeri"
            />
          </FormControl>

          <Button
            fullWidth
            loading={isSubmitting}
            disabled={!invite || !password}
            onClick={handleSignup}
          >
            Crea account
          </Button>

          <Box mt={2}>
            <JoyLink component={Link} href="/login">
              Hai già un account? Accedi
            </JoyLink>
          </Box>
        </Box>
      </Sheet>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageContent />
    </Suspense>
  )
}
