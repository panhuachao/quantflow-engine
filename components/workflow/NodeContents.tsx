
import React, { useEffect, useState } from 'react';
import { NodeType } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import { dataSourceService } from '../../services/dataSourceService';

// Helper for consistent sharp rows
const ContentRow = ({ label, value, valueClass = "text-slate-200" }: { label: string, value: string | React.ReactNode, valueClass?: string }) => (
  <div className="flex justify-between items-center text-[11px] leading-tight">
    <span className="text-slate-500 font-medium">{label}</span>
    <span className={`font-mono truncate max-w-[110px] ${valueClass}`}>{value}</span>
  </div>
);

export const DataCollectContent = ({ config }: { config: any }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5">
      <ContentRow label={t('node.content.source')} value={config.source || '-'} />
      <ContentRow label={t('node.content.symbol')} value={config.symbol || '-'} valueClass="text-orange-400 font-bold" />
    </div>
  );
};

export const TimerContent = ({ config }: { config: any }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-3 pt-2 border-t border-slate-800">
      <div className="flex justify-between items-center text-[11px]">
        <span className="text-slate-500 font-medium">{t('node.content.schedule')}</span>
        <code className="bg-slate-800 px-1.5 py-0.5 rounded text-teal-400 font-bold font-mono text-[10px] border border-slate-700 shadow-sm">{config.cron || '* * * * *'}</code>
      </div>
    </div>
  );
};

export const StorageContent = ({ config }: { config: any }) => {
  const { t } = useTranslation();
  const [dsName, setDsName] = useState(config.dbType || 'Local');

  useEffect(() => {
    if (config.dataSourceId) {
        dataSourceService.getById(config.dataSourceId).then(ds => {
            if (ds) setDsName(ds.name);
        });
    }
  }, [config.dataSourceId]);

  return (
    <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5">
      <div className="text-slate-400 text-[11px] truncate font-medium">{dsName}</div>
      <div className="text-indigo-300 text-[11px] truncate" title={config.table}>
        {config.table ? config.table : <span className="text-slate-600 italic">{t('node.content.no_table')}</span>}
      </div>
    </div>
  );
};

export const ScriptContent = ({ config }: { config: any }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-3 pt-2 border-t border-slate-800">
      <div className="flex justify-between items-center mb-1.5">
         <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{t('node.content.code')}</span>
         <span className={`text-[9px] px-1.5 py-px rounded font-bold border ${config.language === 'python' ? 'bg-blue-950 text-blue-400 border-blue-900' : 'bg-yellow-950 text-yellow-400 border-yellow-900'}`}>
            {config.language === 'python' ? 'PYTHON' : 'JS'}
         </span>
      </div>
      <div className="text-[10px] text-pink-300 font-mono bg-slate-900 p-1.5 rounded border border-slate-800 truncate opacity-90">
        {config.code ? (config.code.length > 25 ? config.code.substring(0, 25) + '...' : config.code) : <span className="text-slate-600">// No code</span>}
      </div>
    </div>
  );
};

export const LLMContent = ({ config }: { config: any }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5">
      <ContentRow 
        label={t('node.content.model')} 
        value={<span className="text-purple-300 bg-purple-900/40 px-1.5 py-0.5 rounded text-[10px] border border-purple-800/50">{config.provider || 'AI'}</span>}
      />
      <div className="text-[10px] text-slate-400 font-mono truncate pl-1">{config.model || 'default'}</div>
    </div>
  );
};

export const DatabaseQueryContent = ({ config }: { config: any }) => {
  const { t } = useTranslation();
  const [dsName, setDsName] = useState('...');

  useEffect(() => {
    if (config.dataSourceId) {
        dataSourceService.getById(config.dataSourceId).then(ds => {
            if (ds) setDsName(ds.name);
            else setDsName('Unknown');
        });
    } else if (config.connectionString) {
        setDsName(t('node.content.conn'));
    } else {
        setDsName(t('node.content.no_conn'));
    }
  }, [config.dataSourceId, config.connectionString, t]);

  return (
    <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] space-y-1">
      <div className="text-sky-300 font-mono truncate font-medium">{dsName}</div>
      <div className="text-slate-500 truncate italic bg-slate-900/50 p-1 rounded">
        {config.query || 'SELECT * ...'}
      </div>
    </div>
  );
};

export const HttpRequestContent = ({ config }: { config: any }) => (
  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] space-y-1.5">
    <div className="flex gap-2 items-center">
      <span className="font-bold text-violet-400 bg-violet-900/20 px-1 rounded text-[10px] border border-violet-800/30">{config.method || 'GET'}</span>
      <span className="text-slate-400 truncate flex-1 font-mono text-[10px]">{config.url || 'http://...'}</span>
    </div>
  </div>
);

export const DefaultNodeContent = ({ config }: { config: any }) => null;

export const NODE_CONTENT_REGISTRY: Record<string, React.FC<{ config: any }>> = {
  [NodeType.DATA_COLLECT]: DataCollectContent,
  [NodeType.TIMER]: TimerContent,
  [NodeType.STORAGE]: StorageContent,
  [NodeType.SCRIPT]: ScriptContent,
  [NodeType.LLM]: LLMContent,
  [NodeType.DATABASE_QUERY]: DatabaseQueryContent,
  [NodeType.HTTP_REQUEST]: HttpRequestContent,
};
