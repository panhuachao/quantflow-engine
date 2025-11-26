
import { StrategyItem } from '../types';
import { MOCK_STRATEGIES } from '../constants';
import { API_CONFIG } from './config';
import { apiClient } from './apiClient';

let mockStrategies: StrategyItem[] = [...MOCK_STRATEGIES];

export const strategyService = {
  getAll: async (): Promise<StrategyItem[]> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      return mockStrategies;
    } else {
      return apiClient.get<StrategyItem[]>('/strategies');
    }
  },

  getById: async (id: string): Promise<StrategyItem | undefined> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      return mockStrategies.find(s => s.id === id);
    } else {
      return apiClient.get<StrategyItem>(`/strategies/${id}`);
    }
  },

  create: async (): Promise<StrategyItem> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
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
      mockStrategies = [newStrategy, ...mockStrategies];
      return newStrategy;
    } else {
      return apiClient.post<StrategyItem>('/strategies', {
        name: 'New Algorithm',
        code: 'import backtrader as bt...',
        language: 'python'
      });
    }
  },

  update: async (strategy: StrategyItem): Promise<StrategyItem> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      const index = mockStrategies.findIndex(s => s.id === strategy.id);
      if (index !== -1) {
          mockStrategies[index] = { ...strategy, updatedAt: new Date().toLocaleString() };
          return mockStrategies[index];
      }
      return strategy;
    } else {
      return apiClient.put<StrategyItem>(`/strategies/${strategy.id}`, strategy);
    }
  }
};
