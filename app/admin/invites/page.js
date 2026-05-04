"use client"

import { useEffect, useState } from "react"
import ProtectedRoute from "@/components/protectedRoute"
import { useAuth } from "@/utils/authContext"
import {
  createAdminInvite,
  listAdminInvites,
  revokeAdminInvite
} from "@/utils/api"
import { formatDateTime } from "@/utils/helpers"
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormLabel,
  Input,
  Sheet,
  Table,
  Typography
} from "@mui/joy"

function getStatusColor(invite) {
  if (invite.status === "used") {
    return "success"
  }

  if (invite.status === "revoked" || invite.isExpired) {
    return "danger"
  }

  return "primary"
}

function getStatusLabel(invite) {
  if (invite.status === "used") {
    return "Usato"
  }

  if (invite.status === "revoked") {
    return "Revocato"
  }

  if (invite.isExpired) {
    return "Scaduto"
  }

  return "Attivo"
}

function AdminInvitesPageContent() {
  const { viewer } = useAuth()
  const [invites, setInvites] = useState([])
  const [email, setEmail] = useState("")
  const [expiresInHours, setExpiresInHours] = useState("168")
  const [loadError, setLoadError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [latestInviteUrl, setLatestInviteUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [revokingId, setRevokingId] = useState("")

  const loadInvites = async () => {
    setIsLoading(true)
    setLoadError("")

    try {
      const nextInvites = await listAdminInvites()
      setInvites(nextInvites)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInvites()
  }, [])

  const handleCreateInvite = async () => {
    setIsSubmitting(true)
    setLoadError("")
    setSuccessMessage("")

    try {
      const result = await createAdminInvite({
        email,
        expiresInHours: expiresInHours ? Number.parseInt(expiresInHours, 10) : undefined
      })

      setInvites((currentInvites) => [result.invite, ...currentInvites])
      setLatestInviteUrl(result.inviteUrl)
      setSuccessMessage(`Invito creato per ${result.invite.email}`)
      setEmail("")
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeInvite = async (inviteId) => {
    setRevokingId(inviteId)
    setLoadError("")
    setSuccessMessage("")

    try {
      const updatedInvite = await revokeAdminInvite(inviteId)
      setInvites((currentInvites) =>
        currentInvites.map((invite) =>
          invite.id === inviteId ? updatedInvite : invite
        )
      )
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setRevokingId("")
    }
  }

  return (
    <main
      style={{
        width: "min(1200px, calc(100% - 32px))",
        margin: "0 auto",
        padding: "32px 0 64px"
      }}
    >
      <Sheet
        sx={{
          p: 3,
          borderRadius: "28px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(238,244,255,0.98))",
          boxShadow: "0 22px 60px rgba(10, 47, 143, 0.1)"
        }}
      >
        <Typography level="body-sm" sx={{ letterSpacing: "0.14em", textTransform: "uppercase", color: "#0a63b3" }}>
          Admin
        </Typography>
        <Typography level="h1" sx={{ mt: 0.5 }}>
          Gestione inviti
        </Typography>
        <Typography sx={{ mt: 1.5, maxWidth: 760 }}>
          Crea inviti monouso legati a una email specifica e revoca quelli ancora attivi.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 1.5,
            mt: 3
          }}
        >
          <FormControl>
            <FormLabel>Email invitata</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@azienda.com"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Scadenza in ore</FormLabel>
            <Input
              type="number"
              value={expiresInHours}
              onChange={(event) => setExpiresInHours(event.target.value)}
            />
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2.5 }}>
          <Button loading={isSubmitting} onClick={handleCreateInvite}>
            Crea invito
          </Button>
          <Button variant="soft" onClick={loadInvites} disabled={isLoading}>
            Aggiorna elenco
          </Button>
        </Box>

        {successMessage ? (
          <Sheet sx={{ mt: 2.5, p: 2, borderRadius: "18px", background: "rgba(220, 252, 231, 0.6)" }}>
            <Typography level="title-sm">{successMessage}</Typography>
            {latestInviteUrl ? (
              <Input sx={{ mt: 1.5 }} value={latestInviteUrl} readOnly />
            ) : null}
          </Sheet>
        ) : null}

        {loadError && loadError !== "Admin access required" ? (
          <Typography sx={{ mt: 2, color: "#c2410c" }}>{loadError}</Typography>
        ) : null}
      </Sheet>

      <Sheet
        sx={{
          mt: 3,
          p: 3,
          borderRadius: "24px",
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 16px 36px rgba(10, 47, 143, 0.08)",
          overflowX: "auto"
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip variant="soft" color="primary" sx={{ borderRadius: 999 }}>
            {invites.length} inviti
          </Chip>
          <Chip variant="soft" color="neutral" sx={{ borderRadius: 999 }}>
            {viewer?.email || "Admin"}
          </Chip>
        </Box>

        {isLoading ? (
          <Typography>Caricamento inviti...</Typography>
        ) : invites.length === 0 ? (
          <Typography>Nessun invito creato finora.</Typography>
        ) : (
          <Table borderAxis="xBetween" hoverRow stickyHeader>
            <thead>
              <tr>
                <th>Email</th>
                <th>Stato</th>
                <th>Creato</th>
                <th>Scade</th>
                <th>Creato da</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td>{invite.email}</td>
                  <td>
                    <Chip color={getStatusColor(invite)} variant="soft" sx={{ borderRadius: 999 }}>
                      {getStatusLabel(invite)}
                    </Chip>
                  </td>
                  <td>{formatDateTime(invite.createdAt)}</td>
                  <td>{formatDateTime(invite.expiresAt)}</td>
                  <td>{invite.createdBy || "-"}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="soft"
                      color="danger"
                      disabled={
                        invite.status !== "pending" ||
                        invite.isExpired ||
                        revokingId === invite.id
                      }
                      loading={revokingId === invite.id}
                      onClick={() => handleRevokeInvite(invite.id)}
                    >
                      Revoca
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Sheet>
    </main>
  )
}

export default function AdminInvitesPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminInvitesPageContent />
    </ProtectedRoute>
  )
}