import React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface SimilarCasino {
    id: number;
    name: string;
    logoUrl: string;
    rating: number;
}

interface SimilarCasinosProps {
    casinos: SimilarCasino[];
}

export function SimilarCasinos({ casinos }: SimilarCasinosProps) {
    return (
        <div className='rounded-lg border border-purple-700 bg-indigo-950 text-white shadow-lg p-6'>
            <h3 className='text-xl font-bold mb-4'>Lignende Casinoer</h3>

            <div className='space-y-4'>
                {casinos.map((casino) => (
                    <div key={casino.id} className='flex items-center gap-4'>
                        <div className='h-12 w-12 rounded-full bg-white p-1 flex items-center justify-center'>
                            <img
                                alt={`${casino.name}`}
                                src={casino.logoUrl}
                                className='rounded-full'
                                width='40'
                                height='40'
                            />
                        </div>

                        <div className='flex-1'>
                            <h4 className='font-medium'>{casino.name}</h4>
                            <div className='px-2 py-0.5 bg-purple-800 rounded text-white text-xs font-medium inline-block'>
                                {casino.rating}/10
                            </div>
                        </div>

                        <Button variant='outline' size='sm' fullWidth>
                            <Link href={`/casino/${casino.id}`}>Se</Link>
                        </Button>
                    </div>
                ))}
            </div>

            <Button variant='outline' fullWidth className='mt-4'>
                <Link href='/'>Se flere</Link>
            </Button>
        </div>
    );
}
