
import { DashboardMeta } from '../types';
import { MOCK_DASHBOARDS_LIST } from '../constants';
import { API_CONFIG } from './config';
import { apiClient } from './apiClient';

let mockDashboards: DashboardMeta[] = [...MOCK_DASHBOARDS_LIST];

export const dashboardService = {
  getAll: async (): Promise<DashboardMeta[]> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      return mockDashboards;
    } else {
      return apiClient.get<DashboardMeta[]>('/dashboards');
    }
  },

  getById: async (id: string): Promise<DashboardMeta | undefined> => {
    if (API_CONFIG.USE_MOCK) {
      // In a real app, fetch full config. For now, return meta.
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockDashboards.find(d => d.id === id);
    } else {
      return apiClient.get<DashboardMeta>(`/dashboards/${id}`);
    }
  },

  create: async (name: string, description: string): Promise<DashboardMeta> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      const newDash: DashboardMeta = {
        id: `db-${Date.now()}`,
        name: name || 'New Dashboard',
        description: description || 'Custom market view.',
        widgetCount: 0,
        updatedAt: 'Just now',
        thumbnailColor: 'bg-slate-800'
      };
      mockDashboards = [newDash, ...mockDashboards];
      return newDash;
    } else {
      return apiClient.post<DashboardMeta>('/dashboards', { name, description });
    }
  }
};
