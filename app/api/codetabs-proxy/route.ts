import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get the URL from the query parameters
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Use the CodeTabs proxy service
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`

    // Fetch the URL through the proxy
    const response = await fetch(proxyUrl)

    if (!response.ok) {
      return NextResponse.json(
        { error: `CodeTabs proxy request failed with status: ${response.status}` },
        { status: response.status },
      )
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
    console.error("CodeTabs proxy error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
