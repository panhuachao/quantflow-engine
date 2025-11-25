import { BacktestReport, StrategyItem } from '../types';
import { MOCK_BACKTEST_REPORTS, MOCK_REPORT_HTML } from '../constants';

let reports: BacktestReport[] = [...MOCK_BACKTEST_REPORTS];

export const backtestService = {
  getAll: async (): Promise<BacktestReport[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById: async (id: string): Promise<BacktestReport | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return reports.find(r => r.id === id);
  },

  // Simulates starting a backtest job
  runSimulation: async (strategy: StrategyItem): Promise<BacktestReport> => {
    const newId = `bt-${Date.now()}`;
    const pendingReport: BacktestReport = {
        id: newId,
        strategyId: strategy.id,
        strategyName: strategy.name,
        symbol: 'BTCUSDT', 
        interval: '1h',
        startDate: '2023-01-01',
        endDate: '2023-10-25',
        initialCash: 100000,
        finalValue: 0,
        returnPct: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        tradeCount: 0,
        winRate: 0,
        status: 'pending',
        createdAt: new Date().toLocaleString()
    };
    
    reports = [pendingReport, ...reports];
    return pendingReport;
  },

  // Simulates job completion
  completeSimulation: async (id: string): Promise<BacktestReport> => {
     // Simulate processing time
     await new Promise(resolve => setTimeout(resolve, 2500)); 
     
     const index = reports.findIndex(r => r.id === id);
     if (index === -1) throw new Error('Report not found');

     const completedReport: BacktestReport = {
        ...reports[index],
        finalValue: 108500,
        returnPct: 8.5,
        sharpeRatio: 1.45,
        maxDrawdown: -5.2,
        tradeCount: 42,
        winRate: 58.0,
        status: 'completed',
        reportHtml: MOCK_REPORT_HTML 
    };
    reports[index] = completedReport;
    return completedReport;
  }
};