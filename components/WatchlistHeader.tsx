'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SearchCommand from "@/components/SearchCommand";
import CreateAlertDialog from "@/components/CreateAlertDialog";

interface WatchlistHeaderProps {
  user: { id: string; name: string; email: string };
  initialStocks: StockWithWatchlistStatus[];
}

export default function WatchlistHeader({ user, initialStocks }: WatchlistHeaderProps) {
  const [triggerSearch, setTriggerSearch] = useState(false);

  const handleAddStock = async () => {
    setStocks(initialStocks);
  };

  const handleSearchOpenChange = () => {
    setTriggerSearch(false);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Watchlist</h1>
          <p className="text-gray-400">Track your favorite stocks and their performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddStock}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Stock
          </Button>
          <CreateAlertDialog user={user} />
        </div>
      </div>
      
      {/* Hidden SearchCommand that can be triggered externally */}
      <div style={{ display: 'none' }}>
        <SearchCommand
          renderAs="button"
          label="Search"
          initialStocks={initialStocks}
          user={user}
          triggerOpen={triggerSearch}
          onOpenChange={handleSearchOpenChange}
        />
      </div>
    </>
  );
}

function setStocks(initialStocks: StockWithWatchlistStatus[]) {
  throw new Error("Function not implemented.");
}
