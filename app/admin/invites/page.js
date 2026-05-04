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
import { AdminPageShell } from "@/components/adminPageShell"
import { PageSection, PageStatusBanner } from "@/components/pageShell"
import { colors, radii } from "@/utils/designTokens"

const fieldSx = {
  borderRadius: radii.md,
  minHeight: 52,
  backgroundColor: "rgba(247,250,255,0.9)"
}

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
    setLatestInviteUrl("")

    try {
      const updatedInvite = await revokeAdminInvite(inviteId)
      setInvites((currentInvites) =>
        currentInvites.map((invite) =>
          invite.id === inviteId ? updatedInvite : invite
        )
      )
      setSuccessMessage(`Invito revocato per ${updatedInvite.email}`)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setRevokingId("")
    }
  }

  return (
    <AdminPageShell
      title="Gestione inviti"
      description="Crea e revoca inviti."
      stats={[
        { label: `${invites.length} inviti`, color: "primary" }
      ]}
    >
      <PageSection>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 1.5
          }}
        >
          <FormControl>
            <FormLabel sx={{ color: colors.ink, fontWeight: 600 }}>Email invitata</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@azienda.com"
              sx={fieldSx}
            />
          </FormControl>

          <FormControl>
            <FormLabel sx={{ color: colors.ink, fontWeight: 600 }}>Scadenza in ore</FormLabel>
            <Input
              type="number"
              value={expiresInHours}
              onChange={(event) => setExpiresInHours(event.target.value)}
              sx={fieldSx}
            />
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2.5 }}>
          <Button
            loading={isSubmitting}
            onClick={handleCreateInvite}
            disabled={!email}
            sx={{ borderRadius: radii.pill }}
          >
            Crea invito
          </Button>
          <Button
            variant="soft"
            onClick={loadInvites}
            disabled={isLoading}
            sx={{ borderRadius: radii.pill }}
          >
            Aggiorna elenco
          </Button>
        </Box>

        {successMessage ? (
          <PageStatusBanner tone="success" title={successMessage}>
            {latestInviteUrl ? (
              <Input sx={{ mt: 1.5, ...fieldSx }} value={latestInviteUrl} readOnly />
            ) : null}
          </PageStatusBanner>
        ) : null}

        {loadError && loadError !== "Admin access required" ? (
          <PageStatusBanner tone="danger">{loadError}</PageStatusBanner>
        ) : null}
      </PageSection>

      <PageSection
        sx={{
          overflowX: "auto"
        }}
      >
        {isLoading ? (
          <Typography>Caricamento inviti...</Typography>
        ) : invites.length === 0 ? (
          <Typography>Nessun invito creato finora.</Typography>
        ) : (
          <Table
            borderAxis="xBetween"
            hoverRow
            stickyHeader
            sx={{
              minWidth: 760,
              '--TableCell-headBackground': 'rgba(237, 244, 255, 0.98)'
            }}
          >
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
                    <Chip color={getStatusColor(invite)} variant="soft" sx={{ borderRadius: radii.pill }}>
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
                      sx={{ borderRadius: radii.pill }}
                    >
                      Revoca
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </PageSection>
    </AdminPageShell>
  )
}

export default function AdminInvitesPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminInvitesPageContent />
    </ProtectedRoute>
  )
}