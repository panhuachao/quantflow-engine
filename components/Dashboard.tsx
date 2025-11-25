import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, DollarSign, AlertCircle } from 'lucide-react';

const DATA = [
  { time: '09:00', value: 10000 },
  { time: '10:00', value: 10050 },
  { time: '11:00', value: 10020 },
  { time: '12:00', value: 10100 },
  { time: '13:00', value: 10150 },
  { time: '14:00', value: 10120 },
  { time: '15:00', value: 10200 },
  { time: '16:00', value: 10350 },
];

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6 rounded-xl hover:border-slate-600 transition-colors group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-100 tracking-tight">{value}</h3>
        <p className={`text-xs mt-2 font-medium ${color}`}>{sub}</p>
      </div>
      <div className={`p-3 rounded-lg bg-slate-900/50 ${color.replace('text-', 'text-opacity-80 text-')}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-6 h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Equity" 
          value="$10,350.00" 
          sub="+3.5% Today" 
          icon={DollarSign} 
          color="text-emerald-400" 
        />
        <StatCard 
          title="Active Strategies" 
          value="3" 
          sub="2 Running, 1 Idle" 
          icon={Activity} 
          color="text-cyan-400" 
        />
        <StatCard 
          title="Total Volume" 
          value="$45,200" 
          sub="+12% vs Avg" 
          icon={TrendingUp} 
          color="text-blue-400" 
        />
        <StatCard 
          title="Risk Exposure" 
          value="Low" 
          sub="Sharpe: 2.1" 
          icon={AlertCircle} 
          color="text-purple-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Equity Curve</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Recent Signals</h3>
          <div className="space-y-4">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-600">
                 <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                   <div>
                     <p className="text-sm font-medium text-slate-200">BTC/USDT</p>
                     <p className="text-xs text-slate-500">RSI Reversal Strategy</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className={`text-sm font-bold ${i % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                     {i % 2 === 0 ? 'BUY' : 'SELL'}
                   </p>
                   <p className="text-xs text-slate-500">10:2{i} AM</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
