'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/' },
        { name: 'Casinos', href: '/casinos' },
        { name: 'Parser', href: '/parser' },
    ];

    return (
        <nav className='bg-white shadow-sm'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between h-16'>
                    <div className='flex'>
                        <div className='flex-shrink-0 flex items-center'>
                            <h1 className='text-xl font-bold text-gray-900'>
                                Casino Site Parser
                            </h1>
                        </div>
                        <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                            {navItems.map((item) => {
                                const isActive =
                                    item.href === '/'
                                        ? pathname === '/'
                                        : pathname.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`${
                                            isActive
                                                ? 'border-indigo-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
