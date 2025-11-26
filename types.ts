import React from 'react';

export enum NodeType {
  SOURCE = 'SOURCE',
  DATA_COLLECT = 'DATA_COLLECT', // Kept for backward compat or generic data
  TRANSFORM = 'TRANSFORM',
  SCRIPT = 'SCRIPT',             // Code Node
  LLM = 'LLM',                   // Large Language Model Node (formerly STRATEGY)
  FILTER = 'FILTER',
  EXECUTION = 'EXECUTION',
  STORAGE = 'STORAGE',            
  TIMER = 'TIMER',                 
  DATABASE_QUERY = 'DATABASE_QUERY', 
  HTTP_REQUEST = 'HTTP_REQUEST'      
}

export interface NodeData {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'error' | 'success';
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface ChartDataPoint {
  time: string;
  value: number;
  volume?: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  WORKFLOW = 'WORKFLOW',
  MARKET = 'MARKET',
  STRATEGIES = 'STRATEGIES',
  BACKTESTS = 'BACKTESTS', 
}

export interface StrategyConfig {
  symbol: string;
  interval: string;
  parameters: string; 
}

export interface StrategyItem {
  id: string;
  name: string;
  description: string;
  code: string; 
  language: 'python';
  framework: 'backtrader';
  updatedAt: string;
  tags: string[];
}

export interface BacktestReport {
  id: string;
  strategyId: string;
  strategyName: string;
  symbol: string;
  interval: string;
  startDate: string;
  endDate: string;
  initialCash: number;
  finalValue: number;
  returnPct: number;
  sharpeRatio: number;
  maxDrawdown: number;
  tradeCount: number;
  winRate: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  reportHtml?: string; 
}

export enum DataSourceType {
  SQLITE = 'SQLite',
  MYSQL = 'MySQL',
  POSTGRES = 'PostgreSQL',
  REST_API = 'REST API'
}

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  config: {
    connectionString?: string;
    filePath?: string;
    auth?: string;
  };
}

export enum WidgetType {
  STAT = 'STAT',       
  LINE = 'LINE',       
  BAR = 'BAR',         
  PIE = 'PIE',         
  CANDLE = 'CANDLE',
  TABLE = 'TABLE'
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: WidgetType;
  dataSourceId?: string;
  script?: string;     
  colSpan: number;     
  config?: any;        
}

export interface WorkflowMeta {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  updatedAt: string;
  nodesCount: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  updatedAt: string;
  nodes: NodeData[];       
  connections: Connection[]; 
}

export interface DashboardMeta {
  id: string;
  name: string;
  description?: string;
  widgetCount: number;
  updatedAt: string;
  thumbnailColor: string;
}

// --- Execution & Logs ---

export interface LogEntry {
  id: string;
  timestamp: string;
  nodeId?: string;
  level: 'info' | 'success' | 'error' | 'warn';
  message: string;
}

export interface ExecutionHistoryItem {
  id: string;
  timestamp: string;
  status: 'success' | 'failed';
  duration: number; // ms
  logs: LogEntry[];
}

// --- New Modular Architecture Types ---

export interface ExecutionContext {
  nodeId: string;
  inputs: any[]; // Data from previous nodes
  config: Record<string, any>;
  log: (message: string, level?: 'info' | 'success' | 'warn' | 'error') => void;
}

export interface ExecutionResult {
  output: any; // Data to pass to next nodes
  status: 'success' | 'error';
}

export interface NodeDefinition {
  type: NodeType;
  label: string; // Default label
  icon: React.ElementType;
  color: string; // Tailwind border color class
  iconColor: string; // Tailwind text color class
  description: string;
  
  // UI Components
  ConfigComponent: React.FC<{ 
    config: any; 
    onUpdate: (key: string, value: any) => void 
  }>;
  
  PreviewComponent: React.FC<{ 
    config: any 
  }>;

  // Logic
  execute: (ctx: ExecutionContext) => Promise<ExecutionResult>;
}