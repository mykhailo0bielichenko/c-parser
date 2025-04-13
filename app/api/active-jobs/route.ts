import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        // Get active jobs (queued or processing)
        const { data: activeJobs, error } = await supabaseAdmin
            .from('parsing_jobs')
            .select('*')
            .in('status', ['queued', 'processing'])
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch active jobs' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            activeJobs: activeJobs || [],
        });
    } catch (error) {
        console.error('Error in active-jobs API:', error);
        return NextResponse.json(
            { error: 'Failed to check active jobs' },
            { status: 500 }
        );
    }
}
