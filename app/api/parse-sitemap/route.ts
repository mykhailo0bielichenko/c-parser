import { type NextRequest, NextResponse } from 'next/server';
import { parseSitemap } from '@/lib/parser';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { error: 'Sitemap URL is required' },
                { status: 400 }
            );
        }

        console.log(`Starting to parse sitemap: ${url}`);

        // Parse the sitemap
        const { urls, error } = await parseSitemap(url);

        if (error) {
            return NextResponse.json(
                {
                    error: `Failed to parse sitemap: ${error}`,
                },
                { status: 500 }
            );
        }

        if (!urls || urls.length === 0) {
            return NextResponse.json(
                {
                    error: 'No casino URLs found in the sitemap',
                },
                { status: 404 }
            );
        }

        // Return only the filtered casino URLs
        return NextResponse.json({
            success: true,
            message: `Found ${urls.length} casino URLs in sitemap`,
            urls,
        });
    } catch (error) {
        console.error('Error in parse-sitemap API:', error);
        return NextResponse.json(
            { error: 'Failed to parse sitemap' },
            { status: 500 }
        );
    }
}
