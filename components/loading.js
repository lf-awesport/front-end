import Image from "next/image"
import styles from "./carousel.module.css"

export default function Loading() {
  return (
    <main className={styles.loading}>
      <div className={styles.spinner}>
        <Image
          src="/AWE-SPORT-EDUCATION-ICON-POS.png"
          alt="Loading..."
          width={60}
          height={60}
        />
      </div>
    </main>
  )
}
