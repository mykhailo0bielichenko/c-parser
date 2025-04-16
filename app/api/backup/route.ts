import { NextResponse } from 'next/server';
import { downloadDatabaseBackup } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        // Optional: Add authentication check here

        const { backupName } = await request.json();
        const path = await downloadDatabaseBackup(
            backupName || 'api-triggered-backup'
        );

        return NextResponse.json({
            success: true,
            message: 'Backup completed successfully',
            path,
        });
    } catch (error: any) {
        console.error('Backup API error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
