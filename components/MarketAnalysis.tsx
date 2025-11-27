
import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, Area 
} from 'recharts';
import { Search, RefreshCw, BrainCircuit, TrendingUp, Activity, ArrowUp, ArrowDown, BarChart2, Loader2, DollarSign, PieChart, Table2, Layers } from 'lucide-react';
import { Button } from './ui/Button';
import { analyzeMarketData } from '../services/geminiService';
import { marketService, MarketDataPoint, MarketIndex, StockFundamentals, DragonTigerItem } from '../services/marketService';
import { useTranslation } from '../contexts/LanguageContext';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'SPY', 'QQQ', 'AAPL', 'NVDA', '600519.SH'];

export const MarketAnalysis: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [data, setData] = useState<MarketDataPoint[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [fundamentals, setFundamentals] = useState<StockFundamentals | null>(null);
  const [dragonTiger, setDragonTiger] = useState<DragonTigerItem[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { t } = useTranslation();

  const fetchData = async () => {
    setLoadingData(true);
    try {
        const [marketData, idxData, fundData, dtData] = await Promise.all([
            marketService.getMarketData(selectedSymbol),
            marketService.getMarketIndices(),
            marketService.getStockFundamentals(selectedSymbol),
            marketService.getDragonTigerList(selectedSymbol)
        ]);
        setData(marketData);
        setIndices(idxData);
        setFundamentals(fundData);
        setDragonTiger(dtData);
        setAiAnalysis(''); 
    } finally {
        setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSymbol]);

  const latest = data[data.length - 1] || { close: 0, open: 0, high: 0, low: 0, volume: 0 };
  const prev = data[data.length - 2] || { close: 0 };
  const changePct = prev.close ? ((latest.close - prev.close) / prev.close) * 100 : 0;
  const isPositive = changePct >= 0;

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const recentData = data.slice(-5).map(d => 
      `Date: ${d.date}, Close: ${d.close.toFixed(2)}`
    ).join('\n');
    
    // Construct a comprehensive prompt
    const summary = `
      Symbol: ${selectedSymbol}
      Current Price: ${latest.close.toFixed(2)} (24h Change: ${changePct.toFixed(2)}%)
      
      Fundamentals:
      - P/E (TTM): ${fundamentals?.pe_ttm}
      - P/B: ${fundamentals?.pb}
      - Market Cap: ${fundamentals?.market_cap}
      - Sector: ${fundamentals?.sector}
      
      Capital Flow (Dragon Tiger List):
      - Top Net Buy Seat: ${dragonTiger[0]?.seatName} (Net: ${dragonTiger[0]?.net})
      - Top Net Sell Seat: ${dragonTiger[dragonTiger.length-1]?.seatName} (Net: ${dragonTiger[dragonTiger.length-1]?.net})
      
      Recent Price Action:
      ${recentData}

      Please provide a comprehensive diagnosis. Include fundamental evaluation, institutional flow analysis, and technical trend.
    `;

    const result = await analyzeMarketData(summary);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
       {/* Top Bar: Controls & Key Metric */}
       <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0 backdrop-blur z-10">
          <div className="flex items-center gap-6">
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
             <div className="flex items-center gap-8">
                <div>
                   <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">{t('market.last_price')}</span>
                   <span className={`text-xl font-bold font-mono flex items-center gap-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      ${latest.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                </div>
                <div>
                   <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">{t('market.change_24h')}</span>
                   <span className={`text-sm font-bold font-mono flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                      {Math.abs(changePct).toFixed(2)}%
                   </span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={fetchData} disabled={loadingData}>
               {t('market.btn.refresh')}
             </Button>
          </div>
       </div>

       <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* Market Indices Banner */}
          <div className="bg-slate-900 border-b border-slate-800 p-2 flex gap-4 overflow-x-auto shrink-0 scrollbar-hide">
              <div className="flex items-center gap-2 px-3 text-slate-400 text-xs font-bold uppercase shrink-0">
                  <Activity size={14} className="text-cyan-400"/> {t('market.indices')}
              </div>
              {indices.map(idx => (
                  <div key={idx.name} className="flex flex-col justify-center px-4 py-1 bg-slate-800/50 rounded-lg border border-slate-700 min-w-[140px]">
                      <div className="text-[10px] text-slate-400 font-medium">{idx.name}</div>
                      <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-200">{idx.value.toLocaleString()}</span>
                          <span className={`text-xs font-mono ${idx.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {idx.change >= 0 ? '+' : ''}{idx.changePct}%
                          </span>
                      </div>
                  </div>
              ))}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Left Column: Chart & Dragon Tiger */}
            <div className="flex-1 bg-slate-950 flex flex-col overflow-y-auto">
                {/* Chart Section */}
                <div className="h-[400px] p-4 flex flex-col border-b border-slate-800">
                    <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-xl p-4 relative flex flex-col">
                        {loadingData ? (
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                            </div>
                        ) : (
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
                        )}
                    </div>
                </div>

                {/* Dragon Tiger List */}
                <div className="flex-1 p-4">
                    <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
                       <Table2 size={16} className="text-orange-400" /> {t('market.dragon_tiger')}
                    </h3>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
                                <tr>
                                    <th className="p-3 font-medium">{t('market.dt.seat')}</th>
                                    <th className="p-3 font-medium text-right">{t('market.dt.buy')}</th>
                                    <th className="p-3 font-medium text-right">{t('market.dt.sell')}</th>
                                    <th className="p-3 font-medium text-right">{t('market.dt.net')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {dragonTiger.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/30">
                                        <td className="p-3 text-slate-300 font-medium">{item.seatName}</td>
                                        <td className="p-3 text-right text-red-400 font-mono">{item.buy.toLocaleString()}</td>
                                        <td className="p-3 text-right text-green-400 font-mono">{item.sell.toLocaleString()}</td>
                                        <td className={`p-3 text-right font-mono font-bold ${item.net > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            {item.net > 0 ? '+' : ''}{item.net.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {dragonTiger.length === 0 && (
                                    <tr><td colSpan={4} className="p-4 text-center text-slate-500">No data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Column: Fundamentals & AI */}
            <div className="w-full lg:w-96 border-l border-slate-800 bg-slate-900 p-6 flex flex-col gap-6 overflow-y-auto z-20 shadow-2xl">
                
                {/* Fundamentals */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
                       <PieChart size={16} className="text-blue-400" /> {t('market.fundamentals')}
                    </h3>
                    {fundamentals ? (
                         <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                             <div>
                                 <div className="text-[10px] text-slate-500 mb-1">{t('market.pe')}</div>
                                 <div className="text-sm font-mono text-slate-200">{fundamentals.pe_ttm}</div>
                             </div>
                             <div>
                                 <div className="text-[10px] text-slate-500 mb-1">{t('market.pb')}</div>
                                 <div className="text-sm font-mono text-slate-200">{fundamentals.pb}</div>
                             </div>
                             <div>
                                 <div className="text-[10px] text-slate-500 mb-1">{t('market.mkt_cap')}</div>
                                 <div className="text-sm font-mono text-slate-200">{fundamentals.market_cap}</div>
                             </div>
                             <div>
                                 <div className="text-[10px] text-slate-500 mb-1">{t('market.eps')}</div>
                                 <div className="text-sm font-mono text-slate-200">{fundamentals.eps}</div>
                             </div>
                             <div>
                                 <div className="text-[10px] text-slate-500 mb-1">{t('market.sector')}</div>
                                 <div className="text-sm text-slate-200 truncate">{fundamentals.sector}</div>
                             </div>
                             <div>
                                 <div className="text-[10px] text-slate-500 mb-1">{t('market.turnover')}</div>
                                 <div className="text-sm font-mono text-slate-200">{fundamentals.turnover_rate}%</div>
                             </div>
                         </div>
                    ) : (
                        <div className="text-xs text-slate-500 text-center py-4">Loading...</div>
                    )}
                </div>

                <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-xl p-1 border border-slate-700/50 shadow-lg">
                    <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <BrainCircuit size={16} className="text-purple-400" /> {t('market.gemini_analyst')}
                    </h3>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto min-h-[200px]">
                    {isAnalyzing ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-500 animate-in fade-in">
                            <Loader2 size={32} className="text-purple-500 animate-spin" />
                            <span className="text-xs font-medium">{t('market.analyzing')}</span>
                        </div>
                    ) : aiAnalysis ? (
                        <div className="prose prose-invert prose-sm animate-in slide-in-from-bottom-2 fade-in duration-500">
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
                            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-500">
                                <Activity size={12} /> {t('market.analysis_generated')}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-600">
                            <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-2">
                                <TrendingUp size={24} className="opacity-50"/>
                            </div>
                            <p className="text-xs text-center max-w-[200px]">
                                {t('market.click_analyze')}
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
                        {aiAnalysis ? t('market.btn.update_analysis') : t('market.btn.analyze')}
                    </Button>
                    </div>
                </div>
            </div>
          </div>
       </div>
    </div>
  );
};
