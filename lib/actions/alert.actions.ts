'use server';

import { connectToDatabase } from '@/database/mongoose';
import { StockAlertModel, type StockAlert } from '@/database/models/stockAlert.model';

export async function createStockAlert(
    email: string, 
    symbol: string, 
    company: string, 
    alertType: 'buy' | 'sell' | 'price_target' | 'technical',
    condition: StockAlert['condition']
): Promise<{ success: boolean; message: string; alertId?: string }> {
    if (!email || !symbol || !company) {
        return { success: false, message: 'Missing required parameters' };
    }

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Get user
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) {
            return { success: false, message: 'Invalid user ID' };
        }

        // Create the alert
        const alert = await StockAlertModel.create({
            userId,
            symbol: symbol.toUpperCase(),
            company: company.trim(),
            alertType,
            condition,
            isActive: true,
        });

        return { 
            success: true, 
            message: 'Alert created successfully', 
            alertId: String(alert._id)
        };
    }
    catch (err) {
        console.error('createStockAlert error:', err);
        return { success: false, message: 'Failed to create alert' };
    }
}

export async function getUserAlerts(email: string): Promise<StockAlert[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const alerts = await StockAlertModel.find({ userId, isActive: true }).sort({ createdAt: -1 }).lean();
        return alerts;
    }
    catch (err) {
        console.error('getUserAlerts error:', err);
        return [];
    }
}

export async function toggleAlert(email: string, alertId: string): Promise<{ success: boolean; message: string }> {
    if (!email || !alertId) {
        return { success: false, message: 'Missing required parameters' };
    }

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) {
            return { success: false, message: 'Invalid user ID' };
        }

        const alert = await StockAlertModel.findOne({ _id: alertId, userId });
        if (!alert) {
            return { success: false, message: 'Alert not found' };
        }

        alert.isActive = !alert.isActive;
        await alert.save();

        return { 
            success: true, 
            message: `Alert ${alert.isActive ? 'activated' : 'deactivated'} successfully` 
        };
    }
    catch (err) {
        console.error('toggleAlert error:', err);
        return { success: false, message: 'Failed to update alert' };
    }
}

export async function deleteAlert(email: string, alertId: string): Promise<{ success: boolean; message: string }> {
    if (!email || !alertId) {
        return { success: false, message: 'Missing required parameters' };
    }

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) {
            return { success: false, message: 'Invalid user ID' };
        }

        const result = await StockAlertModel.deleteOne({ _id: alertId, userId });
        
        if (result.deletedCount === 0) {
            return { success: false, message: 'Alert not found' };
        }

        return { success: true, message: 'Alert deleted successfully' };
    }
    catch (err) {
        console.error('deleteAlert error:', err);
        return { success: false, message: 'Failed to delete alert' };
    }
}

// Function to get all active alerts for monitoring
export async function getAllActiveAlerts(): Promise<StockAlert[]> {
    try {
        await connectToDatabase();
        const alerts = await StockAlertModel.find({ isActive: true }).lean();
        return alerts;
    }
    catch (err) {
        console.error('getAllActiveAlerts error:', err);
        return [];
    }
}