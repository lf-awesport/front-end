import Link from "next/link"
import Image from "next/image"
import styles from "./header.module.css"
import Menu from "./menu"

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brandLink}>
          <div className={styles.brandMark}>
            <Image
              src="/EDDY.png"
              alt="awe Logo"
              width={50}
              height={50}
              style={{ marginRight: "-10px" }}
              priority
            />
            <Image
              src="/eddy-logo.png"
              alt="awe Logo"
              width={75}
              height={50}
              priority
            />
          </div>
        </Link>

        <div className={styles.menuSlot}>
          <Menu />
        </div>
      </div>
    </header>
  )
}
