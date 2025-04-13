import React from 'react';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { CasinoHeader } from '@/components/casino/CasinoHeader';
import { CasinoTabs } from '@/components/casino/CasinoTabs';
import { BonusCard } from '@/components/casino/BonusCard';
import { SimilarCasinos } from '@/components/casino/SimilarCasinos';

// Define the type for the page props
type Props = {
    params: { id: string };
};

// Define proper interfaces for the casino data
interface License {
    name: string;
    country_code?: string;
}

interface GameType {
    id: number;
    name: string;
}

interface GameProvider {
    id: number;
    name: string;
}

interface PaymentMethod {
    id: number;
    name: string;
}

interface Bonus {
    id: number;
    name: string;
    type: string;
    subtype: string | null;
    max_cashout: string | null;
    min_deposit: string | null;
    wagering_requirements: string | null;
    max_bet: string | null;
    process_speed: string | null;
    free_spins_value: string | null;
    free_spins_conditions: string | null;
    other_info: string | null;
}

interface Screenshot {
    id: number;
    url: string;
    alt_text: string | null;
}

interface CasinoFeature {
    id: number;
    casino_id: number;
    feature: string;
    type: 'positive' | 'negative' | 'interesting';
}

interface CasinoPaymentMethod {
    id: number;
    payment_methods: PaymentMethod;
}

interface CasinoLicense {
    id: number;
    licenses: {
        id: number;
        name: string;
        country_code: string | null;
    };
}

interface CasinoGameType {
    id: number;
    game_types: GameType;
}

interface CasinoGameProvider {
    id: number;
    game_providers: GameProvider;
}

interface Language {
    id: number;
    name: string;
    country_code: string | null;
}

interface CasinoLanguage {
    id: number;
    type: 'website' | 'support' | 'livechat';
    languages: Language;
}

interface Casino {
    id: number;
    name: string;
    logo_url: string | null;
    rating: number | null;
    owner: string | null;
    operator: string | null;
    established: number | null;
    estimated_revenue: string | null;
    withdrawal_limits: string | null;
    description: string | null;
    casino_features: CasinoFeature[];
    casino_payment_methods: CasinoPaymentMethod[];
    casino_licenses: CasinoLicense[];
    casino_game_types: CasinoGameType[];
    casino_game_providers: CasinoGameProvider[];
    bonuses: Bonus[];
    screenshots: Screenshot[];
}

interface CasinoDetails {
    casino: Casino;
    features: {
        positive: string[];
        negative: string[];
        interesting: string[];
    };
    paymentMethods: string[];
    licenses: License[];
    gameTypes: string[];
    gameProviders: string[];
    bonuses: Bonus[];
    screenshots: Screenshot[];
    languages: CasinoLanguage[];
}

async function getCasinoDetails(id: string): Promise<CasinoDetails> {
    const casinoId = Number(id);

    // Validate the id
    if (isNaN(casinoId)) {
        return notFound();
    }

    // Query data with the numeric ID
    const { data: casino, error } = await supabaseAdmin
        .from('casinos')
        .select(
            `
      *,
      casino_features(*),
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
      bonuses(id, name, type, subtype, max_cashout, min_deposit, wagering_requirements, max_bet, process_speed, free_spins_value, free_spins_conditions, other_info),
      screenshots(id, url, alt_text)
    `
        )
        .eq('id', casinoId)
        .single();

    // Handle errors and not found cases
    if (error || !casino) {
        console.error('Error fetching casino:', error);
        return notFound();
    }

    // Fetch languages with join to get the names
    const { data: languagesData } = await supabaseAdmin
        .from('casino_languages')
        .select(
            `
            id,
            type,
            languages:language_id(id, name, country_code)
        `
        )
        .eq('casino_id', casinoId);

    // Convert the data to match our interfaces
    const languages: CasinoLanguage[] = languagesData
        ? languagesData.map((item) => {
              // Check if languages is an array and extract the first item if so
              const languageData = Array.isArray(item.languages)
                  ? item.languages[0]
                  : item.languages;

              return {
                  id: item.id,
                  type: item.type as 'website' | 'support' | 'livechat',
                  languages: {
                      id: languageData.id,
                      name: languageData.name,
                      country_code: languageData.country_code,
                  },
              };
          })
        : [];

    // Group features by type
    const features = {
        positive: casino.casino_features
            .filter((f: CasinoFeature) => f.type === 'positive')
            .map((f: CasinoFeature) => f.feature),
        negative: casino.casino_features
            .filter((f: CasinoFeature) => f.type === 'negative')
            .map((f: CasinoFeature) => f.feature),
        interesting: casino.casino_features
            .filter((f: CasinoFeature) => f.type === 'interesting')
            .map((f: CasinoFeature) => f.feature),
    };

    // Extract payment methods
    const paymentMethods = casino.casino_payment_methods.map(
        (pm: CasinoPaymentMethod) => pm.payment_methods.name
    );

    // Extract licenses with country codes
    const licenses = casino.casino_licenses.map((l: CasinoLicense) => ({
        name: l.licenses.name,
        country_code: l.licenses.country_code || undefined,
    }));

    // Extract game types
    const gameTypes = casino.casino_game_types.map(
        (gt: CasinoGameType) => gt.game_types.name
    );

    // Extract game providers
    const gameProviders = casino.casino_game_providers.map(
        (gp: CasinoGameProvider) => gp.game_providers.name
    );

    // Extract bonuses
    const bonuses = casino.bonuses.map((b: Bonus) => ({
        id: b.id,
        name: b.name,
        type: b.type,
        subtype: b.subtype,
        max_cashout: b.max_cashout,
        min_deposit: b.min_deposit,
        wagering_requirements: b.wagering_requirements,
        max_bet: b.max_bet,
        process_speed: b.process_speed,
        free_spins_value: b.free_spins_value,
        free_spins_conditions: b.free_spins_conditions,
        other_info: b.other_info,
    }));

    // Extract screenshots
    const screenshots = casino.screenshots || [];

    return {
        casino,
        features,
        paymentMethods,
        licenses,
        gameTypes,
        gameProviders,
        bonuses,
        screenshots,
        languages,
    };
}

export default async function CasinoPage({ params }: Props) {
    const {
        casino,
        features,
        paymentMethods,
        licenses,
        gameTypes,
        gameProviders,
        bonuses,
        screenshots,
        languages,
    } = await getCasinoDetails(params.id);

    // Sample similar casinos data - in a real app you'd fetch related casinos
    const similarCasinos = [
        {
            id: 1,
            name: 'LuckyWins Casino',
            logoUrl: '/placeholder.svg',
            rating: 8.8,
        },
        {
            id: 2,
            name: 'Rocket Riches Casino',
            logoUrl: '/placeholder.svg',
            rating: 8.6,
        },
        {
            id: 3,
            name: 'Ice Casino',
            logoUrl: '/placeholder.svg',
            rating: 8.8,
        },
    ];

    // Find first welcome bonus if available
    const welcomeBonus = bonuses.find(
        (bonus) =>
            bonus.type.toLowerCase().includes('welcome') ||
            bonus.type.toLowerCase().includes('deposit')
    );

    return (
        <div className='p-4 max-w-7xl mx-auto bg-indigo-950/20 min-h-screen'>
            <div className='grid gap-6 lg:grid-cols-3'>
                {/* Main content - 2/3 width on desktop */}
                <div className='lg:col-span-2'>
                    <CasinoHeader
                        name={casino.name}
                        logoUrl={casino.logo_url}
                        rating={casino.rating}
                        established={casino.established}
                        operator={casino.operator}
                        promoTag='Nytt cashback tilbud!'
                    />

                    <CasinoTabs
                        paymentMethods={paymentMethods}
                        withdrawalLimits={casino.withdrawal_limits}
                        features={features}
                        bonuses={bonuses}
                        gameTypes={gameTypes}
                        gameProviders={gameProviders}
                        screenshots={screenshots}
                        languages={languages}
                        description={casino.description}
                    />
                </div>

                {/* Sidebar - 1/3 width on desktop */}
                <div className='space-y-6'>
                    <BonusCard
                        title='Eksklusiv Bonus'
                        description={
                            welcomeBonus
                                ? `${welcomeBonus.name}`
                                : '100% opptil 5.000 kr + 300 freespins'
                        }
                        minDeposit={welcomeBonus?.min_deposit || '200 kr'}
                        wageringRequirements={
                            welcomeBonus?.wagering_requirements || '35x'
                        }
                        maxBet={welcomeBonus?.max_bet || '50 kr'}
                    />

                    <SimilarCasinos casinos={similarCasinos} />
                </div>
            </div>
        </div>
    );
}
