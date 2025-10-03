import {inngest} from "@/lib/inngest/client";
import {NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendNewsSummaryEmail, sendWelcomeEmail} from "@/lib/nodemailer";
import {getAllUsersForNewEmail} from "@/lib/actions/user.actions";
import {getWatchlistSymbolsByEmail} from "@/lib/actions/watchlist.actions";
import {getNews} from "@/lib/actions/finnhub.actions";
import {formatDateToday} from "@/lib/utils";
import {getAllActiveAlerts} from "@/lib/actions/alert.actions";

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created'},
    async ({ event, step }) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt }
                        ]
                    }]
            }
        })
        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) ||'Thanks for joining Signalist. You now have the tools to track markets and make smarter decisions.'

            const { data: { email, name } } = event;
            return await sendWelcomeEmail({ email, name, intro: introText })
        })
        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary' },
    [ { event: 'app/send.daily.news' }, { cron: '0 12 * * *' } ],
    async ({ step }) => {
        // Step 1: Get all users for news email
        const users = await step.run("get-all-users", async () => {
            return await getAllUsersForNewEmail();
        });

        if (!users || users.length === 0) {
            return { success: false, message: 'No users found for news email.' };
        }

        // Step 2: Process each user - get watchlist and fetch news
        const results = [];
        for (const user of users) {
            const result = await step.run(`process-user-${user.id}`, async () => {
                try {
                    // Get user's watchlist symbols
                    const symbols = await getWatchlistSymbolsByEmail(user.email);

                    // Fetch news (either for their symbols or general if no watchlist)
                    const news = await getNews(symbols.length > 0 ? symbols : undefined);

                    // Limit to 6 articles max per user
                    const limitedNews = news.slice(0, 6);

                    // Store news for this user (will be used in next steps)
                    return {
                        user: user,
                        articles: limitedNews,
                        watchlistSymbols: symbols
                    };
                }
                catch (error) {
                    console.error(`Error processing user ${user.email}:`, error);
                    return null;
                }
            });
            if (result) results.push(result);
        }

        // Step 3: Placeholder for AI news summarization
        const userNewsSummaries: { user: User; newsContent: string | null }[] = [];

        for ( const { user, articles } of results ) {
            let response: any;
            try {
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));
                response = await step.ai.infer(`summarize-news-${user.email}`, {
                    model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
                    body: {
                        contents: [{ role: 'user', parts: [{ text: prompt }] }]
                    }
                })
            }
            catch (error) {
                console.error('Failed to summarize news for :', user.email);
                userNewsSummaries.push({ user, newsContent: null });
                continue;
            }

            const part = response.candidates?.[0]?.content?.parts?.[0];
            const newsContent = (part && 'text' in part ? part.text : null) || 'No market news.';

            userNewsSummaries.push({ user, newsContent });
        }

        // Step 4: Placeholder for sending emails
        await step.run("send-news-emails", async () => {
            await Promise.all(
                userNewsSummaries.map(async ({ user, newsContent }) => {
                    if (!newsContent) return false;

                    return await sendNewsSummaryEmail({ email: user.email, date: formatDateToday, newsContent });
                })
            )
            console.log("Email sending placeholder");
            return { emailsSent: users.length };
        });

        return {
            success: true,
            message: `Daily news summary processed for ${users.length} users`
        };
    }
)

export const checkStockAlerts = inngest.createFunction(
    { id: 'check-stock-alerts' },
    [ { cron: '*/15 * * * *' } ], // Check every 15 minutes during market hours
    async ({ step }) => {
        // Step 1: Get all active alerts
        const alerts = await step.run("get-active-alerts", async () => {
            return await getAllActiveAlerts();
        });

        if (!alerts || alerts.length === 0) {
            return { success: true, message: 'No active alerts to check.' };
        }

        // Step 2: Group alerts by symbol for efficient API calls
        type Alert = {
            symbol: string;
            condition: {
                type: string;
                value?: number;
            };
            userId: string;
            // Add other properties as needed
        };
        const symbolGroups: Record<string, Alert[]> = {};
        (alerts as Alert[]).forEach((alert: Alert) => {
            if (!symbolGroups[alert.symbol]) {
                symbolGroups[alert.symbol] = [];
            }
            symbolGroups[alert.symbol].push(alert);
        });

        const triggeredAlerts: Array<{
            alert: typeof alerts[0];
            message: string;
            symbol: string;
            marketData: any;
        }> = [];

        // Step 3: Check each symbol's conditions
        for (const symbol of Object.keys(symbolGroups)) {
            const symbolAlerts = symbolGroups[symbol];
            
            await step.run(`check-${symbol}`, async () => {
                try {
                    // Here you would fetch real market data from your API
                    // For now, we'll use mock data to demonstrate the logic
                    const mockMarketData = {
                        price: 150 + (Math.random() - 0.5) * 20, // Random price around 150
                        rsi: Math.random() * 100, // Random RSI
                        volume: Math.random() * 1000000,
                        previousVolume: Math.random() * 800000
                    };

                    for (const alert of symbolAlerts) {
                        let shouldTrigger = false;
                        let alertMessage = '';

                        switch (alert.condition.type) {
                            case 'rsi_oversold':
                                if (mockMarketData.rsi < 30) {
                                    shouldTrigger = true;
                                    alertMessage = `${symbol} is oversold (RSI: ${mockMarketData.rsi.toFixed(2)}) - Consider buying!`;
                                }
                                break;
                            case 'rsi_overbought':
                                if (mockMarketData.rsi > 70) {
                                    shouldTrigger = true;
                                    alertMessage = `${symbol} is overbought (RSI: ${mockMarketData.rsi.toFixed(2)}) - Consider selling!`;
                                }
                                break;
                            case 'price_above':
                                if (alert.condition.value && mockMarketData.price > alert.condition.value) {
                                    shouldTrigger = true;
                                    alertMessage = `${symbol} price ($${mockMarketData.price.toFixed(2)}) is above your target of $${alert.condition.value}`;
                                }
                                break;
                            case 'price_below':
                                if (alert.condition.value && mockMarketData.price < alert.condition.value) {
                                    shouldTrigger = true;
                                    alertMessage = `${symbol} price ($${mockMarketData.price.toFixed(2)}) is below your target of $${alert.condition.value}`;
                                }
                                break;
                            case 'volume_spike':
                            case 'volume_spike': {
                                const baseVolume = mockMarketData.previousVolume || 0;
                                if (baseVolume === 0) break;
                                const volumeIncrease = mockMarketData.volume / baseVolume;
                                if (volumeIncrease > 2) {
                                    shouldTrigger = true;
                                    alertMessage = `${symbol} has unusual volume activity (${volumeIncrease.toFixed(1)}x increase)`;
                                }
                                break;
                            }
                                break;
                        }

                        if (shouldTrigger) {
                            triggeredAlerts.push({
                                alert,
                                message: alertMessage,
                                symbol,
                                marketData: mockMarketData
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error checking alerts for ${symbol}:`, error);
                }
            });
        }

        // Step 4: Send alert emails for triggered alerts
        if (triggeredAlerts.length > 0) {
            await step.run("send-alert-emails", async () => {
                // Group by user to send consolidated emails
                const userAlerts = triggeredAlerts.reduce((acc, { alert, message }) => {
                    const typedAlert = alert as Alert;
                    if (!acc[typedAlert.userId]) {
                        acc[typedAlert.userId] = [];
                    }
                    acc[typedAlert.userId].push(message);
                    return acc;
                }, {} as Record<string, string[]>);

                // Get user emails and send alerts
                for (const userId of Object.keys(userAlerts)) {
                    try {
                        // Here you would get user email from userId
                        // For demo, we'll just log the alerts
                        console.log(`Alerts for user ${userId}:`, userAlerts[userId]);
                        
                        // TODO: Send actual email using your email service
                        // await sendAlertEmail({
                        //     email: userEmail,
                        //     alerts: userAlerts[userId]
                        // });
                    } catch (error) {
                        console.error(`Failed to send alert email to user ${userId}:`, error);
                    }
                }

                return { emailsSent: Object.keys(userAlerts).length };
            });
        }

        return {
            success: true,
            message: `Checked ${alerts.length} alerts, triggered ${triggeredAlerts.length} notifications`
        };
    }
)