export const getCategoryDetails = (category) => {
  const categoryDetails = {
    "Sports Law": { color: "#1E88E5", acronym: "LAW" },
    Finance: { color: "#43A047", acronym: "FIN" },
    Esport: { color: "#D32F2F", acronym: "ESP" },
    "Event Management": { color: "#8E24AA", acronym: "EVM" },
    Marketing: { color: "#FB8C00", acronym: "MKT" },
    Sponsorship: { color: "#FDD835", acronym: "SPN" },
    "Sport for Good": { color: "#00ACC1", acronym: "SFG" },
    "Sport Equipment": { color: "#5D4037", acronym: "EQP" },
    "Sport Tourism": { color: "#7CB342", acronym: "TOU" },
    Media: { color: "#424242", acronym: "MED" },
    "Fan Experience": { color: "purples", acronym: "EXP" }
  }

  return categoryDetails[category] || { color: "#000000", acronym: "UNK" } // Default to black and "UNK" for unknown categories
}

const DEFAULT_DATE_TIME_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
}

export function getTimestampMillis(value) {
  if (!value) {
    return 0
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis()
  }

  if (typeof value.seconds === "number") {
    return value.seconds * 1000
  }

  if (typeof value._seconds === "number") {
    return value._seconds * 1000
  }

  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function toDateValue(value) {
  const timestamp = getTimestampMillis(value)
  return timestamp ? new Date(timestamp) : null
}

export function formatDateTime(
  value,
  {
    fallback = "-",
    locale = "it-IT",
    options = DEFAULT_DATE_TIME_OPTIONS
  } = {}
) {
  const date = toDateValue(value)

  if (!date) {
    return fallback
  }

  return new Intl.DateTimeFormat(locale, options).format(date)
}
