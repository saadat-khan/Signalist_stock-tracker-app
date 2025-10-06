import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getFullWatchlist } from "@/lib/actions/watchlist.actions";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import WatchlistButton from "@/components/WatchlistButton";
import WatchlistHeader from "@/components/WatchlistHeader";
import CreateAlertDialog from "@/components/CreateAlertDialog";
import CompanyLogo from "@/components/CompanyLogo";
import ScrollableAlerts from "@/components/ScrollableAlerts";

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

export default async function WatchlistPage() {
  const authInstance = await auth;
  const session = await authInstance.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/sign-in");

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };

  const watchlistItems = await getFullWatchlist(user.email);
  const initialStocks = await searchStocks();

  // For now, we'll use mock data for stock prices - you can integrate with Finnhub API later
  const watchlistWithPrices: WatchlistStock[] = watchlistItems.map((item, index) => ({
    symbol: item.symbol,
    company: item.company,
    logoUrl: item.logoUrl,
    officialName: item.officialName,
    price: 100 + (index * 15.5), // Mock price
    change: (Math.random() - 0.5) * 10, // Mock change
    changePercent: (Math.random() - 0.5) * 5, // Mock percentage
    marketCap: `$${(Math.random() * 1000 + 50).toFixed(1)}B`, // Mock market cap
    peRatio: (Math.random() * 30 + 10).toFixed(1), // Mock P/E ratio
    addedAt: item.addedAt,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <WatchlistHeader user={user} initialStocks={initialStocks} />

      {/* Alerts Section */}
      {watchlistWithPrices.length > 0 && (
        <ScrollableAlerts 
          watchlistStocks={watchlistWithPrices} 
          userEmail={user.email}
        />
      )}

      {/* Watchlist Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Your Watchlist ({watchlistWithPrices.length})</h2>
        </div>
        
        {watchlistWithPrices.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">Your watchlist is empty</div>
            <Link href="/">
              <Button variant="outline">Browse Stocks</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead 
                  className="text-gray-300 text-left" 
                  title="Company name and stock symbol - Click to view detailed stock information"
                >
                  Company
                </TableHead>
                <TableHead 
                  className="text-gray-300 text-center" 
                  title="Current stock price per share in USD"
                >
                  Price
                </TableHead>
                <TableHead 
                  className="text-gray-300 text-center" 
                  title="Price change percentage from previous close - Green indicates gains, Red indicates losses"
                >
                  Change
                </TableHead>
                <TableHead 
                  className="text-gray-300 text-center" 
                  title="Market Capitalization - Total value of all company shares (Price × Total Shares)"
                >
                  Market Cap
                </TableHead>
                <TableHead 
                  className="text-gray-300 text-center" 
                  title="Price-to-Earnings Ratio - Current price divided by earnings per share over the last 12 months"
                >
                  P/E Ratio
                </TableHead>
                <TableHead 
                  className="text-gray-300 text-center" 
                  title="Create price alerts to get notified when stock reaches your target price or meets technical conditions"
                >
                  Alert
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlistWithPrices.map((stock) => (
                <TableRow key={stock.symbol} className="border-gray-800 hover:bg-gray-800/30">
                  <TableCell className="text-left">
                    <div className="flex items-center gap-3">
                      <CompanyLogo 
                        logoUrl={stock.logoUrl}
                        symbol={stock.symbol}
                        companyName={stock.officialName || stock.company}
                        size="md"
                      />
                      <div className="flex flex-col">
                        <Link href={`/stocks/${stock.symbol}`} className="text-white hover:text-yellow-400 font-medium">
                          {stock.officialName || stock.company}
                        </Link>
                        <span className="text-xs text-gray-400">{stock.symbol}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-semibold text-center">${stock.price?.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <div className={`flex items-center justify-center gap-1 ${stock.changePercent! > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.changePercent! > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span>{stock.changePercent! > 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 text-center">{stock.marketCap}</TableCell>
                  <TableCell className="text-gray-300 text-center">{stock.peRatio}</TableCell>
                  <TableCell className="text-center">
                    <CreateAlertDialog 
                      symbol={stock.symbol}
                      company={stock.company}
                      user={user}
                      trigger={<Button variant="outline" size="sm" className="text-xs">Add Alert</Button>}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
