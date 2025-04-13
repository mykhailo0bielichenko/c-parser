import { JSDOM } from 'jsdom';

export interface PaymentMethod {
    name: string;
    logo_url: string | null;
}

export class PaymentMethodsParser {
    private dom: JSDOM;
    private document: Document;

    constructor(html: string) {
        console.log('[PaymentMethodsParser] Initializing with section HTML');
        // Wrap the HTML in a div if it's not a complete HTML document
        if (!html.includes('<html') && !html.includes('<body')) {
            html = `<div>${html}</div>`;
        }
        this.dom = new JSDOM(html);
        this.document = this.dom.window.document;
    }

    parsePaymentMethods(): PaymentMethod[] {
        console.log('[PaymentMethodsParser] Starting to parse payment methods');
        const methods: PaymentMethod[] = [];

        // Now search directly for payment method items since we're already in the correct section
        const methodItems = this.document.querySelectorAll(
            '.casino-detail-logos-item'
        );
        console.log(
            `[PaymentMethodsParser] Found ${methodItems.length} payment method items`
        );

        // Process each payment method
        methodItems.forEach((item: Element) => {
            const link = item.querySelector('a');
            if (!link) return;

            const imgElement = item.querySelector('img');
            if (!imgElement) return;

            // Get method name from either title attribute or alt text on image
            const name =
                link.getAttribute('title') ||
                imgElement.getAttribute('alt') ||
                '';
            const logoUrl = imgElement.getAttribute('data-src') || null;

            if (name) {
                methods.push({
                    name,
                    logo_url: logoUrl,
                });
            }
        });

        return methods;
    }
}
