import { Box, Chip } from "@mui/joy"
import { PageActionLink, PageContainer, PageHero } from "@/components/pageShell"
import { radii } from "@/utils/designTokens"

export function AdminPageShell({
  title,
  description,
  stats = [],
  actions,
  backHref = "/admin",
  backLabel = "Admin",
  children
}) {
  const heroActions =
    actions || backHref ? (
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "flex-end"
        }}
      >
        {actions}
        {backHref ? <PageActionLink href={backHref} label={backLabel} /> : null}
      </Box>
    ) : null

  return (
    <PageContainer>
      <PageHero
        eyebrow="Admin"
        title={title}
        description={description}
        action={heroActions}
      >
        {stats.length > 0 ? (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {stats.map((stat) => (
              <Chip
                key={stat.label}
                variant={stat.variant || "soft"}
                color={stat.color || "neutral"}
                sx={{ borderRadius: radii.pill }}
              >
                {stat.label}
              </Chip>
            ))}
          </Box>
        ) : null}
      </PageHero>
      {children}
    </PageContainer>
  )
}