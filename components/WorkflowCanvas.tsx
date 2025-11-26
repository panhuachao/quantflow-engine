
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NodeData, Connection, NodeType, Workflow } from '../types';
import { INITIAL_NODES, INITIAL_CONNECTIONS } from '../constants';
import { Database, Filter, TrendingUp, PlayCircle, MoreHorizontal, DownloadCloud, FileCode, Save, Clock, AlertTriangle, Plus, Minus, Maximize, Move, Terminal, XCircle, CheckCircle, ChevronDown, ChevronUp, ArrowLeft, Globe, Search } from 'lucide-react';
import { Button } from './ui/Button';
import { NodeCard } from './workflow/NodeCard';
import { PropertiesPanel } from './workflow/PropertiesPanel';

// SVG Path helper
const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
  return `M${x1},${y1} C${x1 + 100},${y1} ${x2 - 100},${y2} ${x2},${y2}`;
};

// Cycle detection
const hasCycle = (sourceId: string, targetId: string, connections: Connection[]): boolean => {
  const adj = new Map<string, string[]>();
  connections.forEach(c => {
    if (!adj.has(c.sourceId)) adj.set(c.sourceId, []);
    adj.get(c.sourceId)?.push(c.targetId);
  });

  if (!adj.has(sourceId)) adj.set(sourceId, []);
  adj.get(sourceId)?.push(targetId);

  const stack = [targetId];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const curr = stack.pop()!;
    if (curr === sourceId) return true;
    if (!visited.has(curr)) {
      visited.add(curr);
      const neighbors = adj.get(curr) || [];
      neighbors.forEach(n => stack.push(n));
    }
  }
  return false;
};

const NodePaletteIcon = ({ type }: { type: NodeType }) => {
   switch (type) {
    case NodeType.SOURCE: return <Database size={18} />;
    case NodeType.DATA_COLLECT: return <DownloadCloud size={18} />;
    case NodeType.TRANSFORM: return <Filter size={18} />;
    case NodeType.SCRIPT: return <FileCode size={18} />;
    case NodeType.STRATEGY: return <TrendingUp size={18} />;
    case NodeType.FILTER: return <Filter size={18} />;
    case NodeType.EXECUTION: return <PlayCircle size={18} />;
    case NodeType.STORAGE: return <Save size={18} />;
    case NodeType.TIMER: return <Clock size={18} />;
    case NodeType.DATABASE_QUERY: return <Search size={18} />;
    case NodeType.HTTP_REQUEST: return <Globe size={18} />;
    default: return <MoreHorizontal size={18} />;
  }
}

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
  const [clipboard, setClipboard] = useState<{ nodes: NodeData[] } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  // Interaction
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{startX: number, startY: number, currentX: number, currentY: number} | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cycleError, setCycleError] = useState<string | null>(null);
  
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

        // Space Panning
        if (e.code === 'Space' && !e.repeat) { e.preventDefault(); setIsSpacePressed(true); }

        // Select All (Ctrl + A)
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') { e.preventDefault(); setSelectedIds(new Set(nodes.map(n => n.id))); }

        // Copy (Ctrl + C)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedIds.size > 0) {
             setClipboard({ nodes: nodes.filter(n => selectedIds.has(n.id)) });
             addLog(`Copied ${selectedIds.size} nodes.`, 'info');
        }

        // Paste (Ctrl + V)
        if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
             const newNodes: NodeData[] = [];
             clipboard.nodes.forEach(node => {
                const newId = Date.now().toString() + Math.random().toString().substring(2, 5);
                newNodes.push({ ...node, id: newId, x: node.x + 50, y: node.y + 50, label: `${node.label} (Copy)`, status: 'idle' });
             });
             setNodes(prev => [...prev, ...newNodes]);
             setSelectedIds(new Set(newNodes.map(n => n.id)));
             addLog(`Pasted ${newNodes.length} nodes.`, 'info');
        }

        // Delete
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
            setNodes(nodes.filter(n => !selectedIds.has(n.id)));
            setConnections(connections.filter(c => !selectedIds.has(c.sourceId) && !selectedIds.has(c.targetId)));
            setSelectedIds(new Set());
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') { setIsSpacePressed(false); setIsPanning(false); } };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [nodes, connections, selectedIds, isPanning, clipboard]);

  // --- Handlers ---
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      setIsPanning(true); lastMousePos.current = { x: e.clientX, y: e.clientY }; return;
    } 
    if (e.button === 0) {
      if (!e.ctrlKey && !e.metaKey) setSelectedIds(new Set());
      setCycleError(null);
      if (canvasRef.current) {
         const rect = canvasRef.current.getBoundingClientRect();
         const x = e.clientX - rect.left; const y = e.clientY - rect.top;
         setIsBoxSelecting(true); setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
      }
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
        setPan(prev => ({ x: prev.x + (e.clientX - lastMousePos.current.x), y: prev.y + (e.clientY - lastMousePos.current.y) }));
        lastMousePos.current = { x: e.clientX, y: e.clientY }; return;
    }
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top;
        if (isBoxSelecting && selectionBox) { setSelectionBox(prev => prev ? ({ ...prev, currentX: mouseX, currentY: mouseY }) : null); return; }
        const worldX = (mouseX - pan.x) / zoom; const worldY = (mouseY - pan.y) / zoom;
        if (isDraggingNode && selectedIds.size > 0) {
            const dx = (e.clientX - lastMousePos.current.x) / zoom; const dy = (e.clientY - lastMousePos.current.y) / zoom;
            setNodes(prev => prev.map(n => selectedIds.has(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n));
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
        if (connectingSourceId) setMousePos({ x: worldX, y: worldY });
    }
  }, [isDraggingNode, isPanning, isBoxSelecting, selectionBox, selectedIds, connectingSourceId, zoom, pan]);

  const handleMouseUp = useCallback(() => {
    if (isBoxSelecting && selectionBox) {
        const startX = (Math.min(selectionBox.startX, selectionBox.currentX) - pan.x) / zoom;
        const endX = (Math.max(selectionBox.startX, selectionBox.currentX) - pan.x) / zoom;
        const startY = (Math.min(selectionBox.startY, selectionBox.currentY) - pan.y) / zoom;
        const endY = (Math.max(selectionBox.startY, selectionBox.currentY) - pan.y) / zoom;
        if (Math.abs(selectionBox.currentX - selectionBox.startX) > 5) {
            const newSelected = new Set(selectedIds);
            nodes.forEach(node => { 
                const w = 200; const h = 100; // approximate node size
                if (node.x < endX && node.x + w > startX && node.y < endY && node.y + h > startY) newSelected.add(node.id); 
            });
            setSelectedIds(newSelected);
        }
    }
    setIsDraggingNode(false); setIsPanning(false); setIsBoxSelecting(false); setSelectionBox(null); setConnectingSourceId(null);
  }, [isBoxSelecting, selectionBox, nodes, pan, zoom, selectedIds]);

  useEffect(() => { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); }; }, [handleMouseMove, handleMouseUp]);


  // --- Simulation Logic ---
  const runSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsLogPanelOpen(true);
    setLogs([]);
    addLog("Initializing workflow engine...", 'info');
    
    // Simulate Data Context
    const dataContext = new Map<string, any>(); 

    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    await new Promise(r => setTimeout(r, 500));

    // Simple BFS for Execution
    const targets = new Set(connections.map(c => c.targetId));
    const roots = nodes.filter(n => !targets.has(n.id));
    const queue = roots.length > 0 ? [...roots] : [nodes[0]];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const batch = [...queue];
        queue.length = 0;
        await Promise.all(batch.map(async (node) => {
            if (visited.has(node.id)) return;
            visited.add(node.id);
            setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'running' } : n));
            
            // Artificial delay for visual effect
            await new Promise(r => setTimeout(r, 800 + Math.random() * 500));

            // Logic based on Type
            let outputMsg = "";
            let level: LogEntry['level'] = 'success';
            let outputData: any = {};
            
            // --- DATA FLOW: Collect inputs from previous nodes ---
            const inputs = connections
                .filter(c => c.targetId === node.id)
                .map(c => dataContext.get(c.sourceId))
                .filter(d => d !== undefined);

            if (node.type === NodeType.DATA_COLLECT) {
                const count = Math.floor(Math.random() * 5000) + 500;
                outputData = { count, type: 'market_data', source: node.config.source };
                outputMsg = `Fetched ${count} candles for ${node.config.symbol || 'Unknown'}.`;
            } 
            else if (node.type === NodeType.SCRIPT) {
                // Code Node Logic
                const lang = node.config.language || 'javascript';
                const inputCount = inputs.length > 0 ? inputs.length : 0;
                
                outputData = { ...inputs[0], processed: true, language: lang };
                outputMsg = `Executed ${lang === 'python' ? 'Python' : 'JavaScript'} code. Received ${inputCount} input(s). passed data forward.`;
            } 
            else if (node.type === NodeType.STRATEGY) {
                 const signals = ['BUY', 'SELL', 'HOLD'];
                 const signal = signals[Math.floor(Math.random() * signals.length)];
                 outputData = { signal, ...inputs[0] };
                 outputMsg = `Strategy Analysis Complete. Generated Signal: ${signal}`;
                 if (signal === 'HOLD') level = 'warn';
            } 
            else if (node.type === NodeType.STORAGE) {
                 outputMsg = `Persisted results to ${node.config.dbType || 'Database'}. Data saved: ${JSON.stringify(inputs[0] || {})}`;
            } 
            else if (node.type === NodeType.TIMER) {
                 outputData = { timestamp: Date.now() };
                 outputMsg = `Trigger fired at ${new Date().toLocaleTimeString()}.`;
            } 
            else if (node.type === NodeType.DATABASE_QUERY) {
                 outputData = { rows: 124, source: 'sql' };
                 outputMsg = `Executed SQL query. Fetched 124 rows.`;
            } 
            else if (node.type === NodeType.HTTP_REQUEST) {
                 outputData = { status: 200, body: 'OK' };
                 outputMsg = `Sent ${node.config.method || 'GET'} request to ${node.config.url || '...'}. Status: 200 OK`;
            } 
            else {
                 outputData = { ...inputs[0] };
                 outputMsg = `Execution complete. Passed data forward.`;
            }

            // Store output for next nodes
            dataContext.set(node.id, outputData);

            addLog(outputMsg, level, node.id);
            setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'success' } : n));
            
            connections.filter(c => c.sourceId === node.id).forEach(c => {
                const next = nodes.find(n => n.id === c.targetId);
                if (next) queue.push(next);
            });
        }));
    }
    addLog("Workflow execution completed.", 'success');
    setIsRunning(false);
  };

  // Removed DATA_COLLECT from palette as requested ("delete current download node")
  const draggableNodeTypes = [NodeType.TIMER, NodeType.DATABASE_QUERY, NodeType.HTTP_REQUEST, NodeType.SCRIPT, NodeType.STRATEGY, NodeType.STORAGE, NodeType.EXECUTION];
  const getCursor = () => isPanning ? 'grabbing' : isSpacePressed ? 'grab' : isBoxSelecting ? 'crosshair' : 'default';

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
         {draggableNodeTypes.map(type => (
             <div key={type} 
              className="p-3 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-grab active:cursor-grabbing transition-colors"
              title={`Add ${type}`}
              draggable
              onDragEnd={(e) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const x = (e.clientX - rect.left - pan.x) / zoom - 100;
                const y = (e.clientY - rect.top - pan.y) / zoom - 40;
                // Default label for SCRIPT is now 'Code Node'
                const label = type === NodeType.TIMER ? 'Cron Timer' : 
                              type === NodeType.DATABASE_QUERY ? 'DB Query' : 
                              type === NodeType.HTTP_REQUEST ? 'HTTP Request' : 
                              type === NodeType.SCRIPT ? 'Code Node' :
                              `New ${type}`;
                setNodes([...nodes, { id: Date.now().toString(), type, label, x, y, config: {}, status: 'idle' }]);
              }}
             >
                <NodePaletteIcon type={type} />
             </div>
         ))}
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 bg-slate-950 relative overflow-hidden grid-bg"
        onMouseDown={handleMouseDownCanvas}
        style={{ cursor: getCursor() }}
      >
        {cycleError && <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-500 text-white px-4 py-2 rounded-lg shadow-xl animate-bounce">{cycleError}</div>}
        {isBoxSelecting && selectionBox && <div className="absolute z-50 border border-cyan-500 bg-cyan-500/10 pointer-events-none" style={{ left: Math.min(selectionBox.startX, selectionBox.currentX), top: Math.min(selectionBox.startY, selectionBox.currentY), width: Math.abs(selectionBox.currentX - selectionBox.startX), height: Math.abs(selectionBox.currentY - selectionBox.startY)}} />}

        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', width: '100%', height: '100%', pointerEvents: isPanning || isSpacePressed ? 'none' : 'auto' }}>
            <svg className="absolute overflow-visible top-0 left-0 w-full h-full pointer-events-none">
            {connections.map(conn => {
                const source = nodes.find(n => n.id === conn.sourceId); const target = nodes.find(n => n.id === conn.targetId);
                if (!source || !target) return null;
                return (
                <g key={conn.id} onClick={() => setConnections(prev => prev.filter(c => c.id !== conn.id))} className="group pointer-events-auto cursor-pointer">
                    <path d={getBezierPath(source.x + 200, source.y + 40, target.x, target.y + 40)} stroke={source.status === 'running' || source.status === 'success' ? '#22d3ee' : '#475569'} strokeWidth={source.status === 'running' ? 3 : 2} fill="none" className="transition-all duration-300 group-hover:stroke-red-500" />
                    <path d={getBezierPath(source.x + 200, source.y + 40, target.x, target.y + 40)} stroke="transparent" strokeWidth="15" fill="none" />
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
};
