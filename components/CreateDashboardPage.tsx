
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { LayoutDashboard, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { dashboardService } from '../services/dashboardService';

export const CreateDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newDash = await dashboardService.create(name, description);
      navigate(`/dashboards/${newDash.id}`);
    } catch (error) {
      console.error("Failed to create dashboard", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        <button 
          onClick={() => navigate('/dashboards')} 
          className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> {t('dash.cancel')}
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/20">
                 <LayoutDashboard className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('dashboard.create_title')}</h1>
                <p className="text-slate-400 text-sm">{t('dashboard.create_subtitle')}</p>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                 <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">{t('dash.widget.title')}</label>
                 <input 
                   required
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                   placeholder="e.g. Crypto Portfolio Tracker"
                   value={name}
                   onChange={e => setName(e.target.value)}
                 />
              </div>

              <div>
                 <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">{t('workflow.desc')}</label>
                 <textarea 
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all h-32 resize-none"
                   placeholder="Describe the purpose of this dashboard..."
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                 />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                 <Button type="button" variant="ghost" onClick={() => navigate('/dashboards')}>
                    {t('dash.cancel')}
                 </Button>
                 <Button type="submit" isLoading={isLoading} icon={<Save size={18} />}>
                    {t('dashboard.new')}
                 </Button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};
