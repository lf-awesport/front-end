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
import { getAuth } from "firebase/auth"
import db from "./firestore"
import { getTimestampMillis } from "./helpers"

const MODULE_COLLECTIONS = ["lessons", "caseStudyLessons"]
const LEARNING_MODULES_COLLECTION = "learningModules"
const MODULE_FETCH_LIMIT = 50
const MODULE_FEEDBACK_SUBCOLLECTION = "feedback"
const DEFAULT_MATERIA = "Sport Management"

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
          getTimestampMillis(right.updatedAt || right.createdAt) -
          getTimestampMillis(left.updatedAt || left.createdAt)
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
          getTimestampMillis(right.createdAt) - getTimestampMillis(left.createdAt)
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

async function readApiResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error?.message || fallbackMessage)
  }

  return payload
}

export async function fetchWithAuth(url, options = {}) {
  const auth = getAuth()
  const user = auth.currentUser
  const forceRefresh = options.forceRefresh === true

  const { forceRefresh: _ignoredForceRefresh, ...fetchOptions } = options

  if (!user) {
    throw new Error("Devi effettuare l'accesso per completare questa operazione")
  }

  const token = await user.getIdToken(forceRefresh)
  const headers = {
    ...fetchOptions.headers,
    Authorization: `Bearer ${token}`
  }

  return fetch(url, {
    ...fetchOptions,
    headers
  })
}

export async function previewInvite(token) {
  const response = await fetch(`${API_URL}/auth/invite/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token })
  })

  const payload = await readApiResponse(
    response,
    "Non riesco a verificare questo invito"
  )

  return payload.invite
}

export async function registerWithInvite({ token, password }) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token, password })
  })

  const payload = await readApiResponse(
    response,
    "Non riesco a completare la registrazione"
  )

  return payload
}

export async function listAdminInvites() {
  const response = await fetchWithAuth(`${API_URL}/admin/invites`)
  const payload = await readApiResponse(
    response,
    "Non riesco a caricare gli inviti"
  )

  return payload.invites || []
}

export async function createAdminInvite({ email, expiresInHours }) {
  const response = await fetchWithAuth(`${API_URL}/admin/invites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, expiresInHours })
  })

  return readApiResponse(response, "Non riesco a creare l'invito")
}

export async function revokeAdminInvite(inviteId) {
  const response = await fetchWithAuth(`${API_URL}/admin/invites/${inviteId}/revoke`, {
    method: "POST"
  })

  const payload = await readApiResponse(
    response,
    "Non riesco a revocare questo invito"
  )

  return payload.invite
}

export async function getViewerSession() {
  const response = await fetchWithAuth(`${API_URL}/auth/session`)
  const payload = await readApiResponse(
    response,
    "Non riesco a verificare l'accesso del tuo account"
  )

  return payload.viewer
}

export async function refreshViewerSession() {
  const response = await fetchWithAuth(`${API_URL}/auth/session`, {
    forceRefresh: true
  })
  const payload = await readApiResponse(
    response,
    "Non riesco a verificare l'accesso del tuo account"
  )

  return payload.viewer
}

export async function listFeedbackReviewEntries() {
  const response = await fetchWithAuth(`${API_URL}/admin/feedback`)
  const payload = await readApiResponse(
    response,
    "Non riesco a caricare i feedback"
  )

  return payload.entries || []
}

export async function listAdminUsers() {
  const response = await fetchWithAuth(`${API_URL}/admin/users`)
  const payload = await readApiResponse(
    response,
    "Non riesco a caricare gli utenti admin"
  )

  return payload.users || []
}

export async function updateAdminUserRole(userId, role) {
  const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}/role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ role })
  })

  const payload = await readApiResponse(
    response,
    "Non riesco ad aggiornare i permessi admin"
  )

  return payload.user
}

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
  const response = await fetch(`${API_URL}/search`, {
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