import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet, useParams, Navigate } from 'react-router-dom';
import { LayoutDashboard, Workflow as WorkflowIcon, LineChart, Settings, Bell, Search, User, Code2, ClipboardList, Loader2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { WorkflowList } from './components/WorkflowList';
import { DashboardList } from './components/DashboardList';
import { StrategyList } from './components/StrategyList';
import { StrategyEditor } from './components/StrategyEditor';
import { BacktestList } from './components/BacktestList';
import { BacktestDetail } from './components/BacktestDetail';
import { MarketAnalysis } from './components/MarketAnalysis';
import { workflowService } from './services/workflowService';
import { strategyService } from './services/strategyService';
import { backtestService } from './services/backtestService';
import { Workflow, StrategyItem, BacktestReport, NodeData, Connection } from './types';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => path.startsWith(route);

  const getTitle = () => {
    if (path.startsWith('/workflows')) return 'Workflow Orchestrator';
    if (path.startsWith('/strategies')) return 'Algorithm Library';
    if (path.startsWith('/backtests')) return 'Backtest Evaluations';
    if (path.startsWith('/dashboards')) return 'Dashboard Library';
    if (path.startsWith('/market')) return 'Market Analysis';
    return 'QuantFlow AI';
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
          <SidebarItem icon={<WorkflowIcon size={24} />} active={isActive('/workflows')} onClick={() => navigate('/workflows')} label="Workflows" />
          <SidebarItem icon={<Code2 size={24} />} active={isActive('/strategies')} onClick={() => navigate('/strategies')} label="Algos" />
          <SidebarItem icon={<ClipboardList size={24} />} active={isActive('/backtests')} onClick={() => navigate('/backtests')} label="Evals" />
          <SidebarItem icon={<LayoutDashboard size={24} />} active={isActive('/dashboards')} onClick={() => navigate('/dashboards')} label="Dash" />
          <SidebarItem icon={<LineChart size={24} />} active={isActive('/market')} onClick={() => navigate('/market')} label="Market" />
        </nav>

        <div className="mt-auto flex flex-col gap-4 w-full px-2">
           <SidebarItem icon={<Settings size={24} />} label="Settings" />
           <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer">
              <User size={20} />
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
              <span className="text-xs font-medium text-green-400">System Operational</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" placeholder="Global search..." className="bg-slate-950 border border-slate-800 text-sm rounded-full pl-10 pr-4 py-1.5 focus:ring-2 focus:ring-cyan-500 outline-none w-64 transition-all" />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900" />
            </button>
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
    <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">{label}</span>
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

  const handleRunBacktest = async (s: StrategyItem) => {
      const report = await backtestService.runSimulation(s);
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
    <Routes>
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
      </Route>
    </Routes>
  );
}