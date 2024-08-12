import { collection, getDocs, setDoc, doc } from "firebase/firestore"
import db from "./firestore"
import axios from "axios"

export const getPosts = (callback) => {
  let posts = []
  getDocs(collection(db, "calciofinanza")).then((snapshot) => {
    snapshot.forEach((doc) => {
      posts.push(doc.data())
    })
    callback(posts)
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
