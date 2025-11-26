import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { Settings, Bell, Key, Shield, Globe, Moon, Save, Sun, Cloud, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${enabled ? 'bg-cyan-600' : 'bg-slate-700'}`}
  >
    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const ThemeCard = ({ themeId, currentTheme, onClick, label, icon: Icon, colors }: { themeId: Theme, currentTheme: Theme, onClick: () => void, label: string, icon: any, colors: string }) => (
  <div 
    onClick={onClick}
    className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center gap-2 transition-all ${currentTheme === themeId ? 'bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
  >
    <div className={`w-full h-12 rounded flex overflow-hidden border border-slate-600 ${colors}`}>
       {/* Mock Interface Preview */}
       <div className="w-1/4 h-full opacity-80 bg-current"></div>
       <div className="flex-1 h-full bg-white/10 p-1">
          <div className="w-1/2 h-1 bg-white/40 rounded mb-1"></div>
          <div className="w-3/4 h-1 bg-white/20 rounded"></div>
       </div>
    </div>
    <div className="flex items-center gap-2">
       <Icon size={14} className={currentTheme === themeId ? 'text-cyan-400' : 'text-slate-400'} />
       <span className={`text-xs font-medium ${currentTheme === themeId ? 'text-cyan-100' : 'text-slate-400'}`}>{label}</span>
    </div>
  </div>
);

export const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-3xl font-bold text-slate-100">{t('nav.settings')}</h2>
           <Button icon={<Save size={16}/>}>{t('settings.save')}</Button>
        </div>

        {/* Section: Account */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
           <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
              <Settings size={18} className="text-slate-400"/>
              <h3 className="font-semibold text-slate-200">{t('settings.account')}</h3>
           </div>
           <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs text-slate-400 mb-1">Display Name</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" defaultValue="Alex Quant" />
                 </div>
                 <div>
                    <label className="block text-xs text-slate-400 mb-1">Email</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" defaultValue="alex@quantflow.ai" disabled/>
                 </div>
              </div>
           </div>
        </div>

        {/* Section: Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
           <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
              <Globe size={18} className="text-slate-400"/>
              <h3 className="font-semibold text-slate-200">System Preferences</h3>
           </div>
           <div className="p-6 space-y-6">
               <div className="flex items-center justify-between border-b border-slate-800/50 pb-4">
                  <div>
                     <div className="text-sm text-white font-medium mb-1">{t('settings.language')}</div>
                     <div className="text-xs text-slate-500">Select your preferred interface language.</div>
                  </div>
                  <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-700">
                     <button 
                       onClick={() => setLanguage('en')}
                       className={`px-3 py-1 text-xs rounded-md transition-all ${language === 'en' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                       English
                     </button>
                     <button 
                       onClick={() => setLanguage('zh')}
                       className={`px-3 py-1 text-xs rounded-md transition-all ${language === 'zh' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                       中文
                     </button>
                  </div>
               </div>
               
               <div>
                  <div className="flex items-center justify-between mb-3">
                     <div>
                        <div className="text-sm text-white font-medium mb-1">{t('settings.theme')}</div>
                        <div className="text-xs text-slate-500">Customize the application appearance.</div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <ThemeCard 
                       themeId="dark" currentTheme={theme} onClick={() => setTheme('dark')} 
                       label={t('settings.theme.dark')} icon={Moon} 
                       colors="bg-slate-950 text-slate-200"
                     />
                     <ThemeCard 
                       themeId="light" currentTheme={theme} onClick={() => setTheme('light')} 
                       label={t('settings.theme.light')} icon={Sun} 
                       colors="bg-gray-100 text-slate-800"
                     />
                     <ThemeCard 
                       themeId="midnight" currentTheme={theme} onClick={() => setTheme('midnight')} 
                       label={t('settings.theme.midnight')} icon={Cloud} 
                       colors="bg-black text-gray-300"
                     />
                     <ThemeCard 
                       themeId="cosmic" currentTheme={theme} onClick={() => setTheme('cosmic')} 
                       label={t('settings.theme.cosmic')} icon={Sparkles} 
                       colors="bg-indigo-950 text-indigo-200"
                     />
                  </div>
               </div>
           </div>
        </div>

        {/* Section: Notifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
           <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
              <Bell size={18} className="text-slate-400"/>
              <h3 className="font-semibold text-slate-200">{t('settings.notifications')}</h3>
           </div>
           <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">Email Notifications</div>
                  <Toggle enabled={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
              </div>
              <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">Push Notifications</div>
                  <Toggle enabled={pushNotif} onChange={() => setPushNotif(!pushNotif)} />
              </div>
           </div>
        </div>

        {/* Section: API Keys */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
           <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
              <Key size={18} className="text-slate-400"/>
              <h3 className="font-semibold text-slate-200">{t('settings.api_keys')}</h3>
           </div>
           <div className="p-6 space-y-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                 <div>
                    <div className="text-xs font-bold text-slate-400 mb-1">BINANCE_API_KEY</div>
                    <div className="font-mono text-sm text-slate-200">***************a8f9</div>
                 </div>
                 <Button variant="ghost" size="sm">Revoke</Button>
              </div>
              <Button variant="secondary" size="sm" className="w-full">Generate New Key</Button>
           </div>
        </div>

      </div>
    </div>
  );
};
