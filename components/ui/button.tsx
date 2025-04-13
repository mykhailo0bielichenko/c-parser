import React from 'react';
import Link from 'next/link';

type ButtonProps = {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    className?: string;
    onClick?: () => void;
    fullWidth?: boolean;
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    href,
    className = '',
    onClick,
    fullWidth = false,
}: ButtonProps) {
    const baseClasses =
        'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2';

    const variantClasses = {
        primary: 'bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold',
        secondary: 'bg-purple-700 hover:bg-purple-800 text-white',
        outline: 'border border-purple-600 text-white hover:bg-purple-700',
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'py-3 text-lg',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
    } ${fullWidth ? 'w-full' : ''} ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} onClick={onClick}>
            {children}
        </button>
    );
}
