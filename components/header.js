import styles from "./carousel.module.css"
import Image from "next/image"
import HomeIcon from "@mui/icons-material/Home"

export function Header({ children }) {
  return (
    <div className={styles.header}>
      <div className={styles.leftColumn}>
        <a href="/">
          <HomeIcon sx={{ color: "#fff", fontSize: 40 }} />{" "}
        </a>
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
