import styles from "./carousel.module.css"
import { Typography } from "@mui/joy"

export function Footer() {
  return (
    <div className={styles.footer}>
      <Typography
        level="body-sm"
        sx={{ color: "#fff", textAlign: "center", width: "100%" }}
      >
        © 2025 AWE Eddy — Powered by Sport & AI ⚽🤖
      </Typography>
    </div>
  )
}
