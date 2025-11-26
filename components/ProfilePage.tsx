import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { User, Mail, Shield, Clock, TrendingUp, Activity, Box, PlayCircle } from 'lucide-react';
import { Button } from './ui/Button';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950">
       <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-slate-100 mb-8">{t('profile.title')}</h2>

          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
             <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border-4 border-slate-900 shadow-xl flex items-center justify-center text-slate-400">
                <User size={48} />
             </div>
             <div className="flex-1 text-center md:text-left space-y-2">
                <h3 className="text-2xl font-bold text-white">Alex Quant</h3>
                <p className="text-cyan-400 font-medium">{t('profile.role')}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-500 mt-2">
                   <div className="flex items-center gap-1.5"><Mail size={14}/> alex@quantflow.ai</div>
                   <div className="flex items-center gap-1.5"><Shield size={14}/> Admin</div>
                </div>
             </div>
             <Button>{t('dash.edit')}</Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-2 text-slate-400">
                   <Box size={18} /> {t('profile.stats.strategies')}
                </div>
                <div className="text-3xl font-bold text-white font-mono">12</div>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-2 text-slate-400">
                   <PlayCircle size={18} /> {t('profile.stats.backtests')}
                </div>
                <div className="text-3xl font-bold text-white font-mono">148</div>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-green-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-2 text-slate-400">
                   <Clock size={18} /> {t('profile.stats.runtime')}
                </div>
                <div className="text-3xl font-bold text-white font-mono">842h</div>
             </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Activity size={18} className="text-cyan-400"/> {t('profile.recent_activity')}
             </h3>
             <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                {[1, 2, 3].map((_, i) => (
                   <div key={i} className="flex gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 z-10">
                         <TrendingUp size={14} className="text-cyan-400"/>
                      </div>
                      <div>
                         <div className="text-sm font-medium text-slate-200">Deployed "Golden Cross" Strategy</div>
                         <div className="text-xs text-slate-500 mt-1">2 hours ago • Production Environment</div>
                      </div>
                   </div>
                ))}
                <div className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 z-10">
                         <Box size={14} className="text-purple-400"/>
                      </div>
                      <div>
                         <div className="text-sm font-medium text-slate-200">Created new Backtest on BTCUSDT</div>
                         <div className="text-xs text-slate-500 mt-1">5 hours ago • High Performance Cluster</div>
                      </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};