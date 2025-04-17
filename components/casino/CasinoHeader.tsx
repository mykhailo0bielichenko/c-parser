import React from 'react';
import { Button } from '../ui/button';

interface CasinoHeaderProps {
    name: string;
    logoUrl: string | null;
    rating: number | null;
    established: number | null;
    operator: string | null;
    promoTag?: string;
    licenses?: {
        name: string;
        country_code?: string;
    }[];
}

export function CasinoHeader({
    name,
    logoUrl,
    rating,
    established,
    operator,
    promoTag,
    licenses,
}: CasinoHeaderProps) {
    return (
        <div className='rounded-lg border border-purple-700 bg-indigo-950 text-white shadow-lg'>
            <div className='p-6 flex flex-col md:flex-row gap-6 items-center'>
                <div className='h-32 w-32 rounded-full bg-white p-2 flex items-center justify-center'>
                    <img
                        src={logoUrl || '/placeholder.svg'}
                        alt={`${name} Logo`}
                        className='rounded-full'
                        width='100'
                        height='100'
                    />
                </div>

                <div className='flex-1 text-center md:text-left'>
                    {promoTag && (
                        <div className='inline-block px-3 py-1 bg-pink-600 text-white text-xs font-medium rounded-full mb-2'>
                            {promoTag}
                        </div>
                    )}

                    <h1 className='text-3xl font-bold'>{name}</h1>

                    <div className='flex justify-center md:justify-start items-center mt-2'>
                        {rating && (
                            <div className='px-2 py-1 bg-purple-800 rounded text-white text-sm font-medium'>
                                {rating}/10
                            </div>
                        )}
                        <span className='ml-2 text-sm text-white/60'>
                            (230 anmeldelser)
                        </span>

                        {licenses && licenses.length > 0 && (
                            <div className='flex items-center ml-4'>
                                {licenses.map((license) => (
                                    <img
                                        key={license.name}
                                        src={`/flags/${license.country_code}.svg`}
                                        alt={license.name}
                                        className='h-6 w-6 rounded-full border border-white'
                                    />
                                ))}

                                <span className='ml-2 text-sm text-white/60'>
                                    {licenses
                                        .map((license) => license.name)
                                        .join(', ')}
                                </span>
                            </div>
                        )}
                    </div>

                    <p className='mt-2 text-white/60'>
                        {operator ? `Operated by ${operator} • ` : ''}
                        {`Etablert ${established || 'N/A'}`}
                    </p>
                </div>

                <div className='flex flex-col gap-2'>
                    <Button variant='primary' size='lg' fullWidth>
                        Besøk Casino
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='ml-2 h-4 w-4'
                        >
                            <path d='M15 3h6v6'></path>
                            <path d='M10 14 21 3'></path>
                            <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'></path>
                        </svg>
                    </Button>
                    <p className='text-xs text-center text-white/60'>
                        T&C gjelder. 18+ Kun.
                    </p>
                </div>
            </div>
        </div>
    );
}
