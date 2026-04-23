import {
  collection,
  collectionGroup,
  getDoc,
  getDocs,
  doc,
  query,
  limit,
  orderBy,
  startAfter,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "firebase/firestore"
import db from "./firestore"

const MODULE_COLLECTIONS = ["lessons", "caseStudyLessons"]
const LEARNING_MODULES_COLLECTION = "learningModules"
const MODULE_FETCH_LIMIT = 50
const MODULE_FEEDBACK_SUBCOLLECTION = "feedback"
const DEFAULT_MATERIA = "Sport Management"

function getCreatedAtValue(value) {
  if (!value) return 0

  if (typeof value.toMillis === "function") {
    return value.toMillis()
  }

  if (typeof value.seconds === "number") {
    return value.seconds * 1000
  }

  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function getModuleCollectionRef(materia, collectionName) {
  return collection(db, LEARNING_MODULES_COLLECTION, materia, collectionName)
}

export function getLessonFeedbackDocRef({
  materia = DEFAULT_MATERIA,
  collectionName,
  moduleId,
  userId
}) {
  return doc(
    db,
    LEARNING_MODULES_COLLECTION,
    materia,
    collectionName,
    moduleId,
    MODULE_FEEDBACK_SUBCOLLECTION,
    userId
  )
}

export function listenToLessonFeedback(input, onValue) {
  const feedbackRef = getLessonFeedbackDocRef(input)

  return onSnapshot(feedbackRef, (snapshot) => {
    onValue(
      snapshot.exists()
        ? { id: snapshot.id, ...snapshot.data() }
        : null
    )
  })
}

export async function upsertLessonFeedback({
  materia = DEFAULT_MATERIA,
  collectionName,
  moduleId,
  user,
  moduleData,
  overallRating,
  overallSuggestion,
  sectionFeedback = []
}) {
  const feedbackRef = getLessonFeedbackDocRef({
    materia,
    collectionName,
    moduleId,
    userId: user.uid
  })
  const existingSnapshot = await getDoc(feedbackRef)
  const existingData = existingSnapshot.exists() ? existingSnapshot.data() : null

  const nextSectionFeedback = sectionFeedback
    .map((entry) => ({
      targetKey: entry.targetKey,
      targetType: entry.targetType,
      label: entry.label,
      suggestion: typeof entry.suggestion === "string" ? entry.suggestion.trim() : ""
    }))
    .filter((entry) => entry.targetKey && entry.label && entry.suggestion)

  await setDoc(
    feedbackRef,
    {
      moduleId,
      collectionName,
      materia,
      lessonType: moduleData?.type || "lesson",
      title: moduleData?.title || moduleData?.topic || "Untitled lesson",
      lessonDate: moduleData?.lessonDate || null,
      submittedBy: {
        uid: user.uid,
        email: user.email || null
      },
      overallRating,
      overallSuggestion: typeof overallSuggestion === "string" ? overallSuggestion.trim() : "",
      sectionFeedback: nextSectionFeedback,
      createdAt: existingData?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      editorMeta: existingData?.editorMeta || null
    },
    { merge: true }
  )
}

export async function getLessonFeedbackEntries({
  materia = DEFAULT_MATERIA,
  limitCount = 200
} = {}) {
  const feedbackQuery = query(collectionGroup(db, MODULE_FEEDBACK_SUBCOLLECTION))
  const snapshot = await getDocs(feedbackQuery)

  return snapshot.docs
    .map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }))
    .filter((entry) => entry.materia === materia)
    .sort(
      (left, right) =>
        getCreatedAtValue(right.updatedAt || right.createdAt) -
        getCreatedAtValue(left.updatedAt || left.createdAt)
    )
    .slice(0, limitCount)
}

function getModuleSnapshot(materia, collectionName, queryConstraints = []) {
  const collectionRef = getModuleCollectionRef(materia, collectionName)
  const source = queryConstraints.length > 0
    ? query(collectionRef, ...queryConstraints)
    : collectionRef

  return getDocs(source).then((snapshot) => ({ collectionName, snapshot }))
}

async function getModuleSnapshots(materia, queryConstraints = []) {
  return Promise.all(
    MODULE_COLLECTIONS.map((collectionName) =>
      getModuleSnapshot(materia, collectionName, queryConstraints)
    )
  )
}

function normalizeModuleSummary(docSnapshot, collectionName) {
  const data = docSnapshot.data()

  return {
    id: docSnapshot.id,
    collectionName,
    ...data,
    topic: data.topic || data.title || "Untitled lesson"
  }
}

export async function getUserModuleProgress(userId, materia) {
  try {
    const moduleSnapshots = await getModuleSnapshots(materia)
    const moduleIds = moduleSnapshots.flatMap(({ snapshot }) =>
      snapshot.docs.map((moduleDoc) => moduleDoc.id)
    )

    const progressMap = {}

    for (const moduleId of moduleIds) {
      const progressRef = doc(db, "learningProgress", userId, "modules", moduleId)
      const progressSnap = await getDoc(progressRef)

      if (progressSnap.exists()) {
        progressMap[moduleId] = progressSnap.data()
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
    const moduleSnapshots = await getModuleSnapshots(materia, [
      orderBy("createdAt", "desc"),
      limit(MODULE_FETCH_LIMIT)
    ])

    const modules = moduleSnapshots
      .flatMap(({ collectionName, snapshot }) =>
        snapshot.docs.map((docSnapshot) =>
          normalizeModuleSummary(docSnapshot, collectionName)
        )
      )
      .sort(
        (left, right) =>
          getCreatedAtValue(right.createdAt) - getCreatedAtValue(left.createdAt)
    )
      .slice(0, MODULE_FETCH_LIMIT)

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
  const docRef = doc(db, "daily", id)
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