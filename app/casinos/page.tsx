import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 60; // Revalidate this page every 60 seconds

async function getCasinos() {
    const { data, error } = await supabaseAdmin
        .from('casinos')
        .select(
            `
      *,
      casino_features(id, feature, type),
      casino_licenses(
        licenses(id, name, country_code)
      ),
      casino_payment_methods(
        payment_methods(id, name, logo_url)
      ),
      bonuses(id, type, name)
    `
        )
        .order('name');

    if (error) {
        console.error('Error fetching casinos:', error);
        return [];
    }

    return data || [];
}

export default async function CasinosPage() {
    const casinos = await getCasinos();

    return (
        <div className='space-y-6'>
            <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
                <div className='px-4 py-5 sm:px-6 flex justify-between items-center'>
                    <div>
                        <h2 className='text-lg leading-6 font-medium text-gray-900'>
                            Casinos
                        </h2>
                        <p className='mt-1 max-w-2xl text-sm text-gray-500'>
                            A list of all the casinos in your database.
                        </p>
                    </div>
                    <Link
                        href='/parser'
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    >
                        Parse New Casino
                    </Link>
                </div>

                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                        <thead className='bg-gray-50'>
                            <tr>
                                <th
                                    scope='col'
                                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                >
                                    Name
                                </th>
                                <th
                                    scope='col'
                                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                >
                                    Rating
                                </th>
                                <th
                                    scope='col'
                                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                >
                                    Established
                                </th>
                                <th
                                    scope='col'
                                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                >
                                    Licenses
                                </th>
                                <th
                                    scope='col'
                                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                >
                                    Bonuses
                                </th>
                                <th
                                    scope='col'
                                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                            {casinos.map((casino) => (
                                <tr key={casino.id}>
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <div className='flex items-center'>
                                            {casino.logo_url && (
                                                <img
                                                    src={
                                                        casino.logo_url ||
                                                        '/placeholder.svg'
                                                    }
                                                    alt={`${casino.name} logo`}
                                                    className='h-10 w-10 object-contain mr-3'
                                                />
                                            )}
                                            <div>
                                                <div className='text-sm font-medium text-gray-900'>
                                                    {casino.name}
                                                </div>
                                                <div className='text-sm text-gray-500'>
                                                    {casino.operator}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        {casino.rating && (
                                            <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                                                {casino.rating}/5
                                            </span>
                                        )}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                        {casino.established || 'Unknown'}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                        {casino.casino_licenses
                                            ?.map(
                                                (license) =>
                                                    license.licenses?.name
                                            )
                                            .join(', ') || 'None'}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                        {casino.bonuses?.length || 0}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                        <Link
                                            href={`/casinos/${casino.id}`}
                                            className='text-indigo-600 hover:text-indigo-900 mr-4'
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/casinos/${casino.id}/edit`}
                                            className='text-indigo-600 hover:text-indigo-900'
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {casinos.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'
                                    >
                                        No casinos found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
