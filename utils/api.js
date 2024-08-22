import {
  collection,
  getDoc,
  getDocs,
  setDoc,
  doc,
  query,
  limit
} from "firebase/firestore"
import db from "./firestore"
import axios from "axios"

export const getPosts = (callback, route) => {
  let posts = []
  const q = query(collection(db, route), limit(50))
  getDocs(q).then((snapshot) => {
    snapshot.forEach((doc) => {
      posts.push(doc.data())
    })
    callback(posts)
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

export const updateCarousel = (updatedPost, callback) => {
  setDoc(doc(db, "carousels", updatedPost.id), updatedPost).then(() => {
    getCarousel(updatedPost.id, callback)
  })
}

export const updateDailySummary = (updatedDailySummary, callback) => {
  setDoc(doc(db, "daily", updatedDailySummary.id), updatedDailySummary).then(
    () => {
      getDailySummary(updatedDailySummary.id, callback)
    }
  )
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
