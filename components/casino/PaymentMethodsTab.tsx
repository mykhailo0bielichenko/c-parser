import React from 'react';

interface PaymentMethodsTabProps {
    paymentMethods: string[];
    withdrawalLimits: string | null;
}

export function PaymentMethodsTab({
    paymentMethods,
    withdrawalLimits,
}: PaymentMethodsTabProps) {
    // In a real app, we'd differentiate between deposit and withdrawal methods
    // For simplicity, we'll use the same methods for both
    return (
        <div className='rounded-lg border border-purple-700 bg-indigo-950 text-white shadow-lg'>
            <div className='p-6'>
                <h2 className='text-2xl font-bold mb-4'>Betalingsmetoder</h2>

                <div className='space-y-6'>
                    {/* Deposit Methods */}
                    <div>
                        <h3 className='font-bold mb-2'>Innskuddsmetoder</h3>
                        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
                            {paymentMethods.map((method, index) => (
                                <div
                                    key={`deposit-${index}`}
                                    className='rounded-md border border-purple-700 p-3 text-center'
                                >
                                    {method}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='w-full h-px bg-gray-300 bg-purple-700'></div>

                    {/* Withdrawal Methods */}
                    <div>
                        <h3 className='font-bold mb-2'>Uttaksmetoder</h3>
                        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
                            {paymentMethods.map((method, index) => (
                                <div
                                    key={`withdrawal-${index}`}
                                    className='rounded-md border border-purple-700 p-3 text-center'
                                >
                                    {method}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='w-full h-px bg-gray-300 bg-purple-700'></div>

                    {/* Withdrawal Limits and Times */}
                    <div className='space-y-4'>
                        <div>
                            <h3 className='font-bold mb-2'>Uttaksgrenser</h3>
                            <p>
                                {withdrawalLimits ||
                                    'Min: 200 kr | Maks: 50.000 kr per dag'}
                            </p>
                        </div>

                        <div>
                            <h3 className='font-bold mb-2'>Uttakstider</h3>
                            <ul className='space-y-2'>
                                <li>E-lommebøker: 0-24 timer</li>
                                <li>Kreditt/Debetkort: 1-3 virkedager</li>
                                <li>Bankoverføringer: 3-5 virkedager</li>
                                <li>Kryptovalutaer: 0-1 time</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
