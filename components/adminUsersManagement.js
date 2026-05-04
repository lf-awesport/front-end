"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { listAdminUsers, updateAdminUserRole } from "@/utils/api"
import { useAuth } from "@/utils/authContext"
import { formatDateTime } from "@/utils/helpers"
import {
  Box,
  Button,
  Chip,
  Input,
  Sheet,
  Table,
  Typography
} from "@mui/joy"

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <div>
            <Typography
              level="body-sm"
              sx={{ letterSpacing: "0.14em", textTransform: "uppercase", color: "#0a63b3" }}
            >
              Admin
            </Typography>
            <Typography level="h1" sx={{ mt: 0.5 }}>
              Gestione utenti admin
            </Typography>
            <Typography sx={{ mt: 1.5, maxWidth: 760 }}>
              Promuovi o revoca i permessi admin dai profili utente gia registrati. La revoca dell&apos;ultimo admin e la tua auto-revoca da questo pannello sono bloccate.
            </Typography>
          </div>

          <Link href="/admin" style={{ textDecoration: "none" }}>
            <Button variant="soft" color="primary" sx={{ borderRadius: 999 }}>
              Torna ad admin
            </Button>
          </Link>
        </div>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1fr) auto",
            gap: 1.5,
            mt: 3,
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
            sx={{ borderRadius: "16px" }}
          />

          <Button variant="soft" onClick={loadUsers} disabled={isLoading} sx={{ borderRadius: 999 }}>
            Aggiorna elenco
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
          <Chip variant="soft" color="primary" sx={{ borderRadius: 999 }}>
            {adminCount} admin
          </Chip>
          <Chip variant="soft" color="neutral" sx={{ borderRadius: 999 }}>
            {memberCount} member
          </Chip>
          <Chip variant="soft" color="neutral" sx={{ borderRadius: 999 }}>
            {viewer?.email || "Admin corrente"}
          </Chip>
        </Box>

        {successMessage ? (
          <Typography sx={{ mt: 2, color: "#166534" }}>{successMessage}</Typography>
        ) : null}

        {loadError ? (
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
        {isLoading ? (
          <Typography>Caricamento utenti...</Typography>
        ) : filteredUsers.length === 0 ? (
          <Typography>Nessun utente corrisponde ai filtri correnti.</Typography>
        ) : (
          <Table borderAxis="xBetween" hoverRow stickyHeader>
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
                        <Typography level="body-xs" sx={{ color: "rgba(18, 36, 85, 0.65)" }}>
                          {user.uid}
                        </Typography>
                      </div>
                    </td>
                    <td>
                      <Chip color={getRoleChipColor(user)} variant="soft" sx={{ borderRadius: 999 }}>
                        {user.isAdmin ? "Admin" : "Member"}
                      </Chip>
                    </td>
                    <td>
                      <Chip color={getStatusChipColor(user)} variant="soft" sx={{ borderRadius: 999 }}>
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
                            sx={{ borderRadius: 999 }}
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
                            sx={{ borderRadius: 999 }}
                          >
                            Rendi admin
                          </Button>
                        )}
                        {isSelfAdmin ? (
                          <Chip variant="soft" color="neutral" sx={{ borderRadius: 999 }}>
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
      </Sheet>
    </main>
  )
}