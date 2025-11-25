
import React, { useState } from 'react';
import { AppView, WorkflowMeta, DashboardMeta, StrategyItem, BacktestReport } from './types';
import { LayoutDashboard, Workflow, LineChart, Settings, Bell, Search, User, ChevronRight, ArrowLeft, Code2, ClipboardList } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { WorkflowList } from './components/WorkflowList';
import { DashboardList } from './components/DashboardList';
import { StrategyList } from './components/StrategyList';
import { StrategyEditor } from './components/StrategyEditor';
import { BacktestList } from './components/BacktestList';
import { BacktestDetail } from './components/BacktestDetail';
import { MOCK_BACKTEST_REPORTS, MOCK_REPORT_HTML } from './constants';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.WORKFLOW);
  
  // Navigation State
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowMeta | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardMeta | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyItem | null>(null);
  const [selectedBacktest, setSelectedBacktest] = useState<BacktestReport | null>(null);
  
  // Global Data State (for simulation)
  const [backtestReports, setBacktestReports] = useState<BacktestReport[]>(MOCK_BACKTEST_REPORTS);

  // Navigation Handlers
  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    // Reset selections when switching main tabs
    if (view !== AppView.WORKFLOW) setSelectedWorkflow(null);
    if (view !== AppView.DASHBOARD) setSelectedDashboard(null);
    if (view !== AppView.STRATEGIES) setSelectedStrategy(null);
    if (view !== AppView.BACKTESTS) setSelectedBacktest(null);
  };

  const handleBack = () => {
    if (currentView === AppView.WORKFLOW) setSelectedWorkflow(null);
    if (currentView === AppView.DASHBOARD) setSelectedDashboard(null);
    if (currentView === AppView.STRATEGIES) setSelectedStrategy(null);
    if (currentView === AppView.BACKTESTS) setSelectedBacktest(null);
  };

  // Simulation Logic
  const runBacktestSimulation = (strategy: StrategyItem) => {
     // Create a new "pending" report
     const newReport: BacktestReport = {
        id: `bt-${Date.now()}`,
        strategyId: strategy.id,
        strategyName: strategy.name,
        symbol: 'BTCUSDT', // Default for sim
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
     
     // 1. Add pending report to list
     const updatedReports = [newReport, ...backtestReports];
     setBacktestReports(updatedReports);
     
     // 2. Navigate to Backtest List to show it's running
     handleNavigate(AppView.BACKTESTS);

     // 3. Simulate completion after 2 seconds
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
            reportHtml: MOCK_REPORT_HTML // Attach the mock HTML
        };
        setBacktestReports(prev => prev.map(r => r.id === newReport.id ? completedReport : r));
        // Optionally auto-open the completed report
        setSelectedBacktest(completedReport);
     }, 2000);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.WORKFLOW:
        if (selectedWorkflow) {
          return <WorkflowCanvas />;
        }
        return (
          <WorkflowList 
            onSelect={(wf) => setSelectedWorkflow(wf)} 
            onCreate={() => setSelectedWorkflow({ id: 'new', name: 'New Strategy', description: '', status: 'draft', updatedAt: 'Just now', nodesCount: 0 })}
          />
        );
      
      case AppView.DASHBOARD:
        if (selectedDashboard) {
          return <Dashboard />;
        }
        return (
          <DashboardList 
            onSelect={(db) => setSelectedDashboard(db)} 
            onCreate={() => setSelectedDashboard({ id: 'new', name: 'New Dashboard', widgetCount: 0, updatedAt: 'Just now', thumbnailColor: 'bg-slate-800' })}
          />
        );

      case AppView.STRATEGIES:
        if (selectedStrategy) {
          return (
            <StrategyEditor 
               strategy={selectedStrategy} 
               onSave={(s) => setSelectedStrategy(s)} 
               onRunBacktest={runBacktestSimulation}
            />
          );
        }
        return (
          <StrategyList 
            onSelect={(s) => setSelectedStrategy(s)}
            onCreate={() => setSelectedStrategy({
               id: 'new',
               name: 'New Backtrader Strategy',
               description: '',
               code: 'import backtrader as bt\n\nclass MyStrategy(bt.Strategy):\n    def next(self):\n        pass',
               language: 'python',
               framework: 'backtrader',
               updatedAt: 'Just now',
               tags: []
            })}
          />
        );
      
      case AppView.BACKTESTS:
         if (selectedBacktest) {
            return <BacktestDetail report={selectedBacktest} onBack={() => setSelectedBacktest(null)} />;
         }
         return <BacktestList reports={backtestReports} onSelect={(r) => setSelectedBacktest(r)} />;

      case AppView.MARKET:
        return (
          <div className="p-10 flex flex-col items-center justify-center h-full text-slate-500">
             <LineChart size={64} className="mb-4 opacity-20" />
             <h2 className="text-xl font-semibold">Market Analysis Module</h2>
             <p className="max-w-md text-center mt-2">Advanced charting and data visualization tools would populate this view.</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  const getBreadcrumbs = () => {
    if (currentView === AppView.WORKFLOW && selectedWorkflow) {
       return (
         <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 cursor-pointer hover:text-slate-300" onClick={handleBack}>Strategies</span>
            <ChevronRight size={14} className="text-slate-600" />
            <span className="font-medium text-slate-200">{selectedWorkflow.name}</span>
         </div>
       );
    }
    if (currentView === AppView.DASHBOARD && selectedDashboard) {
      return (
        <div className="flex items-center gap-2 text-sm">
           <span className="text-slate-500 cursor-pointer hover:text-slate-300" onClick={handleBack}>Dashboards</span>
           <ChevronRight size={14} className="text-slate-600" />
           <span className="font-medium text-slate-200">{selectedDashboard.name}</span>
        </div>
      );
    }
    if (currentView === AppView.STRATEGIES && selectedStrategy) {
      return (
        <div className="flex items-center gap-2 text-sm">
           <span className="text-slate-500 cursor-pointer hover:text-slate-300" onClick={handleBack}>Algorithms</span>
           <ChevronRight size={14} className="text-slate-600" />
           <span className="font-medium text-slate-200">{selectedStrategy.name}</span>
        </div>
      );
    }
    if (currentView === AppView.BACKTESTS && selectedBacktest) {
        return (
          <div className="flex items-center gap-2 text-sm">
             <span className="text-slate-500 cursor-pointer hover:text-slate-300" onClick={handleBack}>Evaluations</span>
             <ChevronRight size={14} className="text-slate-600" />
             <span className="font-medium text-slate-200">{selectedBacktest.strategyName}</span>
          </div>
        );
      }
    return null;
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Sidebar */}
      <aside className="w-20 flex flex-col items-center py-6 bg-slate-900 border-r border-slate-800 z-50">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          <SidebarItem 
            icon={<Workflow size={24} />} 
            active={currentView === AppView.WORKFLOW} 
            onClick={() => handleNavigate(AppView.WORKFLOW)}
            label="Workflows"
          />
          <SidebarItem 
            icon={<Code2 size={24} />} 
            active={currentView === AppView.STRATEGIES} 
            onClick={() => handleNavigate(AppView.STRATEGIES)}
            label="Algos"
          />
          <SidebarItem 
            icon={<ClipboardList size={24} />} 
            active={currentView === AppView.BACKTESTS} 
            onClick={() => handleNavigate(AppView.BACKTESTS)}
            label="Evals"
          />
          <SidebarItem 
            icon={<LayoutDashboard size={24} />} 
            active={currentView === AppView.DASHBOARD} 
            onClick={() => handleNavigate(AppView.DASHBOARD)}
            label="Dash"
          />
          <SidebarItem 
            icon={<LineChart size={24} />} 
            active={currentView === AppView.MARKET} 
            onClick={() => handleNavigate(AppView.MARKET)}
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
            
            {/* Conditional Back Button or Title */}
            {(selectedWorkflow || selectedDashboard || selectedStrategy || selectedBacktest) ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleBack}
                  className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                {getBreadcrumbs()}
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                  {currentView === AppView.WORKFLOW && 'Workflow Orchestrator'}
                  {currentView === AppView.DASHBOARD && 'Dashboard Library'}
                  {currentView === AppView.STRATEGIES && 'Algorithm Library'}
                  {currentView === AppView.BACKTESTS && 'Backtest Evaluations'}
                  {currentView === AppView.MARKET && 'Market Analysis'}
                </h1>
                <div className="h-4 w-px bg-slate-700 mx-2" />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700/50">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
                  <span className="text-xs font-medium text-green-400">System Operational</span>
                </div>
              </>
            )}

          </div>

          <div className="flex items-center gap-4">
            {!selectedWorkflow && !selectedDashboard && !selectedStrategy && !selectedBacktest && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Global search..." 
                  className="bg-slate-950 border border-slate-800 text-sm rounded-full pl-10 pr-4 py-1.5 focus:ring-2 focus:ring-cyan-500 outline-none w-64 transition-all"
                />
              </div>
            )}
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 relative overflow-hidden">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}

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
