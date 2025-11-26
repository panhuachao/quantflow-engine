import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/workflows');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mx-auto mb-6">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </div>
           <h1 className="text-2xl font-bold text-white mb-2">{t('login.welcome')}</h1>
           <p className="text-slate-400">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
             <label className="block text-xs text-slate-400 mb-1.5 ml-1">{t('login.email')}</label>
             <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
             </div>
          </div>
          
          <div>
             <div className="flex justify-between items-center mb-1.5 ml-1">
               <label className="block text-xs text-slate-400">{t('login.password')}</label>
               <span 
                 onClick={() => navigate('/forgot-password')}
                 className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
               >
                 {t('login.forgot')}
               </span>
             </div>
             <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
             </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-3 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-none shadow-lg shadow-cyan-900/20"
            isLoading={isLoading}
          >
             {isLoading ? <Loader2 className="animate-spin mr-2" /> : <span className="flex items-center">{t('login.btn')} <ArrowRight size={16} className="ml-2"/></span>}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
           {t('login.no_account')} <span onClick={() => navigate('/register')} className="text-cyan-400 font-medium hover:text-cyan-300 ml-1 cursor-pointer">{t('login.register')}</span>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-center text-[10px] text-slate-600">
        © 2023 QuantFlow AI Inc. All rights reserved.
      </div>
    </div>
  );
};