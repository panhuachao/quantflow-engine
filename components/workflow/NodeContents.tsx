import React, { useEffect, useState } from 'react';
import { NodeType } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import { dataSourceService } from '../../services/dataSourceService';

export const DataCollectContent = ({ config }: { config: any }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] space-y-1">
      <div className="flex justify-between items-center text-slate-400">
        <span>{t('node.content.source')}</span>
        <span className="text-slate-200 font-medium">{config.source || '-'}</span>
      </div>
      <div className="flex justify-between items-center text-slate-400">
        <span>{t('node.content.symbol')}</span>
        <span className="text-orange-400 font-mono">{config.symbol || '-'}</span>
      </div>
    </div>
  );
};

export const TimerContent = ({ config }: { config: any }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px]">
      <div className="flex justify-between items-center text-slate-400">
        <span>{t('node.content.schedule')}</span>
        <code className="bg-slate-900 px-1.5 py-0.5 rounded text-teal-400 font-mono">{config.cron || '* * * * *'}</code>
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
    <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] space-y-1">
      <div className="text-slate-400 truncate">{dsName}</div>
      <div className="text-indigo-300 truncate" title={config.table}>{config.table ? `${t('node.content.table')}: ${config.table}` : t('node.content.no_table')}</div>
    </div>
  );
};

export const ScriptContent = ({ config }: { config: any }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-2 pt-2 border-t border-slate-700/50">
      <div className="flex justify-between items-center mb-1">
         <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">{t('node.content.code')}</span>
         <span className={`text-[9px] px-1.5 rounded font-bold ${config.language === 'python' ? 'bg-blue-900/50 text-blue-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
            {config.language === 'python' ? 'PY' : 'JS'}
         </span>
      </div>
      <div className="text-[10px] text-pink-400 font-mono bg-slate-900/50 p-1 rounded truncate opacity-80">
        {config.code ? (config.code.length > 25 ? config.code.substring(0, 25) + '...' : config.code) : '// No code'}
      </div>
    </div>
  );
};

export const LLMContent = ({ config }: { config: any }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-2 pt-2 border-t border-slate-700/50">
      <div className="flex justify-between items-center mb-1">
         <span className="text-[9px] text-slate-500 uppercase font-semibold">{t('node.content.model')}</span>
         <span className="text-[9px] text-purple-300 bg-purple-900/30 px-1 rounded">{config.provider || 'AI'}</span>
      </div>
      <div className="text-[10px] text-slate-400 font-mono truncate">{config.model || 'default'}</div>
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
    <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px]">
      <div className="text-sky-300 font-mono truncate mb-1">{dsName}</div>
      <div className="text-slate-500 truncate italic">{config.query || 'SELECT * FROM ...'}</div>
    </div>
  );
};

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
  [NodeType.LLM]: LLMContent,
  [NodeType.DATABASE_QUERY]: DatabaseQueryContent,
  [NodeType.HTTP_REQUEST]: HttpRequestContent,
};