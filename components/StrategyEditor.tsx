import React, { useState } from 'react';
import { StrategyItem, BacktestConfig } from '../types';
import { Button } from './ui/Button';
import { Play, Save, Settings, Code, Activity, X } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface StrategyEditorProps {
  strategy: StrategyItem;
  onSave: (strategy: StrategyItem) => void;
  onRunBacktest?: (strategy: StrategyItem, config: BacktestConfig) => void;
}

const ConfigModal = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (config: BacktestConfig) => void;
}) => {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [cash, setCash] = useState(100000);
  const [start, setStart] = useState('2023-01-01');
  const [end, setEnd] = useState('2023-12-31');
  const [params, setParams] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
       <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <Activity size={20} className="text-green-500" />
               {t('bt.config.title')}
             </h3>
             <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
          </div>
          
          <div className="space-y-4">
             <div>
               <label className="block text-xs text-slate-400 mb-1">{t('bt.config.symbol')}</label>
               <input 
                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none uppercase font-mono"
                 value={symbol}
                 onChange={(e) => setSymbol(e.target.value)}
                 placeholder="BTCUSDT"
               />
             </div>
             <div>
               <label className="block text-xs text-slate-400 mb-1">{t('bt.config.initial_cash')}</label>
               <input 
                 type="number"
                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none font-mono"
                 value={cash}
                 onChange={(e) => setCash(Number(e.target.value))}
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('bt.config.start_date')}</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('bt.config.end_date')}</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
             </div>
             <div>
               <label className="block text-xs text-slate-400 mb-1">{t('bt.config.params')}</label>
               <textarea 
                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono h-20 focus:ring-2 focus:ring-green-500 outline-none resize-none"
                 value={params}
                 onChange={(e) => setParams(e.target.value)}
                 placeholder={t('bt.config.params_placeholder')}
               />
             </div>
          </div>

          <div className="flex gap-3 justify-end mt-8">
            <Button variant="ghost" onClick={onClose}>{t('bt.config.cancel')}</Button>
            <Button 
              className="bg-green-600 hover:bg-green-500"
              icon={<Play size={16}/>}
              onClick={() => onConfirm({ symbol, initialCash: cash, startDate: start, endDate: end, parameters: params })}
            >
              {t('bt.config.confirm')}
            </Button>
          </div>
       </div>
    </div>
  );
}

export const StrategyEditor: React.FC<StrategyEditorProps> = ({ strategy, onSave, onRunBacktest }) => {
  const [code, setCode] = useState(strategy.code);
  const [name, setName] = useState(strategy.name);
  const [isRunning, setIsRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  const handleRunClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmRun = (config: BacktestConfig) => {
    setIsModalOpen(false);
    if (onRunBacktest) {
        setIsRunning(true);
        // Simulate local delay before handing off to app level
        setTimeout(() => {
            setIsRunning(false);
            onRunBacktest({ ...strategy, code, name }, config);
        }, 800);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Toolbar */}
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
         <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <input 
                className="bg-transparent text-slate-100 font-bold outline-none focus:border-b focus:border-purple-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                 <Code size={10} /> Backtrader (Python)
              </span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<Settings size={14}/>}>{t('editor.btn.config')}</Button>
            <Button variant="primary" size="sm" icon={<Save size={14} />} onClick={() => onSave({ ...strategy, code, name })}>{t('editor.btn.save')}</Button>
            <div className="w-px h-6 bg-slate-700 mx-1" />
            <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-500" 
                icon={<Play size={14}/>}
                onClick={handleRunClick}
                isLoading={isRunning}
            >
                {t('editor.btn.run')}
            </Button>
         </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative flex">
         {/* Line Numbers (Fake for UI) */}
         <div className="w-12 bg-slate-900 text-slate-600 text-right pr-3 pt-4 text-xs font-mono border-r border-slate-800 select-none">
            {Array.from({length: 50}, (_, i) => i + 1).map(n => (
              <div key={n} className="h-5 leading-5">{n}</div>
            ))}
         </div>

         {/* Code Input */}
         <div className="flex-1 bg-[#0d1117] relative">
            <textarea 
               className="w-full h-full bg-transparent text-slate-300 font-mono text-xs p-4 leading-5 outline-none resize-none selection:bg-purple-900/50"
               value={code}
               onChange={(e) => setCode(e.target.value)}
               spellCheck={false}
            />
         </div>
      </div>

      <ConfigModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirmRun} 
      />
    </div>
  );
};