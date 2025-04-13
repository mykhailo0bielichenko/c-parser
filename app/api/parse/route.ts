import { type NextRequest, NextResponse } from 'next/server';
import { CasinoParserService } from '@/lib/services/casino-parser-service';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Parse and save the casino using shared service
        const result = await CasinoParserService.parseAndSaveCasino(url);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Return the parsed data along with the casino ID
        return NextResponse.json({
            success: true,
            message: `Successfully parsed data for ${result.parsedData!.name}`,
            casinoId: result.casinoId,
            parsedData: {
                ...result.parsedData,
                // Include the cleaned HTML content
                description_html: result.parsedData!.description_html,
            },
        });
    } catch (error) {
        console.error('Error in parse API:', error);

        // Log the error with more details
        if (typeof error === 'object' && error !== null) {
            const errorMessage = (error as Error).message || 'Unknown error';
            const stack = (error as Error).stack || '';

            console.error(`Parse error details: ${errorMessage}`);
            if (stack) console.error(`Stack trace: ${stack}`);
        }

        return NextResponse.json(
            {
                error: 'Failed to parse and save casino data. Check server logs for details.',
            },
            { status: 500 }
        );
    }
}
