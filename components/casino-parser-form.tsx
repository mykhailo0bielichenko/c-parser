"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export function CasinoParserForm() {
  const [casinoUrl, setCasinoUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!casinoUrl) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: casinoUrl }),
      })

      // Check if the response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // Not JSON, get the text response
        const textResponse = await response.text()
        console.error("Non-JSON response:", textResponse)

        setResult({
          success: false,
          message: "Server returned a non-JSON response",
          error: textResponse.substring(0, 500), // Limit the size
        })
        return
      }

      const data = await response.json()

      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "Parsing completed successfully" : "Failed to parse casino"),
        data: data.parsedData,
        error: data.error,
      })
    } catch (error) {
      console.error("Error in handleSubmit:", error)

      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
        error: error instanceof Error ? error.stack : String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parse Casino Page</CardTitle>
        <CardDescription>Enter the URL of a casino review page to parse.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="casinoUrl" className="text-sm font-medium">
                Casino URL
              </label>
              <Input
                id="casinoUrl"
                type="url"
                placeholder="https://casino.guru/lemon-casino-review"
                value={casinoUrl}
                onChange={(e) => setCasinoUrl(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : (
              "Parse Casino"
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mt-4 w-full">
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
              {result.error && (
                <div className="mt-2">
                  <p className="font-medium">Error details:</p>
                  <pre className="mt-2 max-h-60 overflow-auto rounded bg-slate-100 p-2 text-xs">{result.error}</pre>
                </div>
              )}
              {result.success && result.data && (
                <div className="mt-2">
                  <p className="font-medium">Parsed Data:</p>
                  <pre className="mt-2 max-h-60 overflow-auto rounded bg-slate-100 p-2 text-xs">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </Alert>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
