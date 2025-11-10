// Log ogni lettera digitata nella griglia

"use client"

import React, { Component } from "react"
import { doc, getDoc } from "firebase/firestore"
import db from "@/utils/firestore"
import Loading from "@/components/loading"
import Crossword from "@jaredreisinger/react-crossword"
import styles from "./carousel.module.css"

const crosswordTheme = {
  gridBackground: "#f7fafc",
  cellBackground: "#fff",
  cellBorder: "#5cc9fa",
  textColor: "#222",
  numberColor: "#5cc9fa",
  focusBackground: "#e3f6ff",
  highlightBackground: "#d0f0ff",
  columnBreakpoint: "700px"
}

class CrosswordTab extends Component {
  handleResetCrossword = () => {
    if (this.crosswordRef.current && this.crosswordRef.current.reset) {
      this.crosswordRef.current.reset()
      this.setState({ crosswordCompleted: false })
    }
  }
  state = {
    crosswordData: null,
    loading: true,
    crosswordCompleted: false
  }
  handleFillAllAnswers = () => {
    if (this.crosswordRef.current && this.crosswordRef.current.fillAllAnswers) {
      this.crosswordRef.current.fillAllAnswers()
    }
  }
  handleCellChange = (row, col, char) => {
    console.log(`Lettera inserita: '${char}' in cella [${row},${col}]`)
  }
  constructor(props) {
    super(props)
    this.state = {
      crosswordData: null,
      loading: true
    }
    this.crosswordRef = React.createRef()
  }

  componentDidMount() {
    this.loadCrossword()
  }

  loadCrossword = () => {
    const { postId } = this.props
    if (!postId) return
    const ref = doc(db, "crosswords", postId)
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data()
        console.log(data)
        this.setState({
          crosswordData: data.crossword || null,
          loading: false
        })
      } else {
        this.setState({ loading: false })
      }
    })
  }

  handleClueCorrect = (direction, number, answer) => {
    console.log(
      `[onCorrect] Parola indovinata: n. ${number} (${direction}) = ${answer}`
    )
    alert(`Hai indovinato la parola n. ${number} (${direction}): ${answer}`)
  }

  handleCrosswordComplete = (isCorrect) => {
    if (isCorrect) {
      this.setState({ crosswordCompleted: true })
      console.log("✅ Cruciverba completato correttamente!")
    } else {
      this.setState({ crosswordCompleted: false })
      console.log("❌ Cruciverba non ancora completato correttamente.")
    }
  }

  render() {
    const { crosswordData, loading, crosswordCompleted } = this.state
    if (loading) return <Loading message="Caricamento cruciverba..." />
    if (!crosswordData) return <Loading message="Nessun cruciverba trovato." />
    return (
      <main
        className={styles.main}
        style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}
      >
        <div
          className={styles["responsive-crossword-container"]}
          style={
            crosswordCompleted ? { pointerEvents: "none", opacity: 0.9 } : {}
          }
        >
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginBottom: 24
          }}
        >
          <button
            style={{
              padding: "8px 20px",
              background: "#5cc9fa",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: crosswordCompleted ? "not-allowed" : "pointer"
            }}
            onClick={this.handleFillAllAnswers}
            disabled={crosswordCompleted}
          >
            Mostra tutte le risposte
          </button>
          <button
            style={{
              padding: "8px 20px",
              background: "#eee",
              color: "#222",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: crosswordCompleted ? "not-allowed" : "pointer"
            }}
            onClick={this.handleResetCrossword}
          >
            Reset
          </button>
        </div>
      </main>
    )
  }
}

export default CrosswordTab
