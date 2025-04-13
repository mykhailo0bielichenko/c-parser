import { supabase } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarIcon, ArrowLeft, CreditCard, Award, Gamepad2, Globe } from "lucide-react"

export default async function CasinoDetail({ params }: { params: { id: string } }) {
  const casinoId = Number.parseInt(params.id)

  if (isNaN(casinoId)) {
    return notFound()
  }

  // Fetch casino details
  const { data: casino, error } = await supabase
    .from("casinos")
    .select(`
    *,
    casino_features(id, feature, type),
    casino_payment_methods(
      id,
      payment_methods(id, name)
    ),
    casino_licenses(
      id,
      licenses(id, name, country_code)
    ),
    casino_game_types(
      id,
      game_types(id, name)
    ),
    casino_game_providers(
      id,
      game_providers(id, name)
    ),
    bonuses(id, type, name, name_2, subtype, min_deposit, wagering_requirements, max_cashout, max_bet, bonus_expiration, process_speed, free_spins, free_spins_conditions, other_info, free_spins_value)
  `)
    .eq("id", params.id)
    .single()

  if (error || !casino) {
    console.error("Error fetching casino:", error)
    return notFound()
  }

  // Organize features by type
  const positiveFeatures = casino.casino_features.filter((feature) => feature.type === "positive")
  const negativeFeatures = casino.casino_features.filter((feature) => feature.type === "negative")
  const interestingFeatures = casino.casino_features.filter((feature) => feature.type === "interesting")

  // Organize languages by type
  const websiteLanguages = casino.casino_languages
    .filter((lang) => lang.type === "website")
    .map((lang) => lang.languages.name)
  const supportLanguages = casino.casino_languages
    .filter((lang) => lang.type === "support")
    .map((lang) => lang.languages.name)
  const livechatLanguages = casino.casino_languages
    .filter((lang) => lang.type === "livechat")
    .map((lang) => lang.languages.name)

  // Get bonuses
  const noDepositBonus = casino.bonuses?.find((bonus: any) => bonus.type === "no_deposit")
  const depositBonus = casino.bonuses?.find((bonus: any) => bonus.type === "deposit")

  return (
    <div className="container mx-auto py-10 px-4">
      <Link href="/dashboard" className="flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Card>
            <CardHeader className="pb-2">
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
              <CardTitle>{casino.name}</CardTitle>
              <CardDescription>Established {casino.established}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-xl font-bold">{casino.rating}/5</span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Owner</h3>
                  <p>{casino.owner || "Not specified"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Operator</h3>
                  <p>{casino.operator || "Not specified"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Estimated Revenue</h3>
                  <p>{casino.estimated_revenue || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3 lg:w-3/4">
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bonuses">
                <Award className="h-4 w-4 mr-2" />
                Bonuses
              </TabsTrigger>
              <TabsTrigger value="payments">
                <CreditCard className="h-4 w-4 mr-2" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="games">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Games
              </TabsTrigger>
              <TabsTrigger value="languages">
                <Globe className="h-4 w-4 mr-2" />
                Languages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{casino.description || "No description available."}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Positives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {positiveFeatures.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {positiveFeatures.map((feature, index) => (
                          <li key={index}>{feature.feature}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No positives listed</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Negatives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {negativeFeatures.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {negativeFeatures.map((feature, index) => (
                          <li key={index}>{feature.feature}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No negatives listed</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interesting Facts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {interestingFeatures.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {interestingFeatures.map((feature, index) => (
                          <li key={index}>{feature.feature}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No interesting facts listed</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Licenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {casino.casino_licenses.length > 0 ? (
                      casino.casino_licenses.map((license, index) => (
                        <Badge key={index} variant="outline">
                          {license.licenses.country_code && (
                            <span className={`flag-icon flag-icon-${license.licenses.country_code} mr-2`}></span>
                          )}
                          {license.licenses.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No licenses listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {casino.screenshots.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Screenshots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {casino.screenshots.map((screenshot, index) => (
                        <div key={index} className="aspect-video bg-muted rounded-md overflow-hidden">
                          <img
                            src={screenshot.url || "/placeholder.svg"}
                            alt={screenshot.alt_text || `${casino.name} screenshot ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                            }}
                          />
                          <div className="text-xs text-center mt-1 text-muted-foreground">
                            {screenshot.type === "mobile" ? "Mobile" : "Desktop"} View
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="bonuses">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>No Deposit Bonus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {noDepositBonus ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold">{noDepositBonus.name}</h3>
                          {noDepositBonus.name_2 && <p className="text-lg">{noDepositBonus.name_2}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {noDepositBonus.wagering_requirements && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Wagering</h4>
                              <p>{noDepositBonus.wagering_requirements}</p>
                            </div>
                          )}

                          {noDepositBonus.free_spins_value && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Free Spins Value</h4>
                              <p>{noDepositBonus.free_spins_value}</p>
                            </div>
                          )}

                          {noDepositBonus.max_cashout && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Max Cashout</h4>
                              <p>{noDepositBonus.max_cashout}</p>
                            </div>
                          )}

                          {noDepositBonus.max_bet && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Max Bet</h4>
                              <p>{noDepositBonus.max_bet}</p>
                            </div>
                          )}

                          {noDepositBonus.bonus_expiration && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Expiration</h4>
                              <p>{noDepositBonus.bonus_expiration}</p>
                            </div>
                          )}

                          {noDepositBonus.process_speed && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Process Speed</h4>
                              <p>{noDepositBonus.process_speed}</p>
                            </div>
                          )}
                        </div>

                        {noDepositBonus.other_info && (
                          <div className="text-sm text-muted-foreground">{noDepositBonus.other_info}</div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No no-deposit bonus available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Deposit Bonus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {depositBonus ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold">{depositBonus.name}</h3>
                          {depositBonus.name_2 && <p className="text-lg">{depositBonus.name_2}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {depositBonus.min_deposit && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Min Deposit</h4>
                              <p>{depositBonus.min_deposit}</p>
                            </div>
                          )}

                          {depositBonus.wagering_requirements && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Wagering</h4>
                              <p>{depositBonus.wagering_requirements}</p>
                            </div>
                          )}

                          {depositBonus.max_cashout && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Max Cashout</h4>
                              <p>{depositBonus.max_cashout}</p>
                            </div>
                          )}

                          {depositBonus.max_bet && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Max Bet</h4>
                              <p>{depositBonus.max_bet}</p>
                            </div>
                          )}

                          {depositBonus.bonus_expiration && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Expiration</h4>
                              <p>{depositBonus.bonus_expiration}</p>
                            </div>
                          )}

                          {depositBonus.process_speed && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Process Speed</h4>
                              <p>{depositBonus.process_speed}</p>
                            </div>
                          )}
                        </div>

                        {depositBonus.free_spins && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Free Spins</h4>
                            <p>{depositBonus.free_spins}</p>
                            {depositBonus.free_spins_conditions && (
                              <p className="text-sm text-muted-foreground">{depositBonus.free_spins_conditions}</p>
                            )}
                          </div>
                        )}

                        {depositBonus.other_info && (
                          <div className="text-sm text-muted-foreground">{depositBonus.other_info}</div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No deposit bonus available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  {casino.casino_payment_methods.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {casino.casino_payment_methods.map((payment, index) => (
                        <div key={index} className="border rounded-md p-4 flex flex-col items-center">
                          <div className="h-12 w-12 mb-2 flex items-center justify-center">
                            {payment.payment_methods.logo_url ? (
                              <img
                                src={payment.payment_methods.logo_url || "/placeholder.svg"}
                                alt={payment.payment_methods.name}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                                }}
                              />
                            ) : (
                              <CreditCard className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-center">{payment.payment_methods.name}</h3>
                          {payment.withdrawal_limit && (
                            <p className="text-xs text-muted-foreground text-center mt-1">
                              Limit: {payment.withdrawal_limit}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No payment methods listed</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="games">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Game Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {casino.casino_game_types.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {casino.casino_game_types.map((gameType, index) => (
                          <div key={index} className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${
                                gameType.is_available ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></div>
                            <span>{gameType.game_types.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No game types listed</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Game Providers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {casino.casino_game_providers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {casino.casino_game_providers.map((provider, index) => (
                          <Badge key={index} variant="outline">
                            {provider.game_providers.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No game providers listed</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="languages">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Website Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {websiteLanguages.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {websiteLanguages.map((lang, index) => (
                          <li key={index}>{lang}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No website languages listed</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Support Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {supportLanguages.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {supportLanguages.map((lang, index) => (
                          <li key={index}>{lang}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No support languages listed</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Live Chat Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {livechatLanguages.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {livechatLanguages.map((lang, index) => (
                          <li key={index}>{lang}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No live chat languages listed</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
