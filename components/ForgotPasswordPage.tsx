import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { Lock, Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate Sending Code
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate Reset
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        <button onClick={() => navigate('/login')} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
        </button>

        <div className="text-center mb-8 mt-4">
           <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
           </div>
           <h1 className="text-2xl font-bold text-white mb-2">
             {step === 1 ? t('forgot.title') : t('forgot.step2.title')}
           </h1>
           <p className="text-slate-400 text-sm px-4">
             {step === 1 ? t('forgot.subtitle') : t('forgot.step2.subtitle')}
           </p>
        </div>

        {step === 1 ? (
            <form onSubmit={handleSendCode} className="space-y-6">
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
                <Button 
                    type="submit" 
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500"
                    isLoading={isLoading}
                >
                    {t('forgot.step1.btn')}
                </Button>
            </form>
        ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-300 flex items-center gap-2 mb-4">
                    <CheckCircle size={14} className="text-green-400"/>
                    {t('forgot.sent')} <span className="font-bold text-white">{email}</span>
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1.5 ml-1">{t('forgot.code')}</label>
                    <input 
                        type="text"
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all tracking-widest text-center font-mono font-bold text-lg"
                        placeholder="000000"
                        maxLength={6}
                        value={code}
                        onChange={e => setCode(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1.5 ml-1">{t('forgot.new_password')}</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                        type="password"
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1.5 ml-1">{t('forgot.confirm_new')}</label>
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
                    className="w-full py-3 mt-4 bg-green-600 hover:bg-green-500"
                    isLoading={isLoading}
                >
                    {t('forgot.reset_btn')}
                </Button>

                <div className="text-center mt-4">
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-white transition-colors">
                        {t('forgot.resend')}
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};