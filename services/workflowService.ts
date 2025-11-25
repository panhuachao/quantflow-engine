import { Workflow, WorkflowMeta, NodeData, Connection } from '../types';
import { MOCK_WORKFLOWS_LIST } from '../constants';

// In-memory storage simulation
let workflows: Workflow[] = [...MOCK_WORKFLOWS_LIST];

export const workflowService = {
  getAll: async (): Promise<WorkflowMeta[]> => {
    await new Promise(resolve => setTimeout(resolve, 400)); // Network delay
    return workflows.map(w => ({
      id: w.id,
      name: w.name,
      description: w.description,
      status: w.status,
      updatedAt: w.updatedAt,
      nodesCount: w.nodes.length
    }));
  },

  getById: async (id: string): Promise<Workflow | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return workflows.find(w => w.id === id);
  },

  create: async (): Promise<Workflow> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: 'New Trading Strategy',
      description: 'Draft strategy configuration.',
      status: 'draft',
      updatedAt: new Date().toLocaleString(),
      nodes: [],
      connections: []
    };
    workflows = [newWorkflow, ...workflows];
    return newWorkflow;
  },

  updateGraph: async (id: string, nodes: NodeData[], connections: Connection[]): Promise<Workflow> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = workflows.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Workflow not found');
    
    const updated = { 
      ...workflows[index], 
      nodes, 
      connections, 
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    workflows[index] = updated;
    return updated;
  }
};