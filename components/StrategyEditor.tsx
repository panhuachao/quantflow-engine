
import React, { useState } from 'react';
import { StrategyItem } from '../types';
import { Button } from './ui/Button';
import { Play, Save, Settings, Code, Activity } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface StrategyEditorProps {
  strategy: StrategyItem;
  onSave: (strategy: StrategyItem) => void;
  onRunBacktest?: (strategy: StrategyItem) => void;
}

export const StrategyEditor: React.FC<StrategyEditorProps> = ({ strategy, onSave, onRunBacktest }) => {
  const [code, setCode] = useState(strategy.code);
  const [name, setName] = useState(strategy.name);
  const [isRunning, setIsRunning] = useState(false);
  const { t } = useTranslation();

  const handleRun = () => {
    if (onRunBacktest) {
        setIsRunning(true);
        // Simulate local delay before handing off to app level
        setTimeout(() => {
            setIsRunning(false);
            onRunBacktest({ ...strategy, code, name });
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
                onClick={handleRun}
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
    </div>
  );
};