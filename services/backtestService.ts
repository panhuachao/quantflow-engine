import { BacktestReport, StrategyItem, BacktestConfig } from '../types';
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
  runSimulation: async (strategy: StrategyItem, config: BacktestConfig): Promise<BacktestReport> => {
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
    
    reports = [pendingReport, ...reports];
    return pendingReport;
  },

  // Simulates job completion
  completeSimulation: async (id: string): Promise<BacktestReport> => {
     // Simulate processing time
     await new Promise(resolve => setTimeout(resolve, 2500)); 
     
     const index = reports.findIndex(r => r.id === id);
     if (index === -1) throw new Error('Report not found');

     // Mock results based on randomness for demo purposes
     const isProfit = Math.random() > 0.4;
     const returnPct = isProfit ? parseFloat((Math.random() * 20).toFixed(2)) : parseFloat((Math.random() * -10).toFixed(2));
     const initial = reports[index].initialCash;
     const finalValue = initial * (1 + returnPct / 100);

     const completedReport: BacktestReport = {
        ...reports[index],
        finalValue: Math.floor(finalValue),
        returnPct: returnPct,
        sharpeRatio: isProfit ? parseFloat((Math.random() * 2 + 0.5).toFixed(2)) : parseFloat((Math.random() * -1).toFixed(2)),
        maxDrawdown: parseFloat((Math.random() * -15).toFixed(2)),
        tradeCount: Math.floor(Math.random() * 50) + 10,
        winRate: parseFloat((Math.random() * 40 + 30).toFixed(1)),
        status: 'completed',
        reportHtml: MOCK_REPORT_HTML 
    };
    reports[index] = completedReport;
    return completedReport;
  }
};