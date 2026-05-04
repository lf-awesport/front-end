import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectDir = path.resolve(__dirname, "..")
const templatePath = path.join(projectDir, "firestore.feedback.rules")
const outputPath = path.join(projectDir, "firestore.feedback.generated.rules")

async function run() {
  const template = await fs.readFile(templatePath, "utf8")
  await fs.writeFile(outputPath, template, "utf8")

  console.log(
    `Generated ${path.basename(outputPath)} from ${path.basename(templatePath)}.`
  )
}

run().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})