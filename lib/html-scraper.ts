import { load } from "cheerio"

// Maximum number of retry attempts
const MAX_RETRY_ATTEMPTS = 3
// Delay between retry attempts (in milliseconds)
const RETRY_DELAY = 2000

/**
 * Fetches HTML content from a URL using a proxy service to bypass anti-bot measures
 */
export async function fetchHtml(url: string): Promise<string> {
  // Try multiple methods to fetch the HTML
  const methods = [
    fetchWithCodeTabsProxy, // Try the CodeTabs proxy first
    fetchWithServerSideProxy,
    fetchWithCorsBypass,
    fetchDirectWithEnhancedHeaders,
  ]

  let lastError: Error | null = null

  // Try each method in sequence
  for (const method of methods) {
    try {
      console.log(`Trying to fetch ${url} using ${method.name}...`)
      const html = await method(url)

      // Verify we got valid HTML
      if (html && html.length > 1000 && (html.includes("<html") || html.includes("<body"))) {
        console.log(`Successfully fetched HTML using ${method.name}`)

        // Process the HTML to remove the popup
        const processedHtml = removePopup(html)

        return processedHtml
      } else {
        console.log(`Got invalid HTML response using ${method.name}`)
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Error using ${method.name}:`, lastError.message)
    }
  }

  // If all methods failed, throw the last error
  throw lastError || new Error(`Failed to fetch HTML from ${url} using all available methods`)
}

/**
 * Remove the popup from the HTML content
 */
function removePopup(html: string): string {
  // Look for the popup div and remove it
  let processedHtml = html

  // Remove the popup with the OK button
  const popupRegex = /<div[^>]*class="[^"]*popup[^"]*"[^>]*>[\s\S]*?<\/div>/gi
  processedHtml = processedHtml.replace(popupRegex, "")

  // Remove any overlay divs
  const overlayRegex = /<div[^>]*class="[^"]*overlay[^"]*"[^>]*>[\s\S]*?<\/div>/gi
  processedHtml = processedHtml.replace(overlayRegex, "")

  // Remove any modal divs
  const modalRegex = /<div[^>]*class="[^"]*modal[^"]*"[^>]*>[\s\S]*?<\/div>/gi
  processedHtml = processedHtml.replace(modalRegex, "")

  return processedHtml
}

/**
 * Fetch using the CodeTabs CORS proxy service
 */
async function fetchWithCodeTabsProxy(url: string): Promise<string> {
  const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`

  // Try with retry logic
  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(proxyUrl)

      if (!response.ok) {
        throw new Error(`CodeTabs proxy request failed with status: ${response.status}`)
      }

      return await response.text()
    } catch (error) {
      console.error(`CodeTabs proxy attempt ${attempt + 1} failed:`, error)

      if (attempt < MAX_RETRY_ATTEMPTS - 1) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`)
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      } else {
        throw error
      }
    }
  }

  throw new Error(`Failed after ${MAX_RETRY_ATTEMPTS} attempts with CodeTabs proxy`)
}

/**
 * Attempt to fetch directly with enhanced browser-like headers and cookie consent
 */
async function fetchDirectWithEnhancedHeaders(url: string): Promise<string> {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Upgrade-Insecure-Requests": "1",
    Referer: "https://www.google.com/",
    Connection: "keep-alive",
    // Add cookie consent cookies to bypass popups
    Cookie: "cookieconsent_status=dismiss; age_verified=1; popup_closed=1; gdpr_consent=1; ok_clicked=1",
  }

  // Try with retry logic
  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      return await response.text()
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error)

      if (attempt < MAX_RETRY_ATTEMPTS - 1) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`)
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      } else {
        throw error
      }
    }
  }

  throw new Error(`Failed after ${MAX_RETRY_ATTEMPTS} attempts`)
}

/**
 * Attempt to fetch using a server-side proxy approach
 * This uses our own API route as a proxy to bypass CORS and hide our origin
 */
async function fetchWithServerSideProxy(url: string): Promise<string> {
  // Create a proxy API route that will fetch the URL server-side
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`

  const response = await fetch(proxyUrl)

  if (!response.ok) {
    throw new Error(`Proxy request failed with status: ${response.status}`)
  }

  return await response.text()
}

/**
 * Attempt to fetch using a CORS bypass service
 */
async function fetchWithCorsBypass(url: string): Promise<string> {
  // Use a public CORS proxy service
  const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`

  const response = await fetch(corsProxyUrl)

  if (!response.ok) {
    throw new Error(`CORS proxy request failed with status: ${response.status}`)
  }

  return await response.text()
}

/**
 * Parse HTML content using Cheerio
 */
export function parseHtml(html: string) {
  return load(html)
}
