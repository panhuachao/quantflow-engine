import React, { useEffect, useState } from 'react';
import { BacktestReport } from '../types';
import { Button } from './ui/Button';
import { Pagination } from './ui/Pagination';
import { Search, CheckCircle, XCircle, Clock, Loader2, Settings } from 'lucide-react';
import { backtestService } from '../services/backtestService';
import { useTranslation } from '../contexts/LanguageContext';

interface BacktestListProps {
  onSelect: (report: BacktestReport) => void;
}

export const BacktestList: React.FC<BacktestListProps> = ({ onSelect }) => {
  const [reports, setReports] = useState<BacktestReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { t } = useTranslation();

  useEffect(() => {
    const load = async () => {
      const data = await backtestService.getAll();
      setReports(data);
      setLoading(false);
    }
    load();
  }, []);

  // Filter Logic
  const filteredReports = reports.filter(r => 
      r.strategyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <div className="h-full flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-green-500"/></div>;

  return (
    <div className="p-8 h-full flex flex-col bg-slate-950">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">{t('backtest.title')}</h2>
            <p className="text-slate-400 mt-1">{t('backtest.desc')}</p>
          </div>
          <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder={t('backtest.search')}
                 value={searchTerm}
                 onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                 className="bg-slate-900/50 border border-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-cyan-500 outline-none w-64 text-slate-200"
               />
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl shadow-black/20 flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="p-4 font-medium">{t('backtest.col.status')}</th>
                    <th className="p-4 font-medium">{t('backtest.col.strategy')}</th>
                    <th className="p-4 font-medium hidden md:table-cell">{t('backtest.col.config')}</th>
                    <th className="p-4 font-medium">{t('backtest.col.date_range')}</th>
                    <th className="p-4 font-medium text-right">{t('backtest.col.return')}</th>
                    <th className="p-4 font-medium text-right hidden sm:table-cell">{t('backtest.col.sharpe')}</th>
                    <th className="p-4 font-medium text-right hidden sm:table-cell">{t('backtest.col.max_dd')}</th>
                    <th className="p-4 font-medium hidden lg:table-cell">{t('backtest.col.created')}</th>
                    <th className="p-4"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                {currentReports.length === 0 && (
                    <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-500">No reports found.</td>
                    </tr>
                )}
                {currentReports.map((report) => (
                    <tr 
                    key={report.id} 
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => onSelect(report)}
                    >
                    <td className="p-4">
                        {report.status === 'completed' ? (
                        <div className="flex items-center gap-2 text-green-400 bg-green-900/10 px-2 py-1 rounded-full w-fit">
                            <CheckCircle size={14} /> <span className="text-xs font-bold">{t('backtest.status.success')}</span>
                        </div>
                        ) : report.status === 'failed' ? (
                        <div className="flex items-center gap-2 text-red-400 bg-red-900/10 px-2 py-1 rounded-full w-fit">
                            <XCircle size={14} /> <span className="text-xs font-bold">{t('backtest.status.failed')}</span>
                        </div>
                        ) : (
                        <div className="flex items-center gap-2 text-yellow-400 bg-yellow-900/10 px-2 py-1 rounded-full w-fit">
                            <Clock size={14} className="animate-spin" /> <span className="text-xs font-bold">{t('backtest.status.running')}</span>
                        </div>
                        )}
                    </td>
                    <td className="p-4">
                        <div className="font-semibold text-slate-200">{report.strategyName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{report.id.substring(0,8)}</div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-orange-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded w-fit">
                            {report.symbol}
                        </span>
                        {report.parameters && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono max-w-[150px] truncate" title={report.parameters}>
                            <Settings size={10} /> {report.parameters}
                            </div>
                        )}
                        </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                        <div className="whitespace-nowrap">{report.startDate}</div>
                        <div className="text-[10px] text-slate-600">to {report.endDate}</div>
                    </td>
                    <td className="p-4 text-right">
                        <div className={`font-mono font-medium ${report.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {report.returnPct > 0 ? '+' : ''}{report.returnPct}%
                        </div>
                    </td>
                    <td className="p-4 text-right font-mono text-slate-300 hidden sm:table-cell">
                        {report.sharpeRatio.toFixed(2)}
                    </td>
                    <td className="p-4 text-right font-mono text-red-400 hidden sm:table-cell">
                        {report.maxDrawdown}%
                    </td>
                    <td className="p-4 text-sm text-slate-500 hidden lg:table-cell">
                        {report.createdAt}
                    </td>
                    <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        {t('backtest.btn.view')}
                        </Button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>

        <Pagination 
            currentPage={currentPage}
            totalItems={filteredReports.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
};