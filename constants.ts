import { NodeType, WidgetType, DataSourceType, Workflow, DashboardMeta, StrategyItem, BacktestReport } from './types';

// Standalone defaults (Scenario 1: Daily Data Sync)
export const INITIAL_NODES = [
  {
    id: '1',
    type: NodeType.TIMER,
    label: 'Daily 20:00',
    x: 100,
    y: 200,
    config: { cron: '0 20 * * 1-5' },
    status: 'idle'
  },
  {
    id: '2',
    type: NodeType.SCRIPT,
    label: 'Fetch AkShare Data',
    x: 400,
    y: 200,
    config: { 
      language: 'python', 
      code: `import akshare as ak\n\ndef main(args):\n    # Fetch daily spot data for A-shares\n    df = ak.stock_zh_a_spot_em()\n    return df.to_dict('records')` 
    },
    status: 'idle'
  },
  {
    id: '3',
    type: NodeType.STORAGE,
    label: 'Save to MySQL',
    x: 700,
    y: 200,
    config: { dbType: 'MySQL', table: 'stock_daily_quotes' },
    status: 'idle'
  }
];

export const INITIAL_CONNECTIONS = [
  { id: 'c1', sourceId: '1', targetId: '2' },
  { id: 'c2', sourceId: '2', targetId: '3' }
];

export const NODE_COLORS = {
  [NodeType.SOURCE]: 'border-blue-500 shadow-blue-500/20',
  [NodeType.DATA_COLLECT]: 'border-orange-500 shadow-orange-500/20',
  [NodeType.TRANSFORM]: 'border-yellow-500 shadow-yellow-500/20',
  [NodeType.SCRIPT]: 'border-pink-500 shadow-pink-500/20',
  [NodeType.LLM]: 'border-purple-500 shadow-purple-500/20',
  [NodeType.FILTER]: 'border-rose-500 shadow-rose-500/20',
  [NodeType.EXECUTION]: 'border-green-500 shadow-green-500/20',
  [NodeType.STORAGE]: 'border-indigo-500 shadow-indigo-500/20',
  [NodeType.TIMER]: 'border-teal-500 shadow-teal-500/20',
  [NodeType.DATABASE_QUERY]: 'border-sky-500 shadow-sky-500/20',
  [NodeType.HTTP_REQUEST]: 'border-violet-500 shadow-violet-500/20',
};

export const NODE_ICONS_COLOR = {
  [NodeType.SOURCE]: 'text-blue-400',
  [NodeType.DATA_COLLECT]: 'text-orange-400',
  [NodeType.TRANSFORM]: 'text-yellow-400',
  [NodeType.SCRIPT]: 'text-pink-400',
  [NodeType.LLM]: 'text-purple-400',
  [NodeType.FILTER]: 'text-rose-400',
  [NodeType.EXECUTION]: 'text-green-400',
  [NodeType.STORAGE]: 'text-indigo-400',
  [NodeType.TIMER]: 'text-teal-400',
  [NodeType.DATABASE_QUERY]: 'text-sky-400',
  [NodeType.HTTP_REQUEST]: 'text-violet-400',
};

// --- Dashboard Initial Data ---

export const INITIAL_DATA_SOURCES = [
  { 
    id: 'ds1', 
    name: 'Strategy DB (MySQL)', 
    type: DataSourceType.MYSQL, 
    config: { connectionString: 'mysql://user:pass@localhost:3306/quant_db' } 
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
    colSpan: 1,
    script: 'SELECT month, return_pct FROM monthly_stats'
  },
  {
    id: 'w9',
    title: 'Recommended Buys (Today)',
    type: WidgetType.TABLE,
    colSpan: 1,
    script: 'SELECT symbol, price, signal FROM signals WHERE date = CURDATE()',
    config: {}
  }
];

// --- Mock Workflows (Scenarios) ---

export const MOCK_WORKFLOWS_LIST: Workflow[] = [
  { 
    id: 'wf-daily-sync', 
    name: 'Daily Data Sync (AkShare)', 
    description: 'Scheduled 20:00 task to fetch daily stock spots via AkShare and save to MySQL.', 
    status: 'active', 
    updatedAt: '2023-10-25 19:30',
    nodes: [
        { id: '1', type: NodeType.TIMER, label: 'Daily 20:00', x: 100, y: 150, config: { cron: '0 20 * * 1-5' } },
        { 
          id: '2', 
          type: NodeType.SCRIPT, 
          label: 'Fetch AkShare', 
          x: 400, 
          y: 150, 
          config: { 
            language: 'python', 
            code: `import akshare as ak\n\ndef main(args):\n    # Download A-share spot data\n    df = ak.stock_zh_a_spot_em()\n    print(f"Fetched {len(df)} records")\n    return df.to_dict('records')` 
          } 
        },
        { 
          id: '3', 
          type: NodeType.STORAGE, 
          label: 'Save to MySQL', 
          x: 700, 
          y: 150, 
          config: { dbType: 'MySQL', table: 'stock_daily_spot' } 
        }
    ],
    connections: [
        { id: 'c1', sourceId: '1', targetId: '2' },
        { id: 'c2', sourceId: '2', targetId: '3' }
    ]
  },
  { 
    id: 'wf-morning-alert', 
    name: 'Morning Strategy & Alert', 
    description: 'Runs at 08:00. Analyzes previous day data, generates signals, saves results, and pushes to DingTalk.', 
    status: 'active', 
    updatedAt: '2023-10-26 07:45',
    nodes: [
        { id: '1', type: NodeType.TIMER, label: 'Daily 08:00', x: 50, y: 200, config: { cron: '0 8 * * 1-5' } },
        { 
          id: '2', 
          type: NodeType.DATABASE_QUERY, 
          label: 'Get History', 
          x: 300, 
          y: 200, 
          config: { 
            connectionString: 'mysql://user:pass@localhost:3306/quant_db',
            query: 'SELECT * FROM stock_daily_spot WHERE date = CURDATE() - INTERVAL 1 DAY' 
          } 
        },
        { 
          id: '3', 
          type: NodeType.SCRIPT, 
          label: 'Calc Signals', 
          x: 550, 
          y: 200, 
          config: { 
            language: 'python', 
            code: `def main(records):\n    signals = []\n    for row in records:\n        if row['change_pct'] > 5.0 and row['volume'] > 100000:\n            signals.append({'symbol': row['symbol'], 'action': 'BUY'})\n    return signals` 
          } 
        },
        { 
          id: '4', 
          type: NodeType.DATABASE_QUERY, 
          label: 'Save Signals', 
          x: 800, 
          y: 100, 
          config: { 
             connectionString: 'mysql://user:pass@localhost:3306/quant_db',
             query: 'INSERT INTO signal_log (symbol, action) VALUES (:symbol, :action)' 
          } 
        },
        { 
          id: '5', 
          type: NodeType.HTTP_REQUEST, 
          label: 'DingTalk Push', 
          x: 800, 
          y: 300, 
          config: { 
            method: 'POST',
            url: 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN',
            headers: '{"Content-Type": "application/json"}',
            body: '{"msgtype": "text", "text": {"content": "Found {{inputs.length}} opportunities today."}}'
          } 
        }
    ],
    connections: [
        { id: 'c1', sourceId: '1', targetId: '2' },
        { id: 'c2', sourceId: '2', targetId: '3' },
        { id: 'c3', sourceId: '3', targetId: '4' },
        { id: 'c4', sourceId: '3', targetId: '5' }
    ]
  },
  { 
    id: 'wf-sentiment', 
    name: 'AI Sentiment Analysis', 
    description: 'Fetch news, analyze with LLM, and store sentiment score.', 
    status: 'draft', 
    updatedAt: '2023-10-14 11:20',
    nodes: [
        { id: '1', type: NodeType.TIMER, label: 'Hourly', x: 50, y: 150, config: { cron: '0 * * * *' } },
        { id: '2', type: NodeType.HTTP_REQUEST, label: 'News API', x: 300, y: 150, config: { method: 'GET', url: 'https://api.news.com/finance' } },
        { id: '3', type: NodeType.LLM, label: 'DeepSeek Analysis', x: 550, y: 150, config: { provider: 'DeepSeek', model: 'deepseek-chat', userPrompt: 'Analyze sentiment: {{inputs}}' } },
        { id: '4', type: NodeType.STORAGE, label: 'Log Score', x: 800, y: 150, config: { dbType: 'PostgreSQL', table: 'sentiment_log' } }
    ],
    connections: [
        { id: 'c1', sourceId: '1', targetId: '2' },
        { id: 'c2', sourceId: '2', targetId: '3' },
        { id: 'c3', sourceId: '3', targetId: '4' }
    ]
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
`
export const MOCK_BACKTEST_REPORTS: BacktestReport[] = [
  {
    id: 'bt-1',
    strategyId: 'st-1',
    strategyName: 'Golden Cross Strategy',
    symbol: 'BTCUSDT',
    interval: '1h',
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    parameters: 'fast=10, slow=30',
    initialCash: 100000,
    finalValue: 108500,
    returnPct: 8.5,
    sharpeRatio: 1.45,
    maxDrawdown: -5.2,
    tradeCount: 42,
    winRate: 58.0,
    status: 'completed',
    createdAt: '2023-11-01 09:00',
    reportHtml: MOCK_REPORT_HTML
  },
  {
     id: 'bt-2',
     strategyId: 'st-2',
     strategyName: 'RSI Mean Reversion',
     symbol: 'ETHUSDT',
     interval: '15m',
     startDate: '2023-10-20',
     endDate: '2023-10-25',
     parameters: 'rsi_period=14, rsi_low=30, rsi_high=70',
     initialCash: 50000,
     finalValue: 49200,
     returnPct: -1.6,
     sharpeRatio: -0.8,
     maxDrawdown: -4.5,
     tradeCount: 156,
     winRate: 42.0,
     status: 'completed',
     createdAt: '2023-10-26 14:20'
  }
];