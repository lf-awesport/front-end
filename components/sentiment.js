"use client"

import styles from "./carousel.module.css"
import { BarChart } from "@mui/x-charts/BarChart"
import { axisClasses } from "@mui/x-charts/ChartsAxis"
import { Typography } from "@mui/joy"

const chartSetting = {
  width: 340,
  height: 400,
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: "translate(-20px, 0)"
    },
    //change left yAxis label styles
    "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
      strokeWidth: "0.4"
    },
    // change bottom label styles
    "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
      strokeWidth: "0.5"
    },
    // bottomAxis Line Styles
    "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
      strokeWidth: 0.4
    },
    // leftAxis Line Styles
    "& .MuiChartsAxis-left .MuiChartsAxis-line": {
      strokeWidth: 0.4
    },
    ".MuiChartsLegend-mark + text > tspan": {
      strokeWidth: 0.4
    }
  }
}

const valueFormatter = (value) => value

export function Sentiment({ data }) {
  if (!data)
    return (
      <main className={styles.loading}>
        <Typography level="h1" color="fff" style={{ marginBottom: 20 }}>
          NOT FOUND
        </Typography>
      </main>
    )

  data.emozioni.label = "Emozione"
  const dataset = [data.emozioni]

  return (
    <div className={styles.sentiment}>
      <Typography level="h2" color="fff" style={{ marginBottom: 20 }}>
        Analisi del Testo
      </Typography>
      <div className={styles.chart}>
        <BarChart
          dataset={dataset}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "label"
            }
          ]}
          series={[
            {
              dataKey: "gioia",
              label: "Gioia",
              valueFormatter,
              color: ["#ffeb3b"]
            },
            {
              dataKey: "paura",
              label: "Paura",
              valueFormatter,
              color: ["#212121"]
            },
            {
              dataKey: "rabbia",
              label: "Rabbia",
              valueFormatter,
              color: ["#dd2c00"]
            },
            {
              dataKey: "sorpresa",
              label: "Sorpresa",
              valueFormatter,
              color: ["#00c853"]
            },
            {
              dataKey: "tristezza",
              label: "Tristezza",
              valueFormatter,
              color: ["#1a237e"]
            }
          ]}
          {...chartSetting}
        />
        <div className={styles.explanationContainer}>
          <Typography level="body-sm" color="fff" style={{ marginBottom: 20 }}>
            {data.spiegazione}
          </Typography>
        </div>
      </div>
    </div>
  )
}
