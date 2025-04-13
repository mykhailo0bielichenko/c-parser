import * as cheerio from "cheerio"

/**
 * Extracts and cleans HTML content from a div, keeping only basic HTML tags
 * @param html The full HTML content
 * @param selector The CSS selector for the div to extract content from
 * @returns Cleaned HTML content with only basic tags
 */
export function extractAndCleanHtml(html: string, selector: string): string {
  try {
    const $ = cheerio.load(html)
    const contentDiv = $(selector)

    if (!contentDiv.length) {
      return ""
    }

    // Clone the content to avoid modifying the original
    const content = contentDiv.clone()

    // Remove all class and style attributes from all elements
    content.find("*").each((_, element) => {
      const el = $(element)
      el.removeAttr("class")
      el.removeAttr("style")
      el.removeAttr("id")
      el.removeAttr("data-*")

      // Keep only allowed attributes for specific tags
      if (el.is("a")) {
        const href = el.attr("href")
        el.attr("href", href)
        el.removeAttr("target")
        el.removeAttr("rel")
      } else if (el.is("img")) {
        const src = el.attr("src")
        const alt = el.attr("alt") || ""
        el.attr("src", src)
        el.attr("alt", alt)
      }

      // Remove all other attributes
      const attributes = element.attributes
      for (let i = attributes.length - 1; i >= 0; i--) {
        const attrName = attributes[i].name
        if (!["href", "src", "alt"].includes(attrName)) {
          el.removeAttr(attrName)
        }
      }
    })

    // Remove all elements except basic HTML tags
    content.find("*").each((_, element) => {
      const el = $(element)
      const tagName = element.tagName.toLowerCase()
      const allowedTags = ["h1", "h2", "h3", "h4", "a", "img", "p", "ul", "ol", "li", "strong", "em", "b", "i", "br"]

      if (!allowedTags.includes(tagName)) {
        // Replace the element with its contents
        el.replaceWith(el.html() || "")
      }
    })

    return content.html() || ""
  } catch (error) {
    console.error("Error extracting and cleaning HTML:", error)
    return ""
  }
}
