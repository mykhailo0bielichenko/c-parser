import React from 'react';
import { Button } from '../ui/button';

interface BonusCardProps {
    title: string;
    description: string;
    minDeposit?: string;
    wageringRequirements?: string;
    maxBet?: string;
    expiration?: string;
}

export function BonusCard({
    title,
    description,
    minDeposit = '200 kr',
    wageringRequirements = '35x',
    maxBet = '50 kr',
    expiration = '30 Dager',
}: BonusCardProps) {
    return (
        <div className='rounded-lg border border-purple-700 bg-indigo-950 text-white shadow-lg p-6'>
            <h3 className='text-xl font-bold mb-2'>{title}</h3>
            <p className='text-sm text-white/60 mb-4'>Tidsbegrenset tilbud</p>

            <div className='bg-gradient-to-r from-purple-800/50 to-indigo-800/50 p-4 rounded-md mb-4'>
                <p className='text-sm font-medium text-white/80'>
                    Velkomstpakke
                </p>
                <p className='text-2xl font-bold text-pink-500'>
                    {description}
                </p>
            </div>

            <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                    <span>Min. innskudd</span>
                    <span className='font-medium'>{minDeposit}</span>
                </div>
                <div className='flex justify-between'>
                    <span>Omsetningskrav</span>
                    <span className='font-medium'>{wageringRequirements}</span>
                </div>
                <div className='flex justify-between'>
                    <span>Maks. innsats</span>
                    <span className='font-medium'>{maxBet}</span>
                </div>
                <div className='flex justify-between'>
                    <span>Utløpsdato</span>
                    <span className='font-medium'>{expiration}</span>
                </div>
            </div>

            <Button variant='primary' fullWidth className='mt-4'>
                Få Bonus
            </Button>
        </div>
    );
}
