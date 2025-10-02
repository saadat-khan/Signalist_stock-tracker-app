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
import {Loader, Loader2, TrendingUp} from "lucide-react";
import Link from "next/link";
import {searchStocks} from "@/lib/actions/finnhub.actions";
import {useDebounce} from "@/hooks/useDebounce";

"use client";

import {useState, useEffect, useCallback} from "react";
import type { StockWithWatchlistStatus } from "@/lib/actions/finnhub.actions";
import {
  CommandDialog,
  CommandInput,
  // …other imports
} from "your-command-library";
import {useDebounce} from "@/hooks/useDebounce";

interface SearchCommandProps {
  renderAs?: 'button' | 'text';
  label?: string;
  initialStocks: StockWithWatchlistStatus[];
}

export default function SearchCommand(
  { renderAs = 'button', label = "Add stock", initialStocks }: SearchCommandProps
) {
  // …component implementation
}
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = async () => {
      if(!isSearchMode) return setStocks(initialStocks);

      setLoading(true);
      try {
          const results= await searchStocks(searchTerm.trim());
          setStocks(results);
      }
      catch {
          setStocks([])
      }
      finally {
          setLoading(false);
      }
  }

  const debouncedSearch = useDebounce(handleSearch, 300);

    useEffect(() => {
        debouncedSearch();
    }, [searchTerm]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  };

  return (
    <>
        {renderAs === "text" ? (
            <span onClick={() => setOpen(true)} className="search-text">
                {label}
            </span>
        ):(
            <Button onClick={() => setOpen(true)} className="search-btn">
                {label}
            </Button>
        )}
        <CommandDialog open={open} onOpenChange={setOpen} className="search-dialogue">
            <div className="search-field">
                <CommandInput
                placeholder="Search stocks..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="search-input"
                />
                {loading && <Loader2 className="search-loader"/>}
            </div>
            <CommandList className="search-list">
                {loading ? (
                    <CommandEmpty className="search-list-empty">Loading stocks...</CommandEmpty>
                ) : displayStocks?.length === 0 ? (
                    <div className="search-list-indicator">
                        {isSearchMode ? "No results found" : "No stocks found."}
                    </div>
                ) : (
                        <ul>
                            <div className="search-count">
                                {isSearchMode ? "Search results" : "Popular stocks"}
                                {` `}({displayStocks?.length || 0})
                            </div>
                            {displayStocks?.map((stock, i) => (
                                <li key={stock.symbol} className="search-item">
                                    <Link
                                        href={`/stocks/${stock.symbol}`}
                                        onClick={handleSelectStock}
                                        className="search-tiem-link"
                                    >
                                        <TrendingUp className="h-4 w-4 text-gray-500" />
                                        <div className="flex-1">
                                            {stock.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {stock.symbol} | {stock.exchange} | {stock.type}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )
                }
                <CommandGroup heading="Stocks">
                    <CommandItem onSelect={handleSelectStock}>
                        Sample Stock
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    </>
  );
}