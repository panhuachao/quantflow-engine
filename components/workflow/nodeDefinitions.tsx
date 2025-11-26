
import React, { useState } from 'react';
import { NodeType, NodeDefinition, ExecutionContext, ExecutionResult } from '../../types';
import { 
  Clock, Search, Globe, FileCode, TrendingUp, Save, 
  Database, Filter, PlayCircle, MoreHorizontal, DownloadCloud, Code, BrainCircuit, Sparkles 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from '../../contexts/LanguageContext';
import { NODE_CONTENT_REGISTRY } from './NodeContents';

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

const ConfigTextArea = ({ label, value, onChange, placeholder, height = "h-32", helpText }: any) => (
  <div className="mb-4">
    <label className="block text-xs text-slate-400 mb-2">{label}</label>
    <textarea
      className={`w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-xs font-mono text-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none resize-none ${height}`}
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
    {helpText && <div className="text-[10px] text-slate-500 mt-1">{helpText}</div>}
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

const ConfigSlider = ({ label, value, onChange, min, max, step }: any) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
       <label className="block text-xs text-slate-400">{label}</label>
       <span className="text-xs font-mono text-cyan-400">{value}</span>
    </div>
    <input
      type="range"
      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
      min={min} max={max} step={step}
      value={value || min}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
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
  
  ConfigComponent: ({ config, onUpdate }) => {
    const { t } = useTranslation();
    return (
      <div>
        <div className="flex items-center gap-2 text-teal-400 mb-4">
          <Clock size={16} />
          <span className="text-sm font-semibold">{t('node.timer.schedule')}</span>
        </div>
        <ConfigInput 
          label={t('node.timer.cron')} 
          value={config.cron} 
          onChange={(v: string) => onUpdate('cron', v)} 
          placeholder="0 9 * * 1-5"
        />
        <div className="text-[10px] text-slate-500">Example: 0 9 * * 1-5 (Mon-Fri 9AM)</div>
      </div>
    );
  },

  PreviewComponent: NODE_CONTENT_REGISTRY[NodeType.TIMER],

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

  ConfigComponent: ({ config, onUpdate }) => {
    const { t } = useTranslation();
    return (
      <div>
        <div className="flex items-center gap-2 text-sky-400 mb-4">
          <Search size={16} />
          <span className="text-sm font-semibold">{t('node.db.query_config')}</span>
        </div>
        <ConfigInput 
          label={t('node.db.conn_string')} 
          value={config.connectionString} 
          onChange={(v: string) => onUpdate('connectionString', v)} 
          placeholder="postgres://user:pass@localhost:5432/db"
        />
        <ConfigTextArea 
          label={t('node.db.query')} 
          value={config.query} 
          onChange={(v: string) => onUpdate('query', v)} 
          placeholder="SELECT * FROM market_data..." 
          height="h-40"
        />
        <Button variant="secondary" size="sm" className="w-full text-xs">{t('node.db.validate')}</Button>
      </div>
    );
  },

  PreviewComponent: NODE_CONTENT_REGISTRY[NodeType.DATABASE_QUERY],

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

  ConfigComponent: ({ config, onUpdate }) => {
    const { t } = useTranslation();
    return (
      <div>
        <div className="flex items-center gap-2 text-violet-400 mb-4">
          <Globe size={16} />
          <span className="text-sm font-semibold">{t('node.http.config')}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <ConfigSelect 
              label={t('node.http.method')}
              value={config.method || 'GET'} 
              onChange={(v: string) => onUpdate('method', v)}
              options={[
                { label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' }, { label: 'DELETE', value: 'DELETE' }
              ]}
            />
          </div>
          <div className="col-span-2">
            <ConfigInput label={t('node.http.url')} value={config.url} onChange={(v: string) => onUpdate('url', v)} placeholder="https://api..." />
          </div>
        </div>
        <ConfigTextArea label={t('node.http.headers')} value={config.headers} onChange={(v: string) => onUpdate('headers', v)} placeholder='{"Content-Type": "application/json"}' height="h-20"/>
        <ConfigTextArea label={t('node.http.body')} value={config.body} onChange={(v: string) => onUpdate('body', v)} placeholder='{ "data": "value" }' height="h-24"/>
      </div>
    );
  },

  PreviewComponent: NODE_CONTENT_REGISTRY[NodeType.HTTP_REQUEST],

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

  ConfigComponent: ({ config, onUpdate }) => {
    const { t } = useTranslation();
    return (
      <div>
        <div className="flex items-center gap-2 text-pink-400 mb-4">
          <Code size={16} />
          <span className="text-sm font-semibold">{t('node.script.execution')}</span>
        </div>
        <ConfigSelect 
          label={t('node.script.language')}
          value={config.language || 'javascript'} 
          onChange={(v: string) => onUpdate('language', v)}
          options={[{ label: 'JavaScript (Node.js)', value: 'javascript' }, { label: 'Python 3.10', value: 'python' }]}
        />
        <ConfigTextArea 
          label={t('node.script.logic')}
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
    );
  },

  PreviewComponent: NODE_CONTENT_REGISTRY[NodeType.SCRIPT],

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

// --- 5. LLM / STRATEGY NODE ---

const LLMNode: NodeDefinition = {
  type: NodeType.LLM,
  label: 'LLM Strategy',
  icon: BrainCircuit,
  color: 'border-purple-500 shadow-purple-500/20',
  iconColor: 'text-purple-400',
  description: 'AI-powered processing using DeepSeek, GPT-4, etc.',

  ConfigComponent: ({ config, onUpdate }) => {
    const { t } = useTranslation();
    return (
      <div>
        <div className="flex items-center gap-2 text-purple-400 mb-4">
          <Sparkles size={16} />
          <span className="text-sm font-semibold">{t('node.llm.config')}</span>
        </div>
        
        <ConfigSelect 
          label={t('node.llm.provider')}
          value={config.provider || 'DeepSeek'}
          onChange={(v: string) => onUpdate('provider', v)}
          options={[
            { label: 'DeepSeek', value: 'DeepSeek' },
            { label: 'OpenAI (ChatGPT)', value: 'OpenAI' },
            { label: 'Google Gemini', value: 'Gemini' },
            { label: 'Anthropic Claude', value: 'Anthropic' },
          ]}
        />

        <ConfigInput 
           label={t('node.llm.model')}
           value={config.model}
           onChange={(v: string) => onUpdate('model', v)}
           placeholder="e.g. deepseek-chat, gpt-4o, gemini-pro"
        />

        <ConfigInput 
           label={t('node.llm.apikey')}
           type="password"
           value={config.apiKey}
           onChange={(v: string) => onUpdate('apiKey', v)}
           placeholder="sk-..."
        />

        <ConfigSlider 
          label={t('node.llm.temperature')}
          value={config.temperature !== undefined ? config.temperature : 0.7}
          min={0} max={1} step={0.1}
          onChange={(v: number) => onUpdate('temperature', v)}
        />

        <ConfigTextArea 
          label={t('node.llm.system')}
          value={config.systemPrompt} 
          onChange={(v: string) => onUpdate('systemPrompt', v)} 
          placeholder="You are an expert quantitative trader..." 
          height="h-24"
        />

        <ConfigTextArea 
          label={t('node.llm.user')}
          value={config.userPrompt} 
          onChange={(v: string) => onUpdate('userPrompt', v)} 
          placeholder="Analyze the following market data: {{inputs}}" 
          height="h-32"
          helpText="Use {{inputs}} to inject data from previous nodes."
        />
      </div>
    );
  },

  PreviewComponent: NODE_CONTENT_REGISTRY[NodeType.LLM],

  execute: async ({ config, inputs, log }) => {
    const provider = config.provider || 'DeepSeek';
    const model = config.model || 'default';
    
    log(`Initializing ${provider} client (${model})...`);
    
    // Construct Prompt
    let prompt = config.userPrompt || '';
    if (inputs && inputs.length > 0) {
       // Simple injection simulation
       const dataStr = JSON.stringify(inputs).substring(0, 500) + '...'; // Truncate for log
       prompt = prompt.replace('{{inputs}}', JSON.stringify(inputs));
       log(`Context injected: ${inputs.length} records.`);
    }

    log(`Sending request to ${provider} API...`, 'info');
    
    // Simulate API Call Latency
    await new Promise(r => setTimeout(r, 1500));
    
    const responseText = `[${provider}] Analysis Result: Based on the provided data, the trend appears bullish with a confidence of 85%. Recommended action: BUY.`;
    
    log(`Received response from model.`, 'success');
    
    return { 
      output: { 
        provider, 
        model, 
        response: responseText, 
        raw: { choices: [{ message: { content: responseText } }] } 
      }, 
      status: 'success' 
    };
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

  ConfigComponent: ({ config, onUpdate }) => {
    const { t } = useTranslation();
    return (
      <div>
        <div className="flex items-center gap-2 text-indigo-400 mb-4">
          <Save size={16} />
          <span className="text-sm font-semibold">{t('node.storage.config')}</span>
        </div>
        <ConfigSelect 
          label={t('node.storage.type')}
          value={config.dbType || 'SQLite'} 
          onChange={(v: string) => onUpdate('dbType', v)}
          options={[{label: 'SQLite', value: 'SQLite'}, {label: 'MySQL', value: 'MySQL'}, {label: 'PostgreSQL', value: 'PostgreSQL'}]}
        />
        <ConfigInput label={t('node.storage.table')} value={config.table} onChange={(v: string) => onUpdate('table', v)} placeholder="results_table" />
      </div>
    );
  },

  PreviewComponent: NODE_CONTENT_REGISTRY[NodeType.STORAGE],

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
  [NodeType.LLM]: LLMNode,
  [NodeType.STORAGE]: StorageNode,
  // Map others to default or implement later as needed
  [NodeType.EXECUTION]: { ...DefaultNode, type: NodeType.EXECUTION, label: 'Execution', icon: PlayCircle, color: 'border-green-500' },
  [NodeType.FILTER]: { ...DefaultNode, type: NodeType.FILTER, label: 'Filter', icon: Filter, color: 'border-rose-500' },
  [NodeType.DATA_COLLECT]: { ...DefaultNode, type: NodeType.DATA_COLLECT, label: 'Legacy Data', icon: DownloadCloud, color: 'border-orange-500' }
};

export const getNodeDefinition = (type: NodeType): NodeDefinition => {
  return NODE_REGISTRY[type] || DefaultNode;
};