  // Log ogni lettera digitata nella griglia

"use client"

import React, { Component } from "react"
import { useParams, useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/utils/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import db from "@/utils/firestore"
import Loading from "@/components/loading"
import Crossword from "@jaredreisinger/react-crossword"
import responsiveStyles from "./crosswordResponsive.module.css"
import styles from "../../posts.module.css"

const crosswordTheme = {
  gridBackground: "#f7fafc",
  cellBackground: "#fff",
  cellBorder: "#5cc9fa",
  textColor: "#222",
  numberColor: "#5cc9fa",
  focusBackground: "#e3f6ff",
  highlightBackground: "#d0f0ff",
  columnBreakpoint: "900px"
}

class DailyPageClient extends Component {
  // Riempie tutte le risposte corrette nel cruciverba
  handleFillAllAnswers = () => {
    if (this.crosswordRef.current && this.crosswordRef.current.fillAllAnswers) {
      this.crosswordRef.current.fillAllAnswers()
    }
  }
  // Log ogni lettera digitata nella griglia
  handleCellChange = (row, col, char) => {
    console.log(`Lettera inserita: '${char}' in cella [${row},${col}]`)
  }
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      crosswordData: null,
      summary: null,
      date: null,
      loading: true
    }
    this.crosswordRef = React.createRef()
  }

  componentDidMount() {
    this.unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Next.js router hook is not available in class, fallback to window.location
        window.location.href = "/login"
        return
      }
      this.setState({ user: currentUser }, this.loadCrossword)
    })
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) this.unsubscribeAuth()
  }

  loadCrossword = () => {
    const { user } = this.state
    // Estraggo id dalla url
    const urlParts = window.location.pathname.split("/")
    const id = urlParts[urlParts.length - 1]
    if (!user || !id) return
    const ref = doc(db, "dailySummaries", id)
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data()
        this.setState({
          crosswordData: data.crossword || null,
          summary: data.summary || null,
          date: data.date || id,
          loading: false
        })
      } else {
        this.setState({ loading: false })
      }
    })
  }

  // Mostra alert e log quando una parola viene indovinata
  handleClueCorrect = (direction, number, answer) => {
    console.log(`[onCorrect] Parola indovinata: n. ${number} (${direction}) = ${answer}`)
    alert(`Hai indovinato la parola n. ${number} (${direction}): ${answer}`)
  }

  // Logga in console quando il cruciverba è completato
  handleCrosswordComplete = (isCorrect) => {
    if (isCorrect) {
      console.log("✅ Cruciverba completato correttamente!")
    } else {
      console.log("❌ Cruciverba non ancora completato correttamente.")
    }
  }

  render() {
    const { user, crosswordData, summary, date, loading } = this.state
    if (!user || loading) return <Loading message="Caricamento..." />
    if (!crosswordData) return <Loading message="Caricamento cruciverba..." />
    return (
      <main
        className={styles.main}
        style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}
      >
        <h2
          style={{
            margin: "32px 0 24px 0",
            fontWeight: 700,
            textAlign: "center",
            color: "#5cc9fa"
          }}
        >
          {date ? date : "Cruciverba Sport Business"}
        </h2>
        {summary && (
          <section
            style={{
              background: "#e3f6ff",
              borderRadius: 12,
              padding: "18px 24px",
              margin: "0 auto 32px auto",
              maxWidth: 700,
              boxShadow: "0 2px 8px rgba(92,201,250,0.08)",
              color: "#222",
              fontSize: 18,
              lineHeight: 1.5
            }}
          >
            <strong>Riassunto della giornata:</strong>
            <br />
            {summary}
          </section>
        )}
        <button
          style={{
            display: "block",
            margin: "0 auto 24px auto",
            padding: "8px 20px",
            background: "#5cc9fa",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer"
          }}
          onClick={this.handleFillAllAnswers}
        >
          Mostra tutte le risposte
        </button>
        <div className={responsiveStyles["responsive-crossword-container"]}>
          <Crossword
            ref={this.crosswordRef}
            data={crosswordData}
            theme={crosswordTheme}
            onCorrect={this.handleClueCorrect}
            onCrosswordCorrect={this.handleCrosswordComplete}
            onCellChange={this.handleCellChange}
            acrossLabel="Orizzontali"
            downLabel="Verticali"
          />
        </div>
      </main>
    )
  }
}

export default DailyPageClient
