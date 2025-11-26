import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { Lock, Mail, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
    }
    setError('');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // alert(t('register.success'));
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mx-auto mb-6">
              <User className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-2xl font-bold text-white mb-2">{t('register.title')}</h1>
           <p className="text-slate-400">{t('register.subtitle')}</p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-sm text-red-200">
                <AlertCircle size={16} /> {error}
            </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
             <label className="block text-xs text-slate-400 mb-1.5 ml-1">{t('register.name')}</label>
             <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="Alex Quant"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
             </div>
          </div>

          <div>
             <label className="block text-xs text-slate-400 mb-1.5 ml-1">{t('register.email')}</label>
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
             <label className="block text-xs text-slate-400 mb-1.5 ml-1">{t('register.password')}</label>
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

          <div>
             <label className="block text-xs text-slate-400 mb-1.5 ml-1">{t('register.confirm_password')}</label>
             <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
             </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 border-none shadow-lg shadow-cyan-900/20"
            isLoading={isLoading}
          >
             {isLoading ? <Loader2 className="animate-spin mr-2" /> : <span className="flex items-center">{t('register.btn')} <ArrowRight size={16} className="ml-2"/></span>}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
           {t('register.has_account')} <span onClick={() => navigate('/login')} className="text-cyan-400 font-medium hover:text-cyan-300 ml-1 cursor-pointer">{t('register.login')}</span>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-center text-[10px] text-slate-600">
        © 2023 QuantFlow AI Inc. All rights reserved.
      </div>
    </div>
  );
};