"use client";

import {useState, useEffect, useCallback} from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "./ui/button";
import {Loader, Loader2, TrendingUp, Star} from "lucide-react";
import Link from "next/link";
import {useDebounce} from "@/hooks/useDebounce";
import { addToWatchlist, removeFromWatchlist, getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";
import CompanyLogo from "@/components/CompanyLogo";

interface SearchCommandProps {
  renderAs?: 'button' | 'text';
  label?: string;
  initialStocks: StockWithWatchlistStatus[];
  user?: { id: string; email: string; name: string };
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SearchCommand(
  { renderAs = 'button', label = "Add stock", initialStocks, user, triggerOpen, onOpenChange }: SearchCommandProps
) {
  const [open, setOpen] = useState(false);

  // Handle external trigger
  useEffect(() => {
    if (triggerOpen) {
      setOpen(true);
      onOpenChange?.(false); // Reset the trigger
    }
  }, [triggerOpen, onOpenChange]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  // Update initial stocks with watchlist status when component mounts or user changes
  useEffect(() => {
    const updateInitialStocksWithWatchlist = async () => {
      if (!user?.email || initialStocks.length === 0) {
        setStocks(initialStocks);
        return;
      }

      try {
        const watchlistSymbols = await getWatchlistSymbolsByEmail(user.email);
        const updatedInitialStocks = initialStocks.map(stock => ({
          ...stock,
          isInWatchlist: watchlistSymbols.includes(stock.symbol)
        }));
        setStocks(updatedInitialStocks);
      } catch (error) {
        console.error('Error updating initial stocks with watchlist:', error);
        setStocks(initialStocks);
      }
    };

    if (!isSearchMode) {
      updateInitialStocksWithWatchlist();
    }
  }, [initialStocks, user?.email, isSearchMode]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  const handleSearch = useCallback(async () => {
    if (!isSearchMode) return setStocks(initialStocks);

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      let searchResults = data.results || [];
      
      // Update watchlist status if user is logged in
      if (user?.email && searchResults.length > 0) {
        try {
          const watchlistSymbols = await getWatchlistSymbolsByEmail(user.email);
          searchResults = searchResults.map((stock: StockWithWatchlistStatus) => ({
            ...stock,
            isInWatchlist: watchlistSymbols.includes(stock.symbol)
          }));
        } catch (error) {
          console.error('Error checking watchlist status:', error);
          // Continue with original results if watchlist check fails
        }
      }
      
      setStocks(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, initialStocks, user?.email]);

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, debouncedSearch]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  };

  const handleStarClick = async (stock: StockWithWatchlistStatus, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.email) {
      toast.error("Please sign in to add stocks to watchlist");
      return;
    }

    try {
      let result;
      if (stock.isInWatchlist) {
        result = await removeFromWatchlist(user.email, stock.symbol);
      } else {
        result = await addToWatchlist(
          user.email, 
          stock.symbol, 
          stock.name, 
          stock.logoUrl, 
          stock.officialName
        );
      }

      if (result.success) {
        // Update the local state
        const updatedStocks = stocks.map(s => 
          s.symbol === stock.symbol 
            ? { ...s, isInWatchlist: !s.isInWatchlist }
            : s
        );
        setStocks(updatedStocks);
        
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Watchlist error:', error);
      toast.error('Failed to update watchlist');
    }
  };

  return (
    <>
      {renderAs === "text" ? (
        <span onClick={() => setOpen(true)} className="search-text cursor-pointer hover:text-gray-300">
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className="search-btn">
          {label}
        </Button>
      )}
      
      {/* Custom Modal Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-20"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)', // For Safari support
            backgroundColor: 'rgba(0, 0, 0, 0.25)'
          }}
          onClick={() => setOpen(false)}
        >
          <div 
            className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 border border-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by symbol or company name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-gray-500"
                  autoFocus
                />
                {loading && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400"/>}
                <button 
                  onClick={() => setOpen(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  style={{ display: loading ? 'none' : 'block' }}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400">Loading stocks...</div>
              ) : displayStocks?.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  {isSearchMode ? "No results found" : "No stocks found."}
                </div>
              ) : (
                <div className="p-4">
                  <div className="mb-4 text-sm text-gray-400">
                    {isSearchMode ? "Search Results" : "Popular Stocks"} ({displayStocks?.length || 0})
                  </div>
                  <div className="space-y-2">
                    {displayStocks?.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg group">
                        <Link
                          href={`/stocks/${stock.symbol}`}
                          onClick={handleSelectStock}
                          className="flex items-center gap-3 flex-1"
                        >
                          <CompanyLogo 
                            logoUrl={stock.logoUrl}
                            symbol={stock.symbol}
                            companyName={stock.officialName || stock.name}
                            size="sm"
                          />
                          <div className="flex-1">
                            <div className="text-white font-medium">{stock.officialName || stock.name}</div>
                            <div className="text-sm text-gray-400">
                              {stock.symbol} • {stock.exchange} • {stock.type}
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={(e) => handleStarClick(stock, e)}
                          className="p-2 rounded hover:bg-gray-600 transition-colors flex-shrink-0"
                        >
                          <Star 
                            className={`h-5 w-5 ${
                              stock.isInWatchlist ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}