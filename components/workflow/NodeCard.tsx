
import React from 'react';
import { NodeData } from '../../types';
import { getNodeDefinition } from './nodeDefinitions';

interface NodeCardProps {
  node: NodeData;
  isSelected: boolean;
  connectingSourceId: string | null;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onMouseDownOutput: (e: React.MouseEvent, id: string) => void;
  onMouseUpInput: (e: React.MouseEvent, id: string) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({ 
  node, 
  isSelected, 
  connectingSourceId,
  onMouseDown, 
  onMouseDownOutput, 
  onMouseUpInput 
}) => {
  const definition = getNodeDefinition(node.type);
  const { PreviewComponent, icon: Icon, color, iconColor } = definition;

  // Round coordinates to prevent sub-pixel blurring which causes text to look fuzzy
  const x = Math.round(node.x);
  const y = Math.round(node.y);

  return (
    <div
      style={{ transform: `translate(${x}px, ${y}px)` }}
      className={`absolute w-[200px] rounded-lg bg-slate-900 
        border-l-4 ${color} border-y border-r border-slate-800
        ${isSelected 
          ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
          : 'shadow-lg hover:shadow-xl hover:border-slate-700'
        } 
        transition-all z-10 group`}
      onMouseDown={(e) => onMouseDown(e, node.id)}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-slate-800 flex items-center justify-between cursor-move select-none bg-slate-900/50 rounded-t-lg">
        <div className="flex items-center gap-2.5 max-w-[150px]">
          <Icon size={16} className={iconColor} />
          <span className="text-sm font-bold text-slate-200 truncate tracking-tight">{node.label}</span>
        </div>
        
        {/* Status Indicators - sharper colors */}
        <div className="flex items-center">
          {node.status === 'running' && <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]" />}
          {node.status === 'error' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
          {node.status === 'success' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />}
        </div>
      </div>
      
      {/* Body */}
      <div className="p-3 bg-slate-950/30 rounded-b-lg min-h-[50px]">
        <div className="text-[10px] text-slate-500 font-mono mb-2 flex justify-between select-none">
            <span>ID: {node.id.substring(0, 4)}</span>
            <span className="opacity-50">{node.type}</span>
        </div>
        
        {/* Dynamic Preview Content */}
        <PreviewComponent config={node.config} />

        {/* Input Port - larger hit area, sharper visual */}
        <div 
          className="absolute top-1/2 -left-3 w-6 h-6 -mt-3 flex items-center justify-center z-20 group/port"
          onMouseUp={(e) => onMouseUpInput(e, node.id)}
        >
          <div className={`w-3 h-3 rounded-full border-2 transition-all duration-200 
            ${connectingSourceId && connectingSourceId !== node.id ? 'bg-cyan-400 border-cyan-200 scale-125 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-800 border-slate-600 group-hover/port:bg-slate-200 group-hover/port:border-white'} 
            cursor-crosshair`} 
          />
        </div>
        
        {/* Output Port */}
        <div 
          className="absolute top-1/2 -right-3 w-6 h-6 -mt-3 flex items-center justify-center z-20 group/port"
          onMouseDown={(e) => onMouseDownOutput(e, node.id)}
        >
          <div className="w-3 h-3 bg-slate-800 rounded-full border-2 border-slate-600 group-hover/port:bg-cyan-400 group-hover/port:border-white cursor-crosshair transition-all shadow-sm" />
        </div>
      </div>
    </div>
  );
};
