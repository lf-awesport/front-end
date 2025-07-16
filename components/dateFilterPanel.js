import { ThemeProvider, createTheme } from "@mui/material/styles"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { Stack, TextField } from "@mui/material"

const materialTheme = createTheme()

export default function DateFilterPanel({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  shouldDisableFromDate,
  shouldDisableToDate
}) {
  return (
    <ThemeProvider theme={materialTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <DatePicker
            label="Da"
            value={fromDate}
            onChange={(newValue) => setFromDate(newValue)}
            slotProps={{ textField: { variant: "outlined", size: "small" } }}
            shouldDisableDate={shouldDisableFromDate}
          />
          <DatePicker
            label="A"
            sx={{ ml: 0 }}
            value={toDate}
            onChange={(newValue) => setToDate(newValue)}
            slotProps={{ textField: { variant: "outlined", size: "small" } }}
            shouldDisableDate={shouldDisableToDate}
          />
        </Stack>
      </LocalizationProvider>
    </ThemeProvider>
  )
}
