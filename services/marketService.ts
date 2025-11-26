
import { API_CONFIG } from './config';
import { apiClient } from './apiClient';

export interface MarketDataPoint {
  time: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma7: number;
  ma25: number;
}

export const marketService = {
  getMarketData: async (symbol: string, count = 50): Promise<MarketDataPoint[]> => {
    if (API_CONFIG.USE_MOCK) {
      // Simulate API Latency
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));

      // Seed price based on symbol
      let price = symbol.includes('BTC') ? 42000 : symbol.includes('ETH') ? 2250 : symbol.includes('SPY') ? 440 : 150;
      const data: MarketDataPoint[] = [];
      
      for (let i = 0; i < count; i++) {
        const volatility = price * 0.02; // 2% volatility
        const change = (Math.random() - 0.5) * volatility;
        const close = price + change;
        const open = price;
        const high = Math.max(open, close) + Math.random() * (volatility * 0.2);
        const low = Math.min(open, close) - Math.random() * (volatility * 0.2);
        
        // Update next open
        price = close;

        data.push({
          time: i,
          date: `10-${(i % 30) + 1} ${Math.floor(i/30)*4 + 9}:00`,
          open,
          high,
          low,
          close,
          volume: Math.floor(Math.random() * 5000) + 1000,
          ma7: close * (1 + (Math.random() - 0.5) * 0.03), 
          ma25: close * (1 + (Math.random() - 0.5) * 0.08), 
        });
      }
      return data;
    } else {
      return apiClient.get<MarketDataPoint[]>(`/market/kline?symbol=${symbol}&limit=${count}`);
    }
  }
};
