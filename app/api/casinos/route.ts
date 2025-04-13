import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from("casinos")
      .select(`
        *,
        casino_features(id, feature, type),
        casino_licenses(
          licenses(id, name, country_code)
        ),
        casino_payment_methods(
          payment_methods(id, name, logo_url),
          withdrawal_limit
        ),
        bonuses(id, type, name, name_2, subtype)
      `)
      .order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ casinos: data })
  } catch (error) {
    console.error("Error fetching casinos:", error)
    return NextResponse.json({ error: "Failed to fetch casinos" }, { status: 500 })
  }
}
