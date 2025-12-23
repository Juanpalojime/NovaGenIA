import React, { useEffect, useRef, useState } from 'react';
import { Rocket, Filter, Clock, AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { LogEntry, TrainingState } from '../types';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  trainingState: TrainingState;
  onStartTraining: () => void;
  totalSteps: number;
}

// Generate some initial fake data for the chart background or initial state
const INITIAL_DATA = Array.from({ length: 20 }, (_, i) => ({
    step: i,
    loss: 0.8 - (i * 0.02) + (Math.random() * 0.05),
    accuracy: 0.2 + (i * 0.03)
}));

export const MonitorPanel: React.FC<Props> = ({ trainingState, onStartTraining, totalSteps }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');

  // Auto scroll logs
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [trainingState.logs, filter]);

  // Merge fake initial data with real-time updates (simulated) for visualization
  const chartData = trainingState.status === 'idle' 
    ? INITIAL_DATA 
    : [...INITIAL_DATA, ...trainingState.logs.filter((_, i) => i % 2 === 0).map((_, i) => ({
        step: 20 + i,
        loss: Math.max(0.1, 0.4 - (i * 0.01) + (Math.random() * 0.1)),
        accuracy: Math.min(0.99, 0.6 + (i * 0.02))
    }))].slice(-40); // Keep last 40 points

  // Filter Logs
  const filteredLogs = trainingState.logs.filter(log => filter === 'all' || log.type === filter);

  // Estimate Time
  // Simulation: Assume a fixed speed for visual purposes (e.g., 20 steps/sec)
  const stepsRemaining = Math.max(0, Math.floor(totalSteps * (1 - (trainingState.progress / 100))));
  const simulatedSpeed = 15; // steps per second
  const secondsRemaining = trainingState.status === 'training' ? Math.floor(stepsRemaining / simulatedSpeed) : 0;

  const formatTime = (totalSeconds: number) => {
      if (trainingState.status !== 'training') return "--:--";
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m}m ${s}s`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-3 rounded-lg shadow-xl text-xs backdrop-blur-md">
          <p className="text-slate-500 dark:text-gray-400 mb-1 font-mono">Step: {payload[0].payload.step}</p>
          <div className="flex gap-3">
              <span className="text-primary font-bold">Loss: {payload[0].value.toFixed(4)}</span>
              <span className="text-green-500 font-bold">Acc: {payload[0].payload.accuracy.toFixed(4)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden flex flex-col h-full shadow-sm">
      <h3 className="bg-slate-50 dark:bg-[#2a1d36] border-b border-border-light dark:border-border-dark text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider px-5 py-4 flex items-center justify-between">
        Training Monitor
        <span className="flex items-center gap-2 text-xs font-normal normal-case text-slate-500 dark:text-gray-400">
            <span className={`size-2 rounded-full ${trainingState.status === 'training' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></span>
            {trainingState.status === 'training' ? 'Training...' : 'Idle'}
        </span>
      </h3>

      <div className="p-5 flex flex-col gap-5 flex-1">
        
        {/* Progress Bar */}
        <div className="w-full">
            <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-500 dark:text-gray-400 font-medium">Progress</span>
                <span className="text-slate-900 dark:text-white font-mono">{Math.round(trainingState.progress)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-black/40 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-300 ease-out"
                    style={{ width: `${trainingState.progress}%` }}
                ></div>
            </div>
        </div>

        {/* Graph */}
        <div className="relative w-full h-36 bg-slate-50 dark:bg-black/30 rounded-lg border border-slate-200 dark:border-border-dark p-3 flex flex-col justify-between overflow-hidden">
             <div className="flex justify-between text-[10px] text-slate-400 font-mono uppercase mb-2 z-10 relative">
                <span>Loss</span>
                <span>Accuracy</span>
            </div>
            
            <div className="absolute inset-0 top-0 bottom-0 left-0 right-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7f13ec" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#7f13ec" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7f13ec', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="loss" stroke="#7f13ec" strokeWidth={2} fillOpacity={1} fill="url(#colorLoss)" isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Terminal Logs */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900 rounded-lg border border-slate-800 shadow-inner overflow-hidden">
            {/* Log Controls */}
            <div className="flex items-center gap-1 p-2 border-b border-slate-800 bg-slate-900/50">
                <Filter size={12} className="text-slate-500 ml-1 mr-2" />
                <button 
                    onClick={() => setFilter('all')}
                    className={`text-[10px] px-2 py-1 rounded transition-colors ${filter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >All</button>
                <button 
                    onClick={() => setFilter('info')}
                    className={`text-[10px] px-2 py-1 rounded transition-colors ${filter === 'info' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                >Info</button>
                <button 
                    onClick={() => setFilter('success')}
                    className={`text-[10px] px-2 py-1 rounded transition-colors ${filter === 'success' ? 'bg-green-500/20 text-green-400' : 'text-slate-500 hover:text-slate-300'}`}
                >Success</button>
                <button 
                    onClick={() => setFilter('error')}
                    className={`text-[10px] px-2 py-1 rounded transition-colors ${filter === 'error' ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
                >Error</button>
            </div>
            
            <div 
                ref={scrollRef}
                className="flex-1 p-4 font-mono text-xs overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700"
            >
                <div className="flex flex-col gap-1">
                    {filteredLogs.length === 0 && (
                        <p className="text-slate-500 italic">No logs found...</p>
                    )}
                    {filteredLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-2">
                            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                            <span className={`${
                                log.type === 'success' ? 'text-green-400' : 
                                log.type === 'error' ? 'text-red-400' :
                                log.type === 'warning' ? 'text-yellow-400' : 'text-slate-300'
                            }`}>
                                {log.message}
                            </span>
                        </div>
                    ))}
                    {trainingState.status === 'training' && filter === 'all' && (
                        <p className="text-primary animate-pulse">_</p>
                    )}
                </div>
            </div>
        </div>

        {/* Estimated Time */}
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                <Clock size={14} />
                <span className="text-xs font-medium">Estimated Time</span>
            </div>
            <span className="text-slate-900 dark:text-white font-mono text-sm">{formatTime(secondsRemaining)}</span>
        </div>

        {/* CTA Button */}
        <button 
            onClick={onStartTraining}
            disabled={trainingState.status === 'training'}
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-slate-600 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:cursor-not-allowed"
        >
            {trainingState.status === 'training' ? <Loader2 className="animate-spin" /> : <Rocket />}
            {trainingState.status === 'training' ? 'Training in Progress' : 'Start Training'}
        </button>
      </div>
    </div>
  );
};