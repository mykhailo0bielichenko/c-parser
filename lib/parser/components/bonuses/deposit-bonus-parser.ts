import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Create an equivalent to __dirname for ES modules - only when running in Node.js context
let __dirname;
try {
    // Only execute if in a proper Node.js environment
    if (
        typeof process !== 'undefined' &&
        process.versions &&
        process.versions.node
    ) {
        const __filename = fileURLToPath(import.meta.url);
        __dirname = path.dirname(__filename);
    }
} catch (error) {
    // Silently handle errors for environments where this doesn't work (like Next.js)
    __dirname = '.';
}

export interface DepositBonus {
    name: string;
    name_2: string;
    subtype: string;
    min_deposit: string;
    max_cashout: string;
    wagering_requirements: string;
    max_bet: string;
    bonus_expiration: string;
    process_speed: string;
    free_spins_value: string;
    free_spins_conditions: string;
    other_info: string;
}

export class DepositBonusParser {
    private dom: JSDOM;
    private document: Document;

    constructor(html: string) {
        console.log('[DepositBonusParser] Initializing with section HTML');
        // Wrap the HTML in a div if it's not a complete HTML document
        if (!html.includes('<html') && !html.includes('<body')) {
            html = `<div>${html}</div>`;
        }
        this.dom = new JSDOM(html);
        this.document = this.dom.window.document;
    }

    parseDepositBonus(): DepositBonus {
        console.log('[DepositBonusParser] Starting to parse deposit bonus');
        const result: DepositBonus = {
            name: '',
            name_2: '',
            subtype: '',
            min_deposit: '',
            max_cashout: '',
            wagering_requirements: '',
            max_bet: '',
            bonus_expiration: '',
            process_speed: '',
            free_spins_value: '',
            free_spins_conditions: '',
            other_info: '',
        };

        // Find the bonus wrapper
        const bonusWrapper = this.document.querySelector(
            '.info-col-bonus-wrapper'
        );
        if (!bonusWrapper) return result;

        // Extract name and name_2
        const bonusName1 = bonusWrapper.querySelector('.bonus-name-1');
        if (bonusName1 && bonusName1.textContent)
            result.name = bonusName1.textContent.trim();

        const bonusName2 = bonusWrapper.querySelector('.bonus-name-2');
        if (bonusName2 && bonusName2.textContent)
            result.name_2 = bonusName2.textContent.trim();

        // Find the popover content
        const popoverId = bonusWrapper
            .querySelector('[data-popover-content]')
            ?.getAttribute('data-popover-content');
        if (!popoverId) return result;

        const popoverContent = this.document.querySelector(popoverId);
        if (!popoverContent) return result;

        // Process all bonus condition lines
        const conditionLines = popoverContent.querySelectorAll(
            '.bonus-conditions-line'
        );
        conditionLines.forEach((line: Element) => {
            const iconUse = line.querySelector('use');
            if (!iconUse) return;

            const href = iconUse.getAttribute('xlink:href');
            const content = line.querySelector('div');
            if (!content || !content.textContent) return;

            // Extract data based on the icon type
            if (href === '#base_category_ico_bonuses') {
                result.subtype = content.textContent.trim();
            } else if (href === '#bonus_ico_maximum_cashout') {
                const spans = content.querySelectorAll('span');
                spans.forEach((span: Element) => {
                    if (
                        span.textContent &&
                        span.textContent.includes('Minimum deposit:')
                    ) {
                        const strongText =
                            span.querySelector('strong')?.textContent;
                        result.min_deposit = strongText
                            ? strongText.trim()
                            : '';
                    } else if (
                        span.textContent &&
                        span.textContent.includes('Maximum cashout:')
                    ) {
                        const strongText =
                            span.querySelector('strong')?.textContent;
                        result.max_cashout = strongText
                            ? strongText.trim()
                            : '';
                    }
                });
            } else if (href === '#bonus_ico_wagering_requirements') {
                const span = content.querySelector('span');
                if (
                    span &&
                    span.textContent &&
                    span.textContent.includes('Wagering requirements:')
                ) {
                    const strongText =
                        span.querySelector('strong')?.textContent;
                    result.wagering_requirements = strongText
                        ? strongText.trim()
                        : '';
                }
            } else if (href === '#bonus_ico_maximal_bet') {
                const span = content.querySelector('span');
                if (
                    span &&
                    span.textContent &&
                    span.textContent.includes('Maximum bet:')
                ) {
                    const strongText =
                        span.querySelector('strong')?.textContent;
                    result.max_bet = strongText ? strongText.trim() : '';
                }
            } else if (href === '#bonus_ico_stop_watch') {
                const spans = content.querySelectorAll('span');
                spans.forEach((span: Element) => {
                    if (
                        span.textContent &&
                        span.textContent.includes(
                            'The process of getting this bonus'
                        )
                    ) {
                        if (span.textContent.includes('FAST')) {
                            result.process_speed = 'Fast';
                        }
                    } else if (
                        span.textContent &&
                        span.textContent.includes('Bonus expiration:')
                    ) {
                        const strongText =
                            span.querySelector('strong')?.textContent;
                        result.bonus_expiration = strongText
                            ? strongText.trim()
                            : '';
                    }
                });
            } else if (href === '#bonus_ico_freespins') {
                const span = content.querySelector('span');
                if (
                    span &&
                    span.textContent &&
                    span.textContent.includes('Free spins:')
                ) {
                    result.free_spins_value = span.textContent
                        .replace('Free spins:', '')
                        .trim();
                }
            } else if (href === '#bonus_ico_expiration_freespins_1') {
                const span = content.querySelector('span');
                if (
                    span &&
                    span.textContent &&
                    span.textContent.includes('Free spins conditions:')
                ) {
                    const strongElements = span.querySelectorAll('strong');
                    const conditions = Array.from(strongElements)
                        .map((strong) => strong.textContent?.trim())
                        .filter(Boolean)
                        .join(', ');
                    result.free_spins_conditions = conditions;
                }
            } else if (href === '#base_ui_ico_info') {
                result.other_info = content.textContent
                    .trim()
                    .replace(/\s+/g, ' ');
            }
        });

        return result;
    }
}

// Only execute this part when running directly (not when imported)
// Check in a way that's safe for all environments
try {
    // Only run if this module is executed directly in Node.js
    if (
        typeof process !== 'undefined' &&
        process.versions &&
        process.versions.node &&
        typeof require !== 'undefined' &&
        require.main === module
    ) {
        // Save the HTML to a file for reuse
        const htmlFilePath = path.join(
            __dirname || '.',
            'sample-deposit-bonus-2.html'
        );
        const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

        // Parse the bonus
        const parser = new DepositBonusParser(htmlContent);
        const bonus = parser.parseDepositBonus();

        console.log('Saving deposit bonus:', JSON.stringify(bonus, null, 2));
    }
} catch (error) {
    // Silently ignore any errors that might occur in different environments
}
