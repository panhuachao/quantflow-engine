import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NodeData, Connection, NodeType } from '../types';
import { INITIAL_NODES, INITIAL_CONNECTIONS } from '../constants';
import { Database, Filter, TrendingUp, PlayCircle, MoreHorizontal, DownloadCloud, FileCode, Save, Clock, AlertTriangle, Plus, Minus, Maximize, Move } from 'lucide-react';
import { Button } from './ui/Button';
import { NodeCard } from './workflow/NodeCard';
import { PropertiesPanel } from './workflow/PropertiesPanel';

// SVG Path helper
const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
  return `M${x1},${y1} C${x1 + 100},${y1} ${x2 - 100},${y2} ${x2},${y2}`;
};

// Cycle detection algorithm (DFS)
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
   // Simplified icon mapping for palette
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
    default: return <MoreHorizontal size={18} />;
  }
}

export const WorkflowCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Viewport State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Interaction State
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  
  // Connection Dragging State
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // World coordinates
  const [cycleError, setCycleError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 }); // Screen coordinates for delta calc

  // Derived Selection
  const singleSelectedNodeId = selectedIds.size === 1 ? Array.from(selectedIds)[0] : null;
  const selectedNode = singleSelectedNodeId ? nodes.find(n => n.id === singleSelectedNodeId) : null;

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Select All (Ctrl + A)
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            setSelectedIds(new Set(nodes.map(n => n.id)));
        }
        // Delete (Delete / Backspace)
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            setNodes(nodes.filter(n => !selectedIds.has(n.id)));
            setConnections(connections.filter(c => !selectedIds.has(c.sourceId) && !selectedIds.has(c.targetId)));
            setSelectedIds(new Set());
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, connections, selectedIds]);

  // --- Handlers ---

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    // Middle click or Space+Left click to pan
    if (e.button === 1 || (e.button === 0 && e.getModifierState('Space'))) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else if (e.button === 0) {
      // Regular left click on canvas -> Clear selection
      setSelectedIds(new Set());
      setCycleError(null);
    }
  };

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    
    const newSelected = new Set(selectedIds);
    
    if (e.ctrlKey || e.metaKey) {
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    } else {
        if (!newSelected.has(id)) {
            setSelectedIds(new Set([id]));
        }
    }

    setIsDraggingNode(true);
    setCycleError(null);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseDownOutput = (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setCycleError(null);
    setConnectingSourceId(sourceId);
    
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
            x: (e.clientX - rect.left - pan.x) / zoom,
            y: (e.clientY - rect.top - pan.y) / zoom
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
    if (isPanning) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        return;
    }

    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const worldX = (e.clientX - rect.left - pan.x) / zoom;
        const worldY = (e.clientY - rect.top - pan.y) / zoom;

        if (isDraggingNode && selectedIds.size > 0) {
            const dx = (e.clientX - lastMousePos.current.x) / zoom;
            const dy = (e.clientY - lastMousePos.current.y) / zoom;

            setNodes(prev => prev.map(node => {
                if (selectedIds.has(node.id)) {
                    return { ...node, x: node.x + dx, y: node.y + dy };
                }
                return node;
            }));
            
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }

        if (connectingSourceId) {
            setMousePos({ x: worldX, y: worldY });
        }
    }
  }, [isDraggingNode, selectedIds, connectingSourceId, zoom, pan, isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingNode(false);
    setIsPanning(false);
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

  const updateSelectedNode = (key: string, value: any) => {
    if (!singleSelectedNodeId) return;
    
    setNodes(prev => prev.map(n => {
      if (n.id === singleSelectedNodeId) {
        // Handle dot notation "config.cron"
        if (key.startsWith('config.')) {
           const configKey = key.split('.')[1];
           return { ...n, config: { ...n.config, [configKey]: value } };
        }
        return { ...n, [key]: value };
      }
      return n;
    }));
  };

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
      {/* Palette */}
      <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4 z-20 shadow-xl">
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
                
                const newNode: NodeData = {
                  id: Date.now().toString(),
                  type,
                  label: type === NodeType.TIMER ? 'Cron Timer' : `New ${type}`,
                  x,
                  y,
                  config: {},
                  status: 'idle'
                };
                setNodes([...nodes, newNode]);
              }}
             >
                <NodePaletteIcon type={type} />
             </div>
         ))}
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 bg-slate-950 relative overflow-hidden grid-bg cursor-default"
        onMouseDown={handleMouseDownCanvas}
        style={{ cursor: isPanning ? 'grabbing' : undefined }}
      >
        {cycleError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-500 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
                <AlertTriangle size={18} />
                <span className="text-sm font-medium">{cycleError}</span>
            </div>
        )}

        {/* Viewport Transform Container */}
        <div 
            style={{ 
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
                transformOrigin: '0 0',
                width: '100%',
                height: '100%',
                pointerEvents: isPanning ? 'none' : 'auto'
            }}
        >
            <svg className="absolute overflow-visible top-0 left-0 w-full h-full pointer-events-none">
            {/* Existing Connections */}
            {connections.map(conn => {
                const source = nodes.find(n => n.id === conn.sourceId);
                const target = nodes.find(n => n.id === conn.targetId);
                if (!source || !target) return null;
                return (
                <g key={conn.id} className="group pointer-events-auto cursor-pointer" onClick={() => setConnections(prev => prev.filter(c => c.id !== conn.id))}>
                    <path
                        d={getBezierPath(source.x + 200, source.y + 40, target.x, target.y + 40)}
                        stroke="#475569"
                        strokeWidth="2"
                        fill="none"
                        className="group-hover:stroke-red-500 transition-colors"
                    />
                    <path
                        d={getBezierPath(source.x + 200, source.y + 40, target.x, target.y + 40)}
                        stroke="transparent"
                        strokeWidth="15"
                        fill="none"
                    />
                </g>
                );
            })}

            {/* Temporary Connection Line */}
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
               <NodeCard 
                 key={node.id} 
                 node={node} 
                 isSelected={selectedIds.has(node.id)}
                 connectingSourceId={connectingSourceId}
                 onMouseDown={handleMouseDownNode}
                 onMouseDownOutput={handleMouseDownOutput}
                 onMouseUpInput={handleMouseUpInput}
               />
            ))}
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 shadow-xl z-20">
            <button 
                onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                title="Zoom Out"
            >
                <Minus size={16} />
            </button>
            <div className="text-xs font-mono text-slate-500 w-12 text-center select-none">
                {Math.round(zoom * 100)}%
            </div>
            <button 
                onClick={() => setZoom(z => Math.min(2.0, z + 0.1))}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                title="Zoom In"
            >
                <Plus size={16} />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1"/>
            <button 
                onClick={() => { setZoom(1); setPan({x: 0, y: 0}); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                title="Reset View"
            >
                <Maximize size={16} />
            </button>
            
            <div className="w-px h-4 bg-slate-800 mx-1"/>
            <div className="flex items-center gap-2 px-2 text-[10px] text-slate-500">
                <Move size={12} />
                <span>Space + Drag</span>
            </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode ? (
        <PropertiesPanel 
           node={selectedNode}
           onUpdate={updateSelectedNode}
           onClose={() => setSelectedIds(new Set())}
           onDelete={() => {
              setNodes(prev => prev.filter(n => n.id !== selectedNode.id));
              setConnections(prev => prev.filter(c => c.sourceId !== selectedNode.id && c.targetId !== selectedNode.id));
              setSelectedIds(new Set());
           }}
        />
      ) : (
        selectedIds.size > 1 && (
            <div className="w-96 bg-slate-900 border-l border-slate-800 p-6 z-20 shadow-2xl flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-cyan-400">
                    <Move size={32} />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">{selectedIds.size} Nodes Selected</h2>
                <p className="text-sm text-slate-400">Drag to move selection group.</p>
                <div className="mt-6 w-full">
                    <Button variant="secondary" className="w-full" onClick={() => setSelectedIds(new Set())}>Deselect All</Button>
                </div>
            </div>
        )
      )}
      
      {/* Floating Execute Button */}
      <div className="absolute bottom-6 right-6 z-10">
         <Button size="lg" className="rounded-full shadow-2xl bg-green-600 hover:bg-green-500 text-white pl-6 pr-8 py-4 border-4 border-slate-900">
            <div className="flex items-center gap-3">
               <PlayCircle fill="currentColor" className="w-5 h-5" />
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