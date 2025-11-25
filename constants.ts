
import { NodeType, WidgetType, DataSourceType } from './types';

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

// --- Dashboard Initial Data ---

export const INITIAL_DATA_SOURCES = [
  { 
    id: 'ds1', 
    name: 'Main Strategy DB', 
    type: DataSourceType.SQLITE, 
    config: { filePath: './strategies.db' } 
  },
  { 
    id: 'ds2', 
    name: 'Market Data Warehouse', 
    type: DataSourceType.POSTGRES, 
    config: { connectionString: 'postgres://admin:pass@localhost:5432/market' } 
  }
];

export const INITIAL_DASHBOARD_WIDGETS = [
  {
    id: 'w1',
    title: 'Total PnL',
    type: WidgetType.STAT,
    colSpan: 1,
    script: 'SELECT sum(pnl) FROM trades WHERE date = CURRENT_DATE',
    config: { value: '$12,450', subValue: '+4.2%', color: 'text-emerald-400' }
  },
  {
    id: 'w2',
    title: 'Active Positions',
    type: WidgetType.STAT,
    colSpan: 1,
    script: 'SELECT count(*) FROM positions WHERE status = "OPEN"',
    config: { value: '8', subValue: 'Long: 5 | Short: 3', color: 'text-blue-400' }
  },
  {
    id: 'w3',
    title: 'Win Rate (24h)',
    type: WidgetType.STAT,
    colSpan: 1,
    script: '',
    config: { value: '68%', subValue: '21 Trades', color: 'text-purple-400' }
  },
  {
    id: 'w4',
    title: 'Alpha',
    type: WidgetType.STAT,
    colSpan: 1,
    script: '',
    config: { value: '1.45', subValue: 'vs Benchmark', color: 'text-yellow-400' }
  },
  {
    id: 'w5',
    title: 'Equity Curve',
    type: WidgetType.LINE,
    dataSourceId: 'ds1',
    colSpan: 3,
    script: 'SELECT time, equity FROM performance_log ORDER BY time LIMIT 100'
  },
  {
    id: 'w6',
    title: 'Asset Allocation',
    type: WidgetType.PIE,
    dataSourceId: 'ds1',
    colSpan: 1,
    script: 'SELECT asset, value FROM portfolio_snapshot'
  },
  {
    id: 'w7',
    title: 'BTC/USDT Strategy',
    type: WidgetType.CANDLE,
    dataSourceId: 'ds2',
    colSpan: 2,
    script: 'SELECT open, high, low, close FROM klines WHERE symbol="BTCUSDT"'
  },
  {
    id: 'w8',
    title: 'Monthly Returns',
    type: WidgetType.BAR,
    dataSourceId: 'ds1',
    colSpan: 2,
    script: 'SELECT month, return_pct FROM monthly_stats'
  }
];
