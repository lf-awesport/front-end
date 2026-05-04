"use client"

import { useEffect, useState, Suspense } from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import { useAuth } from "@/utils/authContext"
import Link from "next/link"

export default function ClientHeaderRight() {
  const [hasMounted, setHasMounted] = useState(false)
  const { user, viewer, isAuthReady, isSessionLoading } = useAuth()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || !isAuthReady || (user && isSessionLoading)) return null

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
          alignItems: "center",
          gap: "4px"
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
          <>
            {viewer?.isAdmin ? (
              <Link href="/admin" style={buttonStyle}>
                Admin
              </Link>
            ) : null}
            <button onClick={() => signOut(auth)} style={buttonStyle}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" style={buttonStyle}>
            Login
          </Link>
        )}
      </div>
    </Suspense>
  )
}
