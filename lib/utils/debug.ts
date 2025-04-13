export function logObject(label: string, obj: any) {
  console.log(`\n===== ${label} =====`)
  console.log(JSON.stringify(obj, null, 2))
  console.log("=".repeat(label.length + 12))
}

/**
 * Logs an error with stack trace
 */
export function logError(label: string, error: any) {
  console.error(`\n***** ERROR: ${label} *****`)
  console.error(error)
  if (error && error.stack) {
    console.error(error.stack)
  }
  console.error("*".repeat(label.length + 14))
}
