'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addToWatchlist, removeFromWatchlist } from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WatchlistButtonProps {
    symbol: string;
    company: string;
    userEmail: string;
    initialIsInWatchlist?: boolean;
    type?: 'button' | 'icon';
    onWatchlistChange?: (symbol: string, isAdded: boolean) => void;
}

const WatchlistButton = ({
    symbol,
    company,
    userEmail,
    initialIsInWatchlist = false,
    type = 'button',
    onWatchlistChange,
}: WatchlistButtonProps) => {
    const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
    const [isPending, startTransition] = useTransition();

    const handleWatchlistToggle = () => {
        if (!userEmail) {
            toast.error('Please sign in to manage your watchlist');
            return;
        }

        startTransition(async () => {
            try {
                let result;
                if (isInWatchlist) {
                    result = await removeFromWatchlist(userEmail, symbol);
                } else {
                    result = await addToWatchlist(userEmail, symbol, company);
                }

                if (result.success) {
                    setIsInWatchlist(!isInWatchlist);
                    onWatchlistChange?.(symbol, !isInWatchlist);
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                console.error('Watchlist toggle error:', error);
                toast.error('Something went wrong. Please try again.');
            }
        });
    };

    if (type === 'icon') {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={handleWatchlistToggle}
                disabled={isPending}
                className={cn(
                    'h-8 w-8 rounded-full transition-colors',
                    isInWatchlist ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
                )}
                title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                aria-pressed={isInWatchlist}
            >
                <Star
                    className={cn(
                        'h-4 w-4 transition-all',
                        isInWatchlist && 'fill-current'
                    )}
                />
            </Button>
        );
    }

    return (
        <Button
            onClick={handleWatchlistToggle}
            disabled={isPending}
            variant={isInWatchlist ? 'secondary' : 'default'}
            className={cn(
                'flex items-center gap-2 transition-all',
                isInWatchlist
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
            aria-pressed={isInWatchlist}
        >
            <Star
                className={cn(
                    'h-4 w-4 transition-all',
                    isInWatchlist && 'fill-current'
                )}
            />
            {isPending
                ? 'Loading...'
                : isInWatchlist
                ? 'Remove from Watchlist'
                : 'Add to Watchlist'
            }
        </Button>
    );
};

export default WatchlistButton;