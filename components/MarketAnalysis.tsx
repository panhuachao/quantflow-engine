import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, Area 
} from 'recharts';
import { Search, RefreshCw, BrainCircuit, TrendingUp, Activity, ArrowUp, ArrowDown, BarChart2 } from 'lucide-react';
import { Button } from './ui/Button';
import { analyzeMarketData } from '../services/geminiService';

// --- Types ---
interface MarketDataPoint {
  time: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma7: number;
  ma25: number;
}

// --- Mock Data Generator ---
const generateMarketData = (symbol: string, count = 50): MarketDataPoint[] => {
  // Seed price based on symbol
  let price = symbol.includes('BTC') ? 42000 : symbol.includes('ETH') ? 2250 : symbol.includes('SPY') ? 440 : 150;
  const data: MarketDataPoint[] = [];
  
  for (let i = 0; i < count; i++) {
    const volatility = price * 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * volatility;
    const close = price + change;
    const open = price;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.2);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.2);
    
    // Update next open
    price = close;

    data.push({
      time: i,
      date: `10-${(i % 30) + 1} ${Math.floor(i/30)*4 + 9}:00`,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 5000) + 1000,
      ma7: close * (1 + (Math.random() - 0.5) * 0.03), 
      ma25: close * (1 + (Math.random() - 0.5) * 0.08), 
    });
  }
  return data;
};

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'SPY', 'QQQ', 'AAPL', 'NVDA'];

export const MarketAnalysis: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [data, setData] = useState<MarketDataPoint[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load Data on Symbol Change
  useEffect(() => {
    setData(generateMarketData(selectedSymbol));
    setAiAnalysis(''); 
  }, [selectedSymbol]);

  // Derived Stats
  const latest = data[data.length - 1] || { close: 0, open: 0, high: 0, low: 0, volume: 0 };
  const prev = data[data.length - 2] || { close: 0 };
  const changePct = prev.close ? ((latest.close - prev.close) / prev.close) * 100 : 0;
  const isPositive = changePct >= 0;

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    // Prepare a summary string for the AI
    const recentData = data.slice(-10).map(d => 
      `Date: ${d.date}, Close: ${d.close.toFixed(2)}, High: ${d.high.toFixed(2)}, Low: ${d.low.toFixed(2)}`
    ).join('\n');
    
    const summary = `
      Symbol: ${selectedSymbol}
      Current Price: ${latest.close.toFixed(2)}
      24h Change: ${changePct.toFixed(2)}%
      Recent Price Action (Last 10 periods):
      ${recentData}
    `;

    const result = await analyzeMarketData(summary);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
       {/* Toolbar */}
       <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0 backdrop-blur z-10">
          <div className="flex items-center gap-6">
             {/* Symbol Select */}
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={16} />
                <select 
                  className="bg-slate-950 border border-slate-700 text-sm rounded-lg pl-10 pr-8 py-2 focus:ring-2 focus:ring-cyan-500 outline-none text-slate-200 appearance-none cursor-pointer hover:border-slate-600 font-bold"
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                >
                   {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             
             <div className="h-8 w-px bg-slate-800" />
             
             {/* Header Stats */}
             <div className="flex items-center gap-8">
                <div>
                   <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">Last Price</span>
                   <span className={`text-xl font-bold font-mono flex items-center gap-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      ${latest.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                </div>
                <div>
                   <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">24h Change</span>
                   <span className={`text-sm font-bold font-mono flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                      {Math.abs(changePct).toFixed(2)}%
                   </span>
                </div>
                <div className="hidden md:block">
                   <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">Volume</span>
                   <span className="text-sm font-bold font-mono text-slate-300">
                      {latest.volume.toLocaleString()}
                   </span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={() => setData(generateMarketData(selectedSymbol))}>
               Refresh
             </Button>
          </div>
       </div>

       {/* Content Grid */}
       <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Main Chart Area */}
          <div className="flex-1 bg-slate-950 p-4 flex flex-col min-h-[400px]">
             <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-xl p-4 relative flex flex-col">
                {/* Chart Header Controls */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                   {['15m', '1H', '4H', '1D'].map(tf => (
                      <button key={tf} className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-400 font-medium transition-colors">
                        {tf}
                      </button>
                   ))}
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                       dataKey="date" 
                       stroke="#64748b" 
                       tick={{fontSize: 10}} 
                       axisLine={false} 
                       tickLine={false} 
                       minTickGap={40}
                    />
                    <YAxis 
                       domain={['auto', 'auto']} 
                       stroke="#64748b" 
                       tick={{fontSize: 10}} 
                       axisLine={false} 
                       tickLine={false} 
                       tickFormatter={(val) => `$${val}`}
                       width={60}
                    />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                       formatter={(val: number) => val.toFixed(2)}
                       itemStyle={{ fontSize: 12 }}
                       labelStyle={{ fontSize: 10, color: '#94a3b8', marginBottom: 5 }}
                    />
                    
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke={isPositive ? "#10b981" : "#ef4444"} 
                      fill="url(#colorPrice)" 
                      strokeWidth={2}
                    />
                    <Line type="monotone" dataKey="ma7" stroke="#818cf8" strokeWidth={1} dot={false} activeDot={false} name="MA (7)" />
                    <Line type="monotone" dataKey="ma25" stroke="#fbbf24" strokeWidth={1} dot={false} activeDot={false} name="MA (25)" />

                  </ComposedChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Sidebar / AI Panel */}
          <div className="w-full lg:w-96 border-l border-slate-800 bg-slate-900 p-6 flex flex-col gap-6 overflow-y-auto z-20 shadow-2xl">
             
             {/* Key Stats */}
             <div>
                <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
                   <BarChart2 size={16} className="text-cyan-400" /> Market Depth & Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-[10px] text-slate-500 mb-1">High (24h)</div>
                      <div className="text-sm font-mono text-slate-200">${Math.max(...data.map(d => d.high)).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                   </div>
                   <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-[10px] text-slate-500 mb-1">Low (24h)</div>
                      <div className="text-sm font-mono text-slate-200">${Math.min(...data.map(d => d.low)).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                   </div>
                   <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-[10px] text-slate-500 mb-1">Vol (24h)</div>
                      <div className="text-sm font-mono text-slate-200">${(data.reduce((acc, curr) => acc + curr.volume, 0) / 1000).toFixed(1)}K</div>
                   </div>
                   <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-[10px] text-slate-500 mb-1">Volatility</div>
                      <div className="text-sm font-mono text-slate-200">Medium</div>
                   </div>
                </div>
             </div>

             {/* AI Analysis Section */}
             <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-xl p-1 border border-slate-700/50 shadow-lg">
                <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                   <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <BrainCircuit size={16} className="text-purple-400" /> Gemini Analyst
                   </h3>
                   <div className="flex gap-2">
                      <span className="text-[10px] bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">v2.5 Flash</span>
                   </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto min-h-[200px]">
                   {isAnalyzing ? (
                      <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-500 animate-in fade-in">
                         <div className="relative">
                           <BrainCircuit size={32} className="text-purple-500 animate-pulse" />
                           <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
                         </div>
                         <span className="text-xs font-medium">Processing market structure...</span>
                      </div>
                   ) : aiAnalysis ? (
                      <div className="prose prose-invert prose-sm animate-in slide-in-from-bottom-2 fade-in duration-500">
                         <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
                         <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-500">
                            <Activity size={12} /> Analysis generated based on recent price action.
                         </div>
                      </div>
                   ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-600">
                         <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-2">
                            <TrendingUp size={24} className="opacity-50"/>
                         </div>
                         <p className="text-xs text-center max-w-[200px]">
                            Click "Analyze" to generate an instant technical summary using AI.
                         </p>
                      </div>
                   )}
                </div>

                <div className="p-3 bg-slate-900/50 rounded-b-lg border-t border-slate-700/50">
                   <Button 
                     className="w-full bg-purple-600 hover:bg-purple-500 shadow-purple-500/25 transition-all active:scale-[0.98]" 
                     onClick={handleAiAnalysis}
                     isLoading={isAnalyzing}
                     icon={<BrainCircuit size={16} />}
                   >
                     {aiAnalysis ? 'Update Analysis' : 'Analyze Market Data'}
                   </Button>
                </div>
             </div>

          </div>
       </div>
    </div>
  );
};
