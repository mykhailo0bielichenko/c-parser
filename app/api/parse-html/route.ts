import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"
import { parseHtml } from "@/lib/html-scraper"
import type * as cheerio from "cheerio"

export async function POST(request: Request) {
  try {
    const { html, url } = await request.json()

    if (!html || !url) {
      return NextResponse.json({ message: "HTML content and URL are required" }, { status: 400 })
    }

    // Log the parsing attempt
    const { error: logError } = await supabase.from("parse_logs").insert({
      url,
      status: "processing",
      message: "Parsing HTML content",
    })

    if (logError) {
      console.error("Error logging parse attempt:", logError)
    }

    try {
      // Parse the HTML with Cheerio
      const $ = parseHtml(html)

      // Extract casino data using our existing parser logic
      const casinoData = await parseCasinoPageFromCheerio($, url)

      if (casinoData) {
        // Save the casino data to the database
        await saveCasinoData(casinoData)

        // Update log to success
        await supabase
          .from("parse_logs")
          .update({
            status: "success",
            message: "Successfully parsed casino data",
          })
          .eq("url", url)
          .eq("status", "processing")

        return NextResponse.json({
          success: true,
          message: "Successfully parsed casino data",
          data: casinoData,
        })
      } else {
        throw new Error("Failed to extract casino data")
      }
    } catch (parseError) {
      console.error(`Error parsing HTML:`, parseError)

      // Update log to error
      await supabase
        .from("parse_logs")
        .update({
          status: "error",
          message: parseError instanceof Error ? parseError.message : "Failed to parse casino data",
        })
        .eq("url", url)
        .eq("status", "processing")

      return NextResponse.json(
        {
          success: false,
          message: parseError instanceof Error ? parseError.message : "Failed to parse casino data",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing HTML:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// Parse a casino page from Cheerio object
async function parseCasinoPageFromCheerio($: cheerio.CheerioAPI, url: string) {
  try {
    console.log(`Parsing casino page from HTML: ${url}`)

    // Check if we got a valid page (look for common elements)
    if ($(".casino-logo").length === 0 && $("title:contains('Casino')").length === 0) {
      throw new Error(`The page doesn't appear to be a casino review page: ${url}`)
    }

    // Extract casino data using the same extraction functions from parser.ts
    // This is a simplified version for demonstration
    const casinoData = {
      name:
        $(".casino-logo").attr("alt")?.replace(" Logo", "") || $("title").text().split(" - ")[0] || "Unknown Casino",
      logo_url: $(".casino-logo").attr("src") || "",
      rating: Number.parseFloat($(".rating b").text()) || 0,
      owner: $('.info-col-section-revenues:contains("Owner") b').text() || "",
      operator: $('.info-col-section-revenues:contains("Operator") b').text() || "",
      established: Number.parseInt($('.info-col-section-revenues:contains("Established") b').text()) || 0,
      estimated_revenue: $('.info-col-section-revenues:contains("Estimated annual revenues") b').text() || "",
      description: $(".casino-detail-box-description").text().trim(),
      website_url: url,
      has_live_chat: $(':contains("live chat")').length > 0 || $(':contains("Live Chat")').length > 0,
      // Add more extraction logic as needed
    }

    console.log(`Successfully extracted data for ${casinoData.name}`)
    return casinoData
  } catch (error) {
    console.error(`Error parsing casino page from HTML:`, error)
    throw error
  }
}

// Save casino data to the database (simplified version)
async function saveCasinoData(casinoData: any) {
  try {
    // Insert casino basic info
    const { data: casinoInsert, error: casinoError } = await supabase
      .from("casinos")
      .insert({
        name: casinoData.name,
        logo_url: casinoData.logo_url,
        rating: casinoData.rating,
        owner: casinoData.owner,
        operator: casinoData.operator,
        established: casinoData.established,
        estimated_revenue: casinoData.estimated_revenue,
        description: casinoData.description,
        has_live_chat: casinoData.has_live_chat || false,
        website_url: casinoData.website_url,
      })
      .select()

    if (casinoError) {
      throw casinoError
    }

    return casinoInsert[0].id
  } catch (error) {
    console.error("Error saving casino data:", error)
    throw error
  }
}
