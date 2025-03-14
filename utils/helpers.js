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
