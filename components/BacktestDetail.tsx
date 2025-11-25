
import React from 'react';
import { BacktestReport } from '../types';
import { Button } from './ui/Button';
import { ArrowLeft, Download, ExternalLink, Calendar, DollarSign, Activity, Percent } from 'lucide-react';

interface BacktestDetailProps {
  report: BacktestReport;
  onBack: () => void;
}

const StatCard = ({ label, value, subValue, type = 'neutral' }: { label: string, value: string, subValue?: string, type?: 'positive' | 'negative' | 'neutral' }) => (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col">
    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">{label}</span>
    <span className={`text-2xl font-bold font-mono ${
      type === 'positive' ? 'text-green-400' : 
      type === 'negative' ? 'text-red-400' : 
      'text-slate-100'
    }`}>
      {value}
    </span>
    {subValue && <span className="text-xs text-slate-500 mt-1">{subValue}</span>}
  </div>
);

export const BacktestDetail: React.FC<BacktestDetailProps> = ({ report, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 backdrop-blur">
         <div className="flex items-center gap-4">
           <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
           </button>
           <div>
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
               {report.strategyName}
               <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                 {report.symbol} / {report.interval}
               </span>
             </h2>
             <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>{report.startDate} — {report.endDate}</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full"/>
                <span>ID: {report.id}</span>
             </div>
           </div>
         </div>
         <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<Download size={14}/>}>Export CSV</Button>
            <Button variant="primary" size="sm" icon={<ExternalLink size={14}/>}>Open Full HTML</Button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
           
           {/* Metrics Grid */}
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <StatCard 
                 label="Total Return" 
                 value={`${report.returnPct > 0 ? '+' : ''}${report.returnPct}%`} 
                 type={report.returnPct >= 0 ? 'positive' : 'negative'}
              />
              <StatCard 
                 label="Sharpe Ratio" 
                 value={report.sharpeRatio.toFixed(2)} 
                 type={report.sharpeRatio > 1 ? 'positive' : 'neutral'}
              />
              <StatCard 
                 label="Max Drawdown" 
                 value={`${report.maxDrawdown}%`} 
                 type="negative"
              />
              <StatCard 
                 label="Win Rate" 
                 value={`${report.winRate}%`} 
                 subValue={`${report.tradeCount} Trades`}
              />
              <StatCard 
                 label="Final Equity" 
                 value={`$${report.finalValue.toLocaleString()}`} 
                 subValue={`Initial: $${report.initialCash.toLocaleString()}`}
              />
              <StatCard 
                 label="SQN Score" 
                 value={(report.sharpeRatio * Math.sqrt(report.tradeCount)).toFixed(2)} 
                 type="neutral"
              />
           </div>

           {/* HTML Report View (Iframe) */}
           <div className="bg-white rounded-lg overflow-hidden h-[800px] border border-slate-700 shadow-2xl">
              {report.reportHtml ? (
                 <iframe 
                   title="Backtest Report"
                   srcDoc={report.reportHtml}
                   className="w-full h-full border-none"
                   sandbox="allow-scripts"
                 />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                   No visual report available.
                </div>
              )}
           </div>

        </div>
      </div>
    </div>
  );
};
