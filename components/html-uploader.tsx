"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, Upload, Info } from "lucide-react"
import { Input } from "@/components/ui/input"

export function HtmlUploader() {
  const [html, setHtml] = useState("")
  const [casinoUrl, setCasinoUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!html.trim() || !casinoUrl.trim()) {
      setResult({
        success: false,
        message: "Please provide both the casino URL and HTML content",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      // Validate URL
      try {
        new URL(casinoUrl)
      } catch {
        throw new Error("Please enter a valid URL including https://")
      }

      const response = await fetch("/api/parse-html", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html, url: casinoUrl }),
      })

      const data = await response.json()

      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "HTML parsed successfully" : "Failed to parse HTML"),
        data: data.data,
      })
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Casino HTML</CardTitle>
        <CardDescription>Copy and paste the HTML content of a casino review page to parse it directly.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="casinoUrl" className="block text-sm font-medium mb-1">
                Casino URL
              </label>
              <Input
                id="casinoUrl"
                type="url"
                value={casinoUrl}
                onChange={(e) => setCasinoUrl(e.target.value)}
                placeholder="https://casino.guru/lemon-casino-review"
                required
              />
            </div>

            <div>
              <label htmlFor="html" className="block text-sm font-medium mb-1">
                HTML Content
              </label>
              <Textarea
                id="html"
                placeholder="Paste the HTML content of the casino review page here..."
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="min-h-[300px]"
                required
              />
            </div>

            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>How to handle the "OK" button popup</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal pl-5 text-sm">
                  <li>Visit the casino review page in your browser</li>
                  <li>
                    <strong>Click the "OK" button</strong> on the popup that appears (as shown in the screenshot)
                  </li>
                  <li>Right-click on the page and select "View Page Source" or press Ctrl+U</li>
                  <li>Select all (Ctrl+A) and copy (Ctrl+C) the HTML content</li>
                  <li>Paste (Ctrl+V) the content into the textarea above</li>
                </ol>
                <p className="mt-2 text-sm font-medium">
                  This method bypasses CORS restrictions and ensures the popup is properly handled.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Parse HTML
              </>
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
              {result.success && <p className="mt-2 text-sm">Check the Dashboard to see the parsing results.</p>}
            </Alert>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
