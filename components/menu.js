"use client"

import { useEffect, useState, Suspense } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import Link from "next/link"

export default function ClientHeaderRight() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (!hasMounted || loading) return null

  const buttonStyle = {
    color: "#FFF",
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: "14px",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
    textDecoration: "underline"
  }
  return (
    <Suspense fallback={null}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <span
          title={user ? "Online" : "Offline"}
          style={{
            backgroundColor: user ? "#28a745" : "#dc3545",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            border: "1px solid white",
            display: "inline-block",
            marginBottom: "4px"
          }}
        ></span>

        {user ? (
          <button onClick={() => signOut(auth)} style={buttonStyle}>
            Logout
          </button>
        ) : (
          <Link href="/login" legacyBehavior>
            <a style={buttonStyle}>Login</a>
          </Link>
        )}
      </div>
    </Suspense>
  )
}
