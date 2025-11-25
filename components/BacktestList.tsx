import React, { useEffect, useState } from 'react';
import { BacktestReport } from '../types';
import { Button } from './ui/Button';
import { Search, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { backtestService } from '../services/backtestService';

interface BacktestListProps {
  onSelect: (report: BacktestReport) => void;
}

export const BacktestList: React.FC<BacktestListProps> = ({ onSelect }) => {
  const [reports, setReports] = useState<BacktestReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await backtestService.getAll();
      setReports(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-green-500"/></div>;

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">Backtest Evaluation</h2>
            <p className="text-slate-400 mt-1">Review performance reports from your automated strategy tests.</p>
          </div>
          <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder="Search reports..." 
                 className="bg-slate-900/50 border border-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-cyan-500 outline-none w-64 text-slate-200"
               />
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl shadow-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Strategy / Symbol</th>
                <th className="p-4 font-medium">Date Range</th>
                <th className="p-4 font-medium text-right">Return</th>
                <th className="p-4 font-medium text-right">Sharpe</th>
                <th className="p-4 font-medium text-right">Max DD</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {reports.map((report) => (
                <tr 
                  key={report.id} 
                  className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => onSelect(report)}
                >
                  <td className="p-4">
                    {report.status === 'completed' ? (
                       <div className="flex items-center gap-2 text-green-400 bg-green-900/10 px-2 py-1 rounded-full w-fit">
                         <CheckCircle size={14} /> <span className="text-xs font-bold">Success</span>
                       </div>
                    ) : report.status === 'failed' ? (
                       <div className="flex items-center gap-2 text-red-400 bg-red-900/10 px-2 py-1 rounded-full w-fit">
                         <XCircle size={14} /> <span className="text-xs font-bold">Failed</span>
                       </div>
                    ) : (
                       <div className="flex items-center gap-2 text-yellow-400 bg-yellow-900/10 px-2 py-1 rounded-full w-fit">
                         <Clock size={14} className="animate-spin" /> <span className="text-xs font-bold">Running</span>
                       </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-200">{report.strategyName}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{report.symbol} • {report.interval}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {report.startDate} <span className="text-slate-600">to</span> {report.endDate}
                  </td>
                  <td className="p-4 text-right">
                    <div className={`font-mono font-medium ${report.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {report.returnPct > 0 ? '+' : ''}{report.returnPct}%
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-slate-300">
                    {report.sharpeRatio.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-mono text-red-400">
                    {report.maxDrawdown}%
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {report.createdAt}
                  </td>
                  <td className="p-4 text-right">
                     <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                       View Report
                     </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};