import { supabaseAdmin } from '@/lib/supabase';
import { parseCasinoPage, type ParsedCasino } from '@/lib/parser';

export class CasinoParserService {
    /**
     * Helper function to create a timeout promise
     */
    private static async timeout(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Parse a casino page and save the data to the database
     */
    static async parseAndSaveCasino(
        url: string,
        jobId?: number,
        retryAttempt: number = 0
    ): Promise<{
        success: boolean;
        casinoId?: number;
        parsedData?: ParsedCasino;
        error?: string;
    }> {
        try {
            console.log(
                jobId
                    ? `[Job ${jobId}] Processing URL: ${url}${
                          retryAttempt > 0
                              ? ` (Retry attempt: ${retryAttempt})`
                              : ''
                      }`
                    : `Starting to parse casino URL: ${url}${
                          retryAttempt > 0
                              ? ` (Retry attempt: ${retryAttempt})`
                              : ''
                      }`
            );

            // Parse the casino page
            const parsedData = await parseCasinoPage(url);

            if (!parsedData) {
                const errorMsg = `Failed to parse casino data for URL: ${url}`;
                console.error(jobId ? `[Job ${jobId}] ${errorMsg}` : errorMsg);

                // Log the error to parse_logs
                await supabaseAdmin.from('parse_logs').insert({
                    url,
                    status: 'error',
                    message: `Failed to parse casino data - check server logs for details`,
                    job_id: jobId || null,
                });

                // If this is the first attempt, wait 30 seconds and retry
                if (retryAttempt === 0) {
                    console.log(
                        `Will retry parsing URL ${url} in 30 seconds...`
                    );
                    await this.timeout(30000);
                    return this.parseAndSaveCasino(
                        url,
                        jobId,
                        retryAttempt + 1
                    );
                }

                // Add 30 second timeout on final error before continuing to next URL
                console.log(
                    `Failed after retry, waiting 30 seconds before continuing...`
                );
                await this.timeout(30000);

                return {
                    success: false,
                    error: 'Failed to parse casino data after retry. Please check server logs for more details.',
                };
            }

            // Check if casino already exists by name
            const { data: existingCasino, error: checkError } =
                await supabaseAdmin
                    .from('casinos')
                    .select('id')
                    .ilike('name', parsedData.name)
                    .maybeSingle();

            let casinoId: number;

            if (existingCasino) {
                // Casino already exists, update it
                casinoId = existingCasino.id;
                const updateResult = await this.updateCasino(
                    casinoId,
                    parsedData,
                    jobId
                );
                if (!updateResult.success) {
                    return { success: false, error: updateResult.error };
                }
            } else {
                // Casino doesn't exist, insert it
                const createResult = await this.createCasino(parsedData, jobId);
                if (!createResult.success) {
                    return { success: false, error: createResult.error };
                }
                casinoId = createResult.casinoId!;
            }

            // Now save related data
            await this.saveRelatedData(casinoId, parsedData, jobId);

            // Log the successful parse
            await supabaseAdmin.from('parse_logs').insert({
                url,
                status: 'success',
                message: `Successfully parsed casino data for ${parsedData.name}`,
                job_id: jobId || null,
                casino_id: casinoId,
            });

            return {
                success: true,
                casinoId,
                parsedData,
            };
        } catch (error) {
            console.error(
                jobId
                    ? `[Job ${jobId}] Error processing ${url}${
                          retryAttempt > 0
                              ? ` (Retry attempt: ${retryAttempt})`
                              : ''
                      }:`
                    : `Error parsing URL ${url}${
                          retryAttempt > 0
                              ? ` (Retry attempt: ${retryAttempt})`
                              : ''
                      }:`,
                error
            );

            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';

            // Log the error to parse_logs
            await supabaseAdmin.from('parse_logs').insert({
                url,
                status: 'error',
                message: `Error: ${errorMessage}`,
                job_id: jobId || null,
            });

            // If this is the first attempt, wait 30 seconds and retry
            if (retryAttempt === 0) {
                console.log(
                    `Will retry parsing URL ${url} in 30 seconds after error...`
                );
                await this.timeout(30000);
                return this.parseAndSaveCasino(url, jobId, retryAttempt + 1);
            }

            // Add 30 second timeout on final error before continuing to next URL
            console.log(
                `Failed after retry, waiting 30 seconds before continuing...`
            );
            await this.timeout(30000);

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Update an existing casino
     */
    private static async updateCasino(
        casinoId: number,
        parsedData: ParsedCasino,
        jobId?: number
    ): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            if (jobId) {
                console.log(
                    `[Job ${jobId}] Updating existing casino: ${parsedData.name} (ID: ${casinoId})`
                );
            }

            const { error: updateError } = await supabaseAdmin
                .from('casinos')
                .update({
                    logo_url: parsedData.logo_url,
                    rating: parsedData.rating,
                    description:
                        parsedData.description_html || parsedData.description,
                    owner: parsedData.owner,
                    operator: parsedData.operator,
                    established: parsedData.established,
                    estimated_revenue: parsedData.estimated_revenue,
                    withdrawal_limits: parsedData.withdrawal_limits,
                    withdrawal_limit_per_day:
                        parsedData.withdrawal_limits_structured.per_day,
                    withdrawal_limit_per_week:
                        parsedData.withdrawal_limits_structured.per_week,
                    withdrawal_limit_per_month:
                        parsedData.withdrawal_limits_structured.per_month,
                    data_casino_id: parsedData.data_casino_id,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', casinoId);

            if (updateError) {
                console.error(
                    jobId
                        ? `[Job ${jobId}] Error updating casino:`
                        : 'Error updating casino:',
                    updateError
                );
                return {
                    success: false,
                    error: `Failed to update casino: ${updateError.message}`,
                };
            }

            return { success: true };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: `Error updating casino: ${errorMessage}`,
            };
        }
    }

    /**
     * Create a new casino
     */
    private static async createCasino(
        parsedData: ParsedCasino,
        jobId?: number
    ): Promise<{
        success: boolean;
        casinoId?: number;
        error?: string;
    }> {
        try {
            if (jobId) {
                console.log(
                    `[Job ${jobId}] Inserting new casino: ${parsedData.name}`
                );
            }

            const { data: insertedCasino, error: insertError } =
                await supabaseAdmin
                    .from('casinos')
                    .insert({
                        name: parsedData.name,
                        logo_url: parsedData.logo_url,
                        rating: parsedData.rating,
                        description:
                            parsedData.description_html ||
                            parsedData.description,
                        owner: parsedData.owner,
                        operator: parsedData.operator,
                        established: parsedData.established,
                        estimated_revenue: parsedData.estimated_revenue,
                        withdrawal_limits: parsedData.withdrawal_limits,
                        withdrawal_limit_per_day:
                            parsedData.withdrawal_limits_structured.per_day,
                        withdrawal_limit_per_week:
                            parsedData.withdrawal_limits_structured.per_week,
                        withdrawal_limit_per_month:
                            parsedData.withdrawal_limits_structured.per_month,
                        data_casino_id: parsedData.data_casino_id,
                    })
                    .select('id')
                    .single();

            if (insertError) {
                console.error(
                    jobId
                        ? `[Job ${jobId}] Error inserting casino:`
                        : 'Error inserting casino:',
                    insertError
                );
                return {
                    success: false,
                    error: `Failed to insert casino: ${insertError.message}`,
                };
            }

            if (jobId) {
                console.log(
                    `[Job ${jobId}] Successfully inserted casino with ID: ${insertedCasino.id}`
                );
            }

            return {
                success: true,
                casinoId: insertedCasino.id,
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: `Error creating casino: ${errorMessage}`,
            };
        }
    }

    /**
     * Save all related data for a casino
     */
    static async saveRelatedData(
        casinoId: number,
        data: ParsedCasino,
        jobId?: number
    ) {
        const logPrefix = jobId ? `[Job ${jobId}]` : '';

        try {
            // Save features
            if (data.features) {
                console.log(
                    `${logPrefix} Saving features for casino ID: ${casinoId}`
                );

                // First delete existing features to avoid duplicates
                await supabaseAdmin
                    .from('casino_features')
                    .delete()
                    .eq('casino_id', casinoId);

                // Save positive features
                if (
                    data.features.positive &&
                    data.features.positive.length > 0
                ) {
                    const positiveFeatures = data.features.positive.map(
                        (feature) => ({
                            casino_id: casinoId,
                            feature,
                            type: 'positive',
                        })
                    );

                    const { error: featuresError } = await supabaseAdmin
                        .from('casino_features')
                        .insert(positiveFeatures);

                    if (featuresError) {
                        console.error(
                            `${logPrefix} Error inserting positive features:`,
                            featuresError
                        );
                    }
                }

                // Save negative features
                if (
                    data.features.negative &&
                    data.features.negative.length > 0
                ) {
                    const negativeFeatures = data.features.negative.map(
                        (feature) => ({
                            casino_id: casinoId,
                            feature,
                            type: 'negative',
                        })
                    );

                    const { error: featuresError } = await supabaseAdmin
                        .from('casino_features')
                        .insert(negativeFeatures);

                    if (featuresError) {
                        console.error(
                            `${logPrefix} Error inserting negative features:`,
                            featuresError
                        );
                    }
                }

                // Save interesting features
                if (
                    data.features.interesting &&
                    data.features.interesting.length > 0
                ) {
                    const interestingFeatures = data.features.interesting.map(
                        (feature) => ({
                            casino_id: casinoId,
                            feature,
                            type: 'interesting',
                        })
                    );

                    const { error: featuresError } = await supabaseAdmin
                        .from('casino_features')
                        .insert(interestingFeatures);

                    if (featuresError) {
                        console.error(
                            `${logPrefix} Error inserting interesting features:`,
                            featuresError
                        );
                    }
                }
            }

            // Save payment methods
            if (data.payment_methods && data.payment_methods.length > 0) {
                console.log(
                    `${logPrefix} Saving payment methods for casino ID: ${casinoId}`
                );

                for (const method of data.payment_methods) {
                    try {
                        // Check if payment method exists by name (case-insensitive)
                        const { data: existingMethod } = await supabaseAdmin
                            .from('payment_methods')
                            .select('id, logo_url')
                            .ilike('name', method.name)
                            .maybeSingle();

                        let methodId: number;

                        if (existingMethod) {
                            methodId = existingMethod.id;

                            // Update the logo URL if it was empty and we now have one
                            if (!existingMethod.logo_url && method.logo_url) {
                                await supabaseAdmin
                                    .from('payment_methods')
                                    .update({ logo_url: method.logo_url })
                                    .eq('id', methodId);
                            }
                        } else {
                            // Insert new payment method with both name and logo_url
                            const { data: newMethod, error } =
                                await supabaseAdmin
                                    .from('payment_methods')
                                    .insert({
                                        name: method.name,
                                        logo_url: method.logo_url,
                                    })
                                    .select('id')
                                    .single();

                            if (error) {
                                console.error(
                                    `${logPrefix} Error inserting payment method:`,
                                    error
                                );
                                continue;
                            }
                            methodId = newMethod.id;
                        }

                        // Check if relationship already exists
                        const { data: existingRelation } = await supabaseAdmin
                            .from('casino_payment_methods')
                            .select('id')
                            .eq('casino_id', casinoId)
                            .eq('payment_method_id', methodId)
                            .maybeSingle();

                        if (!existingRelation) {
                            // Create relationship
                            const { error: relationError } = await supabaseAdmin
                                .from('casino_payment_methods')
                                .insert({
                                    casino_id: casinoId,
                                    payment_method_id: methodId,
                                });

                            if (relationError) {
                                console.error(
                                    `${logPrefix} Error inserting casino payment method relation:`,
                                    relationError
                                );
                            }
                        }
                    } catch (error) {
                        console.error(
                            `${logPrefix} Error processing payment method ${method.name}:`,
                            error
                        );
                    }
                }
            }

            // Save licenses
            if (data.licenses && data.licenses.length > 0) {
                console.log(
                    `${logPrefix} Saving licenses for casino ID: ${casinoId}`
                );

                for (const license of data.licenses) {
                    try {
                        // Check if license exists by name (case-insensitive)
                        const { data: existingLicense } = await supabaseAdmin
                            .from('licenses')
                            .select('id, name, country_code')
                            .ilike('name', license.name)
                            .maybeSingle();

                        let licenseId: number;

                        if (existingLicense) {
                            licenseId = existingLicense.id;

                            // Update country code if it's provided and different
                            if (
                                license.country_code &&
                                existingLicense.country_code !==
                                    license.country_code
                            ) {
                                await supabaseAdmin
                                    .from('licenses')
                                    .update({
                                        country_code: license.country_code,
                                    })
                                    .eq('id', licenseId);
                            }
                        } else {
                            // Insert new license WITHOUT specifying the ID (let the database auto-increment)
                            const { data: newLicense, error } =
                                await supabaseAdmin
                                    .from('licenses')
                                    .insert({
                                        name: license.name,
                                        country_code: license.country_code,
                                    })
                                    .select('id')
                                    .single();

                            if (error) {
                                console.error(
                                    `${logPrefix} Error inserting license:`,
                                    error
                                );
                                continue;
                            }
                            licenseId = newLicense.id;
                        }

                        // Check if relationship already exists
                        const { data: existingRelation } = await supabaseAdmin
                            .from('casino_licenses')
                            .select('id')
                            .eq('casino_id', casinoId)
                            .eq('license_id', licenseId)
                            .maybeSingle();

                        if (!existingRelation) {
                            // Create relationship
                            const { error: relationError } = await supabaseAdmin
                                .from('casino_licenses')
                                .insert({
                                    casino_id: casinoId,
                                    license_id: licenseId,
                                });

                            if (relationError) {
                                console.error(
                                    `${logPrefix} Error inserting casino license relation:`,
                                    relationError
                                );
                            }
                        }
                    } catch (error) {
                        console.error(
                            `${logPrefix} Error processing license ${license.name}:`,
                            error
                        );
                    }
                }
            }

            // Save game types
            if (data.game_types && data.game_types.length > 0) {
                console.log(
                    `${logPrefix} Saving game types for casino ID: ${casinoId}`
                );

                for (const gameType of data.game_types) {
                    try {
                        // Check if game type exists
                        const { data: existingType } = await supabaseAdmin
                            .from('game_types')
                            .select('id')
                            .ilike('name', gameType)
                            .maybeSingle();

                        let typeId: number;

                        if (existingType) {
                            typeId = existingType.id;
                        } else {
                            // Insert new game type
                            const { data: newType, error } = await supabaseAdmin
                                .from('game_types')
                                .insert({
                                    name: gameType,
                                })
                                .select('id')
                                .single();

                            if (error) {
                                console.error(
                                    `${logPrefix} Error inserting game type:`,
                                    error
                                );
                                continue;
                            }
                            typeId = newType.id;
                        }

                        // Check if relationship already exists
                        const { data: existingRelation } = await supabaseAdmin
                            .from('casino_game_types')
                            .select('id')
                            .eq('casino_id', casinoId)
                            .eq('game_type_id', typeId)
                            .maybeSingle();

                        if (!existingRelation) {
                            // Create relationship
                            const { error: relationError } = await supabaseAdmin
                                .from('casino_game_types')
                                .insert({
                                    casino_id: casinoId,
                                    game_type_id: typeId,
                                });

                            if (relationError) {
                                console.error(
                                    `${logPrefix} Error inserting casino game type relation:`,
                                    relationError
                                );
                            }
                        }
                    } catch (error) {
                        console.error(
                            `${logPrefix} Error processing game type ${gameType}:`,
                            error
                        );
                    }
                }
            }

            // Save game providers
            if (data.game_providers && data.game_providers.length > 0) {
                console.log(
                    `${logPrefix} Saving game providers for casino ID: ${casinoId}`
                );

                for (const provider of data.game_providers) {
                    try {
                        // Check if provider exists by name (case-insensitive)
                        const { data: existingProvider } = await supabaseAdmin
                            .from('game_providers')
                            .select('id, logo_url')
                            .ilike('name', provider.name)
                            .maybeSingle();

                        let providerId: number;

                        if (existingProvider) {
                            providerId = existingProvider.id;

                            // Update the logo URL if it was empty and we now have one
                            if (
                                !existingProvider.logo_url &&
                                provider.logo_url
                            ) {
                                await supabaseAdmin
                                    .from('game_providers')
                                    .update({ logo_url: provider.logo_url })
                                    .eq('id', providerId);
                            }
                        } else {
                            // Insert new provider with both name and logo_url
                            const { data: newProvider, error } =
                                await supabaseAdmin
                                    .from('game_providers')
                                    .insert({
                                        name: provider.name,
                                        logo_url: provider.logo_url,
                                    })
                                    .select('id')
                                    .single();

                            if (error) {
                                console.error(
                                    `${logPrefix} Error inserting game provider:`,
                                    error
                                );
                                continue;
                            }
                            providerId = newProvider.id;
                        }

                        // Check if relationship already exists
                        const { data: existingRelation } = await supabaseAdmin
                            .from('casino_game_providers')
                            .select('id')
                            .eq('casino_id', casinoId)
                            .eq('game_provider_id', providerId)
                            .maybeSingle();

                        if (!existingRelation) {
                            // Create relationship
                            const { error: relationError } = await supabaseAdmin
                                .from('casino_game_providers')
                                .insert({
                                    casino_id: casinoId,
                                    game_provider_id: providerId,
                                });

                            if (relationError) {
                                console.error(
                                    `${logPrefix} Error inserting casino game provider relation:`,
                                    relationError
                                );
                            }
                        }
                    } catch (error) {
                        console.error(
                            `${logPrefix} Error processing game provider ${provider.name}:`,
                            error
                        );
                    }
                }
            }

            // Save languages
            if (data.languages && data.languages.length > 0) {
                console.log(
                    `${logPrefix} Saving languages for casino ID: ${casinoId}`
                );

                // Delete existing language relations for this casino to avoid duplicates
                const { error: deleteError } = await supabaseAdmin
                    .from('casino_languages')
                    .delete()
                    .eq('casino_id', casinoId);

                if (deleteError) {
                    console.error(
                        `${logPrefix} Error deleting existing language relations:`,
                        deleteError
                    );
                }

                for (const language of data.languages) {
                    try {
                        // Check if language exists by name and country code
                        const { data: existingLanguage } = await supabaseAdmin
                            .from('languages')
                            .select('id')
                            .ilike('name', language.name)
                            .eq('country_code', language.country_code)
                            .maybeSingle();

                        let languageId: number;

                        if (existingLanguage) {
                            languageId = existingLanguage.id;
                        } else {
                            // Insert new language
                            const { data: newLanguage, error } =
                                await supabaseAdmin
                                    .from('languages')
                                    .insert({
                                        name: language.name,
                                        country_code: language.country_code,
                                    })
                                    .select('id')
                                    .single();

                            if (error) {
                                console.error(
                                    `${logPrefix} Error inserting language:`,
                                    error
                                );
                                continue;
                            }
                            languageId = newLanguage.id;
                        }

                        // Create relationship
                        const { error: relationError } = await supabaseAdmin
                            .from('casino_languages')
                            .insert({
                                casino_id: casinoId,
                                language_id: languageId,
                                type: language.type,
                            });

                        if (relationError) {
                            console.error(
                                `${logPrefix} Error inserting casino language relation:`,
                                relationError
                            );
                        }
                    } catch (error) {
                        console.error(
                            `${logPrefix} Error processing language ${language.name}:`,
                            error
                        );
                    }
                }
            }

            // Save bonuses
            if (data.bonuses) {
                console.log(
                    `${logPrefix} Saving bonuses for casino ID: ${casinoId}`
                );

                // First, delete any existing bonuses for this casino to avoid duplicates
                const { error: deleteError } = await supabaseAdmin
                    .from('no_bonuses')
                    .delete()
                    .eq('casino_id', casinoId);

                if (deleteError) {
                    console.error(
                        `${logPrefix} Error deleting existing bonuses:`,
                        deleteError
                    );
                } else {
                    console.log(
                        `${logPrefix} Successfully deleted existing bonuses for casino ID:`,
                        casinoId
                    );
                }

                // Save no deposit bonus if exists
                if (data.bonuses.no_deposit) {
                    const noDepositBonus = data.bonuses.no_deposit;
                    console.log(
                        `${logPrefix} Saving no deposit bonus:`,
                        JSON.stringify(noDepositBonus, null, 2)
                    );

                    try {
                        const { data: insertedBonus, error: insertError } =
                            await supabaseAdmin
                                .from('no_bonuses')
                                .insert({
                                    casino_id: casinoId,
                                    type: 'no_deposit',
                                    name:
                                        noDepositBonus.name || 'Unknown Bonus',
                                    name_2: noDepositBonus.name_2,
                                    subtype: noDepositBonus.subtype,
                                    wagering_requirements:
                                        noDepositBonus.wagering_requirements,
                                    free_spins_value:
                                        noDepositBonus.free_spins_value,
                                    free_spins_conditions:
                                        noDepositBonus.free_spins_conditions,
                                    max_cashout: noDepositBonus.max_cashout,
                                    max_bet: noDepositBonus.max_bet,
                                    bonus_expiration:
                                        noDepositBonus.bonus_expiration,
                                    process_speed: noDepositBonus.process_speed,
                                    other_info: noDepositBonus.other_info,
                                })
                                .select();

                        if (insertError) {
                            console.error(
                                `${logPrefix} Error inserting no deposit bonus:`,
                                insertError
                            );
                        } else {
                            console.log(
                                `${logPrefix} Successfully inserted no deposit bonus:`,
                                insertedBonus
                            );
                        }
                    } catch (bonusError) {
                        console.error(
                            `${logPrefix} Exception in no deposit bonus insert:`,
                            bonusError
                        );
                    }
                }

                // Save deposit bonus if exists
                if (data.bonuses.deposit) {
                    const depositBonus = data.bonuses.deposit;
                    console.log(
                        `${logPrefix} Saving deposit bonus:`,
                        JSON.stringify(depositBonus, null, 2)
                    );

                    try {
                        const { data: insertedBonus, error: insertError } =
                            await supabaseAdmin
                                .from('no_bonuses')
                                .insert({
                                    casino_id: casinoId,
                                    type: 'deposit',
                                    name: depositBonus.name || 'Unknown Bonus',
                                    name_2: depositBonus.name_2,
                                    subtype: depositBonus.subtype,
                                    min_deposit: depositBonus.min_deposit,
                                    max_cashout: depositBonus.max_cashout,
                                    wagering_requirements:
                                        depositBonus.wagering_requirements,
                                    max_bet: depositBonus.max_bet,
                                    bonus_expiration:
                                        depositBonus.bonus_expiration,
                                    process_speed: depositBonus.process_speed,
                                    free_spins_value:
                                        depositBonus.free_spins_value,
                                    free_spins_conditions:
                                        depositBonus.free_spins_conditions,
                                    other_info: depositBonus.other_info,
                                })
                                .select();

                        if (insertError) {
                            console.error(
                                `${logPrefix} Error inserting deposit bonus:`,
                                insertError
                            );
                        } else {
                            console.log(
                                `${logPrefix} Successfully inserted deposit bonus:`,
                                insertedBonus
                            );
                        }
                    } catch (bonusError) {
                        console.error(
                            `${logPrefix} Exception in deposit bonus insert:`,
                            bonusError
                        );
                    }
                }
            } else {
                console.log(
                    `${logPrefix} No bonus data found for casino ID: ${casinoId}`
                );
            }

            // Save screenshots
            if (data.screenshots && data.screenshots.length > 0) {
                console.log(
                    `${logPrefix} Saving screenshots for casino ID: ${casinoId}`
                );

                // First, delete any existing screenshots for this casino to avoid duplicates
                const { error: deleteError } = await supabaseAdmin
                    .from('screenshots')
                    .delete()
                    .eq('casino_id', casinoId);

                if (deleteError) {
                    console.error(
                        `${logPrefix} Error deleting existing screenshots:`,
                        deleteError
                    );
                }

                // Save each screenshot
                for (const screenshot of data.screenshots) {
                    try {
                        const { error: insertError } = await supabaseAdmin
                            .from('screenshots')
                            .insert({
                                casino_id: casinoId,
                                url: screenshot.url,
                                alt_text: screenshot.alt_text,
                            });

                        if (insertError) {
                            console.error(
                                `${logPrefix} Error inserting screenshot:`,
                                insertError
                            );
                        }
                    } catch (error) {
                        console.error(
                            `${logPrefix} Error processing screenshot ${screenshot.url}:`,
                            error
                        );
                    }
                }
            }
        } catch (error) {
            console.error(`${logPrefix} Error saving related data:`, error);
            throw error;
        }
    }
}
