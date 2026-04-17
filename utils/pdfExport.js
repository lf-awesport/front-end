const PDF_PAGE_WIDTH = 595.28
const PDF_MINIMUM_HEIGHT = 841.89
const PDF_MAXIMUM_HEIGHT = 14400
const PDF_MARGIN = 24

function slugifyFileName(value) {
  const normalized = (value || "lesson")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || "lesson"
}

export function buildPdfFileName(title, lessonDate, fallbackTitle = "lesson") {
  const safeTitle = title || fallbackTitle
  const dateSuffix = lessonDate ? `-${lessonDate}` : ""

  return `${slugifyFileName(safeTitle)}${dateSuffix}.pdf`
}

function waitForNextPaint() {
  if (typeof window === "undefined") {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve)
    })
  })
}

async function waitForExportAssets(container) {
  const fontPromise =
    typeof document !== "undefined" && document.fonts?.ready
      ? document.fonts.ready.catch(() => undefined)
      : Promise.resolve()

  const imagePromises = Array.from(container.querySelectorAll("img")).map((image) =>
    image.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true })
          image.addEventListener("error", resolve, { once: true })
        })
  )

  await Promise.all([fontPromise, ...imagePromises])
}

function getPdfLayout(canvas) {
  const renderWidth = PDF_PAGE_WIDTH - PDF_MARGIN * 2
  const naturalRenderHeight = (canvas.height * renderWidth) / canvas.width
  const pageHeight = Math.min(
    PDF_MAXIMUM_HEIGHT,
    Math.max(PDF_MINIMUM_HEIGHT, naturalRenderHeight + PDF_MARGIN * 2)
  )
  const availablePageHeight = pageHeight - PDF_MARGIN * 2
  const fitScale = Math.min(1, availablePageHeight / naturalRenderHeight)
  const imageWidth = renderWidth * fitScale
  const imageHeight = naturalRenderHeight * fitScale

  return {
    pageHeight,
    imageWidth,
    imageHeight,
    imageX: (PDF_PAGE_WIDTH - imageWidth) / 2
  }
}

export async function exportElementAsPdf(element, fileName) {
  await waitForNextPaint()
  await waitForExportAssets(element)
  await waitForNextPaint()

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf")
  ])

  const scale =
    typeof window === "undefined" ? 1.5 : Math.min(window.devicePixelRatio || 1.5, 2)

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: typeof window === "undefined" ? 0 : -window.scrollY,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  })

  const imageData = canvas.toDataURL("image/png")
  const { pageHeight, imageWidth, imageHeight, imageX } = getPdfLayout(canvas)
  const pdf = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: [PDF_PAGE_WIDTH, pageHeight],
    compress: true
  })

  pdf.setProperties({ title: fileName.replace(/\.pdf$/i, "") })

  pdf.addImage(
    imageData,
    "PNG",
    imageX,
    PDF_MARGIN,
    imageWidth,
    imageHeight,
    undefined,
    "FAST"
  )

  pdf.save(fileName)
}