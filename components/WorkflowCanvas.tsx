
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NodeData, Connection, NodeType } from '../types';
import { INITIAL_NODES, INITIAL_CONNECTIONS, NODE_COLORS, NODE_ICONS_COLOR } from '../constants';
import { Database, Filter, TrendingUp, PlayCircle, MoreHorizontal, X, Wand2, Code, Play, DownloadCloud, FileCode, Save, Server, Clock, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import { generateStrategyCode } from '../services/geminiService';

// SVG Path helper
const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
  return `M${x1},${y1} C${x1 + 100},${y1} ${x2 - 100},${y2} ${x2},${y2}`;
};

// Cycle detection algorithm (DFS)
const hasCycle = (sourceId: string, targetId: string, connections: Connection[]): boolean => {
  // Build Adjacency List
  const adj = new Map<string, string[]>();
  connections.forEach(c => {
    if (!adj.has(c.sourceId)) adj.set(c.sourceId, []);
    adj.get(c.sourceId)?.push(c.targetId);
  });

  // Temporarily add the proposed connection
  if (!adj.has(sourceId)) adj.set(sourceId, []);
  adj.get(sourceId)?.push(targetId);

  // DFS to detect back edge to target or cycle involving new path
  // Simpler check: Can we reach source from target? If yes, adding source->target creates loop.
  const stack = [targetId];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const curr = stack.pop()!;
    if (curr === sourceId) return true; // Found a path back to source
    
    if (!visited.has(curr)) {
      visited.add(curr);
      const neighbors = adj.get(curr) || [];
      neighbors.forEach(n => stack.push(n));
    }
  }

  return false;
};

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
    default: return <MoreHorizontal size={18} className={className} />;
  }
};

// Component to display node specific config summary
const NodeSummary = ({ node }: { node: NodeData }) => {
  const { config, type } = node;

  switch (type) {
    case NodeType.DATA_COLLECT:
      return (
        <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span>Source</span>
            <span className="text-slate-200 font-medium">{config.source || '-'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Symbol</span>
            <span className="text-orange-400 font-mono">{config.symbol || '-'}</span>
          </div>
        </div>
      );
    case NodeType.TIMER:
      return (
        <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px]">
          <div className="flex justify-between items-center text-slate-400">
            <span>Schedule</span>
            <code className="bg-slate-900 px-1.5 py-0.5 rounded text-teal-400 font-mono">{config.cron || '* * * * *'}</code>
          </div>
        </div>
      );
    case NodeType.STORAGE:
      return (
        <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] space-y-1">
           <div className="text-slate-400">{config.dbType || 'Storage'}</div>
           <div className="text-indigo-300 truncate" title={config.table}>{config.table ? `Table: ${config.table}` : 'No table set'}</div>
        </div>
      );
    case NodeType.SCRIPT:
      return (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
           <div className="text-[10px] text-pink-400 font-mono bg-slate-900/50 p-1 rounded truncate opacity-80">
             {config.code ? (config.code.length > 25 ? config.code.substring(0,25)+'...' : config.code) : '// No code'}
           </div>
        </div>
      );
    case NodeType.STRATEGY:
      return (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
           <div className="text-[10px] text-slate-400 italic truncate">
             {config.description ? `"${config.description}"` : 'No description'}
           </div>
        </div>
      );
    default:
      return null;
  }
};

export const WorkflowCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Node Dragging State
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Connection Dragging State
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // Relative to canvas
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Property Panel State
  const [nodePrompt, setNodePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cycleError, setCycleError] = useState<string | null>(null);

  // --- Handlers ---

  const handleMouseDownNode = (e: React.MouseEvent, id: string, x: number, y: number) => {
    e.stopPropagation();
    setSelectedNodeId(id);
    setIsDraggingNode(true);
    setCycleError(null);
    
    // Find prompt if existing config
    const n = nodes.find(node => node.id === id);
    if(n) setNodePrompt(n.config.description || '');

    const rect = (e.target as Element).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - x, 
      y: e.clientY - y
    });
  };

  const handleMouseDownOutput = (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setCycleError(null);
    setConnectingSourceId(sourceId);
    
    // Initial mouse pos relative to canvas
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }
  };

  const handleMouseUpInput = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (connectingSourceId) {
        if (connectingSourceId === targetId) {
            setCycleError("Cannot connect a node to itself.");
        } else if (connections.some(c => c.sourceId === connectingSourceId && c.targetId === targetId)) {
            setCycleError("Connection already exists.");
        } else if (hasCycle(connectingSourceId, targetId, connections)) {
            setCycleError("Cannot connect: Cycle detected!");
        } else {
            // Success
            const newConn: Connection = {
                id: `c-${Date.now()}`,
                sourceId: connectingSourceId,
                targetId: targetId
            };
            setConnections([...connections, newConn]);
            setCycleError(null);
        }
    }
    setConnectingSourceId(null);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - canvasRect.left;
        const y = e.clientY - canvasRect.top;

        if (isDraggingNode && selectedNodeId) {
            setNodes(prev => prev.map(node => 
                node.id === selectedNodeId ? { ...node, x: x - dragOffset.x, y: y - dragOffset.y } : node
            ));
        }

        if (connectingSourceId) {
            setMousePos({ x, y });
        }
    }
  }, [isDraggingNode, selectedNodeId, dragOffset, connectingSourceId]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingNode(false);
    setConnectingSourceId(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const deleteConnection = (id: string) => {
      setConnections(connections.filter(c => c.id !== id));
  };

  const handleGenerateCode = async () => {
    if (!selectedNodeId || !nodePrompt) return;
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node || node.type !== NodeType.STRATEGY) return;

    setIsGenerating(true);
    const code = await generateStrategyCode(nodePrompt);
    
    setNodes(prev => prev.map(n => 
      n.id === selectedNodeId ? { 
        ...n, 
        config: { ...n.config, parameters: code, description: nodePrompt } 
      } : n
    ));
    setIsGenerating(false);
  };

  const updateNodeConfig = (key: string, value: any) => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.map(n => 
      n.id === selectedNodeId ? { ...n, config: { ...n.config, [key]: value } } : n
    ));
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  
  const draggableNodeTypes = [
    NodeType.TIMER,
    NodeType.DATA_COLLECT,
    NodeType.SCRIPT,
    NodeType.STRATEGY,
    NodeType.STORAGE,
    NodeType.EXECUTION
  ];

  return (
    <div className="flex h-full">
      {/* Toolbar / Palette */}
      <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4 z-10">
         {draggableNodeTypes.map(type => (
             <div key={type} 
              className="p-3 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-grab active:cursor-grabbing transition-colors"
              title={`Add ${type}`}
              draggable
              onDragEnd={(e) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const newNode: NodeData = {
                  id: Date.now().toString(),
                  type,
                  label: type === NodeType.TIMER ? 'Cron Timer' : `New ${type}`,
                  x: e.clientX - rect.left - 100, // Center on mouse approx
                  y: e.clientY - rect.top - 40,
                  config: {},
                  status: 'idle'
                };
                setNodes([...nodes, newNode]);
              }}
             >
                <NodeIcon type={type} />
             </div>
         ))}
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 bg-slate-950 relative overflow-hidden grid-bg"
        onMouseDown={() => { setSelectedNodeId(null); setCycleError(null); }}
      >
        {/* Cycle Error Toast */}
        {cycleError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-500 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
                <AlertTriangle size={18} />
                <span className="text-sm font-medium">{cycleError}</span>
            </div>
        )}

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Existing Connections */}
          {connections.map(conn => {
            const source = nodes.find(n => n.id === conn.sourceId);
            const target = nodes.find(n => n.id === conn.targetId);
            if (!source || !target) return null;
            return (
              <g key={conn.id} className="group pointer-events-auto cursor-pointer" onClick={() => deleteConnection(conn.id)}>
                 <path
                    d={getBezierPath(source.x + 200, source.y + 40, target.x, target.y + 40)}
                    stroke="#475569"
                    strokeWidth="2"
                    fill="none"
                    className="group-hover:stroke-red-500 transition-colors"
                  />
                  {/* Invisible wide path for easier clicking */}
                  <path
                    d={getBezierPath(source.x + 200, source.y + 40, target.x, target.y + 40)}
                    stroke="transparent"
                    strokeWidth="15"
                    fill="none"
                  />
              </g>
            );
          })}

          {/* Temporary Connection Line being dragged */}
          {connectingSourceId && (
              (() => {
                  const source = nodes.find(n => n.id === connectingSourceId);
                  if (source) {
                      return (
                          <path 
                             d={getBezierPath(source.x + 200, source.y + 40, mousePos.x, mousePos.y)}
                             stroke="#22d3ee"
                             strokeWidth="2"
                             strokeDasharray="5,5"
                             fill="none"
                          />
                      )
                  }
                  return null;
              })()
          )}
        </svg>

        {nodes.map(node => (
          <div
            key={node.id}
            style={{ left: node.x, top: node.y }}
            className={`absolute w-[200px] bg-slate-800 rounded-lg border-l-4 ${NODE_COLORS[node.type]} ${selectedNodeId === node.id ? 'ring-2 ring-white ring-opacity-50' : ''} shadow-xl group transition-shadow`}
            onMouseDown={(e) => handleMouseDownNode(e, node.id, node.x, node.y)}
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
               <div className="text-[10px] text-slate-600 font-mono mb-1">ID: {node.id.substring(0,4)}</div>
               
               {/* Enhanced Node Summary */}
               <NodeSummary node={node} />

               {/* Connectors */}
               
               {/* INPUT (Left) */}
               <div 
                 className="absolute top-1/2 -left-3 w-6 h-6 -mt-3 flex items-center justify-center z-20"
                 onMouseUp={(e) => handleMouseUpInput(e, node.id)}
               >
                  <div className={`w-3 h-3 rounded-full border-2 transition-all duration-200 
                      ${connectingSourceId && connectingSourceId !== node.id ? 'bg-cyan-400 border-cyan-200 scale-125 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-600 border-slate-900'} 
                      hover:bg-white cursor-crosshair`} 
                  />
               </div>
               
               {/* OUTPUT (Right) */}
               <div 
                 className="absolute top-1/2 -right-3 w-6 h-6 -mt-3 flex items-center justify-center z-20"
                 onMouseDown={(e) => handleMouseDownOutput(e, node.id)}
               >
                  <div className="w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-900 hover:bg-cyan-400 hover:border-white cursor-crosshair transition-colors" />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-96 bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto z-20 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Properties</h2>
            <button onClick={() => setSelectedNodeId(null)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Node Label</label>
              <input 
                type="text" 
                value={selectedNode.label}
                onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? {...n, label: e.target.value} : n))}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>

            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-xs text-slate-400">Node Type</span>
                 <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-700 ${NODE_ICONS_COLOR[selectedNode.type]}`}>{selectedNode.type}</span>
               </div>
            </div>

            {/* TIMER CONFIG */}
            {selectedNode.type === NodeType.TIMER && (
              <div className="space-y-4 border-t border-slate-800 pt-4">
                 <div className="flex items-center gap-2 text-teal-400">
                    <Clock size={16} />
                    <span className="text-sm font-semibold">Scheduler Config</span>
                 </div>
                 <div>
                    <label className="block text-xs text-slate-400 mb-2">Cron Expression</label>
                    <input 
                      type="text"
                      placeholder="0 9 * * 1-5"
                      className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      value={selectedNode.config.cron || ''}
                      onChange={(e) => updateNodeConfig('cron', e.target.value)}
                    />
                    <div className="mt-2 text-[10px] text-slate-500">
                       Example: <code className="bg-slate-800 px-1 rounded">0 9 * * 1-5</code> (Mon-Fri 9:00 AM)
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="active"
                      checked={selectedNode.config.active !== false}
                      onChange={(e) => updateNodeConfig('active', e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="active" className="text-sm text-slate-300">Enable Trigger</label>
                 </div>
              </div>
            )}

            {/* DATA COLLECTION CONFIG */}
            {selectedNode.type === NodeType.DATA_COLLECT && (
              <div className="space-y-4 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-orange-400">
                   <DownloadCloud size={16} />
                   <span className="text-sm font-semibold">Data Source Config</span>
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-2">Provider</label>
                   <select 
                     className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                     value={selectedNode.config.source || 'AkShare'}
                     onChange={(e) => updateNodeConfig('source', e.target.value)}
                   >
                     <option value="AkShare">AkShare (Open Source)</option>
                     <option value="Tushare">Tushare Pro</option>
                     <option value="Binance">Binance Public API</option>
                     <option value="Yahoo">Yahoo Finance</option>
                   </select>
                </div>
                {selectedNode.config.source === 'Tushare' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Tushare Token</label>
                    <input 
                      type="password"
                      placeholder="Enter API Token"
                      className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none"
                      value={selectedNode.config.token || ''}
                      onChange={(e) => updateNodeConfig('token', e.target.value)}
                    />
                  </div>
                )}
                <div>
                   <label className="block text-xs text-slate-400 mb-2">Symbol / Code</label>
                   <input 
                     type="text"
                     placeholder="e.g., 600519.SH or BTCUSDT"
                     className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                     value={selectedNode.config.symbol || ''}
                     onChange={(e) => updateNodeConfig('symbol', e.target.value)}
                   />
                </div>
                <Button variant="secondary" size="sm" className="w-full text-xs">Test Connection</Button>
              </div>
            )}

            {/* SCRIPT CONFIG */}
            {selectedNode.type === NodeType.SCRIPT && (
              <div className="space-y-4 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-pink-400">
                   <Code size={16} />
                   <span className="text-sm font-semibold">JavaScript Processor</span>
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-2">Processing Logic</label>
                   <div className="relative">
                     <textarea 
                       className="w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-xs font-mono text-pink-300 focus:ring-2 focus:ring-pink-500 outline-none h-48 resize-none"
                       placeholder="// Access input data via `data` variable&#10;return data.filter(item => item.close > 0);"
                       value={selectedNode.config.code || ''}
                       onChange={(e) => updateNodeConfig('code', e.target.value)}
                     />
                   </div>
                </div>
                <div className="text-xs text-slate-500">
                  Input variable: <span className="font-mono text-slate-400">data</span> (Array)<br/>
                  Expected return: Array or Object
                </div>
              </div>
            )}

            {/* STORAGE CONFIG */}
            {selectedNode.type === NodeType.STORAGE && (
              <div className="space-y-4 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-indigo-400">
                   <Server size={16} />
                   <span className="text-sm font-semibold">Storage Configuration</span>
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-2">Database Type</label>
                   <select 
                     className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                     value={selectedNode.config.dbType || 'SQLite'}
                     onChange={(e) => updateNodeConfig('dbType', e.target.value)}
                   >
                     <option value="SQLite">SQLite (Local File)</option>
                     <option value="MySQL">MySQL / MariaDB</option>
                     <option value="PostgreSQL">PostgreSQL</option>
                   </select>
                </div>
                
                {selectedNode.config.dbType !== 'SQLite' ? (
                   <div>
                     <label className="block text-xs text-slate-400 mb-2">Connection String</label>
                     <input 
                       type="text"
                       placeholder="postgres://user:pass@localhost:5432/db"
                       className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                       value={selectedNode.config.connectionString || ''}
                       onChange={(e) => updateNodeConfig('connectionString', e.target.value)}
                     />
                   </div>
                ) : (
                   <div>
                     <label className="block text-xs text-slate-400 mb-2">File Path</label>
                     <input 
                       type="text"
                       placeholder="./data/strategies.db"
                       className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                       value={selectedNode.config.filePath || ''}
                       onChange={(e) => updateNodeConfig('filePath', e.target.value)}
                     />
                   </div>
                )}

                <div>
                   <label className="block text-xs text-slate-400 mb-2">Target Table Name</label>
                   <input 
                     type="text"
                     placeholder="strategy_results_v1"
                     className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                     value={selectedNode.config.table || ''}
                     onChange={(e) => updateNodeConfig('table', e.target.value)}
                   />
                </div>
              </div>
            )}

            {/* STRATEGY AI CONFIG */}
            {selectedNode.type === NodeType.STRATEGY && (
              <div className="space-y-4 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <Wand2 size={16} />
                  <span className="text-sm font-semibold">AI Strategy Generator</span>
                </div>
                
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Describe your strategy logic</label>
                  <textarea 
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-sm text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
                    placeholder="e.g., Buy when RSI < 30 and MACD crosses above signal line..."
                    value={nodePrompt}
                    onChange={(e) => setNodePrompt(e.target.value)}
                  />
                </div>

                <Button 
                  variant="primary" 
                  className="w-full bg-purple-600 hover:bg-purple-500 shadow-purple-500/25"
                  onClick={handleGenerateCode}
                  isLoading={isGenerating}
                >
                  Generate Code with Gemini
                </Button>

                {selectedNode.config.parameters && (
                   <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                     <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs text-slate-400">Generated Python Logic</label>
                        <Code size={14} className="text-slate-500" />
                     </div>
                     <pre className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-xs font-mono text-green-400 overflow-x-auto">
                       {selectedNode.config.parameters}
                     </pre>
                   </div>
                )}
              </div>
            )}
             
             <div className="border-t border-slate-800 pt-6">
               <Button variant="danger" size="sm" className="w-full" onClick={() => {
                 setNodes(nodes.filter(n => n.id !== selectedNode.id));
                 setConnections(connections.filter(c => c.sourceId !== selectedNode.id && c.targetId !== selectedNode.id));
                 setSelectedNodeId(null);
               }}>
                 Delete Node
               </Button>
             </div>
          </div>
        </div>
      )}
      
      {/* Floating Execute Button */}
      <div className="absolute bottom-6 right-6 z-10">
         <Button size="lg" className="rounded-full shadow-2xl bg-green-600 hover:bg-green-500 text-white pl-6 pr-8 py-4 border-4 border-slate-900">
            <div className="flex items-center gap-3">
               <Play fill="currentColor" className="w-5 h-5" />
               <div className="text-left">
                 <div className="text-xs font-medium opacity-80 uppercase tracking-wider">System Status</div>
                 <div className="font-bold">Deploy Strategy</div>
               </div>
            </div>
         </Button>
      </div>
    </div>
  );
};
