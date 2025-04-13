import { JSDOM } from 'jsdom';

export interface NoDepositBonus {
    name: string;
    name_2: string;
    subtype: string;
    wagering_requirements: string;
    free_spins_value: string;
    free_spins_conditions: string;
    max_cashout: string;
    max_bet: string;
    bonus_expiration: string;
    process_speed: string;
    other_info: string;
}

export class BonusParser {
    private dom: JSDOM;
    private document: Document;

    constructor(html: string) {
        console.log('[NoDepositBonusParser] Initializing with section HTML');
        // Wrap the HTML in a div if it's not a complete HTML document
        if (!html.includes('<html') && !html.includes('<body')) {
            html = `<div>${html}</div>`;
        }
        this.dom = new JSDOM(html);
        this.document = this.dom.window.document;
    }

    parseNoDepositBonus(): NoDepositBonus {
        console.log(
            '[NoDepositBonusParser] Starting to parse no deposit bonus'
        );
        const result: NoDepositBonus = {
            name: '',
            name_2: '',
            subtype: '',
            wagering_requirements: '',
            free_spins_value: '',
            free_spins_conditions: '',
            max_cashout: '',
            max_bet: '',
            bonus_expiration: '',
            process_speed: '',
            other_info: '',
        };

        // Now search directly without the info-col-bonus-wrapper-1 parent since we're already in it
        const bonusName1 = this.document.querySelector('.bonus-name-1');
        if (bonusName1 && bonusName1.textContent)
            result.name = bonusName1.textContent.trim();

        const bonusName2 = this.document.querySelector('.bonus-name-2');
        if (bonusName2 && bonusName2.textContent)
            result.name_2 = bonusName2.textContent.trim();

        const popoverId = this.document
            .querySelector('[data-popover-content]')
            ?.getAttribute('data-popover-content');
        if (!popoverId) return result;

        const popoverContent = this.document.querySelector(popoverId);
        if (!popoverContent) return result;

        const conditionLines = popoverContent.querySelectorAll(
            '.bonus-conditions-line'
        );
        conditionLines.forEach((line: Element) => {
            const iconUse = line.querySelector('use');
            if (!iconUse) return;

            const href = iconUse.getAttribute('xlink:href');
            const content = line.querySelector('div');
            if (!content || !content.textContent) return;

            if (href === '#base_category_ico_bonuses') {
                result.subtype = content.textContent.trim();
            } else if (href === '#bonus_ico_wagering_requirements') {
                result.wagering_requirements = content.textContent.trim();
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
            } else if (href === '#bonus_ico_maximum_cashout') {
                const spans = content.querySelectorAll('span');
                spans.forEach((span: Element) => {
                    if (
                        span.textContent &&
                        span.textContent.includes('Maximum cashout:')
                    ) {
                        const strongText =
                            span.querySelector('strong')?.textContent;
                        result.max_cashout = strongText
                            ? strongText.trim()
                            : '';
                    } else if (
                        span.textContent &&
                        span.textContent.includes('Maximum bet:')
                    ) {
                        const strongText =
                            span.querySelector('strong')?.textContent;
                        result.max_bet = strongText ? strongText.trim() : '';
                    }
                });
            } else if (href === '#bonus_ico_spins_per_day') {
                const span = content.querySelector('span');
                if (
                    span &&
                    span.textContent &&
                    span.textContent.includes('Bonus expiration:')
                ) {
                    const strongText =
                        span.querySelector('strong')?.textContent;
                    result.bonus_expiration = strongText
                        ? strongText.trim()
                        : '';
                }
            } else if (href === '#bonus_ico_stop_watch') {
                const span = content.querySelector('span');
                if (
                    span &&
                    span.textContent &&
                    span.textContent.includes('FAST')
                ) {
                    result.process_speed = 'Fast';
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
