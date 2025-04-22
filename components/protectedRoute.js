// components/ProtectedRoute.js
"use client"

import { useAuth } from "../utils/authContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user === null) {
      router.push("/login")
    }
  }, [user])

  return user ? children : null
}

export default ProtectedRoute
