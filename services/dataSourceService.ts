import { DataSource, DataSourceType } from '../types';
import { INITIAL_DATA_SOURCES } from '../constants';

// Initialize with some mock data, adapting the structure
let dataSources: DataSource[] = INITIAL_DATA_SOURCES.map(ds => ({
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
    await new Promise(resolve => setTimeout(resolve, 300));
    return dataSources;
  },

  getById: async (id: string): Promise<DataSource | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return dataSources.find(ds => ds.id === id);
  },

  create: async (source: Omit<DataSource, 'id' | 'updatedAt' | 'status'>): Promise<DataSource> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newSource: DataSource = {
      ...source,
      id: `ds-${Date.now()}`,
      updatedAt: new Date().toLocaleString(),
      status: 'active'
    };
    dataSources = [newSource, ...dataSources];
    return newSource;
  },

  update: async (id: string, updates: Partial<DataSource>): Promise<DataSource> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = dataSources.findIndex(ds => ds.id === id);
    if (index === -1) throw new Error('Data source not found');
    
    dataSources[index] = { 
        ...dataSources[index], 
        ...updates, 
        updatedAt: new Date().toLocaleString() 
    };
    return dataSources[index];
  },

  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    dataSources = dataSources.filter(ds => ds.id !== id);
  },

  testConnection: async (config: any): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Randomly simulate success/fail for demo
      return Math.random() > 0.1;
  }
};