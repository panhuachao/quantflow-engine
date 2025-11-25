
import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, ComposedChart, ErrorBar
} from 'recharts';
import { 
  Settings, Plus, Trash2, Edit2, Database, Save, 
  LayoutGrid, Activity, DollarSign, TrendingUp, BarChart3, PieChart as PieIcon
} from 'lucide-react';
import { Button } from './ui/Button';
import { DataSource, DashboardWidget, WidgetType, DataSourceType } from '../types';
import { INITIAL_DATA_SOURCES, INITIAL_DASHBOARD_WIDGETS } from '../constants';

// --- MOCK DATA GENERATORS ---
const generateTimeSeriesData = (points = 20) => Array.from({ length: points }, (_, i) => ({
  time: `${10 + Math.floor(i/2)}:${(i%2)*30 === 0 ? '00' : '30'}`,
  value: 1000 + Math.random() * 200 + i * 10
}));

const generatePieData = () => [
  { name: 'Crypto', value: 400 },
  { name: 'Stocks', value: 300 },
  { name: 'Forex', value: 300 },
  { name: 'Cash', value: 200 },
];

const generateBarData = () => [
  { name: 'Jan', value: 2400 },
  { name: 'Feb', value: 1398 },
  { name: 'Mar', value: 9800 },
  { name: 'Apr', value: 3908 },
  { name: 'May', value: 4800 },
  { name: 'Jun', value: 3800 },
];

const generateCandleData = (count = 20) => {
  let prevClose = 40000;
  return Array.from({ length: count }, (_, i) => {
    const open = prevClose;
    const close = open * (1 + (Math.random() - 0.5) * 0.02);
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    prevClose = close;
    return {
      time: i,
      open,
      high,
      low,
      close,
      // For chart rendering:
      bodyBottom: Math.min(open, close),
      bodyTop: Math.max(open, close) - Math.min(open, close),
      color: close > open ? '#10b981' : '#ef4444' // Green or Red
    };
  });
};

// --- SUB-COMPONENTS ---

const StatCard = ({ widget }: { widget: DashboardWidget }) => {
  const { value, subValue, color } = widget.config || { value: '0', subValue: '-', color: 'text-slate-400' };
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h4 className="text-slate-400 text-sm font-medium">{widget.title}</h4>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-100">{value}</span>
        </div>
      </div>
      <div className={`text-xs font-medium ${color} bg-slate-900/40 p-2 rounded self-start mt-2`}>
        {subValue}
      </div>
    </div>
  );
};

const DataSourceModal = ({ 
  isOpen, 
  onClose, 
  dataSources, 
  onAdd 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  dataSources: DataSource[];
  onAdd: (ds: DataSource) => void;
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<DataSourceType>(DataSourceType.SQLITE);
  const [conn, setConn] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Database size={20} className="text-cyan-400"/> Manage Data Sources
        </h3>
        
        <div className="space-y-3 max-h-60 overflow-y-auto mb-6">
          {dataSources.map(ds => (
            <div key={ds.id} className="flex justify-between items-center p-3 bg-slate-800 rounded border border-slate-700">
              <div>
                <div className="text-sm font-semibold text-slate-200">{ds.name}</div>
                <div className="text-xs text-slate-500">{ds.type}</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-4">
          <h4 className="text-sm font-medium text-slate-400">Add New Connection</h4>
          <input 
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none" 
            placeholder="Source Name"
            value={name} onChange={e => setName(e.target.value)}
          />
          <select 
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            value={type} onChange={e => setType(e.target.value as DataSourceType)}
          >
            {Object.values(DataSourceType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input 
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none" 
            placeholder="Connection String / File Path"
            value={conn} onChange={e => setConn(e.target.value)}
          />
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => {
              onAdd({ id: Date.now().toString(), name, type, config: { connectionString: conn } });
              setName(''); setConn('');
            }}>Add Source</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WidgetEditor = ({
  isOpen,
  widget,
  onClose,
  onSave,
  dataSources
}: {
  isOpen: boolean;
  widget: DashboardWidget | null;
  onClose: () => void;
  onSave: (w: DashboardWidget) => void;
  dataSources: DataSource[];
}) => {
  const [localWidget, setLocalWidget] = useState<DashboardWidget | null>(null);

  React.useEffect(() => {
    if (widget) {
      setLocalWidget({ ...widget });
    } else {
      setLocalWidget({
        id: Date.now().toString(),
        title: 'New Widget',
        type: WidgetType.STAT,
        colSpan: 1,
        script: '',
        config: {}
      });
    }
  }, [widget, isOpen]);

  if (!isOpen || !localWidget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">
          {widget ? 'Edit Widget' : 'Add Widget'}
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Title</label>
              <input 
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                value={localWidget.title}
                onChange={e => setLocalWidget({...localWidget, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Type</label>
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                value={localWidget.type}
                onChange={e => setLocalWidget({...localWidget, type: e.target.value as WidgetType})}
              >
                {Object.values(WidgetType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Grid Width (1-4)</label>
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                value={localWidget.colSpan}
                onChange={e => setLocalWidget({...localWidget, colSpan: parseInt(e.target.value)})}
              >
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Col</option>)}
              </select>
            </div>
             <div>
              <label className="text-xs text-slate-400 block mb-1">Data Source</label>
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                value={localWidget.dataSourceId || ''}
                onChange={e => setLocalWidget({...localWidget, dataSourceId: e.target.value})}
              >
                <option value="">-- None (Mock) --</option>
                {dataSources.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
              </select>
            </div>
          </div>

          <div>
             <label className="text-xs text-slate-400 block mb-1">Data Query / Script</label>
             <textarea 
               className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono text-cyan-300 h-24"
               placeholder="SELECT * FROM data..."
               value={localWidget.script || ''}
               onChange={e => setLocalWidget({...localWidget, script: e.target.value})}
             />
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSave(localWidget)}>Save Configuration</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export const Dashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(INITIAL_DASHBOARD_WIDGETS);
  const [dataSources, setDataSources] = useState<DataSource[]>(INITIAL_DATA_SOURCES);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [isDSModalOpen, setIsDSModalOpen] = useState(false);

  // Helper to render chart based on type
  const renderChart = (widget: DashboardWidget) => {
    switch(widget.type) {
      case WidgetType.LINE:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generateTimeSeriesData()}>
              <defs>
                <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
              <Area type="monotone" dataKey="value" stroke="#22d3ee" fill={`url(#grad-${widget.id})`} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case WidgetType.BAR:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={generateBarData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
              <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case WidgetType.PIE:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={generatePieData()}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {generatePieData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#22d3ee', '#818cf8', '#34d399', '#f472b6'][index % 4]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case WidgetType.CANDLE:
         const candleData = generateCandleData();
         return (
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={candleData} barSize={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                   formatter={(value: any, name: string, props: any) => {
                      if (name === 'bodyTop') return [props.payload.close.toFixed(2), 'Close'];
                      return [];
                   }}
                />
                {/* Wicks (High-Low) simulated with ErrorBar or custom shape is complex, using generic bar for visual */}
                {/* Simplified Candle Logic: Bar is body. We can use ComposedChart for Wicks if needed. */}
                {/* Since standard Recharts Candle is verbose, we simulate with a Bar representing Body */}
                <Bar dataKey="bodyTop" stackId="a" fill="transparent" />
                <Bar dataKey="bodyTop" stackId="a" fill="#10b981">
                    {
                      candleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))
                    }
                </Bar>
                {/* This is a visual approximation for the mockup */}
             </BarChart>
          </ResponsiveContainer>
         );
      default:
        return <div className="flex items-center justify-center h-full text-slate-600">No Visualization</div>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <Button 
             variant={isEditing ? 'primary' : 'secondary'} 
             size="sm" 
             onClick={() => setIsEditing(!isEditing)}
             icon={isEditing ? <Save size={16} /> : <Edit2 size={16} />}
          >
            {isEditing ? 'Done Editing' : 'Edit Dashboard'}
          </Button>
          {isEditing && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => { setEditingWidget(null); setIsWidgetModalOpen(true); }}
              icon={<Plus size={16} />}
            >
              Add Widget
            </Button>
          )}
        </div>
        <div>
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={() => setIsDSModalOpen(true)}
             icon={<Database size={16} />}
           >
             Data Sources
           </Button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[160px]">
          {widgets.map(widget => (
            <div 
              key={widget.id} 
              className={`
                relative group rounded-xl border transition-all duration-200
                ${widget.type === WidgetType.STAT ? 'row-span-1' : 'row-span-2'}
                ${widget.colSpan === 1 ? 'col-span-1' : ''}
                ${widget.colSpan === 2 ? 'col-span-1 md:col-span-2' : ''}
                ${widget.colSpan === 3 ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}
                ${widget.colSpan === 4 ? 'col-span-1 md:col-span-2 lg:col-span-4' : ''}
                ${isEditing ? 'border-dashed border-slate-600 bg-slate-900/30' : 'border-slate-800 bg-slate-900/50 backdrop-blur hover:border-slate-700'}
              `}
            >
              {isEditing && (
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingWidget(widget); setIsWidgetModalOpen(true); }}
                    className="p-1.5 bg-slate-700 text-slate-200 rounded hover:bg-cyan-600"
                  >
                    <Settings size={14} />
                  </button>
                  <button 
                    onClick={() => setWidgets(widgets.filter(w => w.id !== widget.id))}
                    className="p-1.5 bg-slate-700 text-red-400 rounded hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              <div className="h-full p-5 flex flex-col">
                {widget.type !== WidgetType.STAT && (
                   <h3 className="text-sm font-medium text-slate-400 mb-4 flex justify-between items-center">
                     {widget.title}
                     {widget.dataSourceId && <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500">SQL</span>}
                   </h3>
                )}
                
                <div className="flex-1 min-h-0">
                  {widget.type === WidgetType.STAT ? (
                    <StatCard widget={widget} />
                  ) : renderChart(widget)}
                </div>
              </div>
            </div>
          ))}
          
          {isEditing && (
             <div 
               onClick={() => { setEditingWidget(null); setIsWidgetModalOpen(true); }}
               className="col-span-1 row-span-1 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-cyan-500 hover:text-cyan-400 transition-colors"
             >
                <Plus size={32} />
                <span className="text-xs font-medium mt-2">Add Widget</span>
             </div>
          )}
        </div>
      </div>

      <WidgetEditor 
        isOpen={isWidgetModalOpen}
        widget={editingWidget}
        onClose={() => setIsWidgetModalOpen(false)}
        onSave={(w) => {
          if (editingWidget) {
            setWidgets(widgets.map(x => x.id === w.id ? w : x));
          } else {
            setWidgets([...widgets, w]);
          }
          setIsWidgetModalOpen(false);
        }}
        dataSources={dataSources}
      />

      <DataSourceModal 
        isOpen={isDSModalOpen}
        onClose={() => setIsDSModalOpen(false)}
        dataSources={dataSources}
        onAdd={(ds) => setDataSources([...dataSources, ds])}
      />
    </div>
  );
};
