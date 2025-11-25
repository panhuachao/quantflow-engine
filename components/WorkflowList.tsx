

import React from 'react';
import { WorkflowMeta, Workflow } from '../types';
import { Button } from './ui/Button';
import { Plus, Search, MoreHorizontal, Play, Edit, Clock, GitBranch, Activity } from 'lucide-react';
import { MOCK_WORKFLOWS_LIST } from '../constants';

interface WorkflowListProps {
  onSelect: (workflow: WorkflowMeta) => void;
  onCreate: () => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ onSelect, onCreate }) => {
  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">Strategies & Workflows</h2>
            <p className="text-slate-400 mt-1">Manage and deploy your quantitative trading logic.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder="Search workflows..." 
                 className="bg-slate-900/50 border border-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-cyan-500 outline-none w-64 text-slate-200"
               />
            </div>
            <Button onClick={onCreate} icon={<Plus size={18}/>}>
              New Strategy
            </Button>
          </div>
        </div>

        {/* Grid/List */}
        <div className="grid grid-cols-1 gap-4">
          {MOCK_WORKFLOWS_LIST.map((workflow) => (
            <div 
              key={workflow.id} 
              className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-cyan-900/10 transition-all cursor-pointer flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
              onClick={() => onSelect({ ...workflow, nodesCount: workflow.nodes.length })}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`mt-1 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    workflow.status === 'active' ? 'bg-green-500/10 text-green-400' :
                    workflow.status === 'draft' ? 'bg-slate-700/50 text-slate-400' :
                    'bg-slate-800 text-slate-600'
                }`}>
                   <GitBranch size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">{workflow.name}</h3>
                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full border ${
                       workflow.status === 'active' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                       workflow.status === 'draft' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' :
                       'border-slate-600 bg-slate-700 text-slate-400'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-1">{workflow.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                       <Clock size={12} />
                       Updated {workflow.updatedAt}
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Activity size={12} />
                       {workflow.nodes.length} Nodes
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                 <Button 
                   variant="secondary" 
                   size="sm" 
                   className="opacity-0 group-hover:opacity-100 transition-opacity"
                   onClick={(e) => { e.stopPropagation(); onSelect({ ...workflow, nodesCount: workflow.nodes.length }); }}
                 >
                   <Edit size={14} className="mr-2" />
                   Configure
                 </Button>
                 <Button 
                   variant="ghost" 
                   size="sm"
                   className="text-slate-400 hover:text-white"
                   onClick={(e) => e.stopPropagation()}
                 >
                   <MoreHorizontal size={18} />
                 </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
