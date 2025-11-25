import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet, useParams, Navigate } from 'react-router-dom';
import { WorkflowMeta, Workflow, DashboardMeta, StrategyItem, BacktestReport, NodeData, Connection } from './types';
import { LayoutDashboard, Workflow as WorkflowIcon, LineChart, Settings, Bell, Search, User, ChevronRight, ArrowLeft, Code2, ClipboardList } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { WorkflowList } from './components/WorkflowList';
import { DashboardList } from './components/DashboardList';
import { StrategyList } from './components/StrategyList';
import { StrategyEditor } from './components/StrategyEditor';
import { BacktestList } from './components/BacktestList';
import { BacktestDetail } from './components/BacktestDetail';
import { MarketAnalysis } from './components/MarketAnalysis';
import { MOCK_WORKFLOWS_LIST, MOCK_BACKTEST_REPORTS, MOCK_REPORT_HTML, MOCK_STRATEGIES, MOCK_DASHBOARDS_LIST } from './constants';

// --- Types for Context Passing ---
type ContextType = {
  workflows: Workflow[];
  setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>>;
  strategies: StrategyItem[];
  setStrategies: React.Dispatch<React.SetStateAction<StrategyItem[]>>;
  dashboards: DashboardMeta[];
  setDashboards: React.Dispatch<React.SetStateAction<DashboardMeta[]>>;
  backtestReports: BacktestReport[];
  setBacktestReports: React.Dispatch<React.SetStateAction<BacktestReport[]>>;
  runBacktestSimulation: (strategy: StrategyItem) => void;
};

// --- Layout Component ---
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
      {/* Sidebar */}
      <aside className="w-20 flex flex-col items-center py-6 bg-slate-900 border-r border-slate-800 z-50">
        <div className="mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          <SidebarItem 
            icon={<WorkflowIcon size={24} />} 
            active={isActive('/workflows')} 
            onClick={() => navigate('/workflows')}
            label="Workflows"
          />
          <SidebarItem 
            icon={<Code2 size={24} />} 
            active={isActive('/strategies')} 
            onClick={() => navigate('/strategies')}
            label="Algos"
          />
          <SidebarItem 
            icon={<ClipboardList size={24} />} 
            active={isActive('/backtests')} 
            onClick={() => navigate('/backtests')}
            label="Evals"
          />
          <SidebarItem 
            icon={<LayoutDashboard size={24} />} 
            active={isActive('/dashboards')} 
            onClick={() => navigate('/dashboards')}
            label="Dash"
          />
          <SidebarItem 
            icon={<LineChart size={24} />} 
            active={isActive('/market')} 
            onClick={() => navigate('/market')}
            label="Market"
          />
        </nav>

        <div className="mt-auto flex flex-col gap-4 w-full px-2">
           <SidebarItem icon={<Settings size={24} />} label="Settings" />
           <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer">
              <User size={20} />
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              {getTitle()}
            </h1>
            <div className="h-4 w-px bg-slate-700 mx-2" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700/50">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
              <span className="text-xs font-medium text-green-400">System Operational</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="bg-slate-950 border border-slate-800 text-sm rounded-full pl-10 pr-4 py-1.5 focus:ring-2 focus:ring-cyan-500 outline-none w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 relative overflow-hidden">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, active, onClick, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full aspect-square flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 group relative ${
      active 
        ? 'bg-cyan-500/10 text-cyan-400' 
        : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />}
    {icon}
    <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">{label}</span>
  </button>
);


// --- Route Wrappers ---

const WorkflowEditorRoute = ({ workflows, setWorkflows }: { workflows: Workflow[], setWorkflows: (w: Workflow[]) => void }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const workflow = workflows.find(w => w.id === id);

  if (!workflow) return <Navigate to="/workflows" replace />;

  const handleSave = (nodes: NodeData[], connections: Connection[]) => {
    const updated = { ...workflow, nodes, connections, updatedAt: 'Just now' };
    setWorkflows(workflows.map(w => w.id === id ? updated : w));
  };

  return <WorkflowCanvas workflow={workflow} onSave={handleSave} onBack={() => navigate('/workflows')} />;
};

const StrategyEditorRoute = ({ strategies, setStrategies, runBacktest }: { strategies: StrategyItem[], setStrategies: (s: StrategyItem[]) => void, runBacktest: (s: StrategyItem) => void }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const strategy = strategies.find(s => s.id === id);

  if (!strategy) return <Navigate to="/strategies" replace />;

  const handleSave = (updatedStrategy: StrategyItem) => {
    setStrategies(strategies.map(s => s.id === id ? updatedStrategy : s));
  };

  return <StrategyEditor strategy={strategy} onSave={handleSave} onRunBacktest={runBacktest} />;
};

const BacktestDetailRoute = ({ reports }: { reports: BacktestReport[] }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const report = reports.find(r => r.id === id);

  if (!report) return <Navigate to="/backtests" replace />;

  return <BacktestDetail report={report} onBack={() => navigate('/backtests')} />;
};

const DashboardRoute = ({ dashboards, setDashboards }: { dashboards: DashboardMeta[], setDashboards: (d: DashboardMeta[]) => void }) => {
  const { id } = useParams();
  // In a real app, Dashboard component would take an ID/Object to render specific data.
  // For now, we render the generic Dashboard component.
  return <Dashboard />;
};


// --- Main App Component ---

export default function App() {
  // Global Data State
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS_LIST);
  const [strategies, setStrategies] = useState<StrategyItem[]>(MOCK_STRATEGIES);
  const [dashboards, setDashboards] = useState<DashboardMeta[]>(MOCK_DASHBOARDS_LIST);
  const [backtestReports, setBacktestReports] = useState<BacktestReport[]>(MOCK_BACKTEST_REPORTS);
  
  const navigate = useNavigate();

  // Actions
  const handleCreateWorkflow = () => {
    const newId = `wf-${Date.now()}`;
    const newWorkflow: Workflow = {
      id: newId,
      name: 'New Trading Strategy',
      description: 'Draft strategy configuration.',
      status: 'draft',
      updatedAt: 'Just now',
      nodes: [],
      connections: []
    };
    setWorkflows([newWorkflow, ...workflows]);
    navigate(`/workflows/${newId}`);
  };

  const handleCreateStrategy = () => {
    const newId = `st-${Date.now()}`;
    const newStrategy: StrategyItem = {
      id: newId,
      name: 'New Algorithm',
      description: '',
      code: 'import backtrader as bt\n\nclass MyStrategy(bt.Strategy):\n    def next(self):\n        pass',
      language: 'python',
      framework: 'backtrader',
      updatedAt: 'Just now',
      tags: []
    };
    setStrategies([newStrategy, ...strategies]);
    navigate(`/strategies/${newId}`);
  };

  const runBacktestSimulation = (strategy: StrategyItem) => {
     const newId = `bt-${Date.now()}`;
     const newReport: BacktestReport = {
        id: newId,
        strategyId: strategy.id,
        strategyName: strategy.name,
        symbol: 'BTCUSDT', 
        interval: '1h',
        startDate: '2023-01-01',
        endDate: '2023-10-25',
        initialCash: 100000,
        finalValue: 0,
        returnPct: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        tradeCount: 0,
        winRate: 0,
        status: 'pending',
        createdAt: new Date().toLocaleString()
     };
     setBacktestReports([newReport, ...backtestReports]);
     navigate(`/backtests/${newId}`); // Go to detail view immediately (showing pending state)

     setTimeout(() => {
        const completedReport: BacktestReport = {
            ...newReport,
            finalValue: 108500,
            returnPct: 8.5,
            sharpeRatio: 1.45,
            maxDrawdown: -5.2,
            tradeCount: 42,
            winRate: 58.0,
            status: 'completed',
            reportHtml: MOCK_REPORT_HTML 
        };
        setBacktestReports(prev => prev.map(r => r.id === newId ? completedReport : r));
     }, 2000);
  };

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Redirect Root to Workflows */}
        <Route index element={<Navigate to="/workflows" replace />} />

        {/* Workflows */}
        <Route path="workflows">
           <Route index element={<WorkflowList onSelect={(wf) => navigate(`/workflows/${wf.id}`)} onCreate={handleCreateWorkflow} />} />
           <Route path=":id" element={<WorkflowEditorRoute workflows={workflows} setWorkflows={setWorkflows} />} />
        </Route>

        {/* Strategies */}
        <Route path="strategies">
           <Route index element={<StrategyList onSelect={(s) => navigate(`/strategies/${s.id}`)} onCreate={handleCreateStrategy} />} />
           <Route path=":id" element={<StrategyEditorRoute strategies={strategies} setStrategies={setStrategies} runBacktest={runBacktestSimulation} />} />
        </Route>

        {/* Backtests */}
        <Route path="backtests">
           <Route index element={<BacktestList reports={backtestReports} onSelect={(r) => navigate(`/backtests/${r.id}`)} />} />
           <Route path=":id" element={<BacktestDetailRoute reports={backtestReports} />} />
        </Route>

        {/* Dashboards */}
        <Route path="dashboards">
           <Route index element={<DashboardList onSelect={(d) => navigate(`/dashboards/${d.id}`)} onCreate={() => { /* Logic to create dash */ }} />} />
           <Route path=":id" element={<DashboardRoute dashboards={dashboards} setDashboards={setDashboards} />} />
        </Route>

        {/* Market */}
        <Route path="market" element={<MarketAnalysis />} />
      </Route>
    </Routes>
  );
}