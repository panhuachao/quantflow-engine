



import React from 'react';
import { NodeData, NodeType } from '../../types';
import { NODE_COLORS, NODE_ICONS_COLOR } from '../../constants';
import { Database, Filter, TrendingUp, PlayCircle, MoreHorizontal, DownloadCloud, FileCode, Save, Clock, Globe, Search } from 'lucide-react';
import { NODE_CONTENT_REGISTRY, DefaultNodeContent } from './NodeContents';

const NodeIcon = ({ type, className }: { type: NodeType, className?: string }) => {
  switch (type) {
    case NodeType.SOURCE: return <Database size={18} className={className} />;
    case NodeType.DATA_COLLECT: return <DownloadCloud size={18} className={className} />;
    case NodeType.TRANSFORM: return <Filter size={18} className={className} />;
    case NodeType.SCRIPT: return <FileCode size={18} className={className} />;
    case NodeType.STRATEGY: return <TrendingUp size={18} className={className} />;
    case NodeType.FILTER: return <Filter size={18} className={className} />;
    case NodeType.EXECUTION: return <PlayCircle size={18} className={className} />;
    case NodeType.STORAGE: return <Save size={18} className={className} />;
    case NodeType.TIMER: return <Clock size={18} className={className} />;
    case NodeType.DATABASE_QUERY: return <Search size={18} className={className} />;
    case NodeType.HTTP_REQUEST: return <Globe size={18} className={className} />;
    default: return <MoreHorizontal size={18} className={className} />;
  }
};

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
  const ContentComponent = NODE_CONTENT_REGISTRY[node.type] || DefaultNodeContent;

  return (
    <div
      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
      className={`absolute w-[200px] bg-slate-800 rounded-lg border-l-4 ${NODE_COLORS[node.type]} 
        ${isSelected ? 'ring-2 ring-white ring-opacity-80 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''} 
        shadow-xl group transition-shadow will-change-transform`}
      onMouseDown={(e) => onMouseDown(e, node.id)}
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-700/50 flex items-center justify-between cursor-move select-none">
        <div className="flex items-center gap-2 max-w-[150px]">
          <NodeIcon type={node.type} className={NODE_ICONS_COLOR[node.type]} />
          <span className="text-sm font-semibold text-slate-200 truncate">{node.label}</span>
        </div>
        {node.status === 'running' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
      </div>
      
      {/* Body */}
      <div className="p-3 bg-slate-900/50 rounded-b-lg min-h-[50px]">
        <div className="text-[10px] text-slate-600 font-mono mb-1">ID: {node.id.substring(0, 4)}</div>
        <ContentComponent config={node.config} />

        {/* Input Port */}
        <div 
          className="absolute top-1/2 -left-3 w-6 h-6 -mt-3 flex items-center justify-center z-20"
          onMouseUp={(e) => onMouseUpInput(e, node.id)}
        >
          <div className={`w-3 h-3 rounded-full border-2 transition-all duration-200 
            ${connectingSourceId && connectingSourceId !== node.id ? 'bg-cyan-400 border-cyan-200 scale-125 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-600 border-slate-900'} 
            hover:bg-white cursor-crosshair`} 
          />
        </div>
        
        {/* Output Port */}
        <div 
          className="absolute top-1/2 -right-3 w-6 h-6 -mt-3 flex items-center justify-center z-20"
          onMouseDown={(e) => onMouseDownOutput(e, node.id)}
        >
          <div className="w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-900 hover:bg-cyan-400 hover:border-white cursor-crosshair transition-colors" />
        </div>
      </div>
    </div>
  );
};