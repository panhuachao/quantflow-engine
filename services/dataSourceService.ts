
import { DataSource, DataSourceType } from '../types';
import { INITIAL_DATA_SOURCES } from '../constants';
import { API_CONFIG } from './config';
import { apiClient } from './apiClient';

// Initialize with some mock data for Mock Mode
let mockDataSources: DataSource[] = INITIAL_DATA_SOURCES.map(ds => ({
    id: ds.id,
    name: ds.name,
    type: ds.type as DataSourceType,
    config: {
        host: 'localhost',
        port: 3306,
        database: 'quant_db',
        username: 'admin',
        ...ds.config
    },
    updatedAt: new Date().toLocaleString(),
    status: 'active'
}));

export const dataSourceService = {
  getAll: async (): Promise<DataSource[]> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      return mockDataSources;
    } else {
      return apiClient.get<DataSource[]>('/datasources');
    }
  },

  getById: async (id: string): Promise<DataSource | undefined> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockDataSources.find(ds => ds.id === id);
    } else {
      return apiClient.get<DataSource>(`/datasources/${id}`);
    }
  },

  create: async (source: Omit<DataSource, 'id' | 'updatedAt' | 'status'>): Promise<DataSource> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      const newSource: DataSource = {
        ...source,
        id: `ds-${Date.now()}`,
        updatedAt: new Date().toLocaleString(),
        status: 'active'
      };
      mockDataSources = [newSource, ...mockDataSources];
      return newSource;
    } else {
      return apiClient.post<DataSource>('/datasources', source);
    }
  },

  update: async (id: string, updates: Partial<DataSource>): Promise<DataSource> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      const index = mockDataSources.findIndex(ds => ds.id === id);
      if (index === -1) throw new Error('Data source not found');
      
      mockDataSources[index] = { 
          ...mockDataSources[index], 
          ...updates, 
          updatedAt: new Date().toLocaleString() 
      };
      return mockDataSources[index];
    } else {
      return apiClient.put<DataSource>(`/datasources/${id}`, updates);
    }
  },

  delete: async (id: string): Promise<void> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      mockDataSources = mockDataSources.filter(ds => ds.id !== id);
    } else {
      return apiClient.delete<void>(`/datasources/${id}`);
    }
  },

  testConnection: async (config: any): Promise<boolean> => {
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Randomly simulate success/fail for demo
        return Math.random() > 0.1;
      } else {
        const result = await apiClient.post<{ success: boolean }>('/datasources/test', config);
        return result.success;
      }
  }
};
