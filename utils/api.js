import {
  collection,
  getDoc,
  getDocs,
  doc,
  query,
  limit,
  orderBy,
  startAfter
} from "firebase/firestore"
import db from "./firestore"

export async function getUserModuleProgress(userId, materia) {
  try {
    const modulesRef = collection(db, "learningModules", materia, "lessons")
    const modulesSnapshot = await getDocs(modulesRef)

    const progressMap = {}

    for (const moduleDoc of modulesSnapshot.docs) {
      const modId = moduleDoc.id
      const progressRef = doc(db, "learningProgress", userId, "modules", modId)
      const progressSnap = await getDoc(progressRef)

      if (progressSnap.exists()) {
        progressMap[modId] = progressSnap.data()
      }
    }

    return progressMap
  } catch (error) {
    console.error("❌ Errore nel recupero del progresso utente:", error)
    return {}
  }
}

export async function getModulesFromFirestore(materia) {
  try {
    const q = query(
      collection(db, "learningModules", materia, "lessons"),
      orderBy("createdAt", "desc"),
      limit(50)
    )

    const snapshot = await getDocs(q)
    const modules = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    return modules
  } catch (error) {
    console.error("❌ Errore durante il recupero dei moduli:", error)
    return []
  }
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export const getPosts = async (route, cursor) => {
  let posts = []
  let res = { posts: [], lastVisible: null }
  let q

  if (!cursor) {
    q = query(collection(db, route), orderBy("date", "desc"), limit(25))
  } else {
    q = query(
      collection(db, route),
      orderBy("date", "desc"),
      startAfter(cursor),
      limit(25)
    )
  }

  const snapshot = await getDocs(q)

  snapshot.forEach((doc) => {
    posts.push({ id: doc.id, ...doc.data() }) // Ensure document ID is included
  })

  const lastVisible =
    snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null

  res = { posts, lastVisible }

  return res
}

export const getPost = (id, callback) => {
  let post
  const docRef = doc(db, "sentiment", id)
  getDoc(docRef).then((res) => {
    post = res.data()
    callback(post)
  })
}

export async function fetchSearchResults(params) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  })

  if (!response.ok) {
    throw new Error("Errore durante la ricerca")
  }

  const data = await response.json()
  return data.sources
}
