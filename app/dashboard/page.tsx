import { supabase } from "@/lib/supabase/server"
import { CasinoCard } from "@/components/casino-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Dashboard() {
  // Fetch casinos with their ratings
  const { data: casinos, error } = await supabase
    .from("casinos")
    .select(`
      id, 
      name, 
      logo_url, 
      rating, 
      established, 
      owner,
      casino_features (
        feature,
        type
      )
    `)
    .order("rating", { ascending: false })

  if (error) {
    console.error("Error fetching casinos:", error)
  }

  // Fetch parse logs
  const { data: parseLogs } = await supabase
    .from("parse_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Casino Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Casinos</CardTitle>
            <CardDescription>Number of casinos in database</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{casinos?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Average Rating</CardTitle>
            <CardDescription>Average casino rating</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {casinos?.length
                ? (casinos.reduce((sum, casino) => sum + Number(casino.rating), 0) / casinos.length).toFixed(1)
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Latest Parse</CardTitle>
            <CardDescription>Most recent parsing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {parseLogs && parseLogs.length > 0
                ? new Date(parseLogs[0].created_at).toLocaleDateString()
                : "No parse logs"}
            </p>
            <p className="text-sm text-muted-foreground">
              {parseLogs && parseLogs.length > 0 ? parseLogs[0].status : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Casinos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {casinos?.map((casino) => (
          <CasinoCard key={casino.id} casino={casino} />
        ))}
      </div>
    </div>
  )
}
