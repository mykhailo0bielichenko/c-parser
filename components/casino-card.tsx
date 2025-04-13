import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarIcon } from "lucide-react"

interface CasinoCardProps {
  casino: {
    id: number
    name: string
    logo_url: string
    rating: number
    established: number
    owner: string
    casino_features: {
      feature: string
      type: string
    }[]
  }
}

export function CasinoCard({ casino }: CasinoCardProps) {
  // Filter positive and negative features
  const positiveFeatures = casino.casino_features?.filter((feature) => feature.type === "positive") || []
  const negativeFeatures = casino.casino_features?.filter((feature) => feature.type === "negative") || []

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-bold">{casino.name}</h3>
            <p className="text-sm text-muted-foreground">Est. {casino.established}</p>
          </div>
          <div className="flex items-center bg-primary/10 px-2 py-1 rounded-md">
            <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="font-bold">{casino.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
          {casino.logo_url ? (
            <img
              src={casino.logo_url || "/placeholder.svg"}
              alt={`${casino.name} logo`}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=200&width=300"
              }}
            />
          ) : (
            <img
              src={`/placeholder.svg?height=200&width=300&text=${encodeURIComponent(casino.name)}`}
              alt={`${casino.name} placeholder`}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-semibold mb-1">Positives</h4>
            <div className="flex flex-wrap gap-1">
              {positiveFeatures.length > 0 ? (
                positiveFeatures.slice(0, 2).map((feature, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {feature.feature}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No positives listed</span>
              )}
              {positiveFeatures.length > 2 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  +{positiveFeatures.length - 2} more
                </Badge>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Negatives</h4>
            <div className="flex flex-wrap gap-1">
              {negativeFeatures.length > 0 ? (
                negativeFeatures.slice(0, 2).map((feature, index) => (
                  <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {feature.feature}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No negatives listed</span>
              )}
              {negativeFeatures.length > 2 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  +{negativeFeatures.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link
          href={`/casino/${casino.id}`}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-center text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  )
}
