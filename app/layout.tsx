import type React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navigation from '../components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Casino Site Parser',
    description: 'Parse and analyze casino websites',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang='en'>
            <body className={inter.className}>
                <div className='min-h-screen bg-gray-100'>
                    <Navigation />
                    <main className='py-10'>
                        <div className='max-w-7xl mx-auto sm:px-6 lg:px-8'>
                            {children}
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}
