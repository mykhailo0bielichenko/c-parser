import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Casino ID is required" }, { status: 400 })
    }

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
        bonuses(id, type, name, name_2, subtype, min_deposit, wagering_requirements, max_cashout, max_bet, bonus_expiration, process_speed, free_spins, free_spins_conditions, other_info),
        casino_game_types(
          game_types(id, name),
          is_available
        ),
        casino_game_providers(
          game_providers(id, name, logo_url)
        ),
        casino_languages(
          languages(id, name, code),
          type
        ),
        screenshots(id, url, alt_text, type),
        mobile_apps(id, platform, app_url, has_app),
        responsible_gambling_features(id, feature),
        user_reviews(id, rating, review_text, author, review_date, source)
      `)
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Casino not found" }, { status: 404 })
    }

    return NextResponse.json({ casino: data })
  } catch (error) {
    console.error("Error fetching casino:", error)
    return NextResponse.json({ error: "Failed to fetch casino" }, { status: 500 })
  }
}
