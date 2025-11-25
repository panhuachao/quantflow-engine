import { StrategyItem } from '../types';
import { MOCK_STRATEGIES } from '../constants';

let strategies: StrategyItem[] = [...MOCK_STRATEGIES];

export const strategyService = {
  getAll: async (): Promise<StrategyItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return strategies;
  },

  getById: async (id: string): Promise<StrategyItem | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return strategies.find(s => s.id === id);
  },

  create: async (): Promise<StrategyItem> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newStrategy: StrategyItem = {
      id: `st-${Date.now()}`,
      name: 'New Algorithm',
      description: '',
      code: 'import backtrader as bt\n\nclass MyStrategy(bt.Strategy):\n    def next(self):\n        pass',
      language: 'python',
      framework: 'backtrader',
      updatedAt: 'Just now',
      tags: []
    };
    strategies = [newStrategy, ...strategies];
    return newStrategy;
  },

  update: async (strategy: StrategyItem): Promise<StrategyItem> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = strategies.findIndex(s => s.id === strategy.id);
    if (index !== -1) {
        strategies[index] = { ...strategy, updatedAt: new Date().toLocaleString() };
        return strategies[index];
    }
    return strategy;
  }
};