'use client';

import React, { useState } from 'react';

type Tab = {
    id: string;
    label: string;
};

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export function TabNavigation({
    tabs,
    activeTab,
    onTabChange,
}: TabNavigationProps) {
    return (
        <div className='flex grid w-full grid-cols-4 bg-purple-800/50 p-1'>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`data-[state=active]:bg-purple-700 text-white ${
                        activeTab === tab.id ? 'active bg-purple-700' : ''
                    }`}
                    data-state={activeTab === tab.id ? 'active' : 'inactive'}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
