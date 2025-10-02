'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    }
    catch (err) {
        console.error('getWatchlistSymbolsByEmail error:', err);
        return [];
    }
}

export async function addToWatchlist(email: string, symbol: string, company: string): Promise<{ success: boolean; message: string }> {
    if (!email || !symbol || !company) {
        return { success: false, message: 'Missing required parameters' };
    }

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) {
            return { success: false, message: 'Invalid user ID' };
        }

        // Check if already exists
        const existingItem = await Watchlist.findOne({ userId, symbol: symbol.toUpperCase() });
        if (existingItem) {
            return { success: false, message: 'Stock is already in your watchlist' };
        }

        // Add to watchlist
        await Watchlist.create({
            userId,
            symbol: symbol.toUpperCase(),
            company: company.trim(),
        });

        return { success: true, message: 'Added to watchlist successfully' };
    }
    catch (err) {
        console.error('addToWatchlist error:', err);
        return { success: false, message: 'Failed to add to watchlist' };
    }
}

export async function removeFromWatchlist(email: string, symbol: string): Promise<{ success: boolean; message: string }> {
    if (!email || !symbol) {
        return { success: false, message: 'Missing required parameters' };
    }

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) {
            return { success: false, message: 'Invalid user ID' };
        }

        // Remove from watchlist
        const result = await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });
        
        if (result.deletedCount === 0) {
            return { success: false, message: 'Stock not found in your watchlist' };
        }

        return { success: true, message: 'Removed from watchlist successfully' };
    }
    catch (err) {
        console.error('removeFromWatchlist error:', err);
        return { success: false, message: 'Failed to remove from watchlist' };
    }
}

export async function isInWatchlist(email: string, symbol: string): Promise<boolean> {
    if (!email || !symbol) return false;

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return false;

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return false;

        const item = await Watchlist.findOne({ userId, symbol: symbol.toUpperCase() });
        return !!item;
    }
    catch (err) {
        console.error('isInWatchlist error:', err);
        return false;
    }
}