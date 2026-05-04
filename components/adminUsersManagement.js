"use client"

import { useEffect, useState } from "react"
import { listAdminUsers, updateAdminUserRole } from "@/utils/api"
import { useAuth } from "@/utils/authContext"
import { formatDateTime } from "@/utils/helpers"
import {
  Box,
  Button,
  Chip,
  Input,
  Table,
  Typography
} from "@mui/joy"
import { AdminPageShell } from "@/components/adminPageShell"
import { PageSection, PageStatusBanner } from "@/components/pageShell"
import { colors, radii } from "@/utils/designTokens"

const searchFieldSx = {
  borderRadius: radii.md,
  minHeight: 52,
  backgroundColor: "rgba(247,250,255,0.9)"
}

function getRoleChipColor(user) {
  return user.isAdmin ? "primary" : "neutral"
}

function getStatusChipColor(user) {
  return user.status === "active" ? "success" : "warning"
}

export function AdminUsersManagement() {
  const { viewer } = useAuth()
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loadError, setLoadError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [pendingUserId, setPendingUserId] = useState("")

  const loadUsers = async () => {
    setIsLoading(true)
    setLoadError("")
    setSuccessMessage("")

    try {
      const nextUsers = await listAdminUsers()
      setUsers(nextUsers)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredUsers = users.filter((user) => {
    if (!normalizedSearch) {
      return true
    }

    return (
      user.email?.toLowerCase().includes(normalizedSearch) ||
      user.uid?.toLowerCase().includes(normalizedSearch) ||
      user.role?.toLowerCase().includes(normalizedSearch)
    )
  })
  const adminCount = users.filter((user) => user.isAdmin).length
  const memberCount = users.length - adminCount

  const handleRoleChange = async (user, nextRole) => {
    setPendingUserId(user.uid)
    setLoadError("")
    setSuccessMessage("")

    try {
      const updatedUser = await updateAdminUserRole(user.uid, nextRole)
      setUsers((currentUsers) =>
        currentUsers.map((entry) =>
          entry.uid === updatedUser.uid ? updatedUser : entry
        )
      )
      setSuccessMessage(
        nextRole === "admin"
          ? `Permessi admin concessi a ${updatedUser.email || updatedUser.uid}`
          : `Permessi admin revocati a ${updatedUser.email || updatedUser.uid}`
      )
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setPendingUserId("")
    }
  }

  return (
    <AdminPageShell
      title="Gestione utenti admin"
      description="Gestisci i ruoli admin."
      stats={[
        { label: `${adminCount} admin`, color: "primary" },
        { label: `${memberCount} member`, color: "neutral" }
      ]}
    >
      <PageSection>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1fr) auto",
            gap: 1.5,
            alignItems: "center",
            "@media (max-width: 720px)": {
              gridTemplateColumns: "1fr"
            }
          }}
        >
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cerca per email, uid o ruolo"
            sx={searchFieldSx}
          />

          <Button
            variant="soft"
            onClick={loadUsers}
            disabled={isLoading}
            sx={{ borderRadius: radii.pill }}
          >
            Aggiorna elenco
          </Button>
        </Box>

        {successMessage ? (
          <PageStatusBanner tone="success">{successMessage}</PageStatusBanner>
        ) : null}

        {loadError ? (
          <PageStatusBanner tone="danger">{loadError}</PageStatusBanner>
        ) : null}
      </PageSection>

      <PageSection
        sx={{
          overflowX: "auto"
        }}
      >
        {isLoading ? (
          <Typography>Caricamento utenti...</Typography>
        ) : filteredUsers.length === 0 ? (
          <Typography>Nessun utente corrisponde ai filtri correnti.</Typography>
        ) : (
          <Table
            borderAxis="xBetween"
            hoverRow
            stickyHeader
            sx={{
              minWidth: 900,
              '--TableCell-headBackground': 'rgba(237, 244, 255, 0.98)'
            }}
          >
            <thead>
              <tr>
                <th>Email</th>
                <th>Ruolo</th>
                <th>Stato</th>
                <th>Ultimo accesso</th>
                <th>Creato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isPending = pendingUserId === user.uid
                const isSelfAdmin = user.isCurrentUser && user.isAdmin

                return (
                  <tr key={user.uid}>
                    <td>
                      <div>
                        <Typography level="title-sm">{user.email || user.uid}</Typography>
                        <Typography level="body-xs" sx={{ color: colors.inkMuted }}>
                          {user.uid}
                        </Typography>
                      </div>
                    </td>
                    <td>
                      <Chip color={getRoleChipColor(user)} variant="soft" sx={{ borderRadius: radii.pill }}>
                        {user.isAdmin ? "Admin" : "Member"}
                      </Chip>
                    </td>
                    <td>
                      <Chip color={getStatusChipColor(user)} variant="soft" sx={{ borderRadius: radii.pill }}>
                        {user.status || "active"}
                      </Chip>
                    </td>
                    <td>{formatDateTime(user.lastLoginAt, { fallback: "Mai" })}</td>
                    <td>{formatDateTime(user.createdAt, { fallback: "-" })}</td>
                    <td>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {user.isAdmin ? (
                          <Button
                            size="sm"
                            variant="soft"
                            color="danger"
                            loading={isPending}
                            disabled={isPending || isSelfAdmin}
                            onClick={() => handleRoleChange(user, "member")}
                            sx={{ borderRadius: radii.pill }}
                          >
                            Revoca admin
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="soft"
                            color="primary"
                            loading={isPending}
                            disabled={isPending}
                            onClick={() => handleRoleChange(user, "admin")}
                            sx={{ borderRadius: radii.pill }}
                          >
                            Rendi admin
                          </Button>
                        )}
                        {isSelfAdmin ? (
                          <Chip variant="soft" color="neutral" sx={{ borderRadius: radii.pill }}>
                            Account corrente
                          </Chip>
                        ) : null}
                      </Box>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </PageSection>
    </AdminPageShell>
  )
}