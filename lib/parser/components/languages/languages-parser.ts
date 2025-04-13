import { JSDOM } from 'jsdom';

export interface CasinoLanguage {
    name: string;
    country_code: string;
    type: 'website' | 'support' | 'livechat';
}

export class LanguagesParser {
    private dom: JSDOM;
    private document: Document;

    constructor(html: string) {
        console.log('[LanguagesParser] Initializing with section HTML');
        // Wrap the HTML in a div if it's not a complete HTML document
        if (!html.includes('<html') && !html.includes('<body')) {
            html = `<div>${html}</div>`;
        }
        this.dom = new JSDOM(html);
        this.document = this.dom.window.document;

        console.log('[LanguagesParser] Languages HTML length:', html.length);
    }

    parseLanguages(): CasinoLanguage[] {
        console.log('[LanguagesParser] Starting to parse languages');
        const languages: CasinoLanguage[] = [];

        // Process each language option directly
        const languageOptions =
            this.document.querySelectorAll('.language-option');

        if (languageOptions.length === 0) {
            console.log(
                '[LanguagesParser] No language options found, returning empty array'
            );
            return languages;
        }

        languageOptions.forEach((option, index) => {
            // Determine type based on the content text
            const middleText =
                option.querySelector('.middle')?.textContent?.toLowerCase() ||
                '';

            let type: 'website' | 'support' | 'livechat';
            if (middleText.includes('website')) {
                type = 'website';
            } else if (middleText.includes('support')) {
                type = 'support';
            } else if (middleText.includes('live chat')) {
                type = 'livechat';
            } else {
                return; // Skip this option
            }

            console.log(`[LanguagesParser] Processing ${type} languages`);

            // Find the corresponding popover content for this language option
            const popoverContentId = option
                .querySelector('[data-popover-content]')
                ?.getAttribute('data-popover-content');

            if (!popoverContentId) {
                // At least add the primary language (English) if present
                this.addPrimaryLanguageIfAvailable(option, type, languages);
                return;
            }

            const popoverContent =
                this.document.querySelector(popoverContentId);
            if (!popoverContent) {
                // At least add the primary language (English) if present
                this.addPrimaryLanguageIfAvailable(option, type, languages);
                return;
            }

            // Extract languages from the popover
            const languageItems =
                popoverContent.querySelectorAll('.flex.items-center');

            languageItems.forEach((item, i) => {
                const flagIcon = item.querySelector('[class*="flag-icon-"]');
                if (!flagIcon) {
                    return;
                }

                // Get the raw HTML to extract the last country code before the closing tag
                const flagIconHtml = flagIcon.outerHTML || '';

                // Extract the country code using a better regex that looks for the last flag-icon-XX before "></i>"
                const countryCodeMatch = flagIconHtml.match(
                    /flag-icon-([a-z]{2})(?="><\/i>|">\s*<\/i>|"\s*><\/i>|"><\/i>|">\s*$)/i
                );

                // If that fails, try to extract the last flag-icon-XX in the class attribute
                const countryCode = countryCodeMatch
                    ? countryCodeMatch[1]
                    : this.extractLastCountryCode(flagIcon);

                if (!countryCode) {
                    return;
                }

                // Find the language name (either in a span next to the flag or in the same element)
                let name = '';
                const nameSpan = item.querySelector(
                    'span:not([class*="flag-icon-"])'
                );
                if (nameSpan) {
                    name = nameSpan.textContent?.trim() || '';
                }

                if (!name) {
                    console.log(
                        `[LanguagesParser] No language name found for ${type} item ${i}`
                    );
                    return;
                }

                console.log(
                    `[LanguagesParser] Adding language: ${name} (${countryCode}) for type: ${type}`
                );
                languages.push({
                    name,
                    country_code: countryCode,
                    type,
                });
            });
        });

        console.log(
            `[LanguagesParser] Finished parsing languages. Found ${languages.length} languages`
        );

        return languages;
    }

    // Helper method to extract the last country code from a flag icon element
    private extractLastCountryCode(flagIcon: Element): string {
        const classList = flagIcon.getAttribute('class')?.split(' ') || [];
        let countryCode = '';

        // Go through all classes from end to start to find the last flag-icon-XX code
        for (let i = classList.length - 1; i >= 0; i--) {
            const match = classList[i].match(/^flag-icon-([a-z]{2})$/);
            if (match) {
                countryCode = match[1];
                break;
            }
        }

        return countryCode;
    }

    private addPrimaryLanguageIfAvailable(
        option: Element,
        type: 'website' | 'support' | 'livechat',
        languages: CasinoLanguage[]
    ): void {
        const flagIcon = option.querySelector(
            '.flag-icon-circle-medium i[class*="flag-icon-"], .flag-icon-circle-medium [class*="flag-icon-"]'
        );

        if (flagIcon) {
            // Get the raw HTML to extract country code
            const flagIconHtml = flagIcon.outerHTML || '';

            // Try to extract country code from the HTML
            const countryCodeMatch = flagIconHtml.match(
                /flag-icon-([a-z]{2})(?="><\/i>|">\s*<\/i>|"\s*><\/i>|"><\/i>|">\s*$)/i
            );

            // If that fails, extract from class list
            const countryCode = countryCodeMatch
                ? countryCodeMatch[1]
                : this.extractLastCountryCode(flagIcon);

            if (countryCode) {
                // Try to get the language name, otherwise default to the country code
                const middleContent =
                    option.querySelector('.middle')?.textContent || '';
                let name = 'Unknown';

                if (middleContent.toLowerCase().includes('english')) {
                    name = 'English';
                } else if (countryCode === 'gb') {
                    name = 'English';
                } else if (countryCode === 'fr') {
                    name = 'French';
                } else if (countryCode === 'de') {
                    name = 'German';
                } else if (countryCode === 'es') {
                    name = 'Spanish';
                } else if (countryCode === 'it') {
                    name = 'Italian';
                } else if (countryCode === 'pt') {
                    name = 'Portuguese';
                } else if (countryCode === 'ru') {
                    name = 'Russian';
                } else if (countryCode === 'cn') {
                    name = 'Chinese';
                } else if (countryCode === 'jp') {
                    name = 'Japanese';
                }

                languages.push({
                    name,
                    country_code: countryCode,
                    type,
                });
            } else {
                console.log(
                    `[LanguagesParser] Could not extract country code from primary flag icon: ${flagIconHtml}`
                );
            }
        }
    }
}
