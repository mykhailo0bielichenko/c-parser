export interface ParsedCasino {
  name: string
  logo_url: string | null
  rating: number | null
  description: string | null
  description_html: string | null
  owner: string | null
  operator: string | null
  established: number | null
  estimated_revenue: string | null
  withdrawal_limits: string | null
  features: {
    positive: string[]
    negative: string[]
    interesting: string[]
  }
  payment_methods: string[]
  licenses: Array<{
    name: string
    country_code?: string
  }>
  game_types: string[]
  game_providers: string[]
  bonuses: {
    no_deposit?: {
      name: string
      name_2: string
      subtype: string
      wagering_requirements: string
      free_spins_value: string
      max_cashout: string
      max_bet: string
      bonus_expiration: string
      process_speed: string
      other_info: string
    }
    deposit?: {
      name: string
      name_2: string
      subtype: string
      min_deposit: string
      max_cashout: string
      wagering_requirements: string
      max_bet: string
      bonus_expiration: string
      process_speed: string
      free_spins: string
      free_spins_conditions: string
      other_info: string
    }
  }
}

export interface BasicCasinoInfo {
  name: string
  logo_url: string | null
  rating: number | null
  description: string | null
  owner: string | null
  operator: string | null
  established: number | null
  estimated_revenue: string | null
  withdrawal_limits: string | null
}

export interface GameInfo {
  gameTypes: string[]
  gameProviders: string[]
}
