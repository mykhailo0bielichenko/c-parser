export function logDebug(message: string, data?: any) {
  console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : "")
}

export function logError(message: string, error: any) {
  console.error(`[ERROR] ${message}`, error)

  // If error is an object with stack trace, log it
  if (error && error.stack) {
    console.error(error.stack)
  }
}
