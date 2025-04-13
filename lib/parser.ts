import * as cheerio from 'cheerio';
import { extractAndCleanHtml } from './html-utils';
import { BonusParser } from './parser/components/bonuses/no-deposit-bonus-parser';
import { DepositBonusParser } from './parser/components/bonuses/deposit-bonus-parser';
import {
    GameProvidersParser,
    GameProvider,
} from './parser/components/providers/game-providers-parser';
import {
    PaymentMethodsParser,
    PaymentMethod,
} from './parser/components/payment-methods/payment-methods-parser';
import {
    WithdrawalLimitsParser,
    WithdrawalLimits,
} from './parser/components/withdrawal-limits/withdrawal-limits-parser';
import {
    ScreenshotsParser,
    Screenshot,
} from './parser/components/screenshots/screenshots-parser';
import {
    LanguagesParser,
    CasinoLanguage,
} from './parser/components/languages/languages-parser';

// Main function to parse a sitemap
export async function parseSitemap(sitemapUrl: string) {
    // Existing code...
}

export interface ParsedCasino {
    name: string;
    logo_url: string | null;
    rating: number | null;
    description: string | null;
    description_html: string | null;
    owner: string | null;
    operator: string | null;
    established: number | null;
    estimated_revenue: string | null;
    withdrawal_limits: string | null;
    withdrawal_limits_structured: WithdrawalLimits;
    features: {
        positive: string[];
        negative: string[];
        interesting: string[];
    };
    payment_methods: PaymentMethod[];
    licenses: Array<{
        name: string;
        country_code?: string;
    }>;
    game_types: string[];
    game_providers: GameProvider[];
    bonuses: {
        no_deposit?: {
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
        };
        deposit?: {
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
        };
    };
    screenshots: Screenshot[];
    languages: CasinoLanguage[];
    data_casino_id: string | null;
}

export async function parseCasinoPage(
    url: string
): Promise<ParsedCasino | null> {
    try {
        // Fetch the HTML content with browser-like headers
        const response = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                'Upgrade-Insecure-Requests': '1',
                Cookie: 'cookieconsent_status=dismiss; age_verified=1; popup_closed=1; gdpr_consent=1; ok_clicked=1',
            },
        });

        if (!response.ok) {
            console.error(
                `HTTP Error: ${response.status} ${response.statusText} for ${url}`
            );
            throw new Error(
                `Failed to fetch URL (${response.status} ${response.statusText})`
            );
        }

        const html = await response.text();
        if (!html || html.length < 100) {
            console.error(
                `Empty or very short HTML response for ${url}. Length: ${html?.length}`
            );
            throw new Error('Empty or invalid HTML response received');
        }

        const $ = cheerio.load(html);

        // Check if page has expected casino structure
        if (!$('.casino-logo').length && !$('h1').length) {
            console.error(
                `Page doesn't appear to be a valid casino page: ${url}`
            );
            throw new Error("Page doesn't appear to be a valid casino page");
        }

        // Extract casino data
        const name = extractCasinoName($) || '';
        if (!name) {
            console.error(`Failed to extract casino name from ${url}`);
            throw new Error('Failed to extract casino name');
        }

        const logoUrl = $('.casino-logo').attr('src') || null;

        // Improved rating extraction to handle fractional numbers
        let rating: number | null = null;
        const ratingText = $('.rating b, .casino-rating__value').text().trim();
        if (ratingText) {
            // Replace commas with periods (in case of European number format)
            const normalizedRating = ratingText.replace(',', '.');
            rating = Number.parseFloat(normalizedRating);
            // Ensure it's a valid number
            if (isNaN(rating)) {
                rating = null;
            }
        }

        // Extract description text
        const description =
            $('.casino-description p, .casino-detail-box-description')
                .text()
                .trim() || null;

        // Extract and clean HTML content from the description div
        const descriptionHtml =
            extractAndCleanHtml(html, '.casino-detail-box-description') || null;

        // Extract owner, operator, established year, and estimated revenue
        // Using the improved selector for the info section
        let owner = null;
        let operator = null;
        let established = null;
        let estimatedRevenue = null;

        // First try the new format with info-col-section-revenues
        $('.info-col-section-revenues .my-m').each((i, el) => {
            const label = $(el)
                .find('label.info-col-section-header')
                .text()
                .trim()
                .toLowerCase();
            const value = $(el).find('b').text().trim();

            if (label.includes('owner')) {
                owner = value;
            } else if (label.includes('operator')) {
                operator = value;
            } else if (label.includes('established')) {
                established = Number.parseInt(value) || null;
            } else if (label.includes('revenue')) {
                estimatedRevenue = value;
            }
        });

        // If not found, try the old format with table rows
        if (!owner && !operator && !established) {
            $('.casino-information tr').each((i, row) => {
                const label = $(row).find('th').text().trim().toLowerCase();
                const value = $(row).find('td').text().trim();

                if (label.includes('owner')) {
                    owner = value;
                } else if (label.includes('operator')) {
                    operator = value;
                } else if (
                    label.includes('established') ||
                    label.includes('founded')
                ) {
                    established = Number.parseInt(value) || null;
                } else if (label.includes('revenue')) {
                    estimatedRevenue = value;
                }
            });
        }

        // Extract withdrawal limits using the dedicated parser
        let withdrawalLimitsHtml = '';
        const withdrawalLimitsSection = $('.payments-withdrawal');
        if (withdrawalLimitsSection.length > 0) {
            withdrawalLimitsHtml = $.html(withdrawalLimitsSection);
            console.log(
                '[parseCasinoPage] Found withdrawal limits section, length:',
                withdrawalLimitsHtml.length
            );
        }
        const withdrawalLimitsParser = new WithdrawalLimitsParser(
            withdrawalLimitsHtml
        );
        const withdrawalLimitsStructured =
            withdrawalLimitsParser.parseWithdrawalLimits();

        // Keep the old text-based withdrawal limits for backward compatibility
        let withdrawalLimits = null;
        $('.info-col-section').each((i, section) => {
            const header = $(section)
                .find('.info-col-section-header')
                .text()
                .trim();
            if (header.toLowerCase().includes('withdrawal limits')) {
                withdrawalLimits = $(section)
                    .find('.fs-m.text-bold, .neo-fs-20')
                    .text()
                    .trim();
            }
        });

        // Extract features
        const features = {
            positive: [] as string[],
            negative: [] as string[],
            interesting: [] as string[],
        };

        // Positives
        $('.casino-detail-box-pros .col:contains("Positives")')
            .next()
            .find('li')
            .each((i, el) => {
                features.positive.push($(el).text().trim());
            });

        // Negatives
        $('.casino-detail-box-pros .col:contains("Negatives")')
            .next()
            .find('li')
            .each((i, el) => {
                features.negative.push($(el).text().trim());
            });

        // Interesting facts
        $('.casino-detail-box-pros .col:contains("Interesting facts")')
            .next()
            .find('li')
            .each((i, el) => {
                features.interesting.push($(el).text().trim());
            });

        // Extract payment methods using the dedicated parser
        let paymentMethodsHtml = '';
        const paymentMethodsSection = $('#popover-payment-methods');
        if (paymentMethodsSection.length > 0) {
            paymentMethodsHtml = $.html(paymentMethodsSection);
            console.log(
                '[parseCasinoPage] Found payment methods section, length:',
                paymentMethodsHtml.length
            );
        }
        const paymentMethodsParser = new PaymentMethodsParser(
            paymentMethodsHtml
        );
        const paymentMethods = paymentMethodsParser.parsePaymentMethods();

        // Extract licenses
        const licenses: Array<{ name: string; country_code?: string }> = [];
        $('ul.license-list li').each((i, el) => {
            const licenseElement = $(el);
            const licenseName = licenseElement
                .find('a.link-secondary')
                .text()
                .trim();

            // Extract country code from flag icon class
            let countryCode: string | undefined = undefined;
            const flagIcon = licenseElement.find("i[class^='flag-icon-']");
            if (flagIcon.length > 0) {
                const flagClass = flagIcon.attr('class') || '';
                const match = flagClass.match(/flag-icon-([a-z]{2})/);
                if (match && match[1]) {
                    countryCode = match[1];
                }
            }

            if (licenseName) {
                licenses.push({
                    name: licenseName,
                    country_code: countryCode,
                });
            }
        });

        // Extract game types
        const gameTypes: string[] = [];
        $('.game-types-list li, .casino-card-available-games-ul li').each(
            (i, el) => {
                const gameType = $(el).text().trim();
                if (gameType) gameTypes.push(gameType);
            }
        );

        // Extract game providers using the dedicated parser
        let gameProvidersHtml = '';
        const gameProvidersSection = $('#popover-game-providers');
        if (gameProvidersSection.length > 0) {
            gameProvidersHtml = $.html(gameProvidersSection);
            console.log(
                '[parseCasinoPage] Found game providers section, length:',
                gameProvidersHtml.length
            );
        }
        const gameProvidersParser = new GameProvidersParser(gameProvidersHtml);
        const gameProviders = gameProvidersParser.parseGameProviders();

        // Extract bonuses
        const bonuses: ParsedCasino['bonuses'] = {};

        // Extract No Deposit Bonus using the dedicated parser
        let noDepositBonusHtml = '';
        const noDepositBonusSection = $('.info-col-bonus-wrapper-1');
        if (noDepositBonusSection.length > 0) {
            noDepositBonusHtml = $.html(noDepositBonusSection);
            console.log(
                '[parseCasinoPage] Found no deposit bonus section, length:',
                noDepositBonusHtml.length
            );
        }
        const noDepositBonusParser = new BonusParser(noDepositBonusHtml);
        const noDepositBonus = noDepositBonusParser.parseNoDepositBonus();
        if (noDepositBonus.name) {
            bonuses.no_deposit = noDepositBonus;
        }

        // Extract Deposit Bonus using the dedicated parser
        let depositBonusHtml = '';
        const depositBonusSection = $('.info-col-bonus-wrapper');
        if (depositBonusSection.length > 0) {
            depositBonusHtml = $.html(depositBonusSection);
            console.log(
                '[parseCasinoPage] Found deposit bonus section, length:',
                depositBonusHtml.length
            );
        }
        const depositBonusParser = new DepositBonusParser(depositBonusHtml);
        const depositBonus = depositBonusParser.parseDepositBonus();
        if (depositBonus.name) {
            bonuses.deposit = depositBonus;
        }

        // Extract screenshots using the dedicated parser
        let screenshotsHtml = '';
        const screenshotsSection = $('.casino-detail-box-screenshots');
        if (screenshotsSection.length > 0) {
            screenshotsHtml = $.html(screenshotsSection);
            console.log(
                '[parseCasinoPage] Found screenshots section, length:',
                screenshotsHtml.length
            );
        }
        const screenshotsParser = new ScreenshotsParser(screenshotsHtml);
        const screenshots = screenshotsParser.parseScreenshots();

        // Extract languages HTML section to pass to the dedicated parser
        let languagesHtml = '';
        const languagesSection = $('.casino-detail-box-languages');
        if (languagesSection.length > 0) {
            languagesHtml = $.html(languagesSection);
            console.log(
                '[parseCasinoPage] Found languages section, length:',
                languagesHtml.length
            );
        } else {
            console.log('[parseCasinoPage] No languages section found in HTML');
            // Try to construct a minimal container with any language content found
            const allLanguageOptions = $('.language-option');
            if (allLanguageOptions.length > 0) {
                languagesHtml =
                    '<div class="casino-detail-box-languages">' +
                    $.html(allLanguageOptions) +
                    '</div>';
                console.log(
                    '[parseCasinoPage] Constructed minimal languages section with language options:',
                    allLanguageOptions.length
                );
            }
        }
        const languagesParser = new LanguagesParser(languagesHtml);
        const languages = languagesParser.parseLanguages();

        // Extract data_casino_id from the div attribute
        let dataCasinoId: string | null = null;
        const casinoDetailDiv = $(
            '.casino-detail-main-col[data-module="modules/casino-detail-tabs"]'
        );
        if (casinoDetailDiv.length > 0) {
            dataCasinoId = casinoDetailDiv.attr('data-casino-id') || null;
            console.log(
                `[parseCasinoPage] Found data-casino-id: ${dataCasinoId}`
            );
        }

        return {
            name,
            logo_url: logoUrl,
            rating,
            description,
            description_html: descriptionHtml,
            owner,
            operator,
            established,
            estimated_revenue: estimatedRevenue,
            withdrawal_limits: withdrawalLimits,
            withdrawal_limits_structured: withdrawalLimitsStructured,
            features,
            payment_methods: paymentMethods,
            licenses,
            game_types: gameTypes,
            game_providers: gameProviders,
            bonuses,
            screenshots,
            languages,
            data_casino_id: dataCasinoId,
        };
    } catch (error) {
        // Provide more detailed error information
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown parser error';
        console.error(`Error parsing casino page ${url}: ${errorMessage}`);
        if (error instanceof Error && error.stack) {
            console.error(error.stack);
        }
        return null;
    }
}

// Helper function to extract casino name
function extractCasinoName($: cheerio.CheerioAPI): string | null {
    // Try different selectors to find the casino name
    const logoAlt = $('.casino-logo').attr('alt');
    if (logoAlt) {
        return logoAlt.replace(' Logo', '');
    }

    // Try the h1 tag
    const h1Text = $('h1').text().trim();
    if (h1Text) {
        return h1Text;
    }

    // Fallback to page title
    const title = $('title').text();
    return title.split(' - ')[0] || null;
}
