'use client';

import CompanyLogo from "@/components/CompanyLogo";
import WatchlistButton from "@/components/WatchlistButton";

interface WatchlistStock {
  symbol: string;
  company: string;
  logoUrl?: string | null;
  officialName?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  marketCap?: string;
  peRatio?: string;
  addedAt: Date;
}

interface ScrollableAlertsProps {
  watchlistStocks: WatchlistStock[];
  userEmail: string;
}

export default function ScrollableAlerts({ watchlistStocks, userEmail }: ScrollableAlertsProps) {
  return (
    <div 
      className="horizontal-scroll-container overflow-x-auto"
      onWheel={(e) => {
        e.preventDefault();
        const container = e.currentTarget;
        const scrollAmount = e.deltaY * 2; // Adjust scroll speed
        container.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }}
    >
      <div className="flex gap-4 pb-2 min-w-max">
        {watchlistStocks.map((stock) => (
          <div key={`alert-${stock.symbol}`} className="bg-gray-800 rounded-lg p-4 border border-gray-700 min-w-[280px] flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CompanyLogo 
                  logoUrl={stock.logoUrl}
                  symbol={stock.symbol}
                  companyName={stock.officialName || stock.company}
                  size="md"
                />
                <span className="text-white font-medium">{stock.symbol}</span>
              </div>
              <div className="flex items-center gap-1">
                <WatchlistButton 
                  symbol={stock.symbol} 
                  company={stock.company} 
                  userEmail={userEmail}
                  logoUrl={stock.logoUrl}
                  officialName={stock.officialName}
                  initialIsInWatchlist={true}
                  type="icon"
                />
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-1">Alert:</div>
            <div className="text-white font-semibold">${stock.price?.toFixed(2)}</div>
            <div className={`text-sm ${stock.changePercent! > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stock.changePercent! > 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}