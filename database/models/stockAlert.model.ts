import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface StockAlert extends Document {
    userId: string;
    symbol: string;
    company: string;
    alertType: 'buy' | 'sell' | 'price_target' | 'technical';
    condition: {
        type: 'price_above' | 'price_below' | 'rsi_oversold' | 'rsi_overbought' | 'volume_spike' | 'moving_average_cross';
        value?: number; // for price targets
        timeframe?: '1D' | '5D' | '1M' | '3M'; // for technical analysis
    };
    isActive: boolean;
    triggeredAt?: Date;
    createdAt: Date;
}

const StockAlertSchema = new Schema<StockAlert>(
    {
        userId: { type: String, required: true, index: true },
        symbol: { type: String, required: true, uppercase: true, trim: true },
        company: { type: String, required: true, trim: true },
        alertType: { 
            type: String, 
            required: true, 
            enum: ['buy', 'sell', 'price_target', 'technical'] 
        },
        condition: {
            type: {
                type: String,
                required: true,
                enum: ['price_above', 'price_below', 'rsi_oversold', 'rsi_overbought', 'volume_spike', 'moving_average_cross']
            },
            value: { 
                type: Number,
                required(this: StockAlert) {
                    return ['price_above', 'price_below'].includes(this.condition?.type);
                }
            },
            timeframe: { 
                type: String, 
                enum: ['1D', '5D', '1M', '3M'],
                default: '1D'
            }
        }
        },
        isActive: { type: Boolean, default: true },
        triggeredAt: { type: Date },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

// Index for efficient queries
StockAlertSchema.index({ userId: 1, symbol: 1 });
StockAlertSchema.index({ isActive: 1 });
StockAlertSchema.index({ 'condition.type': 1 });

export const StockAlertModel: Model<StockAlert> =
    (models?.StockAlert as Model<StockAlert>) || model<StockAlert>('StockAlert', StockAlertSchema);