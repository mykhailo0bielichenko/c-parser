import * as cheerio from "cheerio"

export async function parseSitemap(url: string): Promise<string[]> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`)
    }

    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    const urls: string[] = []

    // Extract URLs from sitemap
    $("url loc").each((i, el) => {
      const url = $(el).text().trim()
      if (url && url.includes("/casino-review")) {
        urls.push(url)
      }
    })

    return urls
  } catch (error) {
    console.error(`Error parsing sitemap: ${error}`)
    return []
  }
}
