"use client"

import type React from "react"

import { useState } from "react"

export default function TestHtmlPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawHtml, setRawHtml] = useState<string | null>(null)
  const [cleanedHtml, setCleanedHtml] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) {
      setError("Please enter a URL")
      return
    }

    setLoading(true)
    setError(null)
    setRawHtml(null)
    setCleanedHtml(null)

    try {
      const response = await fetch("/api/test-html-extraction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract HTML")
      }

      setRawHtml(data.rawHtml)
      setCleanedHtml(data.cleanedHtml)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">HTML Extraction Test</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Test extracting and cleaning HTML content from a casino page.
          </p>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Casino URL
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="url"
                  name="url"
                  id="url"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://casino.guru/casino-name-review"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Extract HTML"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(rawHtml || cleanedHtml) && (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Raw HTML</h3>
                <div className="mt-2 bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs whitespace-pre-wrap">{rawHtml}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Cleaned HTML</h3>
                <div className="mt-2 bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs whitespace-pre-wrap">{cleanedHtml}</pre>
                </div>

                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-900">Rendered Result</h4>
                  <div className="mt-2 border p-4 rounded-md">
                    <div dangerouslySetInnerHTML={{ __html: cleanedHtml || "" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
