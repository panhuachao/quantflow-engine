
import React, { useState } from 'react';
import { NodeType, NodeDefinition, ExecutionContext, ExecutionResult } from '../../types';
import { 
  Clock, Search, Globe, FileCode, TrendingUp, Save, 
  Database, Filter, PlayCircle, MoreHorizontal, DownloadCloud, Code, Wand2 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { generateStrategyCode } from '../../services/geminiService';

// --- Helper Components for Config ---

const ConfigInput = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div className="mb-4">
    <label className="block text-xs text-slate-400 mb-2">{label}</label>
    <input
      type={type}
      className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const ConfigTextArea = ({ label, value, onChange, placeholder, height = "h-32" }: any) => (
  <div className="mb-4">
    <label className="block text-xs text-slate-400 mb-2">{label}</label>
    <textarea
      className={`w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-xs font-mono text-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none resize-none ${height}`}
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const ConfigSelect = ({ label, value, onChange, options }: any) => (
  <div className="mb-4">
    <label className="block text-xs text-slate-400 mb-2">{label}</label>
    <select
      className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// --- 1. TIMER NODE ---

const TimerNode: NodeDefinition = {
  type: NodeType.TIMER,
  label: 'Cron Timer',
  icon: Clock,
  color: 'border-teal-500 shadow-teal-500/20',
  iconColor: 'text-teal-400',
  description: 'Triggers workflow execution based on a schedule.',
  
  ConfigComponent: ({ config, onUpdate }) => (
    <div>
      <div className="flex items-center gap-2 text-teal-400 mb-4">
        <Clock size={16} />
        <span className="text-sm font-semibold">Scheduler Config</span>
      </div>
      <ConfigInput 
        label="Cron Expression" 
        value={config.cron} 
        onChange={(v: string) => onUpdate('cron', v)} 
        placeholder="0 9 * * 1-5"
      />
      <div className="text-[10px] text-slate-500">Example: 0 9 * * 1-5 (Mon-Fri 9AM)</div>
    </div>
  ),

  PreviewComponent: ({ config }) => (
    <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px]">
      <div className="flex justify-between items-center text-slate-400">
        <span>Schedule</span>
        <code className="bg-slate-900 px-1.5 py-0.5 rounded text-teal-400 font-mono">{config.cron || '* * * * *'}</code>
      </div>
    </div>
  ),

  execute: async ({ log }) => {
    const timestamp = new Date().toISOString();
    log(`Timer triggered at ${timestamp}`, 'success');
    return { output: { timestamp, trigger: 'cron' }, status: 'success' };
  }
};

// --- 2. DATABASE QUERY NODE ---

const DatabaseQueryNode: NodeDefinition = {
  type: NodeType.DATABASE_QUERY,
  label: 'DB Query',
  icon: Search,
  color: 'border-sky-500 shadow-sky-500/20',
  iconColor: 'text-sky-400',
  description: 'Executes SQL queries to fetch data.',

  ConfigComponent: ({ config, onUpdate }) => (
    <div>
      <div className="flex items-center gap-2 text-sky-400 mb-4">
        <Search size={16} />
        <span className="text-sm font-semibold">Data Query Config</span>
      </div>
      <ConfigInput 
        label="Connection String" 
        value={config.connectionString} 
        onChange={(v: string) => onUpdate('connectionString', v)} 
        placeholder="postgres://user:pass@localhost:5432/db"
      />
      <ConfigTextArea 
        label="SQL Query" 
        value={config.query} 
        onChange={(v: string) => onUpdate('query', v)} 
        placeholder="SELECT * FROM market_data..." 
        height="h-40"
      />
      <Button variant="secondary" size="sm" className="w-full text-xs">Validate Query</Button>
    </div>
  ),

  PreviewComponent: ({ config }) => (
    <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px]">
      <div className="text-sky-300 font-mono truncate mb-1">{config.connectionString ? 'Conn Configured' : 'No Connection'}</div>
      <div className="text-slate-500 truncate italic">{config.query || 'SELECT * FROM ...'}</div>
    </div>
  ),

  execute: async ({ config, log }) => {
    // Mock Execution
    log(`Connecting to ${config.connectionString ? 'Database' : 'Localhost'}...`);
    await new Promise(r => setTimeout(r, 600));
    const rows = Math.floor(Math.random() * 100) + 1;
    log(`Executed query. Fetched ${rows} rows.`, 'success');
    return { 
      output: { rows, data: Array.from({ length: rows }, (_, i) => ({ id: i, value: Math.random() })) }, 
      status: 'success' 
    };
  }
};

// --- 3. HTTP REQUEST NODE ---

const HttpRequestNode: NodeDefinition = {
  type: NodeType.HTTP_REQUEST,
  label: 'HTTP Request',
  icon: Globe,
  color: 'border-violet-500 shadow-violet-500/20',
  iconColor: 'text-violet-400',
  description: 'Makes HTTP/HTTPS requests to external APIs.',

  ConfigComponent: ({ config, onUpdate }) => (
    <div>
      <div className="flex items-center gap-2 text-violet-400 mb-4">
        <Globe size={16} />
        <span className="text-sm font-semibold">HTTP Request Config</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <ConfigSelect 
            label="Method" 
            value={config.method || 'GET'} 
            onChange={(v: string) => onUpdate('method', v)}
            options={[
              { label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' }, { label: 'DELETE', value: 'DELETE' }
            ]}
          />
        </div>
        <div className="col-span-2">
          <ConfigInput label="URL" value={config.url} onChange={(v: string) => onUpdate('url', v)} placeholder="https://api..." />
        </div>
      </div>
      <ConfigTextArea label="Headers (JSON)" value={config.headers} onChange={(v: string) => onUpdate('headers', v)} placeholder='{"Content-Type": "application/json"}' height="h-20"/>
      <ConfigTextArea label="Body (JSON)" value={config.body} onChange={(v: string) => onUpdate('body', v)} placeholder='{ "data": "value" }' height="h-24"/>
    </div>
  ),

  PreviewComponent: ({ config }) => (
    <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] space-y-1">
      <div className="flex gap-2">
        <span className="font-bold text-violet-400">{config.method || 'GET'}</span>
        <span className="text-slate-400 truncate">{config.url || 'http://...'}</span>
      </div>
    </div>
  ),

  execute: async ({ config, inputs, log }) => {
    log(`Sending ${config.method || 'GET'} request to ${config.url}...`);
    // Pass inputs into body if dynamic (Mocking logic here)
    await new Promise(r => setTimeout(r, 800));
    log(`Response: 200 OK`, 'success');
    return { 
      output: { status: 200, body: { result: 'success', inputsReceived: inputs.length } }, 
      status: 'success' 
    };
  }
};

// --- 4. SCRIPT / CODE NODE ---

const ScriptNode: NodeDefinition = {
  type: NodeType.SCRIPT,
  label: 'Code Block',
  icon: FileCode,
  color: 'border-pink-500 shadow-pink-500/20',
  iconColor: 'text-pink-400',
  description: 'Executes custom Python or JavaScript code.',

  ConfigComponent: ({ config, onUpdate }) => (
    <div>
      <div className="flex items-center gap-2 text-pink-400 mb-4">
        <Code size={16} />
        <span className="text-sm font-semibold">Code Execution</span>
      </div>
      <ConfigSelect 
        label="Language" 
        value={config.language || 'javascript'} 
        onChange={(v: string) => onUpdate('language', v)}
        options={[{ label: 'JavaScript (Node.js)', value: 'javascript' }, { label: 'Python 3.10', value: 'python' }]}
      />
      <ConfigTextArea 
        label="Code Logic" 
        value={config.code} 
        onChange={(v: string) => onUpdate('code', v)}
        placeholder={config.language === 'python' 
          ? "def main(inputs):\n    # Return data for next node\n    return inputs" 
          : "return inputs.map(d => ({ ...d, processed: true }));"
        } 
        height="h-48"
      />
      <div className="text-[10px] text-slate-500">
        Previous node data is available as <code>inputs</code> array.
      </div>
    </div>
  ),

  PreviewComponent: ({ config }) => (
    <div className="mt-2 pt-2 border-t border-slate-700/50">
      <div className="flex justify-between items-center mb-1">
         <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Code</span>
         <span className={`text-[9px] px-1.5 rounded font-bold ${config.language === 'python' ? 'bg-blue-900/50 text-blue-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
            {config.language === 'python' ? 'PY' : 'JS'}
         </span>
      </div>
      <div className="text-[10px] text-pink-400 font-mono bg-slate-900/50 p-1 rounded truncate opacity-80">
        {config.code ? (config.code.length > 25 ? config.code.substring(0, 25) + '...' : config.code) : '// No code'}
      </div>
    </div>
  ),

  execute: async ({ config, inputs, log }) => {
    const lang = config.language || 'javascript';
    log(`Compiling ${lang} code...`);
    log(`Processing ${inputs.length} input records...`);
    await new Promise(r => setTimeout(r, 400));
    
    // Simulating transformation
    const transformed = inputs.length > 0 ? inputs : [{ mock: true }];
    log(`Execution complete.`, 'success');
    
    return { 
      output: { processed: true, count: transformed.length, source: lang, data: transformed }, 
      status: 'success' 
    };
  }
};

// --- 5. STRATEGY NODE ---

const StrategyNode: NodeDefinition = {
  type: NodeType.STRATEGY,
  label: 'Strategy',
  icon: TrendingUp,
  color: 'border-purple-500 shadow-purple-500/20',
  iconColor: 'text-purple-400',
  description: 'AI-assisted quantitative strategy logic.',

  ConfigComponent: ({ config, onUpdate }) => {
    const [prompt, setPrompt] = useState(config.description || '');
    const [loading, setLoading] = useState(false);

    const handleGen = async () => {
      setLoading(true);
      const code = await generateStrategyCode(prompt);
      onUpdate('parameters', code);
      onUpdate('description', prompt);
      setLoading(false);
    };

    return (
      <div>
        <div className="flex items-center gap-2 text-purple-400 mb-4">
          <Wand2 size={16} />
          <span className="text-sm font-semibold">AI Strategy Generator</span>
        </div>
        <ConfigTextArea 
          label="Strategy Description" 
          value={prompt} 
          onChange={setPrompt} 
          placeholder="Buy when RSI < 30..." 
          height="h-24"
        />
        <Button onClick={handleGen} isLoading={loading} className="w-full mb-4">Generate Logic</Button>
        {config.parameters && (
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
             <div className="text-xs text-slate-500 mb-1">Generated Python:</div>
             <pre className="text-[10px] text-green-400 font-mono overflow-x-auto">{config.parameters}</pre>
          </div>
        )}
      </div>
    );
  },

  PreviewComponent: ({ config }) => (
    <div className="mt-2 pt-2 border-t border-slate-700/50">
      <div className="text-[10px] text-slate-400 italic truncate">
        {config.description ? `"${config.description}"` : 'No description'}
      </div>
    </div>
  ),

  execute: async ({ inputs, log }) => {
    log(`Initializing Backtrader engine...`);
    log(`Analyzing ${inputs.length} data points...`, 'info');
    await new Promise(r => setTimeout(r, 1000));
    const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
    log(`Signal Generated: ${action}`, action === 'BUY' ? 'success' : 'warn');
    return { output: { signal: action, confidence: 0.85 }, status: 'success' };
  }
};

// --- 6. STORAGE NODE ---

const StorageNode: NodeDefinition = {
  type: NodeType.STORAGE,
  label: 'Storage',
  icon: Save,
  color: 'border-indigo-500 shadow-indigo-500/20',
  iconColor: 'text-indigo-400',
  description: 'Persist results to database or file.',

  ConfigComponent: ({ config, onUpdate }) => (
    <div>
      <div className="flex items-center gap-2 text-indigo-400 mb-4">
        <Save size={16} />
        <span className="text-sm font-semibold">Storage Config</span>
      </div>
      <ConfigSelect 
        label="Type" 
        value={config.dbType || 'SQLite'} 
        onChange={(v: string) => onUpdate('dbType', v)}
        options={[{label: 'SQLite', value: 'SQLite'}, {label: 'MySQL', value: 'MySQL'}, {label: 'PostgreSQL', value: 'PostgreSQL'}]}
      />
      <ConfigInput label="Table Name" value={config.table} onChange={(v: string) => onUpdate('table', v)} placeholder="results_table" />
    </div>
  ),

  PreviewComponent: ({ config }) => (
    <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] space-y-1">
      <div className="text-slate-400">{config.dbType || 'Storage'}</div>
      <div className="text-indigo-300 truncate" title={config.table}>{config.table ? `Table: ${config.table}` : 'No table set'}</div>
    </div>
  ),

  execute: async ({ config, inputs, log }) => {
    log(`Opening connection to ${config.dbType || 'SQLite'}...`);
    log(`Writing ${inputs.length} records to table '${config.table || 'default'}'...`);
    await new Promise(r => setTimeout(r, 500));
    log('Write confirmed.', 'success');
    return { output: { saved: true, records: inputs.length }, status: 'success' };
  }
};

// --- FALLBACK NODE ---

const DefaultNode: NodeDefinition = {
  type: NodeType.EXECUTION, // Fallback type
  label: 'Generic Node',
  icon: MoreHorizontal,
  color: 'border-slate-500',
  iconColor: 'text-slate-400',
  description: 'Generic Node',
  ConfigComponent: () => <div>No configuration available.</div>,
  PreviewComponent: () => <div>-</div>,
  execute: async ({ inputs }) => ({ output: inputs, status: 'success' })
};

// --- REGISTRY ---

export const NODE_REGISTRY: Record<string, NodeDefinition> = {
  [NodeType.TIMER]: TimerNode,
  [NodeType.DATABASE_QUERY]: DatabaseQueryNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.SCRIPT]: ScriptNode,
  [NodeType.STRATEGY]: StrategyNode,
  [NodeType.STORAGE]: StorageNode,
  // Map others to default or implement later as needed
  [NodeType.EXECUTION]: { ...DefaultNode, type: NodeType.EXECUTION, label: 'Execution', icon: PlayCircle, color: 'border-green-500' },
  [NodeType.FILTER]: { ...DefaultNode, type: NodeType.FILTER, label: 'Filter', icon: Filter, color: 'border-rose-500' },
  [NodeType.DATA_COLLECT]: { ...DefaultNode, type: NodeType.DATA_COLLECT, label: 'Legacy Data', icon: DownloadCloud, color: 'border-orange-500' }
};

export const getNodeDefinition = (type: NodeType): NodeDefinition => {
  return NODE_REGISTRY[type] || DefaultNode;
};
