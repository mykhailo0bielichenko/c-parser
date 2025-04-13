import { type NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CasinoParserService } from '@/lib/services/casino-parser-service';

export async function POST(req: NextRequest) {
    try {
        const { urls, source = 'manual' } = await req.json();

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json(
                { error: 'URLs array is required' },
                { status: 400 }
            );
        }

        // Create a new parsing job in the database
        const { data: job, error: jobError } = await supabaseAdmin
            .from('parsing_jobs')
            .insert({
                total_urls: urls.length,
                processed_urls: 0,
                successful_urls: 0,
                failed_urls: 0,
                status: 'queued',
                source,
            })
            .select()
            .single();

        if (jobError) {
            console.error('Error creating parsing job:', jobError);
            return NextResponse.json(
                { error: 'Failed to create parsing job' },
                { status: 500 }
            );
        }

        // Start the parsing process in the background without waiting for it to complete
        processUrlsInBackground(urls, job.id).catch((error) => {
            console.error(`Error in background parsing job ${job.id}:`, error);
        });

        // Return the job ID so the client can use it to check progress
        return NextResponse.json({
            success: true,
            message: `Started parsing job for ${urls.length} URLs`,
            job_id: job.id,
        });
    } catch (error) {
        console.error('Error in parse-batch API:', error);
        return NextResponse.json(
            { error: 'Failed to start parsing job' },
            { status: 500 }
        );
    }
}

// This function runs in the background and doesn't block the API response
async function processUrlsInBackground(urls: string[], jobId: number) {
    // Update job status to processing
    await supabaseAdmin
        .from('parsing_jobs')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', jobId);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];

        try {
            // Log the start of processing this URL
            await supabaseAdmin.from('parse_logs').insert({
                url,
                status: 'pending',
                message: `Starting to parse casino URL as part of job ${jobId}`,
                job_id: jobId,
            });

            // Parse and save the casino using the shared service
            const result = await CasinoParserService.parseAndSaveCasino(
                url,
                jobId
            );

            if (result.success) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            console.error(`[Job ${jobId}] Error processing ${url}:`, error);

            // Log the error (should be handled by the service, but as a safety net)
            await supabaseAdmin.from('parse_logs').insert({
                url,
                status: 'error',
                message: `Error: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                job_id: jobId,
            });

            failCount++;
        }

        // Update job progress
        await supabaseAdmin
            .from('parsing_jobs')
            .update({
                processed_urls: i + 1,
                successful_urls: successCount,
                failed_urls: failCount,
            })
            .eq('id', jobId);
    }

    // Mark job as completed
    await supabaseAdmin
        .from('parsing_jobs')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

    console.log(
        `[Job ${jobId}] Completed. Success: ${successCount}, Failed: ${failCount}`
    );
}
