import {inngest} from "@/lib/inngest/client";
import {NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendNewsSummaryEmail, sendWelcomeEmail} from "@/lib/nodemailer";
import {getAllUsersForNewEmail} from "@/lib/actions/user.actions";
import {getWatchlistSymbolsByEmail} from "@/lib/actions/watchlist.actions";
import {getNews} from "@/lib/actions/finnhub.actions";
import {formatDateToday} from "@/lib/utils";

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
            const results = await Promise.all(
                userNewsSummaries.map(async ({ user, newsContent }) => {
                    if (!newsContent) return null;

                    try {
                        await sendNewsSummaryEmail({ email: user.email, date: formatDateToday, newsContent });
                        return true;
                    } catch (error) {
                        console.error(`Failed to send email to ${user.email}:`, error);
                        return null;
                    }
                })
            );
            const emailsSent = results.filter(r => r === true).length;
            console.log(`Successfully sent ${emailsSent} emails`);
            return { emailsSent };
        });

        return {
            success: true,
            message: `Daily news summary processed for ${users.length} users`
        };
    }
)