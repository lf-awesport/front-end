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
  Typography,
  Sheet,
  Link as JoyLink
} from "@mui/joy"
import Link from "next/link"
import styles from "../posts.module.css"

export default function LoginPage() {
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

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
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
        <Box sx={{ maxWidth: 400, margin: "auto" }}>
          <Typography level="h3" gutterBottom>
            Login
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

          <Button fullWidth onClick={handleLogin}>
            Accedi
          </Button>

          <Box mt={2}>
            <JoyLink component={Link} href="/signup">
              Non hai un account? Registrati
            </JoyLink>
          </Box>
        </Box>
      </Sheet>
    </main>
  )
}
