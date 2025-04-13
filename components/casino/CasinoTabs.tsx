'use client';

import React, { useState } from 'react';
import { TabNavigation } from './TabNavigation';
import { PaymentMethodsTab } from './PaymentMethodsTab';

interface CasinoTabsProps {
    paymentMethods: string[];
    withdrawalLimits: string | null;
    features: {
        positive: string[];
        negative: string[];
        interesting: string[];
    };
    bonuses: any[];
    gameTypes: string[];
    gameProviders: string[];
    screenshots: {
        id: number;
        url: string;
        alt_text: string | null;
    }[];
    languages: {
        id: number;
        type: 'website' | 'support' | 'livechat';
        languages: {
            id: number;
            name: string;
            country_code: string | null;
        };
    }[];
    description: string | null;
}

export function CasinoTabs({
    paymentMethods,
    withdrawalLimits,
    features,
    bonuses,
    gameTypes,
    gameProviders,
    screenshots,
    languages,
    description,
}: CasinoTabsProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(
        null
    );

    const tabs = [
        { id: 'overview', label: 'Oversikt' },
        { id: 'bonuses', label: 'Bonuser' },
        { id: 'games', label: 'Spill' },
        { id: 'payments', label: 'Betalinger' },
        { id: 'screenshots', label: 'Bilder' },
    ];

    // Group languages by type
    const websiteLanguages =
        languages
            ?.filter((l) => l.type === 'website')
            .map((l) => l.languages) || [];
    const supportLanguages =
        languages
            ?.filter((l) => l.type === 'support')
            .map((l) => l.languages) || [];
    const livechatLanguages =
        languages
            ?.filter((l) => l.type === 'livechat')
            .map((l) => l.languages) || [];

    return (
        <div className='mt-6'>
            <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Screenshot Modal */}
            {selectedScreenshot && (
                <div
                    className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'
                    onClick={() => setSelectedScreenshot(null)}
                >
                    <div className='relative max-w-4xl max-h-[90vh] overflow-hidden'>
                        <img
                            src={selectedScreenshot}
                            alt='Casino screenshot'
                            className='max-w-full max-h-full object-contain'
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedScreenshot(null);
                            }}
                            className='absolute top-2 right-2 bg-purple-700 text-white rounded-full w-8 h-8 flex items-center justify-center'
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className='mt-6'>
                {activeTab === 'overview' && (
                    <div className='rounded-lg border border-purple-700 bg-gradient-to-br from-indigo-950 to-purple-950 text-white shadow-lg'>
                        <div className='p-6'>
                            <div className='flex flex-col md:flex-row gap-6'>
                                <div className='flex-1'>
                                    <h2 className='text-2xl font-bold mb-4 flex items-center'>
                                        <span className='mr-2'>📋</span>{' '}
                                        Oversikt
                                    </h2>

                                    {description && (
                                        <div className='mb-6 bg-purple-900/30 p-4 rounded-lg'>
                                            <p className='italic text-white/90'>
                                                {description}
                                            </p>
                                        </div>
                                    )}

                                    <div className='space-y-6'>
                                        {features.positive.length > 0 && (
                                            <div className='bg-gradient-to-r from-green-900/30 to-green-900/10 p-4 rounded-lg'>
                                                <h3 className='font-bold mb-2 flex items-center'>
                                                    <span className='mr-2 text-green-400'>
                                                        ✓
                                                    </span>{' '}
                                                    Fordeler
                                                </h3>
                                                <ul className='space-y-2 list-disc pl-6'>
                                                    {features.positive.map(
                                                        (feature, index) => (
                                                            <li
                                                                key={index}
                                                                className='text-white/90'
                                                            >
                                                                {feature}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {features.negative.length > 0 && (
                                            <div className='bg-gradient-to-r from-red-900/30 to-red-900/10 p-4 rounded-lg'>
                                                <h3 className='font-bold mb-2 flex items-center'>
                                                    <span className='mr-2 text-red-400'>
                                                        ✗
                                                    </span>{' '}
                                                    Ulemper
                                                </h3>
                                                <ul className='space-y-2 list-disc pl-6'>
                                                    {features.negative.map(
                                                        (feature, index) => (
                                                            <li
                                                                key={index}
                                                                className='text-white/90'
                                                            >
                                                                {feature}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {features.interesting.length > 0 && (
                                            <div className='bg-gradient-to-r from-blue-900/30 to-blue-900/10 p-4 rounded-lg'>
                                                <h3 className='font-bold mb-2 flex items-center'>
                                                    <span className='mr-2 text-blue-400'>
                                                        ℹ️
                                                    </span>{' '}
                                                    Interessante fakta
                                                </h3>
                                                <ul className='space-y-2 list-disc pl-6'>
                                                    {features.interesting.map(
                                                        (feature, index) => (
                                                            <li
                                                                key={index}
                                                                className='text-white/90'
                                                            >
                                                                {feature}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Language Section */}
                                {(websiteLanguages.length > 0 ||
                                    supportLanguages.length > 0 ||
                                    livechatLanguages.length > 0) && (
                                    <div className='md:w-1/3 bg-purple-900/20 p-4 rounded-lg'>
                                        <h3 className='font-bold mb-4 text-xl flex items-center'>
                                            <span className='mr-2'>🌐</span>{' '}
                                            Språkvalg
                                        </h3>

                                        {websiteLanguages.length > 0 && (
                                            <div className='mb-4'>
                                                <h4 className='text-md font-medium text-purple-300 mb-2'>
                                                    Nettsidespråk
                                                </h4>
                                                <div className='flex flex-wrap gap-2'>
                                                    {websiteLanguages.map(
                                                        (lang) => (
                                                            <div
                                                                key={lang.id}
                                                                className='px-2 py-1 bg-purple-800/50 rounded-full flex items-center'
                                                            >
                                                                {lang.country_code && (
                                                                    <span
                                                                        className={`mr-2 flag-icon flag-icon-${lang.country_code.toLowerCase()}`}
                                                                    ></span>
                                                                )}
                                                                <span className='text-sm'>
                                                                    {lang.name}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {supportLanguages.length > 0 && (
                                            <div className='mb-4'>
                                                <h4 className='text-md font-medium text-purple-300 mb-2'>
                                                    Støttespråk
                                                </h4>
                                                <div className='flex flex-wrap gap-2'>
                                                    {supportLanguages.map(
                                                        (lang) => (
                                                            <div
                                                                key={lang.id}
                                                                className='px-2 py-1 bg-purple-800/50 rounded-full flex items-center'
                                                            >
                                                                {lang.country_code && (
                                                                    <span
                                                                        className={`mr-2 flag-icon flag-icon-${lang.country_code.toLowerCase()}`}
                                                                    ></span>
                                                                )}
                                                                <span className='text-sm'>
                                                                    {lang.name}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {livechatLanguages.length > 0 && (
                                            <div>
                                                <h4 className='text-md font-medium text-purple-300 mb-2'>
                                                    Live Chat-språk
                                                </h4>
                                                <div className='flex flex-wrap gap-2'>
                                                    {livechatLanguages.map(
                                                        (lang) => (
                                                            <div
                                                                key={lang.id}
                                                                className='px-2 py-1 bg-purple-800/50 rounded-full flex items-center'
                                                            >
                                                                {lang.country_code && (
                                                                    <span
                                                                        className={`mr-2 flag-icon flag-icon-${lang.country_code.toLowerCase()}`}
                                                                    ></span>
                                                                )}
                                                                <span className='text-sm'>
                                                                    {lang.name}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Preview Screenshots */}
                            {screenshots.length > 0 && (
                                <div className='mt-6'>
                                    <h3 className='text-xl font-bold mb-3 flex items-center'>
                                        <span className='mr-2'>📸</span> Bilder
                                    </h3>
                                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                                        {screenshots
                                            .slice(0, 4)
                                            .map((screenshot) => (
                                                <div
                                                    key={screenshot.id}
                                                    className='h-32 rounded-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105 border border-purple-500'
                                                    onClick={() =>
                                                        setSelectedScreenshot(
                                                            screenshot.url
                                                        )
                                                    }
                                                >
                                                    <img
                                                        src={screenshot.url}
                                                        alt={
                                                            screenshot.alt_text ||
                                                            'Casino screenshot'
                                                        }
                                                        className='w-full h-full object-cover'
                                                    />
                                                </div>
                                            ))}
                                        {screenshots.length > 4 && (
                                            <button
                                                className='h-32 rounded-lg border border-purple-500 flex items-center justify-center text-purple-300 hover:bg-purple-800/30 transition-colors'
                                                onClick={() =>
                                                    setActiveTab('screenshots')
                                                }
                                            >
                                                +{screenshots.length - 4} flere
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'bonuses' && (
                    <div className='rounded-lg border border-purple-700 bg-gradient-to-br from-indigo-950 to-purple-950 text-white shadow-lg'>
                        <div className='p-6'>
                            <h2 className='text-2xl font-bold mb-4 flex items-center'>
                                <span className='mr-2'>🎁</span> Bonuser
                            </h2>

                            <div className='space-y-6'>
                                {bonuses.length > 0 ? (
                                    bonuses.map((bonus, index) => (
                                        <div
                                            key={index}
                                            className='border border-purple-500 rounded-lg p-4 bg-gradient-to-r from-purple-900/40 to-purple-800/20 hover:from-purple-800/40 hover:to-purple-700/20 transition-all'
                                        >
                                            <h3 className='font-bold text-xl mb-2 text-pink-400'>
                                                {bonus.name}
                                            </h3>

                                            {bonus.type && (
                                                <div className='mb-3'>
                                                    <span className='inline-block px-2 py-1 bg-pink-700/50 rounded-full text-xs font-medium'>
                                                        {bonus.type}
                                                    </span>
                                                    {bonus.subtype && (
                                                        <span className='ml-2 inline-block px-2 py-1 bg-blue-700/50 rounded-full text-xs font-medium'>
                                                            {bonus.subtype}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                                {bonus.min_deposit && (
                                                    <div className='bg-purple-900/30 p-2 rounded flex justify-between'>
                                                        <span className='text-purple-300'>
                                                            Min. innskudd:
                                                        </span>
                                                        <span className='font-medium'>
                                                            {bonus.min_deposit}
                                                        </span>
                                                    </div>
                                                )}
                                                {bonus.wagering_requirements && (
                                                    <div className='bg-purple-900/30 p-2 rounded flex justify-between'>
                                                        <span className='text-purple-300'>
                                                            Omsetningskrav:
                                                        </span>
                                                        <span className='font-medium'>
                                                            {
                                                                bonus.wagering_requirements
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {bonus.max_bet && (
                                                    <div className='bg-purple-900/30 p-2 rounded flex justify-between'>
                                                        <span className='text-purple-300'>
                                                            Maks innsats:
                                                        </span>
                                                        <span className='font-medium'>
                                                            {bonus.max_bet}
                                                        </span>
                                                    </div>
                                                )}
                                                {bonus.max_cashout && (
                                                    <div className='bg-purple-900/30 p-2 rounded flex justify-between'>
                                                        <span className='text-purple-300'>
                                                            Maks utbetaling:
                                                        </span>
                                                        <span className='font-medium'>
                                                            {bonus.max_cashout}
                                                        </span>
                                                    </div>
                                                )}
                                                {bonus.free_spins_value && (
                                                    <div className='bg-purple-900/30 p-2 rounded flex justify-between'>
                                                        <span className='text-purple-300'>
                                                            Freespins verdi:
                                                        </span>
                                                        <span className='font-medium'>
                                                            {
                                                                bonus.free_spins_value
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {bonus.process_speed && (
                                                    <div className='bg-purple-900/30 p-2 rounded flex justify-between'>
                                                        <span className='text-purple-300'>
                                                            Prosesshastighet:
                                                        </span>
                                                        <span className='font-medium'>
                                                            {
                                                                bonus.process_speed
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {bonus.free_spins_conditions && (
                                                <div className='mt-3 p-3 bg-blue-900/20 rounded-lg'>
                                                    <span className='font-medium text-blue-300'>
                                                        Freespins vilkår:
                                                    </span>
                                                    <p className='mt-1'>
                                                        {
                                                            bonus.free_spins_conditions
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {bonus.other_info && (
                                                <div className='mt-3 p-3 bg-purple-900/20 rounded-lg'>
                                                    <span className='font-medium text-purple-300'>
                                                        Annen informasjon:
                                                    </span>
                                                    <p className='mt-1'>
                                                        {bonus.other_info}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className='text-center p-10 bg-purple-900/20 rounded-lg'>
                                        <span className='text-5xl block mb-3'>
                                            🎲
                                        </span>
                                        <p>
                                            Ingen bonuser er tilgjengelige for
                                            dette kasinoet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'games' && (
                    <div className='rounded-lg border border-purple-700 bg-gradient-to-br from-indigo-950 to-purple-950 text-white shadow-lg'>
                        <div className='p-6'>
                            <h2 className='text-2xl font-bold mb-6 flex items-center'>
                                <span className='mr-2'>🎮</span> Spill
                            </h2>

                            <div className='space-y-6'>
                                <div className='bg-purple-900/20 p-5 rounded-lg'>
                                    <h3 className='font-bold mb-4 flex items-center text-lg'>
                                        <span className='mr-2'>🎲</span>
                                        Spilltyper
                                    </h3>
                                    <div className='flex flex-wrap gap-3'>
                                        {gameTypes.length > 0 ? (
                                            gameTypes.map((type, index) => (
                                                <span
                                                    key={index}
                                                    className='px-3 py-2 bg-gradient-to-r from-purple-600/50 to-purple-700/30 rounded-full text-sm border border-purple-500/50 hover:shadow-glow hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5'
                                                >
                                                    {type}
                                                </span>
                                            ))
                                        ) : (
                                            <p>Ingen spilltyper oppgitt</p>
                                        )}
                                    </div>
                                </div>

                                <div className='bg-indigo-900/20 p-5 rounded-lg'>
                                    <h3 className='font-bold mb-4 flex items-center text-lg'>
                                        <span className='mr-2'>🏢</span>
                                        Spillutviklere
                                    </h3>
                                    <div className='flex flex-wrap gap-3'>
                                        {gameProviders.length > 0 ? (
                                            gameProviders.map(
                                                (provider, index) => (
                                                    <span
                                                        key={index}
                                                        className='px-3 py-2 bg-gradient-to-r from-indigo-600/50 to-indigo-700/30 rounded-full text-sm border border-indigo-500/50 hover:shadow-glow hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5'
                                                    >
                                                        {provider}
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <p>Ingen spillutviklere oppgitt</p>
                                        )}
                                    </div>
                                </div>

                                <div className='bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-5 rounded-lg border border-purple-600/30'>
                                    <div className='text-center space-y-3'>
                                        <div className='flex justify-center space-x-4'>
                                            <span className='text-3xl'>🎰</span>
                                            <span className='text-3xl'>🎯</span>
                                            <span className='text-3xl'>🃏</span>
                                        </div>
                                        <p className='text-lg text-purple-300'>
                                            Dette kasinoet tilbyr{' '}
                                            {gameTypes.length} spilltyper fra{' '}
                                            {gameProviders.length} forskjellige
                                            spillutviklere
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <PaymentMethodsTab
                        paymentMethods={paymentMethods}
                        withdrawalLimits={withdrawalLimits}
                    />
                )}

                {activeTab === 'screenshots' && screenshots.length > 0 && (
                    <div className='rounded-lg border border-purple-700 bg-gradient-to-br from-indigo-950 to-purple-950 text-white shadow-lg'>
                        <div className='p-6'>
                            <h2 className='text-2xl font-bold mb-4 flex items-center'>
                                <span className='mr-2'>📷</span> Kasinobilder
                            </h2>
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                                {screenshots.map((screenshot) => (
                                    <div
                                        key={screenshot.id}
                                        className='aspect-video rounded-lg overflow-hidden border border-purple-500 cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg relative group'
                                        onClick={() =>
                                            setSelectedScreenshot(
                                                screenshot.url
                                            )
                                        }
                                    >
                                        <img
                                            src={screenshot.url}
                                            alt={
                                                screenshot.alt_text ||
                                                'Casino screenshot'
                                            }
                                            className='w-full h-full object-cover'
                                        />
                                        {screenshot.alt_text && (
                                            <div className='absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end'>
                                                <p className='p-3 text-sm text-white'>
                                                    {screenshot.alt_text}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
