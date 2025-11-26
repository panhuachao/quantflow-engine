
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NodeData, Connection, NodeType, Workflow } from '../types';
import { INITIAL_NODES, INITIAL_CONNECTIONS } from '../constants';
import { PlayCircle, Save, Clock, Plus, Minus, Maximize, Move, Terminal, CheckCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { NodeCard } from './workflow/NodeCard';
import { PropertiesPanel } from './workflow/PropertiesPanel';
import { getNodeDefinition, NODE_REGISTRY } from './workflow/nodeDefinitions';

// SVG Path helper
const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
  return `M${x1},${y1} C${x1 + 100},${y1} ${x2 - 100},${y2} ${x2},${y2}`;
};

interface LogEntry {
  id: string;
  timestamp: string;
  nodeId?: string;
  level: 'info' | 'success' | 'error' | 'warn';
  message: string;
}

const LogPanel = ({ logs, isOpen, onToggle, onClear }: { logs: LogEntry[], isOpen: boolean, onToggle: () => void, onClear: () => void }) => {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs, isOpen]);
  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 transition-all duration-300 z-30 flex flex-col ${isOpen ? 'h-64' : 'h-10'}`}>
       <div className="flex items-center justify-between px-4 h-10 bg-slate-800 cursor-pointer hover:bg-slate-700 select-none" onClick={onToggle}>
         <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
           <Terminal size={14} /> <span>System Console {logs.length > 0 && `(${logs.length})`}</span>
         </div>
         <div className="flex items-center gap-2">
            {isOpen && <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-[10px] text-slate-500 hover:text-red-400 px-2">Clear</button>}
            {isOpen ? <ChevronDown size={14} className="text-slate-400"/> : <ChevronUp size={14} className="text-slate-400"/>}
         </div>
       </div>
       {isOpen && (
         <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 bg-slate-950/50">
            {logs.length === 0 && <div className="text-slate-600 italic">No execution logs...</div>}
            {logs.map(log => (
              <div key={log.id} className="flex gap-3">
                 <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                 <span className={`break-all ${log.level === 'error' ? 'text-red-400' : log.level === 'success' ? 'text-green-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-slate-300'}`}>
                   {log.nodeId && <span className="opacity-50 mr-2">&lt;{log.nodeId.substring(0,4)}&gt;</span>}
                   {log.message}
                 </span>
              </div>
            ))}
            <div ref={endRef} />
         </div>
       )}
    </div>
  );
};

interface WorkflowCanvasProps {
  workflow?: Workflow;
  onSave?: (nodes: NodeData[], connections: Connection[]) => void;
  onBack?: () => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ workflow, onSave, onBack }) => {
  // Init state from props if available, else default
  const [nodes, setNodes] = useState<NodeData[]>(workflow?.nodes || INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>(workflow?.connections || INITIAL_CONNECTIONS);
  
  // Sync state if prop changes
  useEffect(() => {
    if (workflow) {
      setNodes(workflow.nodes);
      setConnections(workflow.connections);
    }
  }, [workflow?.id]);

  // Selection & Viewport
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  // Interaction
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Execution
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 }); 

  const singleSelectedNodeId = selectedIds.size === 1 ? Array.from(selectedIds)[0] : null;
  const selectedNode = singleSelectedNodeId ? nodes.find(n => n.id === singleSelectedNodeId) : null;

  const addLog = (message: string, level: LogEntry['level'] = 'info', nodeId?: string) => {
    setLogs(prev => [...prev, { id: Date.now().toString() + Math.random(), timestamp: new Date().toLocaleTimeString(), level, message, nodeId }]);
  };

  const handleSave = () => {
    if (onSave) {
        onSave(nodes, connections);
        addLog("Workflow saved successfully.", 'success');
    }
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.code === 'Space' && !e.repeat) { e.preventDefault(); setIsSpacePressed(true); }
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
            setNodes(nodes.filter(n => !selectedIds.has(n.id)));
            setConnections(connections.filter(c => !selectedIds.has(c.sourceId) && !selectedIds.has(c.targetId)));
            setSelectedIds(new Set());
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') { setIsSpacePressed(false); setIsPanning(false); } };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [nodes, connections, selectedIds, isPanning]);

  // --- Handlers ---
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      setIsPanning(true); lastMousePos.current = { x: e.clientX, y: e.clientY }; return;
    } 
    if (e.button === 0) {
      if (!e.ctrlKey && !e.metaKey) setSelectedIds(new Set());
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
        setPan(prev => ({ x: prev.x + (e.clientX - lastMousePos.current.x), y: prev.y + (e.clientY - lastMousePos.current.y) }));
        lastMousePos.current = { x: e.clientX, y: e.clientY }; return;
    }
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const worldX = (e.clientX - rect.left - pan.x) / zoom; 
        const worldY = (e.clientY - rect.top - pan.y) / zoom;
        if (isDraggingNode && selectedIds.size > 0) {
            const dx = (e.clientX - lastMousePos.current.x) / zoom; const dy = (e.clientY - lastMousePos.current.y) / zoom;
            setNodes(prev => prev.map(n => selectedIds.has(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n));
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
        if (connectingSourceId) setMousePos({ x: worldX, y: worldY });
    }
  }, [isDraggingNode, isPanning, selectedIds, connectingSourceId, zoom, pan]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingNode(false); setIsPanning(false); setConnectingSourceId(null);
  }, []);

  useEffect(() => { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); }; }, [handleMouseMove, handleMouseUp]);

  // --- REFACTORED SIMULATION LOGIC ---
  const runSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsLogPanelOpen(true);
    setLogs([]);
    addLog("Initializing workflow engine...", 'info');
    
    // Data Context: Maps NodeID -> Output Data
    const dataContext = new Map<string, any>(); 

    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    await new Promise(r => setTimeout(r, 500));

    // Execution Queue (BFS/Topological sort approximation)
    const targets = new Set(connections.map(c => c.targetId));
    const roots = nodes.filter(n => !targets.has(n.id));
    const queue = roots.length > 0 ? [...roots] : [nodes[0]]; // Fallback to first if cycle or no roots
    const visited = new Set<string>();

    while (queue.length > 0) {
        const batch = [...queue];
        queue.length = 0;
        
        await Promise.all(batch.map(async (node) => {
            if (visited.has(node.id)) return;
            visited.add(node.id);
            setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'running' } : n));
            
            // Artificial visual delay
            await new Promise(r => setTimeout(r, 500));

            // --- DATA FLOW ---
            // 1. Gather inputs from previous nodes
            const inputs = connections
                .filter(c => c.targetId === node.id)
                .map(c => dataContext.get(c.sourceId))
                .filter(d => d !== undefined);

            // 2. Execute Node Logic via Interface
            const definition = getNodeDefinition(node.type);
            let executionResult;
            
            try {
                executionResult = await definition.execute({
                    nodeId: node.id,
                    config: node.config,
                    inputs: inputs,
                    log: (msg, lvl) => addLog(msg, lvl || 'info', node.id)
                });
            } catch (err: any) {
                executionResult = { status: 'error', output: null };
                addLog(`Error executing node: ${err.message}`, 'error', node.id);
            }

            // 3. Store Output
            if (executionResult.status === 'success') {
                 dataContext.set(node.id, executionResult.output);
            }

            setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: executionResult.status } : n));
            
            // 4. Queue Next Nodes
            if (executionResult.status === 'success') {
                connections.filter(c => c.sourceId === node.id).forEach(c => {
                    const next = nodes.find(n => n.id === c.targetId);
                    if (next) queue.push(next);
                });
            }
        }));
    }
    addLog("Workflow execution completed.", 'success');
    setIsRunning(false);
  };

  // Define allowed nodes in palette
  const paletteTypes = [
      NodeType.TIMER, 
      NodeType.DATABASE_QUERY, 
      NodeType.HTTP_REQUEST, 
      NodeType.SCRIPT, 
      NodeType.LLM, 
      NodeType.STORAGE
  ];

  const getCursor = () => isPanning ? 'grabbing' : isSpacePressed ? 'grab' : 'default';

  return (
    <div className="flex h-full relative">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-20 right-6 h-14 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl z-20 flex items-center justify-between px-4 shadow-xl">
         <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                 <ArrowLeft size={20} />
              </button>
            )}
            <div>
               <h3 className="font-bold text-slate-200">{workflow?.name || 'Untitled Workflow'}</h3>
               <div className="text-xs text-slate-500 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${workflow?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  {workflow?.status || 'Draft'}
               </div>
            </div>
         </div>
         <div className="flex items-center gap-2">
             <Button variant="secondary" size="sm" onClick={() => addLog("Validated graph structure.", "info")} icon={<CheckCircle size={16}/>}>Validate</Button>
             {onSave && <Button variant="primary" size="sm" onClick={handleSave} icon={<Save size={16}/>}>Save Changes</Button>}
         </div>
      </div>

      {/* Palette */}
      <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center pt-24 pb-4 gap-4 z-10 shadow-xl">
         {paletteTypes.map(type => {
             const def = getNodeDefinition(type);
             const Icon = def.icon;
             return (
                 <div key={type} 
                  className="p-3 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-grab active:cursor-grabbing transition-colors"
                  title={def.label}
                  draggable
                  onDragEnd={(e) => {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const x = (e.clientX - rect.left - pan.x) / zoom - 100;
                    const y = (e.clientY - rect.top - pan.y) / zoom - 40;
                    setNodes([...nodes, { 
                        id: Date.now().toString(), 
                        type, 
                        label: def.label, 
                        x, 
                        y, 
                        config: {}, 
                        status: 'idle' 
                    }]);
                  }}
                 >
                    <Icon size={18} />
                 </div>
             );
         })}
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 bg-slate-950 relative overflow-hidden grid-bg"
        onMouseDown={handleMouseDownCanvas}
        style={{ cursor: getCursor() }}
      >
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', width: '100%', height: '100%', pointerEvents: isPanning || isSpacePressed ? 'none' : 'auto' }}>
            <svg className="absolute overflow-visible top-0 left-0 w-full h-full pointer-events-none">
            {connections.map(conn => {
                const source = nodes.find(n => n.id === conn.sourceId); const target = nodes.find(n => n.id === conn.targetId);
                if (!source || !target) return null;
                return (
                <g key={conn.id} onClick={() => setConnections(prev => prev.filter(c => c.id !== conn.id))} className="group pointer-events-auto cursor-pointer">
                    <path d={getBezierPath(source.x + 200, source.y + 40, target.x, target.y + 40)} stroke={source.status === 'running' || source.status === 'success' ? '#22d3ee' : '#475569'} strokeWidth={source.status === 'running' ? 3 : 2} fill="none" className="transition-all duration-300 group-hover:stroke-red-500" />
                </g>);
            })}
            {connectingSourceId && (() => {
                const source = nodes.find(n => n.id === connectingSourceId);
                return source ? <path d={getBezierPath(source.x + 200, source.y + 40, mousePos.x, mousePos.y)} stroke="#22d3ee" strokeWidth="2" strokeDasharray="5,5" fill="none" /> : null;
            })()}
            </svg>
            {nodes.map(node => (
               <NodeCard 
                 key={node.id} node={node} isSelected={selectedIds.has(node.id)} connectingSourceId={connectingSourceId}
                 onMouseDown={(e, id) => { e.stopPropagation(); const s = new Set(e.ctrlKey ? selectedIds : []); if(e.ctrlKey && s.has(id)) s.delete(id); else s.add(id); setSelectedIds(s); setIsDraggingNode(true); lastMousePos.current = { x: e.clientX, y: e.clientY }; }}
                 onMouseDownOutput={(e, id) => { e.stopPropagation(); setConnectingSourceId(id); }}
                 onMouseUpInput={(e, targetId) => { e.stopPropagation(); if (connectingSourceId && connectingSourceId !== targetId) setConnections([...connections, { id: `c-${Date.now()}`, sourceId: connectingSourceId, targetId }]); setConnectingSourceId(null); }}
               />
            ))}
        </div>

        <div className="absolute bottom-12 left-6 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 shadow-xl z-20">
            <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-2 text-slate-400 hover:text-white rounded"><Minus size={16} /></button>
            <div className="text-xs font-mono text-slate-500 w-12 text-center select-none">{Math.round(zoom * 100)}%</div>
            <button onClick={() => setZoom(z => Math.min(2.0, z + 0.1))} className="p-2 text-slate-400 hover:text-white rounded"><Plus size={16} /></button>
            <button onClick={() => { setZoom(1); setPan({x: 0, y: 0}); }} className="p-2 text-slate-400 hover:text-white rounded"><Maximize size={16} /></button>
            <div className="w-px h-4 bg-slate-800 mx-1"/>
            <div className="flex items-center gap-2 px-2 text-[10px] text-slate-500"><Move size={12} /><span>Space+Drag</span></div>
        </div>
      </div>

      {selectedNode && <PropertiesPanel node={selectedNode} onUpdate={(k, v) => setNodes(nodes.map(n => n.id === selectedNode.id ? (k.startsWith('config.') ? {...n, config: {...n.config, [k.split('.')[1]]: v}} : {...n, [k]: v}) : n))} onClose={() => setSelectedIds(new Set())} onDelete={() => { setNodes(nodes.filter(n => n.id !== selectedNode.id)); setSelectedIds(new Set()); }} />}
      
      <LogPanel logs={logs} isOpen={isLogPanelOpen} onToggle={() => setIsLogPanelOpen(!isLogPanelOpen)} onClear={() => setLogs([])} />
      
      <div className="absolute bottom-12 right-6 z-20">
         <Button size="lg" className={`rounded-full shadow-2xl pl-6 pr-8 py-4 border-4 border-slate-900 ${isRunning ? 'bg-slate-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`} onClick={runSimulation} disabled={isRunning}>
            <div className="flex items-center gap-3">
               {isRunning ? <Clock className="w-5 h-5 animate-spin" /> : <PlayCircle fill="currentColor" className="w-5 h-5" />}
               <div className="text-left"><div className="text-xs font-medium opacity-80 uppercase tracking-wider">{isRunning ? 'Running...' : 'Ready'}</div><div className="font-bold">{isRunning ? 'Executing Flow' : 'Deploy Strategy'}</div></div>
            </div>
         </Button>
      </div>
    </div>
  );
}