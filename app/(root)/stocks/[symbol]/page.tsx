import { headers } from 'next/headers';
import { auth } from '@/lib/better-auth/auth';
import { isInWatchlist } from '@/lib/actions/watchlist.actions';
import TradingViewWidget from '@/components/TradingViewWidget';
import WatchlistButton from '@/components/WatchlistButton';
import {
    SYMBOL_INFO_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG,
    BASELINE_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
    COMPANY_FINANCIALS_WIDGET_CONFIG,
} from '@/lib/constants';

interface StockDetailsProps {
  params: {
    symbol: string;
  };
}

const StockDetails = async ({ params }: StockDetailsProps) => {
    const { symbol } = params;
    const symbolUpper = symbol.toUpperCase();
    // …
    
    // Get user session
    const authInstance = await auth;
    const session = await authInstance.api.getSession({ headers: await headers() });
    
    // Check if stock is in user's watchlist
    let userIsInWatchlist = false;
    if (session?.user?.email) {
        userIsInWatchlist = await isInWatchlist(session.user.email, symbolUpper);
    }

    // For now, we'll use the symbol as company name - in a real app you'd fetch this from an API
    const companyName = symbolUpper;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-6">
                {/* Header with stock symbol and company name */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{symbolUpper}</h1>
                            <p className="text-gray-400 text-lg">{companyName}</p>
                        </div>
                        {session?.user?.email && (
                            <div className="flex items-center gap-4">
                                <WatchlistButton
                                    symbol={symbolUpper}
                                    company={companyName}
                                    userEmail={session.user.email}
                                    initialIsInWatchlist={userIsInWatchlist}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Symbol Info Widget */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <TradingViewWidget
                                title="Symbol Info"
                                scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
                                config={SYMBOL_INFO_WIDGET_CONFIG(symbolUpper)}
                                height={170}
                            />
                        </div>

                        {/* Candle Chart Widget */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <TradingViewWidget
                                title="Price Chart"
                                scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                                config={CANDLE_CHART_WIDGET_CONFIG(symbolUpper)}
                                height={600}
                            />
                        </div>

                        {/* Baseline Widget */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <TradingViewWidget
                                title="Performance"
                                scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                                config={BASELINE_WIDGET_CONFIG(symbolUpper)}
                                height={600}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Technical Analysis Widget */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <TradingViewWidget
                                title="Technical Analysis"
                                scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
                                config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbolUpper)}
                                height={400}
                            />
                        </div>

                        {/* Company Profile Widget */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <TradingViewWidget
                                title="Company Profile"
                                scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js"
                                config={COMPANY_PROFILE_WIDGET_CONFIG(symbolUpper)}
                                height={440}
                            />
                        </div>

                        {/* Company Financials Widget */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <TradingViewWidget
                                title="Financials"
                                scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-financials.js"
                                config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbolUpper)}
                                height={464}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetails;