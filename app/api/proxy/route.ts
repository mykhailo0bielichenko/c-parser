import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get the URL from the query parameters
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Enhanced browser-like headers with cookie consent
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      Referer: "https://www.google.com/",
      Connection: "keep-alive",
      // Add cookie consent cookies to bypass popups
      Cookie: "cookieconsent_status=dismiss; age_verified=1; popup_closed=1; gdpr_consent=1; ok_clicked=1",
    }

    // Fetch the URL
    const response = await fetch(url, { headers })

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status })
    }

    // Get the content type
    const contentType = response.headers.get("content-type") || "text/html"

    // Get the HTML content
    let html = await response.text()

    // Simulate clicking the OK button by removing the popup HTML
    if (html.includes('class="ok-button"') || html.includes('id="ok-button"') || html.includes('button class="ok"')) {
      console.log("Found OK button in HTML, removing popup...")
      // This is a simple approach - in a real implementation, you might need more sophisticated parsing
      html = html.replace(/<div[^>]*class="[^"]*popup[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "")
    }

    // Return the HTML content with the appropriate content type
    return new NextResponse(html, {
      headers: {
        "Content-Type": contentType,
        // Add CORS headers to allow access from any origin
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
