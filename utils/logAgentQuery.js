// utils/logAgentQuery.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { auth } from "./firebaseConfig"
import db from "./firestore"

export async function logAgentQuery({ query, text, sources }) {
  const user = auth.currentUser

  const timestamp = serverTimestamp()

  try {
    await addDoc(collection(db, "agent_queries"), {
      userId: user?.uid ?? "anonymous",
      userEmail: user?.email ?? "anonymous",
      ...JSON.parse(JSON.stringify(user.metadata)), // pulizia extra      query,
      text,
      sources,
      query,
      timestamp
    })
  } catch (err) {
    console.error("🔥 Failed to log agent query:", err)
  }
}
