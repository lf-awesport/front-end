import {
  collection,
  getDoc,
  getDocs,
  setDoc,
  doc,
  query,
  limit,
  orderBy,
  startAfter,
  updateDoc
} from "firebase/firestore"
import db from "./firestore"
import axios from "axios"

export const getPosts = (route, cursor, callback) => {
  let posts = []
  let q
  if (!cursor) {
    q = query(collection(db, route), orderBy("date", "desc"), limit(50))
  } else if (cursor) {
    q = query(
      collection(db, route),
      orderBy("date", "desc"),
      startAfter(cursor),
      limit(50)
    )
  }
  getDocs(q).then((snapshot) => {
    snapshot.forEach((doc) => {
      posts.push(doc.data())
    })
    const lastVisible = snapshot.docs[snapshot.docs.length - 1]
    return callback(posts, lastVisible)
  })
}

export const getPost = (id, callback) => {
  let post
  const docRef = doc(db, "posts", id)
  getDoc(docRef).then((res) => {
    post = res.data()
    callback(post)
  })
}

export const getCarousel = (id, callback) => {
  axios
    .get(`http://localhost:4000/getCarousel`, {
      params: {
        id
      }
    })
    .then((res) => callback(res))
}

export const updateCarousel = (id, updatedPost, callback) => {
  updateDoc(doc(db, "carousels", id), {
    carousel: updatedPost
  }).then(() => {
    getCarousel(id, callback)
  })
}

export const downloadPDF = (ids, id, callback) => {
  axios
    .get(`http://localhost:4000/screenshot`, {
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
    .get(`http://localhost:4000/getDailySummary`, {
      params: {
        date
      }
    })
    .then((res) => callback(res))
}

export const scrapePosts = (callback) => {
  axios.get(`http://localhost:4000/scrapePosts`).then((res) => callback(res))
}

export const getSentimentAnalysis = (id, callback) => {
  axios
    .get(`http://localhost:4000/getSentimentAnalysis`, {
      params: {
        id
      }
    })
    .then((res) => callback(res))
}

export const getWordCloud = (id, callback) => {
  axios
    .get(`http://localhost:4000/getWordCloud`, {
      params: {
        id
      }
    })
    .then((res) => callback(res))
}

export const updateHighlights = (id, callback) => {
  axios
    .get(`http://localhost:4000/updateHighlights`, {
      params: {
        id
      }
    })
    .then((res) => callback(res))
}
