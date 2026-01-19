"use client"

import { useState, useEffect } from "react"
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import { registerZepUser } from "@/utils/api"
import { useRouter } from "next/navigation"
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

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/")
    })
    return () => unsubscribe()
  }, [router])

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      await registerZepUser({
        userId: userCredential.user.uid,
        email: userCredential.user.email,
        name: email.split("@")[0]
      })
      router.push("/")
    } catch (err) {
      setError(err.message)
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
            Registrati
          </Typography>
          {error && <Typography color="danger">{error}</Typography>}

          <FormControl sx={{ my: 2 }}>
            <FormLabel>Email</FormLabel>
            <Input type="email" onChange={(e) => setEmail(e.target.value)} />
          </FormControl>

          <FormControl sx={{ my: 2 }}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>

          <Button fullWidth onClick={handleSignup}>
            Registrati
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
