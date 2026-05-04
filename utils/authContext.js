"use client"

// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "./firebaseConfig"
import { getViewerSession, refreshViewerSession as fetchFreshViewerSession } from "./api"

const AuthContext = createContext({
  user: null,
  isAuthReady: false,
  isSessionLoading: false,
  sessionError: "",
  hasVerifiedAccess: false,
  viewer: null,
  refreshViewerSession: async () => null,
  getIdToken: async () => null
})

async function resolveViewerSession(nextUser, forceRefresh = false) {
  if (!nextUser) {
    return null
  }

  return forceRefresh ? fetchFreshViewerSession() : getViewerSession()
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined)
  const [viewer, setViewer] = useState(null)
  const [sessionError, setSessionError] = useState("")
  const [isSessionLoading, setIsSessionLoading] = useState(false)

  const getIdToken = async (forceRefresh = false) => {
    if (!auth.currentUser) {
      return null
    }

    return auth.currentUser.getIdToken(forceRefresh)
  }

  const refreshViewerSession = async (forceRefresh = false, nextUser = auth.currentUser) => {
    if (!nextUser) {
      setViewer(null)
      setSessionError("")
      setIsSessionLoading(false)
      return null
    }

    setViewer(null)
    setSessionError("")
    setIsSessionLoading(true)

    try {
      const nextViewer = await resolveViewerSession(nextUser, forceRefresh)
      setViewer(nextViewer)
      return nextViewer
    } catch (error) {
      const errorMessage = error.message || "Non riesco a verificare il tuo accesso"
      setSessionError(errorMessage)
      setViewer(null)

      if (
        errorMessage === "Account access is not enabled" ||
        errorMessage === "This account is not enabled for the invite-only access policy"
      ) {
        await signOut(auth)
      }

      return null
    } finally {
      setIsSessionLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)

      if (!nextUser) {
        setViewer(null)
        setSessionError("")
        setIsSessionLoading(false)
        return
      }

      await refreshViewerSession(false, nextUser)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthReady: user !== undefined,
        isSessionLoading,
        sessionError,
        hasVerifiedAccess: viewer !== null,
        viewer,
        refreshViewerSession,
        getIdToken
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
