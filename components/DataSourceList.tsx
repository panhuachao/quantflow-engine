import React, { useEffect, useState } from 'react';
import { DataSource, DataSourceType } from '../types';
import { Button } from './ui/Button';
import { Plus, Search, Database, Edit2, Trash2, CheckCircle, XCircle, Server, FileText, Loader2, Save, X } from 'lucide-react';
import { dataSourceService } from '../services/dataSourceService';
import { useTranslation } from '../contexts/LanguageContext';

const DataSourceModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: Partial<DataSource>) => void;
  initialData?: DataSource;
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<DataSource>>({
    name: '',
    type: DataSourceType.MYSQL,
    config: { host: 'localhost', port: 3306, username: '', password: '', database: '' }
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                type: DataSourceType.MYSQL,
                config: { host: 'localhost', port: 3306, username: '', password: '', database: '' }
            });
        }
        setTestResult(null);
    }
  }, [isOpen, initialData]);

  const updateConfig = (key: string, value: any) => {
      setFormData(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
  };

  const handleTest = async () => {
      setIsTesting(true);
      setTestResult(null);
      try {
          const success = await dataSourceService.testConnection(formData.config);
          setTestResult(success ? 'success' : 'fail');
      } catch {
          setTestResult('fail');
      } finally {
          setIsTesting(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <Database size={20} className="text-cyan-400"/> 
             {initialData ? t('ds.edit_title') : t('ds.new_title')}
           </h3>
           <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
                <label className="block text-xs text-slate-400 mb-1">{t('ds.name')}</label>
                <input 
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="My Database"
                />
            </div>
            <div>
                <label className="block text-xs text-slate-400 mb-1">{t('ds.type')}</label>
                <select 
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as DataSourceType})}
                >
                    {Object.values(DataSourceType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {formData.type === DataSourceType.SQLITE ? (
                 <div>
                    <label className="block text-xs text-slate-400 mb-1">{t('ds.file_path')}</label>
                    <input 
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                        value={formData.config?.filePath || ''} onChange={e => updateConfig('filePath', e.target.value)}
                        placeholder="/path/to/database.sqlite"
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs text-slate-400 mb-1">{t('ds.host')}</label>
                            <input 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                                value={formData.config?.host || ''} onChange={e => updateConfig('host', e.target.value)}
                                placeholder="localhost"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">{t('ds.port')}</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                                value={formData.config?.port || ''} onChange={e => updateConfig('port', parseInt(e.target.value))}
                                placeholder="3306"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">{t('ds.database')}</label>
                        <input 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                            value={formData.config?.database || ''} onChange={e => updateConfig('database', e.target.value)}
                            placeholder="quant_db"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">{t('ds.username')}</label>
                            <input 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                                value={formData.config?.username || ''} onChange={e => updateConfig('username', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">{t('ds.password')}</label>
                            <input 
                                type="password"
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                                value={formData.config?.password || ''} onChange={e => updateConfig('password', e.target.value)}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
             <div className="flex items-center gap-2">
                 <Button variant="secondary" size="sm" onClick={handleTest} isLoading={isTesting}>
                     {t('ds.test_conn')}
                 </Button>
                 {testResult === 'success' && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12}/> OK</span>}
                 {testResult === 'fail' && <span className="text-xs text-red-400 flex items-center gap-1"><XCircle size={12}/> Failed</span>}
             </div>
             <div className="flex gap-2">
                 <Button variant="ghost" onClick={onClose}>{t('dash.cancel')}</Button>
                 <Button icon={<Save size={16}/>} onClick={() => onSave(formData)}>{t('editor.btn.save')}</Button>
             </div>
        </div>
      </div>
    </div>
  );
};

export const DataSourceList: React.FC<{ onSelect?: (ds: DataSource) => void }> = ({ onSelect }) => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | undefined>(undefined);
  const { t } = useTranslation();

  const loadData = async () => {
      const data = await dataSourceService.getAll();
      setSources(data);
      setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (data: Partial<DataSource>) => {
      if (editingSource) {
          await dataSourceService.update(editingSource.id, data);
      } else {
          await dataSourceService.create(data as DataSource);
      }
      setIsModalOpen(false);
      loadData();
  };

  const handleDelete = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this data source?')) {
          await dataSourceService.delete(id);
          loadData();
      }
  };

  if (loading) return <div className="h-full flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-cyan-500"/></div>;

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950">
       <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-100">{t('ds.title')}</h2>
                <p className="text-slate-400 mt-1">{t('ds.desc')}</p>
            </div>
            <div className="flex items-center gap-3">
                <Button onClick={() => { setEditingSource(undefined); setIsModalOpen(true); }} icon={<Plus size={18}/>}>
                  {t('ds.add_new')}
                </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sources.map(ds => (
                  <div key={ds.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg transition-all group relative">
                      <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  ds.type === DataSourceType.MYSQL ? 'bg-blue-900/20 text-blue-400' :
                                  ds.type === DataSourceType.POSTGRES ? 'bg-indigo-900/20 text-indigo-400' :
                                  'bg-slate-700/50 text-slate-400'
                              }`}>
                                  {ds.type === DataSourceType.SQLITE ? <FileText size={20}/> : <Server size={20}/>}
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{ds.name}</h3>
                                  <div className="text-xs text-slate-500">{ds.type}</div>
                              </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${ds.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      
                      <div className="space-y-2 text-xs text-slate-400 mb-6 font-mono bg-slate-950/50 p-3 rounded">
                          {ds.type === DataSourceType.SQLITE ? (
                              <div className="truncate" title={ds.config.filePath}>{ds.config.filePath || 'Memory'}</div>
                          ) : (
                              <>
                                <div className="flex justify-between"><span>HOST:</span> <span className="text-slate-300">{ds.config.host}:{ds.config.port}</span></div>
                                <div className="flex justify-between"><span>DB:</span> <span className="text-slate-300">{ds.config.database}</span></div>
                                <div className="flex justify-between"><span>USER:</span> <span className="text-slate-300">{ds.config.username}</span></div>
                              </>
                          )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                          <Button variant="secondary" size="sm" className="flex-1" onClick={() => { setEditingSource(ds); setIsModalOpen(true); }}>
                             <Edit2 size={14} className="mr-2"/> {t('workflow.btn.configure')}
                          </Button>
                          <button 
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                            onClick={() => handleDelete(ds.id)}
                          >
                             <Trash2 size={16} />
                          </button>
                      </div>
                  </div>
              ))}
              
              <div 
                  onClick={() => { setEditingSource(undefined); setIsModalOpen(true); }}
                  className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500/50 hover:text-cyan-500 hover:bg-slate-900/50 transition-all cursor-pointer min-h-[220px]"
                >
                   <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4 group-hover:bg-cyan-500/10">
                      <Plus size={24} />
                   </div>
                   <span className="font-semibold">{t('ds.add_new')}</span>
                </div>
          </div>
       </div>

       <DataSourceModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave}
          initialData={editingSource}
       />
    </div>
  );
};