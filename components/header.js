import styles from "./carousel.module.css"
import Image from "next/image"
import HomeIcon from "@mui/icons-material/Home"
import { Typography } from "@mui/joy"

export function Header({ children }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeftColumn}>
        <a href="/">
          <HomeIcon sx={{ color: "#fff", fontSize: 40 }} />{" "}
        </a>
      </div>
      <div className={styles.headerRightColumn}>
        {/* <Typography
          level="body-sm"
          sx={{
            color: "#fff",
            fontFamily: "Inter",
            textAlign: "right",
            width: "100%",
            fontWeight: "bold",
            marginRight: "1em"
          }}
        >
          AWE EDDY
        </Typography> */}
        <Image
          src="/EDDY.png"
          alt="awe Logo"
          className={styles.aweLogo}
          width={50}
          height={50}
          style={{ marginRight: "1em" }}
          priority
        />
      </div>
    </div>
  )
}
