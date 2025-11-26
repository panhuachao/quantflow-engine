
import React, { useEffect, useState } from 'react';
import { DashboardMeta } from '../types';
import { Button } from './ui/Button';
import { Pagination } from './ui/Pagination';
import { Plus, LayoutGrid, BarChart3, Clock, MoreVertical, ExternalLink, Loader2 } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useTranslation } from '../contexts/LanguageContext';

interface DashboardListProps {
  onSelect: (dashboard: DashboardMeta) => void;
  onCreate: () => void;
}

export const DashboardList: React.FC<DashboardListProps> = ({ onSelect, onCreate }) => {
  const [dashboards, setDashboards] = useState<DashboardMeta[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { t } = useTranslation();

  useEffect(() => {
    const load = async () => {
        const data = await dashboardService.getAll();
        setDashboards(data);
        setLoading(false);
    }
    load();
  }, []);

  // Pagination Logic (No filtering yet for Dashboards, but could be added)
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentDashboards = dashboards.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <div className="h-full flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-cyan-500"/></div>;

  return (
    <div className="p-8 h-full flex flex-col bg-slate-950 overflow-hidden">
       <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-8">
         
         <div className="flex items-center justify-between shrink-0">
            <div>
               <h2 className="text-3xl font-bold text-slate-100">{t('dashboard.title')}</h2>
               <p className="text-slate-400 mt-1">{t('dashboard.desc')}</p>
            </div>
            <Button onClick={onCreate} icon={<Plus size={18}/>}>
              {t('dashboard.new')}
            </Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 content-start overflow-y-auto min-h-0 pr-2">
            {/* Create New Card Always Visible or First? Let's keep it first in list or separate. 
                Common UX is to have it as the first item of the list, 
                but for pagination, usually it's a separate action or part of the first page.
                Here, let's include it in the grid but strictly it's not "paginated" data. 
                Let's keep it separate or just insert it into the view if on page 1.
            */}
            {currentPage === 1 && (
                <div 
                onClick={onCreate}
                className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500/50 hover:text-cyan-500 hover:bg-slate-900/50 transition-all cursor-pointer min-h-[280px]"
                >
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4 group-hover:bg-cyan-500/10">
                    <Plus size={24} />
                </div>
                <span className="font-semibold">{t('dashboard.create_card')}</span>
                </div>
            )}

            {currentDashboards.map((dash) => (
               <div 
                 key={dash.id}
                 className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-cyan-900/10 transition-all cursor-pointer flex flex-col min-h-[280px]"
                 onClick={() => onSelect(dash)}
               >
                 {/* Thumbnail / Header */}
                 <div className={`h-32 w-full ${dash.thumbnailColor} relative flex items-center justify-center border-b border-slate-800/50 shrink-0`}>
                    <BarChart3 className="text-white/20 w-16 h-16" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-1.5 bg-slate-950/50 hover:bg-slate-900 text-white rounded backdrop-blur">
                          <MoreVertical size={16} />
                       </button>
                    </div>
                 </div>

                 <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors mb-2">{dash.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{dash.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 text-xs text-slate-400 mt-auto">
                       <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5"><LayoutGrid size={12}/> {dash.widgetCount} {t('dashboard.widgets')}</span>
                          <span className="flex items-center gap-1.5"><Clock size={12}/> {dash.updatedAt}</span>
                       </div>
                       <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                 </div>
               </div>
            ))}
         </div>

         <div className="shrink-0">
            <Pagination 
                currentPage={currentPage}
                totalItems={dashboards.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
            />
         </div>
       </div>
    </div>
  );
};
