// app/api/cron/route.js
import axios from "axios"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await axios.get(`${process.env.EXPRESS_BASE_URL}/test`, {
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`
      }
    })

    return NextResponse.json({
      status: "✅ Success",
      data: response.data
    })
  } catch (error) {
    console.error("❌ Cron job error:", error.message)
    return NextResponse.json(
      {
        status: "❌ Failed",
        error: error.message
      },
      { status: 500 }
    )
  }
}
