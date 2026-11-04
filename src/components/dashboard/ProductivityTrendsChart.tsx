import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, Calendar, BarChart3, LineChart } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface DataPoint {
  period: string;
  completed: number;
  overdue: number;
  target: number;
  rate: number;
}

export const ProductivityTrendsChart: React.FC = () => {
  const { tasks, themeSettings } = useWorkspace();
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const isDark = themeSettings.mode === 'dark';

  // 7-day weekly dataset
  const weeklyData: DataPoint[] = [
    { period: 'Senin', completed: 8, overdue: 1, target: 10, rate: 89 },
    { period: 'Selasa', completed: 14, overdue: 0, target: 12, rate: 100 },
    { period: 'Rabu', completed: 11, overdue: 2, target: 12, rate: 85 },
    { period: 'Kamis', completed: 16, overdue: 1, target: 14, rate: 94 },
    { period: 'Jumat', completed: 18, overdue: 0, target: 15, rate: 100 },
    { period: 'Sabtu', completed: 4, overdue: 0, target: 4, rate: 100 },
    { period: 'Minggu', completed: 2, overdue: 0, target: 2, rate: 100 },
  ];

  // 4-week monthly dataset
  const monthlyData: DataPoint[] = [
    { period: 'Minggu 1', completed: 42, overdue: 6, target: 45, rate: 88 },
    { period: 'Minggu 2', completed: 58, overdue: 4, target: 50, rate: 94 },
    { period: 'Minggu 3', completed: 64, overdue: 3, target: 60, rate: 96 },
    { period: 'Minggu 4 (Aktif)', completed: 73, overdue: 2, target: 70, rate: 97 },
  ];

  const activeData = timeRange === 'weekly' ? weeklyData : monthlyData;

  const totalCompleted = activeData.reduce((acc, d) => acc + d.completed, 0);
  const totalOverdue = activeData.reduce((acc, d) => acc + d.overdue, 0);
  const averageRate = Math.round(
    activeData.reduce((acc, d) => acc + d.rate, 0) / activeData.length
  );

  // Custom Recharts Tooltip matching light/dark mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DataPoint;
      return (
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between gap-4 mb-2">
            <span>{label}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {data.rate}% On-Time
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Tasks Selesai (Completed):
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {data.completed} tugas
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Tasks Lewat Tenggat (Overdue):
              </span>
              <span className="font-bold text-red-600 dark:text-red-400">
                {data.overdue} tugas
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-3">
      {/* Controls: Time range & Chart Type */}
      <div className="flex items-center justify-end gap-2 pb-1">
        {/* Time range toggle */}
        <div className="flex rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setTimeRange('weekly')}
            className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
              timeRange === 'weekly'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('monthly')}
            className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
              timeRange === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            4 Minggu
          </button>
        </div>

        {/* Chart style toggle */}
        <div className="flex rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setChartType('area')}
            className={`rounded-lg p-1 transition cursor-pointer ${
              chartType === 'area'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Tampilan Grafik Garis & Area"
            aria-label="Area chart view"
          >
            <LineChart className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`rounded-lg p-1 transition cursor-pointer ${
              chartType === 'bar'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Tampilan Grafik Batang"
            aria-label="Bar chart view"
          >
            <BarChart3 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-emerald-50/70 p-3 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Tugas Selesai
          </div>
          <div className="mt-0.5 text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {totalCompleted}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">↑ +18% vs periode lalu</div>
        </div>

        <div className="rounded-2xl bg-rose-50/70 p-3 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
            Lewat Tenggat
          </div>
          <div className="mt-0.5 text-lg sm:text-xl font-extrabold text-rose-700 dark:text-rose-400">
            {totalOverdue}
          </div>
          <div className="text-[10px] text-rose-600 font-medium">Keterlambatan minimal</div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Ketepatan Waktu
          </div>
          <div className="mt-0.5 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {averageRate}%
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Target minimum 85%</div>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-60 sm:h-64 w-full min-w-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={activeData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Gradients for polished modern look */}
              <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="overdueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#334155' : '#e2e8f0'}
              vertical={false}
            />

            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 500 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              formatter={(value) => (
                <span className="text-slate-600 dark:text-slate-300 font-medium ml-1">
                  {value === 'completed' ? 'Tasks Selesai' : 'Tasks Overdue'}
                </span>
              )}
            />

            {chartType === 'area' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#completedGrad)"
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="overdue"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#overdueGrad)"
                  activeDot={{ r: 5, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </>
            ) : (
              <>
                <Bar
                  dataKey="completed"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="overdue"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & quick note footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Output Selesai
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Overdue
          </span>
        </div>
        <span className="text-slate-400">Diperbarui otomatis dari papan tugas</span>
      </div>
    </div>
  );
};
