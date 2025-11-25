import React, { useState } from 'react';
import { AppView } from './types';
import { LayoutDashboard, Workflow, LineChart, Settings, Bell, Search, User } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { WorkflowCanvas } from './components/WorkflowCanvas';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.WORKFLOW);

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
            onClick={() => setCurrentView(AppView.WORKFLOW)}
            label="Builder"
          />
          <SidebarItem 
            icon={<LayoutDashboard size={24} />} 
            active={currentView === AppView.DASHBOARD} 
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            label="Dash"
          />
          <SidebarItem 
            icon={<LineChart size={24} />} 
            active={currentView === AppView.MARKET} 
            onClick={() => setCurrentView(AppView.MARKET)}
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
        <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              {currentView === AppView.WORKFLOW && 'Strategy Builder'}
              {currentView === AppView.DASHBOARD && 'Live Dashboard'}
              {currentView === AppView.MARKET && 'Market Analysis'}
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
                placeholder="Search strategies..." 
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
          {currentView === AppView.WORKFLOW && <WorkflowCanvas />}
          {currentView === AppView.DASHBOARD && <Dashboard />}
          {currentView === AppView.MARKET && (
            <div className="p-10 flex flex-col items-center justify-center h-full text-slate-500">
               <LineChart size={64} className="mb-4 opacity-20" />
               <h2 className="text-xl font-semibold">Market Analysis Module</h2>
               <p className="max-w-md text-center mt-2">Advanced charting and data visualization tools would populate this view, integrated with the data pipelines defined in the Workflow Builder.</p>
            </div>
          )}
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
