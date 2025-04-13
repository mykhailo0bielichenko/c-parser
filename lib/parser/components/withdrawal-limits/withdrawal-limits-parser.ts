import { JSDOM } from 'jsdom';

export interface WithdrawalLimits {
    per_day: string | null;
    per_week: string | null;
    per_month: string | null;
}

export class WithdrawalLimitsParser {
    private dom: JSDOM;
    private document: Document;

    constructor(html: string) {
        console.log('[WithdrawalLimitsParser] Initializing with section HTML');
        // Wrap the HTML in a div if it's not a complete HTML document
        if (!html.includes('<html') && !html.includes('<body')) {
            html = `<div>${html}</div>`;
        }
        this.dom = new JSDOM(html);
        this.document = this.dom.window.document;
    }

    parseWithdrawalLimits(): WithdrawalLimits {
        console.log(
            '[WithdrawalLimitsParser] Starting to parse withdrawal limits'
        );
        const result: WithdrawalLimits = {
            per_day: null,
            per_week: null,
            per_month: null,
        };

        // Find all section headers first
        const sectionHeaders = this.document.querySelectorAll(
            '.info-col-section-header'
        );
        let limitsSection = null;

        // Find the header that contains "Withdrawal limits"
        for (let i = 0; i < sectionHeaders.length; i++) {
            const header = sectionHeaders[i];
            if (
                header.textContent &&
                header.textContent
                    .trim()
                    .toLowerCase()
                    .includes('withdrawal limits')
            ) {
                limitsSection = header;
                break;
            }
        }

        if (!limitsSection) return result;

        // Get the parent section containing all the limits
        const parentSection = limitsSection.closest('.info-col-section');
        if (!parentSection) return result;

        // Find all limit blocks
        const limitBlocks = parentSection.querySelectorAll('.mr-m');

        // Process each limit block
        limitBlocks.forEach((block: Element) => {
            // Check if this block actually has content
            if (!block.textContent?.trim()) return;

            const periodElement = block.querySelector('.fs-xs');
            const valueElement = block.querySelector('.neo-fs-20');

            if (periodElement && valueElement) {
                const periodText =
                    periodElement.textContent?.trim().toLowerCase() || '';
                const value = valueElement.textContent?.trim() || '';

                if (periodText.includes('per day')) {
                    result.per_day = value;
                } else if (periodText.includes('per week')) {
                    result.per_week = value;
                } else if (periodText.includes('per month')) {
                    result.per_month = value;
                }
            }
        });

        return result;
    }
}
