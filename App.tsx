import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet, useParams, Navigate } from 'react-router-dom';
import { LayoutDashboard, Workflow as WorkflowIcon, LineChart, Settings, Bell, Search, User, Code2, ClipboardList, Loader2, Globe, Database, LogOut, Check } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { WorkflowList } from './components/WorkflowList';
import { DashboardList } from './components/DashboardList';
import { StrategyList } from './components/StrategyList';
import { StrategyEditor } from './components/StrategyEditor';
import { BacktestList } from './components/BacktestList';
import { BacktestDetail } from './components/BacktestDetail';
import { MarketAnalysis } from './components/MarketAnalysis';
import { DataSourceList } from './components/DataSourceList';
import { LoginPage } from './components/LoginPage';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { workflowService } from './services/workflowService';
import { strategyService } from './services/strategyService';
import { backtestService } from './services/backtestService';
import { Workflow, StrategyItem, BacktestReport, NodeData, Connection, BacktestConfig } from './types';
import { LanguageProvider, useTranslation } from './contexts/LanguageContext';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const { t, language, setLanguage } = useTranslation();
  
  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Mock Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Backtest Completed', desc: 'Golden Cross Strategy finished with +8.5%', time: '2m ago', read: false },
    { id: 2, title: 'System Alert', desc: 'High latency detected on Node #4', time: '1h ago', read: false },
    { id: 3, title: 'New Market Data', desc: 'Daily close data for SPY available', time: '5h ago', read: true }
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (route: string) => path.startsWith(route);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTitle = () => {
    if (path.startsWith('/workflows')) return t('header.title.workflows');
    if (path.startsWith('/strategies')) return t('header.title.algos');
    if (path.startsWith('/backtests')) return t('header.title.evals');
    if (path.startsWith('/dashboards')) return t('header.title.dash');
    if (path.startsWith('/market')) return t('header.title.market');
    if (path.startsWith('/datasources')) return t('header.title.datasources');
    if (path.startsWith('/settings')) return t('header.title.settings');
    if (path.startsWith('/profile')) return t('header.title.profile');
    return t('header.title.default');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden selection:bg-cyan-500 selection:text-white">
      <aside className="w-20 flex flex-col items-center py-6 bg-slate-900 border-r border-slate-800 z-50">
        <div className="mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          <SidebarItem icon={<WorkflowIcon size={24} />} active={isActive('/workflows')} onClick={() => navigate('/workflows')} label={t('nav.workflows')} />
          <SidebarItem icon={<Code2 size={24} />} active={isActive('/strategies')} onClick={() => navigate('/strategies')} label={t('nav.algos')} />
          <SidebarItem icon={<ClipboardList size={24} />} active={isActive('/backtests')} onClick={() => navigate('/backtests')} label={t('nav.evals')} />
          <SidebarItem icon={<LayoutDashboard size={24} />} active={isActive('/dashboards')} onClick={() => navigate('/dashboards')} label={t('nav.dash')} />
          <SidebarItem icon={<LineChart size={24} />} active={isActive('/market')} onClick={() => navigate('/market')} label={t('nav.market')} />
          <SidebarItem icon={<Database size={24} />} active={isActive('/datasources')} onClick={() => navigate('/datasources')} label={t('nav.datasources')} />
        </nav>

        <div className="mt-auto flex flex-col gap-4 w-full px-2">
           <button 
             onClick={toggleLanguage}
             className="w-full aspect-square flex flex-col items-center justify-center gap-1 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-cyan-400 transition-all"
             title={language === 'zh' ? 'Switch to English' : '切换中文'}
           >
              <Globe size={20} />
              <span className="text-[10px] font-bold uppercase">{language}</span>
           </button>
           
           <SidebarItem icon={<Settings size={24} />} active={isActive('/settings')} onClick={() => navigate('/settings')} label={t('nav.settings')} />
           
           <div className="relative" ref={userRef}>
             <div 
               onClick={() => setShowUserMenu(!showUserMenu)}
               className="w-10 h-10 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer hover:border-cyan-500/50 transition-colors"
             >
                <User size={20} />
             </div>
             {showUserMenu && (
               <div className="absolute left-14 bottom-0 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                  <div className="p-3 border-b border-slate-800">
                     <div className="font-bold text-sm text-white">Alex Quant</div>
                     <div className="text-xs text-slate-500">Admin</div>
                  </div>
                  <div className="p-1">
                     <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2">
                        <User size={14} /> {t('header.title.profile')}
                     </button>
                     <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg flex items-center gap-2">
                        <Settings size={14} /> {t('nav.settings')}
                     </button>
                  </div>
                  <div className="p-1 border-t border-slate-800">
                     <button onClick={() => navigate('/login')} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg flex items-center gap-2">
                        <LogOut size={14} /> {t('header.logout')}
                     </button>
                  </div>
               </div>
             )}
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">{getTitle()}</h1>
            <div className="h-4 w-px bg-slate-700 mx-2" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700/50">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
              <span className="text-xs font-medium text-green-400">{t('header.system_operational')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" placeholder={t('header.search_placeholder')} className="bg-slate-950 border border-slate-800 text-sm rounded-full pl-10 pr-4 py-1.5 focus:ring-2 focus:ring-cyan-500 outline-none w-64 transition-all" />
            </div>
            
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900 shadow-sm" />
                )}
              </button>

              {showNotifications && (
                 <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between p-3 border-b border-slate-800">
                       <h3 className="font-semibold text-sm">{t('notif.title')}</h3>
                       <button 
                         className="text-[10px] text-cyan-400 hover:underline"
                         onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                       >
                         {t('notif.mark_all_read')}
                       </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                       {notifications.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-500">{t('notif.empty')}</div>
                       ) : (
                          notifications.map(n => (
                             <div key={n.id} className={`p-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.read ? 'bg-slate-800/20' : ''}`}>
                                <div className="flex justify-between items-start mb-1">
                                   <div className="text-sm font-medium text-slate-200">{n.title}</div>
                                   <div className="text-[10px] text-slate-500">{n.time}</div>
                                </div>
                                <div className="text-xs text-slate-400 line-clamp-2">{n.desc}</div>
                                {!n.read && <div className="mt-2 flex items-center gap-1 text-[10px] text-cyan-500"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500"/> Unread</div>}
                             </div>
                          ))
                       )}
                    </div>
                    <div className="p-2 text-center border-t border-slate-800">
                       <button className="text-xs text-slate-500 hover:text-white transition-colors">{t('notif.view_all')}</button>
                    </div>
                 </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 relative overflow-hidden">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, active, onClick, label }: any) => (
  <button onClick={onClick} className={`w-full aspect-square flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 group relative ${active ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}>
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />}
    {icon}
    <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 truncate w-full px-1">{label}</span>
  </button>
);

// --- Route Wrappers ---

const WorkflowEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    workflowService.getById(id).then(w => {
        if (w) setWorkflow(w);
        setLoading(false);
    });
  }, [id]);

  const handleSave = async (nodes: NodeData[], connections: Connection[]) => {
    if (id) {
        const updated = await workflowService.updateGraph(id, nodes, connections);
        setWorkflow(updated);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-cyan-500"/></div>;
  if (!workflow) return <Navigate to="/workflows" />;

  return <WorkflowCanvas workflow={workflow} onSave={handleSave} onBack={() => navigate('/workflows')} />;
};

const StrategyEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState<StrategyItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    strategyService.getById(id).then(s => {
        if (s) setStrategy(s);
        setLoading(false);
    });
  }, [id]);

  const handleSave = async (updatedStrategy: StrategyItem) => {
    const saved = await strategyService.update(updatedStrategy);
    setStrategy(saved);
  };

  const handleRunBacktest = async (s: StrategyItem, config: BacktestConfig) => {
      const report = await backtestService.runSimulation(s, config);
      navigate(`/backtests/${report.id}`);
      setTimeout(async () => {
          await backtestService.completeSimulation(report.id);
      }, 2000);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-purple-500"/></div>;
  if (!strategy) return <Navigate to="/strategies" />;

  return <StrategyEditor strategy={strategy} onSave={handleSave} onRunBacktest={handleRunBacktest} />;
};

const BacktestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<BacktestReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!id) return;
    const fetchReport = async () => {
        const r = await backtestService.getById(id);
        if (r) setReport(r);
        setLoading(false);
        
        if (r && r.status === 'pending') {
            const interval = setInterval(async () => {
                const updated = await backtestService.getById(id);
                if (updated && updated.status !== 'pending') {
                    setReport(updated);
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    };
    fetchReport();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-green-500"/></div>;
  if (!report) return <Navigate to="/backtests" />;

  return <BacktestDetail report={report} onBack={() => navigate('/backtests')} />;
};

const DashboardPage = () => {
  // In a real app, fetch dashboard config by ID
  return <Dashboard />;
};

export default function App() {
  const navigate = useNavigate();

  const handleCreateWorkflow = async () => {
    const newWf = await workflowService.create();
    navigate(`/workflows/${newWf.id}`);
  };

  const handleCreateStrategy = async () => {
    const newSt = await strategyService.create();
    navigate(`/strategies/${newSt.id}`);
  };

  return (
    <LanguageProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/workflows" replace />} />
          <Route path="workflows">
             <Route index element={<WorkflowList onSelect={(wf) => navigate(`/workflows/${wf.id}`)} onCreate={handleCreateWorkflow} />} />
             <Route path=":id" element={<WorkflowEditorPage />} />
          </Route>
          <Route path="strategies">
             <Route index element={<StrategyList onSelect={(s) => navigate(`/strategies/${s.id}`)} onCreate={handleCreateStrategy} />} />
             <Route path=":id" element={<StrategyEditorPage />} />
          </Route>
          <Route path="backtests">
             <Route index element={<BacktestList onSelect={(r) => navigate(`/backtests/${r.id}`)} />} />
             <Route path=":id" element={<BacktestDetailPage />} />
          </Route>
          <Route path="dashboards">
             <Route index element={<DashboardList onSelect={(d) => navigate(`/dashboards/${d.id}`)} onCreate={() => {}} />} />
             <Route path=":id" element={<DashboardPage />} />
          </Route>
          <Route path="market" element={<MarketAnalysis />} />
          <Route path="datasources" element={<DataSourceList />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </LanguageProvider>
  );
}