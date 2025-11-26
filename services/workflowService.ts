
import { Workflow, WorkflowMeta, NodeData, Connection } from '../types';
import { MOCK_WORKFLOWS_LIST } from '../constants';
import { API_CONFIG } from './config';
import { apiClient } from './apiClient';

// In-memory storage simulation for Mock mode
let mockWorkflows: Workflow[] = [...MOCK_WORKFLOWS_LIST];

export const workflowService = {
  getAll: async (): Promise<WorkflowMeta[]> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      return mockWorkflows.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        status: w.status,
        updatedAt: w.updatedAt,
        nodesCount: w.nodes.length
      }));
    } else {
      // Real API Call
      return apiClient.get<WorkflowMeta[]>('/workflows');
    }
  },

  getById: async (id: string): Promise<Workflow | undefined> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      return mockWorkflows.find(w => w.id === id);
    } else {
      return apiClient.get<Workflow>(`/workflows/${id}`);
    }
  },

  create: async (): Promise<Workflow> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      const newWorkflow: Workflow = {
        id: `wf-${Date.now()}`,
        name: 'New Trading Strategy',
        description: 'Draft strategy configuration.',
        status: 'draft',
        updatedAt: new Date().toLocaleString(),
        nodes: [],
        connections: []
      };
      mockWorkflows = [newWorkflow, ...mockWorkflows];
      return newWorkflow;
    } else {
      return apiClient.post<Workflow>('/workflows', {
        name: 'New Trading Strategy',
        description: 'Draft strategy configuration.'
      });
    }
  },

  updateGraph: async (id: string, nodes: NodeData[], connections: Connection[]): Promise<Workflow> => {
    if (API_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_LATENCY));
      const index = mockWorkflows.findIndex(w => w.id === id);
      if (index === -1) throw new Error('Workflow not found');
      
      const updated = { 
        ...mockWorkflows[index], 
        nodes, 
        connections, 
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      mockWorkflows[index] = updated;
      return updated;
    } else {
      return apiClient.put<Workflow>(`/workflows/${id}`, { nodes, connections });
    }
  }
};
