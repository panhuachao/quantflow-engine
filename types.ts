
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

// --- Dashboard Extensions ---

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
  STAT = 'STAT',       // Numeric indicator
  LINE = 'LINE',       // Line chart
  BAR = 'BAR',         // Bar chart
  PIE = 'PIE',         // Pie chart
  CANDLE = 'CANDLE'    // K-Line chart
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: WidgetType;
  dataSourceId?: string;
  script?: string;     // SQL or JS to fetch data
  colSpan: number;     // Grid width (1-4)
  config?: any;        // Specific chart config (colors, etc)
}

// --- List View Metadata ---

export interface WorkflowMeta {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  updatedAt: string;
  nodesCount: number;
}

export interface DashboardMeta {
  id: string;
  name: string;
  description?: string;
  widgetCount: number;
  updatedAt: string;
  thumbnailColor: string;
}
