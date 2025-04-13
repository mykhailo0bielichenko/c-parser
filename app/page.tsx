import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase"

export const revalidate = 60 // Revalidate this page every 60 seconds

async function getDashboardStats() {
  const { data: casinos, error: casinosError } = await supabaseAdmin.from("casinos").select("id", { count: "exact" })

  const { data: parseLogsSuccess, error: parseLogsSuccessError } = await supabaseAdmin
    .from("parse_logs")
    .select("id", { count: "exact" })
    .eq("status", "success")

  const { data: parseLogsError, error: parseLogsErrorError } = await supabaseAdmin
    .from("parse_logs")
    .select("id", { count: "exact" })
    .eq("status", "error")

  const { data: recentLogs, error: recentLogsError } = await supabaseAdmin
    .from("parse_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return {
    casinosCount: casinos?.length || 0,
    parseLogsSuccessCount: parseLogsSuccess?.length || 0,
    parseLogsErrorCount: parseLogsError?.length || 0,
    recentLogs: recentLogs || [],
  }
}

export default async function Home() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Dashboard</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Overview of your casino parser system.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Casinos</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.casinosCount}</p>
            <Link href="/casinos" className="text-sm text-indigo-600 hover:text-indigo-500 mt-2 inline-block">
              View all casinos →
            </Link>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Successful Parses</h3>
            <p className="text-3xl font-bold text-green-600">{stats.parseLogsSuccessCount}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Failed Parses</h3>
            <p className="text-3xl font-bold text-red-600">{stats.parseLogsErrorCount}</p>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Parse Logs</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    URL
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Message
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.url}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {stats.recentLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No parse logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Link href="/parser" className="text-indigo-600 hover:text-indigo-500">
              Go to Parser →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
