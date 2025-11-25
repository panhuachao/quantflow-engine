export enum NodeType {
  SOURCE = 'SOURCE',
  DATA_COLLECT = 'DATA_COLLECT', // New: AkShare/Tushare
  TRANSFORM = 'TRANSFORM',
  SCRIPT = 'SCRIPT',             // New: JS Processing
  STRATEGY = 'STRATEGY',
  FILTER = 'FILTER',
  EXECUTION = 'EXECUTION',
  STORAGE = 'STORAGE'            // New: DB Storage
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
}

export interface StrategyConfig {
  symbol: string;
  interval: string;
  parameters: string; // Python/Pseudo code
}

// --- Dashboard Types ---

export enum WidgetType {
  METRIC = 'METRIC',
  LINE_CHART = 'LINE_CHART',
  BAR_CHART = 'BAR_CHART',
  PIE_CHART = 'PIE_CHART',
  K_LINE = 'K_LINE'
}

export enum DataSourceType {
  SQLITE = 'SQLITE',
  MYSQL = 'MYSQL',
  POSTGRES = 'POSTGRES',
  API = 'API'
}

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  connectionString: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: WidgetType;
  dataSourceId: string;
  query: string; // SQL or JS Script
  w: number; // Grid width (col span)
  h: number; // Grid height (row span)
}