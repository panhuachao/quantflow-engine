
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

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePct: number;
}

export interface StockFundamentals {
  symbol: string;
  pe_ttm: number;     // 市盈率 (TTM)
  pb: number;         // 市净率
  market_cap: string; // 市值
  eps: number;        // 每股收益
  sector: string;     // 板块
  turnover_rate: number; // 换手率
}

export interface DragonTigerItem {
  seatName: string;   // 营业部名称
  buy: number;        // 买入额 (万)
  sell: number;       // 卖出额 (万)
  net: number;        // 净额 (万)
}

export const marketService = {
  getMarketData: async (symbol: string, count = 50): Promise<MarketDataPoint[]> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));

      let price = symbol.includes('BTC') ? 42000 : symbol.includes('ETH') ? 2250 : symbol.includes('SPY') ? 440 : 150;
      const data: MarketDataPoint[] = [];
      
      for (let i = 0; i < count; i++) {
        const volatility = price * 0.02; 
        const change = (Math.random() - 0.5) * volatility;
        const close = price + change;
        const open = price;
        const high = Math.max(open, close) + Math.random() * (volatility * 0.2);
        const low = Math.min(open, close) - Math.random() * (volatility * 0.2);
        
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
  },

  getMarketIndices: async (): Promise<MarketIndex[]> => {
    if (API_CONFIG.USE_MOCK) {
        return [
            { name: 'S&P 500', value: 4783.45, change: 23.45, changePct: 0.49 },
            { name: 'NASDAQ', value: 15678.90, change: -45.20, changePct: -0.29 },
            { name: 'SSE Composite', value: 3050.12, change: 12.30, changePct: 0.40 }, // 上证指数
            { name: 'BTC Global', value: 64230.00, change: 1200.00, changePct: 1.90 },
        ];
    }
    return apiClient.get('/market/indices');
  },

  getStockFundamentals: async (symbol: string): Promise<StockFundamentals> => {
    if (API_CONFIG.USE_MOCK) {
        return {
            symbol,
            pe_ttm: parseFloat((Math.random() * 50 + 5).toFixed(2)),
            pb: parseFloat((Math.random() * 10 + 1).toFixed(2)),
            market_cap: (Math.random() * 200 + 10).toFixed(1) + 'B',
            eps: parseFloat((Math.random() * 5).toFixed(2)),
            sector: ['Technology', 'Finance', 'Energy', 'Consumer'][Math.floor(Math.random() * 4)],
            turnover_rate: parseFloat((Math.random() * 5 + 0.5).toFixed(2))
        };
    }
    return apiClient.get(`/market/fundamentals?symbol=${symbol}`);
  },

  getDragonTigerList: async (symbol: string): Promise<DragonTigerItem[]> => {
    if (API_CONFIG.USE_MOCK) {
        const seats = [
            'Institutional Seat', 'Northbound Capital', 'CITIC Sec. Shanghai', 'Huatai Sec. Shenzhen', 'Retail Aggregation'
        ];
        return seats.map(seatName => {
            const buy = Math.floor(Math.random() * 5000);
            const sell = Math.floor(Math.random() * 4000);
            return {
                seatName,
                buy,
                sell,
                net: buy - sell
            };
        }).sort((a, b) => b.net - a.net);
    }
    return apiClient.get(`/market/dragon-tiger?symbol=${symbol}`);
  }
};
