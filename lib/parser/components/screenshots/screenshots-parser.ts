import { JSDOM } from 'jsdom';

export interface Screenshot {
    url: string;
    alt_text: string;
}

export class ScreenshotsParser {
    private dom: JSDOM;
    private document: Document;

    constructor(html: string) {
        console.log('[ScreenshotsParser] Initializing with section HTML');
        // Wrap the HTML in a div if it's not a complete HTML document
        if (!html.includes('<html') && !html.includes('<body')) {
            html = `<div>${html}</div>`;
        }
        this.dom = new JSDOM(html);
        this.document = this.dom.window.document;
    }

    parseScreenshots(): Screenshot[] {
        console.log('[ScreenshotsParser] Starting to parse screenshots');
        const screenshots: Screenshot[] = [];

        // Now search directly for screenshots since we're already in the screenshots section
        const screenshotElements = this.document.querySelectorAll(
            '.gallery-image-figure img, .casino-detail-box-screenshots img'
        );
        console.log(
            `[ScreenshotsParser] Found ${screenshotElements.length} screenshot elements`
        );

        screenshotElements.forEach((img) => {
            const url = img.getAttribute('data-src') || img.getAttribute('src');
            const altText = img.getAttribute('alt') || '';
            if (url) {
                screenshots.push({
                    url,
                    alt_text: altText,
                });
            }
        });

        return screenshots;
    }
}
