import { type NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        // Get job status
        const { data: job, error: jobError } = await supabaseAdmin
            .from('parsing_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError) {
            return NextResponse.json(
                { error: 'Failed to fetch job status' },
                { status: 500 }
            );
        }

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        // Get the most recent logs for this job (limit to 50)
        const { data: logs, error: logsError } = await supabaseAdmin
            .from('parse_logs')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (logsError) {
            console.error('Error fetching parse logs:', logsError);
        }

        return NextResponse.json({
            job,
            logs: logs || [],
        });
    } catch (error) {
        console.error('Error in job status API:', error);
        return NextResponse.json(
            { error: 'Failed to check job status' },
            { status: 500 }
        );
    }
}
