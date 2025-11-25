

import React from 'react';
import { NodeType } from '../../types';

export const DataCollectContent = ({ config }: { config: any }) => (
  <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] space-y-1">
    <div className="flex justify-between items-center text-slate-400">
      <span>Source</span>
      <span className="text-slate-200 font-medium">{config.source || '-'}</span>
    </div>
    <div className="flex justify-between items-center text-slate-400">
      <span>Symbol</span>
      <span className="text-orange-400 font-mono">{config.symbol || '-'}</span>
    </div>
  </div>
);

export const TimerContent = ({ config }: { config: any }) => (
  <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px]">
    <div className="flex justify-between items-center text-slate-400">
      <span>Schedule</span>
      <code className="bg-slate-900 px-1.5 py-0.5 rounded text-teal-400 font-mono">{config.cron || '* * * * *'}</code>
    </div>
  </div>
);

export const StorageContent = ({ config }: { config: any }) => (
  <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] space-y-1">
    <div className="text-slate-400">{config.dbType || 'Storage'}</div>
    <div className="text-indigo-300 truncate" title={config.table}>{config.table ? `Table: ${config.table}` : 'No table set'}</div>
  </div>
);

export const ScriptContent = ({ config }: { config: any }) => (
  <div className="mt-2 pt-2 border-t border-slate-700/50">
    <div className="text-[10px] text-pink-400 font-mono bg-slate-900/50 p-1 rounded truncate opacity-80">
      {config.code ? (config.code.length > 25 ? config.code.substring(0, 25) + '...' : config.code) : '// No code'}
    </div>
  </div>
);

export const StrategyContent = ({ config }: { config: any }) => (
  <div className="mt-2 pt-2 border-t border-slate-700/50">
    <div className="text-[10px] text-slate-400 italic truncate">
      {config.description ? `"${config.description}"` : 'No description'}
    </div>
  </div>
);

export const DatabaseQueryContent = ({ config }: { config: any }) => (
  <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px]">
    <div className="text-sky-300 font-mono truncate mb-1">{config.connectionString ? 'Conn Configured' : 'No Connection'}</div>
    <div className="text-slate-500 truncate italic">{config.query || 'SELECT * FROM ...'}</div>
  </div>
);

export const HttpRequestContent = ({ config }: { config: any }) => (
  <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] space-y-1">
    <div className="flex gap-2">
      <span className="font-bold text-violet-400">{config.method || 'GET'}</span>
      <span className="text-slate-400 truncate">{config.url || 'http://...'}</span>
    </div>
  </div>
);

export const DefaultNodeContent = ({ config }: { config: any }) => null;

export const NODE_CONTENT_REGISTRY: Record<string, React.FC<{ config: any }>> = {
  [NodeType.DATA_COLLECT]: DataCollectContent,
  [NodeType.TIMER]: TimerContent,
  [NodeType.STORAGE]: StorageContent,
  [NodeType.SCRIPT]: ScriptContent,
  [NodeType.STRATEGY]: StrategyContent,
  [NodeType.DATABASE_QUERY]: DatabaseQueryContent,
  [NodeType.HTTP_REQUEST]: HttpRequestContent,
};