import {
  collection,
  getDoc,
  getDocs,
  doc,
  query,
  limit,
  orderBy,
  startAfter,
  updateDoc,
  deleteDoc
} from "firebase/firestore"
import db from "./firestore"
import axios from "axios"

const domain = process.env.DOMAIN

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

export const getCarousel = (id, callback) => {
  axios
    .get(`${domain}/getCarousel`, {
      params: {
        id
      }
    })
    .then((res) => callback(res))
}

export const updateCarousel = (id, updatedPost, callback) => {
  updateDoc(doc(db, "carousels", id), updatedPost).then(() => {
    getCarousel(id, callback)
  })
}

export const downloadPDF = (ids, id, callback) => {
  axios
    .get(`${domain}/screenshot`, {
      responseType: "blob",
      params: {
        ids,
        id
      }
    })
    .then((res) => {
      callback(res)
    })
}

export const getDailySummary = (date, callback) => {
  axios
    .get(`${domain}/getDailySummary`, {
      params: {
        date
      }
    })
    .then((res) => callback(res))
}

export const scrapePosts = (callback) => {
  axios.get(`${domain}/scrapePosts`).then((res) => callback(res))
}

export const getSentimentAnalysis = (id, callback) => {
  axios
    .get(`${domain}/getSentimentAnalysis`, {
      params: {
        id
      }
    })
    .then((res) => callback(res))
}

export const generateHighlights = (id, callback) => {
  axios
    .get(`${domain}/generateHighlights`, {
      params: {
        id
      }
    })
    .then((res) => callback(res))
}

export const deleteHighlights = (id, callback) => {
  deleteDoc(doc(db, "highlights", id)).then((res) => callback(res))
}

export const getHighlights = (id, callback) => {
  getDoc(doc(db, "highlights", id)).then((res) => callback(res))
}
