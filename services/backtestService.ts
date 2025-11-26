
import { BacktestReport, StrategyItem, BacktestConfig } from '../types';
import { MOCK_BACKTEST_REPORTS, MOCK_REPORT_HTML } from '../constants';
import { API_CONFIG } from './config';
import { apiClient } from './apiClient';

let mockReports: BacktestReport[] = [...MOCK_BACKTEST_REPORTS];

export const backtestService = {
  getAll: async (): Promise<BacktestReport[]> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      return mockReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      return apiClient.get<BacktestReport[]>('/backtests');
    }
  },

  getById: async (id: string): Promise<BacktestReport | undefined> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockReports.find(r => r.id === id);
    } else {
      return apiClient.get<BacktestReport>(`/backtests/${id}`);
    }
  },

  // Simulates starting a backtest job
  runSimulation: async (strategy: StrategyItem, config: BacktestConfig): Promise<BacktestReport> => {
    if (API_CONFIG.USE_MOCK) {
      const newId = `bt-${Date.now()}`;
      const pendingReport: BacktestReport = {
          id: newId,
          strategyId: strategy.id,
          strategyName: strategy.name,
          symbol: config.symbol, 
          interval: '1d', // Mock interval
          startDate: config.startDate,
          endDate: config.endDate,
          parameters: config.parameters,
          initialCash: config.initialCash,
          finalValue: 0,
          returnPct: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
          tradeCount: 0,
          winRate: 0,
          status: 'pending',
          createdAt: new Date().toLocaleString()
      };
      
      mockReports = [pendingReport, ...mockReports];
      return pendingReport;
    } else {
      return apiClient.post<BacktestReport>('/backtests/run', { strategyId: strategy.id, config });
    }
  },

  // Simulates job completion (Polling logic usually handles checking status in real app)
  completeSimulation: async (id: string): Promise<BacktestReport> => {
    if (API_CONFIG.USE_MOCK) {
       // Simulate processing time
       await new Promise(resolve => setTimeout(resolve, 2500)); 
       
       const index = mockReports.findIndex(r => r.id === id);
       if (index === -1) throw new Error('Report not found');
  
       // Mock results based on randomness for demo purposes
       const isProfit = Math.random() > 0.4;
       const returnPct = isProfit ? parseFloat((Math.random() * 20).toFixed(2)) : parseFloat((Math.random() * -10).toFixed(2));
       const initial = mockReports[index].initialCash;
       const finalValue = initial * (1 + returnPct / 100);
  
       const completedReport: BacktestReport = {
          ...mockReports[index],
          finalValue: Math.floor(finalValue),
          returnPct: returnPct,
          sharpeRatio: isProfit ? parseFloat((Math.random() * 2 + 0.5).toFixed(2)) : parseFloat((Math.random() * -1).toFixed(2)),
          maxDrawdown: parseFloat((Math.random() * -15).toFixed(2)),
          tradeCount: Math.floor(Math.random() * 50) + 10,
          winRate: parseFloat((Math.random() * 40 + 30).toFixed(1)),
          status: 'completed',
          reportHtml: MOCK_REPORT_HTML 
      };
      mockReports[index] = completedReport;
      return completedReport;
    } else {
      // In real API, this might just fetch the updated status, logic is on backend
      return apiClient.get<BacktestReport>(`/backtests/${id}`);
    }
  }
};
