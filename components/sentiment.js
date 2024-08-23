"use client"

import styles from "./carousel.module.css"
import { BarChart } from "@mui/x-charts/BarChart"
import { axisClasses } from "@mui/x-charts/ChartsAxis"
import { Typography } from "@mui/joy"

const chartSetting = {
  width: 500,
  height: 350,
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: "translate(-20px, 0)",
      fill: "#fff",
      stroke: "#fff"
    },
    //change left yAxis label styles
    "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
      strokeWidth: "0.4",
      fill: "#fff"
    },
    // change bottom label styles
    "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
      strokeWidth: "0.5",
      fill: "#fff"
    },
    // bottomAxis Line Styles
    "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
      stroke: "#fff",
      strokeWidth: 0.4
    },
    // leftAxis Line Styles
    "& .MuiChartsAxis-left .MuiChartsAxis-line": {
      stroke: "#fff",
      strokeWidth: 0.4
    },
    ".MuiChartsLegend-mark + text > tspan": {
      fill: "#fff",
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
              color: ["yellow"]
            },
            {
              dataKey: "paura",
              label: "Paura",
              valueFormatter,
              color: ["violet"]
            },
            {
              dataKey: "rabbia",
              label: "Rabbia",
              valueFormatter,
              color: ["red"]
            },
            {
              dataKey: "sorpresa",
              label: "Sorpresa",
              valueFormatter,
              color: ["green"]
            },
            {
              dataKey: "tristezza",
              label: "Tristezza",
              valueFormatter,
              color: ["blue"]
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
