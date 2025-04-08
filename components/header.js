import styles from "./carousel.module.css"
import Image from "next/image"
import { Typography } from "@mui/joy"

export function Header({ children }) {
  return (
    <div className={styles.header}>
      <div className={styles.leftColumn}>{children}</div>
      <div className={styles.centerColumn}>
        <Typography color="#003399" level="h1">
          Dashboard
        </Typography>
      </div>
      <div className={styles.rightColumn}>
        <Image
          src="/logo_white.png"
          alt="awe Logo"
          className={styles.aweLogo}
          width={150}
          height={40}
          style={{ margin: 0 }}
          priority
        />
      </div>
    </div>
  )
}
