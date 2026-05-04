import Image from "next/image"
import { Sheet, Typography } from "@mui/joy"
import { colors, radii, shadows } from "@/utils/designTokens"
import styles from "./loading.module.css"

export default function Loading() {
  return (
    <main className={styles.root}>
      <Sheet
        sx={{
          p: 3,
          borderRadius: radii.xl,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(var(--app-primary-rgb), 0.08)",
          boxShadow: shadows.card,
          display: "grid",
          placeItems: "center",
          gap: 2
        }}
      >
        <div className={styles.spinner}>
        <Image
          src="/AWE-SPORT-EDUCATION-ICON-POS.png"
          alt="Loading..."
          width={60}
          height={60}
        />
        </div>
        <Typography sx={{ color: colors.inkMuted }}>
          Sto preparando la tua area di lavoro...
        </Typography>
      </Sheet>
    </main>
  )
}
