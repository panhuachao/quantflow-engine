import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, ErrorBar
} from 'recharts';
import { 
  TrendingUp, Activity, DollarSign, Database, Plus, Settings, 
  Trash2, Save, X, Edit2, Layout, Table
} from 'lucide-react';
import { Button } from './ui/Button';
import { DataSource, DashboardWidget, WidgetType, DataSourceType } from '../types';
import { INITIAL_DATA_SOURCES, INITIAL_WIDGETS } from '../constants';

// --- Mock Data Generator for Visualization ---
const generateMockData = (type: WidgetType) => {
  if (type === WidgetType.PIE_CHART) {
    return [
      { name: 'BTC', value: 45 },
      { name: 'ETH', value: 25 },
      { name: 'USDT', value: 20 },
      { name: 'SOL', value: 10 },
    ];
  }
  if (type === WidgetType.K_LINE) {
    return Array.from({ length: 20 }, (_, i) => {
      const open = 50000 + Math.random() * 2000;
      const close = open + (Math.random() - 0.5) * 1000;
      const high = Math.max(open, close) + Math.random() * 500;
      const low = Math.min(open, close) - Math.random() * 500;
      return { time: `10:${i < 10 ? '0'+i : i}`, open, close, high, low, volume: Math.random() * 100 };
    });
  }
  return Array.from({ length: 15 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 5000) + 1000,
    value2: Math.floor(Math.random() * 3000) + 500,
  }));
};

const COLORS = ['#22d3ee', '#818cf8', '#34d399', '#f472b6', '#facc15'];

// --- Sub-components ---

const WidgetWrapper = ({ 
  children, 
  title, 
  isEditing, 
  onDelete, 
  onEdit, 
  className 
}: any) => (
  <div className={`bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl flex flex-col overflow-hidden relative group ${className}`}>
    <div className="p-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-800/30">
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      {isEditing && (
        <div className="flex items-center gap-1 opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-cyan-400">
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
    <div className="flex-1 min-h-0 p-4 relative">
      {children}
    </div>
  </div>
);

const ChartRenderer = ({ type, data }: { type: WidgetType, data: any[] }) => {
  if (type === WidgetType.METRIC) {
    const lastVal = data[data.length - 1]?.value || 0;
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-4xl font-bold text-slate-100 tracking-tight">${lastVal.toLocaleString()}</span>
        <div className="flex items-center gap-2 mt-2 text-green-400 bg-green-500/10 px-2 py-1 rounded">
          <TrendingUp size={16} />
          <span className="text-sm font-medium">+5.2% vs last period</span>
        </div>
      </div>
    );
  }

  if (type === WidgetType.PIE_CHART) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1e293b" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === WidgetType.K_LINE) {
     return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
          <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
          />
          {/* Mock Candle Body using Bar - Real implementation would use Custom Shape */}
          <Bar dataKey="close" fill="#22c55e" barSize={10} stackId="a" /> 
           {/* Simple Line for visualization in this demo */}
          <Line type="monotone" dataKey="open" stroke="#ff0000" dot={false} strokeWidth={1} opacity={0.5} />
        </ComposedChart>
      </ResponsiveContainer>
     );
  }

  // Default Line/Bar
  const ChartComponent = type === WidgetType.BAR_CHART ? BarChart : AreaChart;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartComponent data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
        <YAxis stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
        />
        {type === WidgetType.BAR_CHART ? (
          <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} />
        ) : (
          <Area type="monotone" dataKey="value" stroke="#22d3ee" fillOpacity={1} fill="url(#colorValue)" />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
};

// --- Modals ---

const DataSourceModal = ({ isOpen, onClose, dataSources, onSave }: any) => {
  const [newDs, setNewDs] = useState<Partial<DataSource>>({ type: DataSourceType.SQLITE, name: '', connectionString: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-[500px] shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Database size={20} className="text-cyan-400" />
          Manage Data Sources
        </h2>

        <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
          {dataSources.map((ds: DataSource) => (
            <div key={ds.id} className="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded text-cyan-500"><Database size={14}/></div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{ds.name}</div>
                  <div className="text-xs text-slate-500">{ds.type}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase">Add New Connection</h3>
          <div className="grid grid-cols-2 gap-4">
             <input 
               placeholder="Source Name" 
               className="bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
               value={newDs.name}
               onChange={e => setNewDs({...newDs, name: e.target.value})}
             />
             <select 
               className="bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
               value={newDs.type}
               onChange={e => setNewDs({...newDs, type: e.target.value as DataSourceType})}
             >
               <option value={DataSourceType.SQLITE}>SQLite</option>
               <option value={DataSourceType.MYSQL}>MySQL</option>
               <option value={DataSourceType.POSTGRES}>PostgreSQL</option>
             </select>
          </div>
          <input 
             placeholder="Connection String / File Path" 
             className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white font-mono"
             value={newDs.connectionString}
             onChange={e => setNewDs({...newDs, connectionString: e.target.value})}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={() => {
            onSave({...newDs, id: Date.now().toString()});
            setNewDs({ type: DataSourceType.SQLITE, name: '', connectionString: '' });
          }}>Add Source</Button>
        </div>
      </div>
    </div>
  );
};

const WidgetEditorModal = ({ isOpen, onClose, widget, onSave, dataSources }: any) => {
  const [config, setConfig] = useState<Partial<DashboardWidget>>(widget || {
    title: 'New Chart',
    type: WidgetType.LINE_CHART,
    dataSourceId: dataSources[0]?.id,
    query: '',
    w: 1,
    h: 1
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-[600px] shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Layout size={20} className="text-cyan-400" />
          {widget ? 'Edit Component' : 'Add Component'}
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Title</label>
              <input 
                value={config.title}
                onChange={e => setConfig({...config, title: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Chart Type</label>
              <select 
                value={config.type}
                onChange={e => setConfig({...config, type: e.target.value as WidgetType})}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
              >
                <option value={WidgetType.METRIC}>Metric (KPI)</option>
                <option value={WidgetType.LINE_CHART}>Line Chart</option>
                <option value={WidgetType.BAR_CHART}>Bar Chart</option>
                <option value={WidgetType.PIE_CHART}>Pie Chart</option>
                <option value={WidgetType.K_LINE}>K-Line (Candlestick)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
               <label className="block text-xs text-slate-400 mb-1">Data Source</label>
               <select 
                 value={config.dataSourceId}
                 onChange={e => setConfig({...config, dataSourceId: e.target.value})}
                 className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
               >
                 {dataSources.map((ds: any) => (
                   <option key={ds.id} value={ds.id}>{ds.name} ({ds.type})</option>
                 ))}
               </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
               <div>
                  <label className="block text-xs text-slate-400 mb-1">Width (Grid)</label>
                  <input type="number" min="1" max="4" value={config.w} onChange={e => setConfig({...config, w: parseInt(e.target.value)})} className="w-full bg-slate-800 border-slate-700 border rounded p-2 text-sm"/>
               </div>
               <div>
                  <label className="block text-xs text-slate-400 mb-1">Height</label>
                  <input type="number" min="1" max="4" value={config.h} onChange={e => setConfig({...config, h: parseInt(e.target.value)})} className="w-full bg-slate-800 border-slate-700 border rounded p-2 text-sm"/>
               </div>
            </div>
          </div>

          <div>
             <label className="block text-xs text-slate-400 mb-1">Data Query / Script</label>
             <textarea 
               value={config.query}
               onChange={e => setConfig({...config, query: e.target.value})}
               placeholder="SELECT time, value FROM table WHERE..."
               className="w-full h-32 bg-slate-950 border border-slate-700 rounded p-3 text-xs font-mono text-green-400 resize-none"
             />
             <p className="text-[10px] text-slate-500 mt-1">Supports SQL for DB sources or JS for API sources.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(config)}>Save Component</Button>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

export const Dashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(INITIAL_WIDGETS);
  const [dataSources, setDataSources] = useState<DataSource[]>(INITIAL_DATA_SOURCES);
  const [isEditing, setIsEditing] = useState(false);
  
  // Modal States
  const [isDSModalOpen, setIsDSModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

  // Handlers
  const handleAddWidget = (newWidget: DashboardWidget) => {
    if (editingWidget) {
      setWidgets(widgets.map(w => w.id === editingWidget.id ? { ...newWidget, id: w.id } : w));
    } else {
      setWidgets([...widgets, { ...newWidget, id: Date.now().toString() }]);
    }
    setIsWidgetModalOpen(false);
    setEditingWidget(null);
  };

  const handleEditWidget = (widget: DashboardWidget) => {
    setEditingWidget(widget);
    setIsWidgetModalOpen(true);
  };

  const handleDeleteWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Dashboard Toolbar */}
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
        <div className="flex items-center gap-4">
           <h2 className="font-semibold text-slate-200">Main Overview</h2>
           <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded border border-slate-700">
             {widgets.length} Components
           </span>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
             <>
                <Button variant="ghost" size="sm" onClick={() => setIsDSModalOpen(true)}>
                  <Database size={16} className="mr-2" /> Data Sources
                </Button>
                <Button variant="primary" size="sm" onClick={() => { setEditingWidget(null); setIsWidgetModalOpen(true); }}>
                  <Plus size={16} className="mr-2" /> Add Component
                </Button>
                <div className="w-px h-4 bg-slate-700 mx-1" />
                <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-500" onClick={() => setIsEditing(false)}>
                  <Save size={16} className="mr-2" /> Done
                </Button>
             </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
               <Settings size={16} className="mr-2" /> Configure Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[180px]">
           {widgets.map(widget => (
             <WidgetWrapper 
                key={widget.id} 
                title={widget.title} 
                isEditing={isEditing}
                onDelete={() => handleDeleteWidget(widget.id)}
                onEdit={() => handleEditWidget(widget)}
                className={`
                  ${widget.w === 1 ? 'col-span-1' : ''}
                  ${widget.w === 2 ? 'col-span-1 md:col-span-2' : ''}
                  ${widget.w === 3 ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}
                  ${widget.w === 4 ? 'col-span-1 md:col-span-2 lg:col-span-4' : ''}
                  ${widget.h === 1 ? 'row-span-1' : ''}
                  ${widget.h === 2 ? 'row-span-2' : ''}
                  ${widget.h === 3 ? 'row-span-3' : ''}
                `}
             >
                <ChartRenderer type={widget.type} data={generateMockData(widget.type)} />
             </WidgetWrapper>
           ))}
           
           {isEditing && (
             <button 
               onClick={() => { setEditingWidget(null); setIsWidgetModalOpen(true); }}
               className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 hover:text-cyan-500 hover:border-cyan-500/50 hover:bg-slate-900/50 transition-all min-h-[180px]"
             >
                <Plus size={32} />
                <span className="text-sm font-medium mt-2">Add Widget</span>
             </button>
           )}
        </div>
      </div>

      {/* Modals */}
      <DataSourceModal 
        isOpen={isDSModalOpen} 
        onClose={() => setIsDSModalOpen(false)} 
        dataSources={dataSources}
        onSave={(ds: DataSource) => { setDataSources([...dataSources, ds]); setIsDSModalOpen(false); }}
      />
      
      <WidgetEditorModal 
         isOpen={isWidgetModalOpen}
         onClose={() => setIsWidgetModalOpen(false)}
         widget={editingWidget}
         dataSources={dataSources}
         onSave={handleAddWidget}
      />
    </div>
  );
};