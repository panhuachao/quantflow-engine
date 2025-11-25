import { NodeType } from './types';

export const INITIAL_NODES = [
  {
    id: '1',
    type: NodeType.DATA_COLLECT,
    label: 'AkShare Stock Data',
    x: 100,
    y: 100,
    config: { source: 'AkShare', symbol: '600519', interval: 'daily' },
    status: 'success'
  },
  {
    id: '2',
    type: NodeType.SCRIPT,
    label: 'Clean Data (JS)',
    x: 400,
    y: 100,
    config: { code: 'return data.filter(d => d.volume > 0);' },
    status: 'success'
  },
  {
    id: '3',
    type: NodeType.STRATEGY,
    label: 'MA Crossover',
    x: 700,
    y: 100,
    config: { fast_ma: 10, slow_ma: 50 },
    status: 'running'
  },
  {
    id: '4',
    type: NodeType.STORAGE,
    label: 'Save to SQLite',
    x: 1000,
    y: 100,
    config: { dbType: 'SQLite', table: 'strategy_results' },
    status: 'idle'
  }
];

export const INITIAL_CONNECTIONS = [
  { id: 'c1', sourceId: '1', targetId: '2' },
  { id: 'c2', sourceId: '2', targetId: '3' },
  { id: 'c3', sourceId: '3', targetId: '4' }
];

export const NODE_COLORS = {
  [NodeType.SOURCE]: 'border-blue-500 shadow-blue-500/20',
  [NodeType.DATA_COLLECT]: 'border-orange-500 shadow-orange-500/20',
  [NodeType.TRANSFORM]: 'border-yellow-500 shadow-yellow-500/20',
  [NodeType.SCRIPT]: 'border-pink-500 shadow-pink-500/20',
  [NodeType.STRATEGY]: 'border-purple-500 shadow-purple-500/20',
  [NodeType.FILTER]: 'border-rose-500 shadow-rose-500/20',
  [NodeType.EXECUTION]: 'border-green-500 shadow-green-500/20',
  [NodeType.STORAGE]: 'border-indigo-500 shadow-indigo-500/20',
};

export const NODE_ICONS_COLOR = {
  [NodeType.SOURCE]: 'text-blue-400',
  [NodeType.DATA_COLLECT]: 'text-orange-400',
  [NodeType.TRANSFORM]: 'text-yellow-400',
  [NodeType.SCRIPT]: 'text-pink-400',
  [NodeType.STRATEGY]: 'text-purple-400',
  [NodeType.FILTER]: 'text-rose-400',
  [NodeType.EXECUTION]: 'text-green-400',
  [NodeType.STORAGE]: 'text-indigo-400',
};