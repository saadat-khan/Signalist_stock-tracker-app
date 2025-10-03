'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createStockAlert } from "@/lib/actions/alert.actions";
import { toast } from "sonner";

interface CreateAlertDialogProps {
  symbol?: string;
  company?: string;
  user: { id: string; name: string; email: string };
  trigger?: React.ReactNode;
}

export default function CreateAlertDialog({ symbol = '', company = '', user, trigger }: CreateAlertDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symbol: symbol,
    company: company,
    alertType: 'buy' as 'buy' | 'sell' | 'price_target' | 'technical',
    conditionType: 'rsi_oversold' as 'price_above' | 'price_below' | 'rsi_oversold' | 'rsi_overbought' | 'volume_spike' | 'moving_average_cross',
    priceValue: '',
    timeframe: '1D' as '1D' | '5D' | '1M' | '3M'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.company) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const condition = {
        type: formData.conditionType,
        value: formData.priceValue ? parseFloat(formData.priceValue) : undefined,
        timeframe: formData.timeframe
      };

      const result = await createStockAlert(
        user.email,
        formData.symbol,
        formData.company,
        formData.alertType,
        condition
      );

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        // Reset form
        setFormData({
          symbol: '',
          company: '',
          alertType: 'buy',
          conditionType: 'rsi_oversold',
          priceValue: '',
          timeframe: '1D'
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Alert creation error:', error);
      toast.error('Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const getAlertDescription = () => {
    const { alertType, conditionType, priceValue } = formData;
    
    if (alertType === 'buy' && conditionType === 'rsi_oversold') {
      return "Alert when RSI indicates the stock is oversold (good buying opportunity)";
    }
    if (alertType === 'sell' && conditionType === 'rsi_overbought') {
      return "Alert when RSI indicates the stock is overbought (consider selling)";
    }
    if (alertType === 'price_target' && conditionType === 'price_above' && priceValue) {
      return `Alert when price goes above $${priceValue}`;
    }
    if (alertType === 'price_target' && conditionType === 'price_below' && priceValue) {
      return `Alert when price goes below $${priceValue}`;
    }
    if (conditionType === 'volume_spike') {
      return "Alert when trading volume spikes significantly";
    }
    if (conditionType === 'moving_average_cross') {
      return "Alert when price crosses moving averages (trend change)";
    }
    return "Configure your alert conditions above";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm">Create Alert</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Create Stock Alert</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symbol" className="text-gray-300">Stock Symbol</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                placeholder="AAPL"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="company" className="text-gray-300">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Apple Inc"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Alert Type</Label>
            <Select value={formData.alertType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, alertType: value }))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="buy">Buy Signal</SelectItem>
                <SelectItem value="sell">Sell Signal</SelectItem>
                <SelectItem value="price_target">Price Target</SelectItem>
                <SelectItem value="technical">Technical Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300">Condition</Label>
            <Select value={formData.conditionType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, conditionType: value }))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="rsi_oversold">RSI Oversold (&lt; 30)</SelectItem>
                <SelectItem value="rsi_overbought">RSI Overbought (&gt; 70)</SelectItem>
                <SelectItem value="price_above">Price Above Target</SelectItem>
                <SelectItem value="price_below">Price Below Target</SelectItem>
                <SelectItem value="volume_spike">Volume Spike</SelectItem>
                <SelectItem value="moving_average_cross">MA Cross</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.conditionType === 'price_above' || formData.conditionType === 'price_below') && (
            <div>
              <Label htmlFor="priceValue" className="text-gray-300">Target Price ($)</Label>
              <Input
                id="priceValue"
                type="number"
                step="0.01"
                value={formData.priceValue}
                onChange={(e) => setFormData(prev => ({ ...prev, priceValue: e.target.value }))}
                placeholder="150.00"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
          )}

          <div>
            <Label className="text-gray-300">Timeframe</Label>
            <Select value={formData.timeframe} onValueChange={(value: any) => setFormData(prev => ({ ...prev, timeframe: value }))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="1D">1 Day</SelectItem>
                <SelectItem value="5D">5 Days</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">
              {getAlertDescription()}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}