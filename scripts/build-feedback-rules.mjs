import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectDir = path.resolve(__dirname, "..")
const envPath = path.join(projectDir, ".env.local")
const templatePath = path.join(projectDir, "firestore.feedback.rules")
const outputPath = path.join(projectDir, "firestore.feedback.generated.rules")

dotenv.config({ path: envPath })

function parseEditorEmails(value) {
  return Array.from(
    new Set(
      String(value || "")
        .split(",")
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
    )
  ).sort()
}

function formatEditorEmailBlock(emails) {
  return emails.map((email) => `        "${email}"`).join(",\n")
}

async function run() {
  const editorEmails = parseEditorEmails(process.env.NEXT_PUBLIC_FEEDBACK_EDITOR_EMAILS)

  if (editorEmails.length === 0) {
    throw new Error(
      "Set NEXT_PUBLIC_FEEDBACK_EDITOR_EMAILS in front-end/.env.local before building feedback rules."
    )
  }

  const template = await fs.readFile(templatePath, "utf8")
  const pattern = /(\/\/ FEEDBACK_EDITOR_EMAILS_START\n)([\s\S]*?)(\n\s*\/\/ FEEDBACK_EDITOR_EMAILS_END)/

  if (!pattern.test(template)) {
    throw new Error("Could not find feedback editor markers in firestore.feedback.rules")
  }

  const nextRules = template.replace(
    pattern,
    `$1${formatEditorEmailBlock(editorEmails)}$3`
  )

  await fs.writeFile(outputPath, nextRules, "utf8")

  console.log(
    `Generated ${path.basename(outputPath)} for ${editorEmails.length} editor email(s).`
  )
}

run().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})