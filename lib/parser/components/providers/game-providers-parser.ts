import { JSDOM } from 'jsdom';

export interface GameProvider {
    name: string;
    logo_url: string | null;
}

export class GameProvidersParser {
    private dom: JSDOM;
    private document: Document;

    constructor(html: string) {
        console.log('[GameProvidersParser] Initializing with section HTML');
        // Wrap the HTML in a div if it's not a complete HTML document
        if (!html.includes('<html') && !html.includes('<body')) {
            html = `<div>${html}</div>`;
        }
        this.dom = new JSDOM(html);
        this.document = this.dom.window.document;
    }

    parseGameProviders(): GameProvider[] {
        console.log('[GameProvidersParser] Starting to parse game providers');
        const providers: GameProvider[] = [];

        // Now search directly for provider items since we're already in the correct section
        const providerItems = this.document.querySelectorAll(
            '.casino-detail-logos-item'
        );
        console.log(
            `[GameProvidersParser] Found ${providerItems.length} provider items`
        );

        // Process each provider
        providerItems.forEach((item: Element) => {
            const imgElement = item.querySelector('img');
            if (!imgElement) return;

            const name = imgElement.getAttribute('alt') || '';
            const logoUrl = imgElement.getAttribute('data-src') || null;

            if (name) {
                console.log(`[GameProvidersParser] Found provider: ${name}`);
                providers.push({
                    name,
                    logo_url: logoUrl,
                });
            }
        });

        console.log(
            `[GameProvidersParser] Parsed ${providers.length} game providers`
        );
        return providers;
    }
}
