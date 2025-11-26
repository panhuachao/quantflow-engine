import React, { useEffect, useState } from 'react';
import { StrategyItem } from '../types';
import { Button } from './ui/Button';
import { Plus, Search, MoreHorizontal, Code2, Tag, Calendar, FileCode, Loader2 } from 'lucide-react';
import { strategyService } from '../services/strategyService';
import { useTranslation } from '../contexts/LanguageContext';

interface StrategyListProps {
  onSelect: (strategy: StrategyItem) => void;
  onCreate: () => void;
}

export const StrategyList: React.FC<StrategyListProps> = ({ onSelect, onCreate }) => {
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const load = async () => {
        const data = await strategyService.getAll();
        setStrategies(data);
        setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-purple-500"/></div>;

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">{t('strategy.title')}</h2>
            <p className="text-slate-400 mt-1">{t('strategy.desc')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder={t('strategy.search')}
                 className="bg-slate-900/50 border border-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none w-64 text-slate-200"
               />
            </div>
            <Button onClick={onCreate} icon={<Plus size={18}/>} className="bg-purple-600 hover:bg-purple-500 shadow-purple-500/20">
              {t('strategy.new')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {strategies.map((strategy) => (
            <div 
              key={strategy.id} 
              className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-purple-900/10 transition-all cursor-pointer flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
              onClick={() => onSelect(strategy)}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-purple-900/30 text-purple-400 border border-purple-800">
                   <Code2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">{strategy.name}</h3>
                    <div className="flex gap-1">
                      {strategy.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-[10px] rounded bg-slate-800 border border-slate-700 text-slate-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-1">{strategy.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                       <FileCode size={12} />
                       {strategy.framework}
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Calendar size={12} />
                       {t('workflow.updated')} {strategy.updatedAt}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                 <Button 
                   variant="secondary" 
                   size="sm" 
                   className="opacity-0 group-hover:opacity-100 transition-opacity"
                   onClick={(e) => { e.stopPropagation(); onSelect(strategy); }}
                 >
                   {t('strategy.btn.edit_code')}
                 </Button>
                 <Button 
                   variant="ghost" 
                   size="sm"
                   className="text-slate-400 hover:text-white"
                   onClick={(e) => e.stopPropagation()}
                 >
                   <MoreHorizontal size={18} />
                 </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
