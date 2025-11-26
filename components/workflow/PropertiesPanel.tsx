
import React, { useState, useEffect } from 'react';
import { NodeData, NodeType } from '../../types';
import { NODE_ICONS_COLOR } from '../../constants';
import { X, Clock, DownloadCloud, Code, Server, Wand2, Trash2, Search, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { generateStrategyCode } from '../../services/geminiService';

interface PropertiesPanelProps {
  node: NodeData;
  onClose: () => void;
  onUpdate: (key: string, value: any) => void;
  onDelete: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, onClose, onUpdate, onDelete }) => {
  const [nodePrompt, setNodePrompt] = useState(node.config.description || '');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync local prompt state when node changes
  useEffect(() => {
    setNodePrompt(node.config.description || '');
  }, [node.id]);

  const handleGenerateCode = async () => {
    if (!nodePrompt) return;
    setIsGenerating(true);
    const code = await generateStrategyCode(nodePrompt);
    onUpdate('config.parameters', code);
    onUpdate('config.description', nodePrompt);
    setIsGenerating(false);
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto z-20 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Properties</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Node Label</label>
          <input 
            type="text" 
            value={node.label}
            onChange={(e) => onUpdate('label', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
          />
        </div>

        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Node Type</span>
            <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-700 ${NODE_ICONS_COLOR[node.type]}`}>{node.type}</span>
          </div>
        </div>

        {/* TIMER CONFIG */}
        {node.type === NodeType.TIMER && (
          <div className="space-y-4 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-teal-400">
              <Clock size={16} />
              <span className="text-sm font-semibold">Scheduler Config</span>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Cron Expression</label>
              <input 
                type="text"
                placeholder="0 9 * * 1-5"
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                value={node.config.cron || ''}
                onChange={(e) => onUpdate('config.cron', e.target.value)}
              />
              <div className="mt-2 text-[10px] text-slate-500">
                Example: <code className="bg-slate-800 px-1 rounded">0 9 * * 1-5</code> (Mon-Fri 9:00 AM)
              </div>
            </div>
          </div>
        )}

        {/* DATA COLLECTION CONFIG */}
        {node.type === NodeType.DATA_COLLECT && (
          <div className="space-y-4 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-orange-400">
              <DownloadCloud size={16} />
              <span className="text-sm font-semibold">Data Source Config</span>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Provider</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                value={node.config.source || 'AkShare'}
                onChange={(e) => onUpdate('config.source', e.target.value)}
              >
                <option value="AkShare">AkShare (Open Source)</option>
                <option value="Tushare">Tushare Pro</option>
                <option value="Binance">Binance Public API</option>
                <option value="Yahoo">Yahoo Finance</option>
              </select>
            </div>
            {node.config.source === 'Tushare' && (
              <div>
                <label className="block text-xs text-slate-400 mb-2">Tushare Token</label>
                <input 
                  type="password"
                  placeholder="Enter API Token"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none"
                  value={node.config.token || ''}
                  onChange={(e) => onUpdate('config.token', e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-400 mb-2">Symbol / Code</label>
              <input 
                type="text"
                placeholder="e.g., 600519.SH or BTCUSDT"
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                value={node.config.symbol || ''}
                onChange={(e) => onUpdate('config.symbol', e.target.value)}
              />
            </div>
            <Button variant="secondary" size="sm" className="w-full text-xs">Test Connection</Button>
          </div>
        )}

        {/* DB QUERY CONFIG */}
        {node.type === NodeType.DATABASE_QUERY && (
          <div className="space-y-4 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-sky-400">
              <Search size={16} />
              <span className="text-sm font-semibold">Data Query Config</span>
            </div>
            <div>
               <label className="block text-xs text-slate-400 mb-2">Connection String / DSN</label>
               <input 
                 type="text"
                 placeholder="postgres://user:pass@localhost:5432/db"
                 className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                 value={node.config.connectionString || ''}
                 onChange={(e) => onUpdate('config.connectionString', e.target.value)}
               />
            </div>
            <div>
               <label className="block text-xs text-slate-400 mb-2">SQL Query</label>
               <textarea 
                 className="w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-xs font-mono text-sky-300 focus:ring-2 focus:ring-sky-500 outline-none h-48 resize-none"
                 placeholder="SELECT * FROM market_data WHERE date > NOW() - INTERVAL '1 day';"
                 value={node.config.query || ''}
                 onChange={(e) => onUpdate('config.query', e.target.value)}
               />
            </div>
            <Button variant="secondary" size="sm" className="w-full text-xs">Validate Query</Button>
          </div>
        )}

        {/* HTTP REQUEST CONFIG */}
        {node.type === NodeType.HTTP_REQUEST && (
          <div className="space-y-4 border-t border-slate-800 pt-4">
             <div className="flex items-center gap-2 text-violet-400">
                <Globe size={16} />
                <span className="text-sm font-semibold">HTTP Request Config</span>
             </div>
             <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                   <label className="block text-xs text-slate-400 mb-2">Method</label>
                   <select 
                      className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-violet-500"
                      value={node.config.method || 'GET'}
                      onChange={(e) => onUpdate('config.method', e.target.value)}
                   >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                   </select>
                </div>
                <div className="col-span-2">
                   <label className="block text-xs text-slate-400 mb-2">URL</label>
                   <input 
                     type="text"
                     placeholder="https://api.example.com/v1/webhook"
                     className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-violet-500"
                     value={node.config.url || ''}
                     onChange={(e) => onUpdate('config.url', e.target.value)}
                   />
                </div>
             </div>
             <div>
                <label className="block text-xs text-slate-400 mb-2">Headers (JSON)</label>
                <textarea 
                   className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-xs font-mono text-violet-200 focus:ring-2 focus:ring-violet-500 outline-none h-20 resize-none"
                   placeholder='{"Content-Type": "application/json", "Authorization": "Bearer ..."}'
                   value={node.config.headers || ''}
                   onChange={(e) => onUpdate('config.headers', e.target.value)}
                />
             </div>
             <div>
                <label className="block text-xs text-slate-400 mb-2">Request Body</label>
                <textarea 
                   className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-xs font-mono text-slate-300 focus:ring-2 focus:ring-violet-500 outline-none h-32 resize-none"
                   placeholder='{ "data": "payload" }'
                   value={node.config.body || ''}
                   onChange={(e) => onUpdate('config.body', e.target.value)}
                />
             </div>
          </div>
        )}

        {/* SCRIPT CONFIG */}
        {node.type === NodeType.SCRIPT && (
          <div className="space-y-4 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-pink-400">
              <Code size={16} />
              <span className="text-sm font-semibold">Code Execution</span>
            </div>
            
            <div>
              <label className="block text-xs text-slate-400 mb-2">Language</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-pink-500"
                value={node.config.language || 'javascript'}
                onChange={(e) => onUpdate('config.language', e.target.value)}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3.10</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">
                Code Logic <span className="text-slate-500">(Input data available as `inputs`)</span>
              </label>
              <textarea 
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-xs font-mono text-pink-300 focus:ring-2 focus:ring-pink-500 outline-none h-48 resize-none"
                placeholder={node.config.language === 'python' 
                  ? "# Access input data via `inputs` list\ndef main(inputs):\n    return [d for d in inputs if d['volume'] > 1000]"
                  : "// Access input data via `inputs` array\nreturn inputs.filter(item => item.volume > 1000);"
                }
                value={node.config.code || ''}
                onChange={(e) => onUpdate('config.code', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STORAGE CONFIG */}
        {node.type === NodeType.STORAGE && (
          <div className="space-y-4 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Server size={16} />
              <span className="text-sm font-semibold">Storage Configuration</span>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Database Type</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={node.config.dbType || 'SQLite'}
                onChange={(e) => onUpdate('config.dbType', e.target.value)}
              >
                <option value="SQLite">SQLite (Local File)</option>
                <option value="MySQL">MySQL / MariaDB</option>
                <option value="PostgreSQL">PostgreSQL</option>
              </select>
            </div>
            {node.config.dbType !== 'SQLite' ? (
              <div>
                <label className="block text-xs text-slate-400 mb-2">Connection String</label>
                <input 
                  type="text"
                  placeholder="postgres://user:pass@localhost:5432/db"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={node.config.connectionString || ''}
                  onChange={(e) => onUpdate('config.connectionString', e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs text-slate-400 mb-2">File Path</label>
                <input 
                  type="text"
                  placeholder="./data/strategies.db"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={node.config.filePath || ''}
                  onChange={(e) => onUpdate('config.filePath', e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-400 mb-2">Target Table Name</label>
              <input 
                type="text"
                placeholder="strategy_results_v1"
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={node.config.table || ''}
                onChange={(e) => onUpdate('config.table', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STRATEGY CONFIG */}
        {node.type === NodeType.STRATEGY && (
          <div className="space-y-4 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-purple-400">
              <Wand2 size={16} />
              <span className="text-sm font-semibold">AI Strategy Generator</span>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Describe your strategy logic</label>
              <textarea 
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-sm text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
                placeholder="e.g., Buy when RSI < 30 and MACD crosses above signal line..."
                value={nodePrompt}
                onChange={(e) => setNodePrompt(e.target.value)}
              />
            </div>
            <Button 
              variant="primary" 
              className="w-full bg-purple-600 hover:bg-purple-500 shadow-purple-500/25"
              onClick={handleGenerateCode}
              isLoading={isGenerating}
            >
              Generate Code with Gemini
            </Button>
            {node.config.parameters && (
              <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs text-slate-400">Generated Python Logic</label>
                  <Code size={14} className="text-slate-500" />
                </div>
                <pre className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-xs font-mono text-green-400 overflow-x-auto">
                  {node.config.parameters}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-slate-800 pt-6">
          <Button variant="danger" size="sm" className="w-full" onClick={onDelete} icon={<Trash2 size={16}/>}>
            Delete Node
          </Button>
        </div>
      </div>
    </div>
  );
};
