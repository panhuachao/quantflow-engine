import { DashboardMeta } from '../types';
import { MOCK_DASHBOARDS_LIST } from '../constants';

let dashboards: DashboardMeta[] = [...MOCK_DASHBOARDS_LIST];

export const dashboardService = {
  getAll: async (): Promise<DashboardMeta[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return dashboards;
  },

  getById: async (id: string): Promise<DashboardMeta | undefined> => {
    // In a real app, fetch full config. For now, return meta.
    return dashboards.find(d => d.id === id);
  },

  create: async (): Promise<DashboardMeta> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newDash: DashboardMeta = {
      id: `db-${Date.now()}`,
      name: 'New Dashboard',
      description: 'Custom market view.',
      widgetCount: 0,
      updatedAt: 'Just now',
      thumbnailColor: 'bg-slate-800'
    };
    dashboards = [newDash, ...dashboards];
    return newDash;
  }
};