
import { NodeType, WidgetType, DataSourceType, Workflow, DashboardMeta, StrategyItem, BacktestReport } from './types';

// Standalone defaults (kept for fallback)
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
  [NodeType.TIMER]: 'border-teal-500 shadow-teal-500/20',
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
  [NodeType.TIMER]: 'text-teal-400',
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

// --- Mock Lists ---

export const MOCK_WORKFLOWS_LIST: Workflow[] = [
  { 
    id: 'wf-1', 
    name: 'Moving Average Crossover', 
    description: 'Classic trend following strategy using SMA 10/50 on Daily candles.', 
    status: 'active', 
    updatedAt: '2023-10-15 14:30',
    nodes: [
        { id: '1', type: NodeType.DATA_COLLECT, label: 'AkShare: SPY', x: 100, y: 150, config: { source: 'AkShare', symbol: 'SPY' } },
        { id: '2', type: NodeType.STRATEGY, label: 'SMA Cross', x: 450, y: 150, config: { fast: 10, slow: 50, description: 'Golden Cross Logic' } },
        { id: '3', type: NodeType.EXECUTION, label: 'Paper Trading', x: 800, y: 150, config: {} }
    ],
    connections: [
        { id: 'c1', sourceId: '1', targetId: '2' },
        { id: 'c2', sourceId: '2', targetId: '3' }
    ]
  },
  { 
    id: 'wf-2', 
    name: 'Grid Trading BTC/USDT', 
    description: 'High frequency grid bot for sideways market volatility harvesting.', 
    status: 'draft', 
    updatedAt: '2023-10-16 09:15',
    nodes: [
        { id: '1', type: NodeType.TIMER, label: 'Every 5m', x: 50, y: 50, config: { cron: '*/5 * * * *' } },
        { id: '2', type: NodeType.DATA_COLLECT, label: 'Binance: BTC', x: 300, y: 50, config: { source: 'Binance', symbol: 'BTCUSDT' } },
        { id: '3', type: NodeType.SCRIPT, label: 'Calc Grid', x: 300, y: 250, config: { code: '// Grid logic...' } },
        { id: '4', type: NodeType.EXECUTION, label: 'Limit Orders', x: 600, y: 250, config: {} }
    ],
    connections: [
        { id: 'c1', sourceId: '1', targetId: '2' },
        { id: 'c2', sourceId: '2', targetId: '3' },
        { id: 'c3', sourceId: '3', targetId: '4' }
    ]
  },
  { 
    id: 'wf-3', 
    name: 'Sentiment Analysis', 
    description: 'Trade based on news sentiment scoring from NLP pipeline.', 
    status: 'active', 
    updatedAt: '2023-10-14 11:20',
    nodes: [
        { id: '1', type: NodeType.DATA_COLLECT, label: 'News Feed', x: 100, y: 100, config: { source: 'Yahoo', symbol: 'NEWS' } },
        { id: '2', type: NodeType.SCRIPT, label: 'NLP Score', x: 400, y: 100, config: { code: 'return sentiment(data)' } },
        { id: '3', type: NodeType.STORAGE, label: 'Log Sentiment', x: 400, y: 300, config: { dbType: 'Postgres' } },
        { id: '4', type: NodeType.STRATEGY, label: 'Long/Short', x: 700, y: 100, config: {} }
    ],
    connections: [
        { id: 'c1', sourceId: '1', targetId: '2' },
        { id: 'c2', sourceId: '2', targetId: '3' },
        { id: 'c3', sourceId: '2', targetId: '4' }
    ]
  },
  { 
    id: 'wf-4', 
    name: 'Mean Reversion RSI', 
    description: 'Buy oversold, sell overbought on 1H timeframe.', 
    status: 'archived', 
    updatedAt: '2023-09-28 16:45',
    nodes: [],
    connections: []
  },
];

export const MOCK_DASHBOARDS_LIST: DashboardMeta[] = [
  { 
    id: 'db-1', 
    name: 'Main Portfolio Overview', 
    description: 'Aggregate view of all active strategy performance and risk metrics.', 
    widgetCount: 8, 
    updatedAt: '2 hours ago',
    thumbnailColor: 'bg-emerald-900/20'
  },
  { 
    id: 'db-2', 
    name: 'Crypto Intraday Alpha', 
    description: 'Real-time signals and execution monitoring for crypto desk.', 
    widgetCount: 12, 
    updatedAt: '1 day ago',
    thumbnailColor: 'bg-purple-900/20'
  },
  { 
    id: 'db-3', 
    name: 'Forex Global Macro', 
    description: 'Currency strength meters and economic calendar impact analysis.', 
    widgetCount: 6, 
    updatedAt: '3 days ago',
    thumbnailColor: 'bg-blue-900/20'
  },
];

export const MOCK_STRATEGIES: StrategyItem[] = [
  {
    id: 'st-1',
    name: 'Golden Cross Strategy',
    description: 'Simple Moving Average crossover strategy. Buys when the short-term MA crosses above the long-term MA.',
    updatedAt: '2023-10-20 10:00',
    tags: ['Trend Following', 'Moving Average'],
    language: 'python',
    framework: 'backtrader',
    code: `import backtrader as bt

class GoldenCross(bt.Strategy):
    params = (('fast', 10), ('slow', 30), ('order_percentage', 0.95), ('ticker', 'SPY'))

    def __init__(self):
        self.fast_moving_average = bt.indicators.SMA(
            self.data.close, period=self.params.fast, plotname='50 day moving average'
        )

        self.slow_moving_average = bt.indicators.SMA(
            self.data.close, period=self.params.slow, plotname='200 day moving average'
        )

        self.crossover = bt.indicators.CrossOver(self.fast_moving_average, self.slow_moving_average)

    def next(self):
        if self.position.size == 0:
            if self.crossover > 0:
                amount_to_invest = (self.params.order_percentage * self.broker.cash)
                self.size = math.floor(amount_to_invest / self.data.close)

                print("Buy {} shares of {} at {}".format(self.size, self.params.ticker, self.data.close[0]))
                self.buy(size=self.size)

        if self.position.size > 0:
            if self.crossover < 0:
                print("Sell {} shares of {} at {}".format(self.size, self.params.ticker, self.data.close[0]))
                self.close()
`
  },
  {
    id: 'st-2',
    name: 'RSI Mean Reversion',
    description: 'Buys when RSI < 30 (Oversold) and sells when RSI > 70 (Overbought).',
    updatedAt: '2023-10-18 15:45',
    tags: ['Mean Reversion', 'Oscillator'],
    language: 'python',
    framework: 'backtrader',
    code: `import backtrader as bt

class RsiStrategy(bt.Strategy):
    params = (('rsi_period', 14), ('rsi_low', 30), ('rsi_high', 70),)

    def __init__(self):
        self.rsi = bt.indicators.RSI(self.data.close, period=self.params.rsi_period)

    def next(self):
        if not self.position:
            if self.rsi < self.params.rsi_low:
                self.buy()
        else:
            if self.rsi > self.params.rsi_high:
                self.close()
`
  }
];

// --- Mock HTML Report Content ---
export const MOCK_REPORT_HTML = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; background: #0f172a; color: #cbd5e1; padding: 20px; }
  .chart-container { background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #334155; }
  h2 { color: #f8fafc; margin-top: 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
  .stat { background: #0f172a; padding: 15px; border-radius: 6px; border: 1px solid #334155; }
  .stat label { display: block; font-size: 12px; color: #64748b; margin-bottom: 5px; }
  .stat value { font-size: 18px; font-weight: bold; color: #f1f5f9; }
  .green { color: #4ade80; } .red { color: #f87171; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #334155; font-size: 14px; }
  th { color: #94a3b8; }
</style>
</head>
<body>
  <div class="chart-container">
    <h2>Performance Overview</h2>
    <div style="height: 300px; display: flex; align-items: flex-end; justify-content: space-around; gap: 4px;">
       <!-- Fake Chart Bars -->
       <div style="height: 40%; width: 100%; background: #3b82f6; opacity: 0.5;"></div>
       <div style="height: 55%; width: 100%; background: #3b82f6; opacity: 0.5;"></div>
       <div style="height: 45%; width: 100%; background: #3b82f6; opacity: 0.5;"></div>
       <div style="height: 70%; width: 100%; background: #3b82f6; opacity: 0.5;"></div>
       <div style="height: 85%; width: 100%; background: #3b82f6; opacity: 0.5;"></div>
       <div style="height: 80%; width: 100%; background: #3b82f6; opacity: 0.5;"></div>
       <div style="height: 95%; width: 100%; background: #3b82f6; opacity: 0.5;"></div>
    </div>
    <p style="text-align: center; margin-top: 10px; color: #64748b; font-size: 12px;">Cumulative Returns (Equity Curve Simulation)</p>
  </div>

  <div class="grid">
     <div class="stat"><label>Total Return</label><value class="green">+45.2%</value></div>
     <div class="stat"><label>Sharpe Ratio</label><value>1.85</value></div>
     <div class="stat"><label>Max Drawdown</label><value class="red">-12.4%</value></div>
     <div class="stat"><label>Trades</label><value>142</value></div>
  </div>

  <div class="chart-container" style="margin-top: 20px;">
     <h2>Recent Trades</h2>
     <table>
       <thead><tr><th>Date</th><th>Type</th><th>Price</th><th>Size</th><th>PnL</th></tr></thead>
       <tbody>
         <tr><td>2023-10-01</td><td class="green">BUY</td><td>$142.50</td><td>100</td><td>-</td></tr>
         <tr><td>2023-10-05</td><td class="red">SELL</td><td>$148.20</td><td>100</td><td class="green">+$570.00</td></tr>
         <tr><td>2023-10-08</td><td class="green">BUY</td><td>$147.10</td><td>100</td><td>-</td></tr>
         <tr><td>2023-10-12</td><td class="red">SELL</td><td>$145.50</td><td>100</td><td class="red">-$160.00</td></tr>
       </tbody>
     </table>
  </div>
</body>
</html>
