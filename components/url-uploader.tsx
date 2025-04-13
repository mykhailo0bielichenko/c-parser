"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, Upload, Info } from "lucide-react"

export function UrlUploader() {
  const [urls, setUrls] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!urls.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      // Split the text by newlines and filter out empty lines
      const urlList = urls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0)

      // Validate URLs
      const validUrls = urlList.filter((url) => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      })

      if (validUrls.length === 0) {
        throw new Error("No valid URLs found. Please enter valid URLs.")
      }

      const response = await fetch("/api/parse-urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls: validUrls }),
      })

      const data = await response.json()

      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "URLs queued for parsing" : "Failed to queue URLs"),
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
        <CardTitle>Upload Casino URLs</CardTitle>
        <CardDescription>Enter a list of casino URLs to parse, with one URL per line.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="https://casino.guru/lemon-casino-review&#10;https://casino.guru/another-casino-review&#10;https://casino.guru/third-casino-review"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="min-h-[200px]"
            />
            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>Fixed CSS Selector Issues</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  We've fixed the CSS selector issues that were causing the "Expected name, found #" error. Our parser
                  now:
                </p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Uses more robust selectors that avoid special characters</li>
                  <li>Handles the popup by removing it from the HTML before parsing</li>
                  <li>Has better error handling to continue parsing even if some sections fail</li>
                  <li>Uses the CodeTabs proxy as the primary method for fetching HTML</li>
                </ul>
                <p className="mt-2 text-sm">
                  If you still encounter issues, please try the HTML Uploader tab as a fallback method.
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
                Upload and Parse URLs
              </>
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
              {result.data?.queuedUrls && (
                <div className="mt-2">
                  <p className="font-medium">Queued URLs:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {result.data.queuedUrls.map((url: string, index: number) => (
                      <li key={index}>{url}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm">
                    Check the Dashboard to see the parsing results once processing is complete.
                  </p>
                </div>
              )}
            </Alert>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
