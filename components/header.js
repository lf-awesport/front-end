import styles from "./carousel.module.css"
import Image from "next/image"
import HomeIcon from "@mui/icons-material/Home"

export function Header({ children }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeftColumn}>
        <a href="/">
          <HomeIcon sx={{ color: "#fff", fontSize: 50 }} />{" "}
        </a>
      </div>
      <div className={styles.headerCenterColumn}>
        <Image
          src="/EDDY.png"
          alt="awe Logo"
          className={styles.aweLogo}
          width={50}
          height={50}
          style={{ marginRight: "-10px" }}
          priority
        />
        <Image
          src="/eddy-logo.png"
          alt="awe Logo"
          className={styles.aweLogo}
          width={75}
          height={50}
          priority
        />
      </div>
      <div className={styles.headerRightColumn}></div>
    </div>
  )
}
