import { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';
import { useAppStore } from '../store';
import { StatCard } from '../components/StatCard';

export default function Performance() {
  const { performanceData, equipments, faultOrders } = useAppStore();
  const [timeRange, setTimeRange] = useState<'6m' | '1y'>('6m');

  const chartData = useMemo(() => {
    return timeRange === '6m' ? performanceData.slice(-6) : performanceData;
  }, [performanceData, timeRange]);

  const latestData = performanceData[performanceData.length - 1];

  const costData = useMemo(() => {
    return chartData.map(d => ({
      date: d.date,
      维修成本: d.maintenanceCost,
      油料成本: d.oilCost,
      轮胎成本: d.tireCost,
    }));
  }, [chartData]);

  const rateData = useMemo(() => {
    return chartData.map(d => ({
      date: d.date,
      完好率: d.availabilityRate,
      利用率: d.utilizationRate,
      故障率: d.failureRate * 10,
    }));
  }, [chartData]);

  const totalCost = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.maintenanceCost + d.oilCost + d.tireCost, 0);
  }, [chartData]);

  const avgAvailability = useMemo(() => {
    const sum = chartData.reduce((sum, d) => sum + d.availabilityRate, 0);
    return (sum / chartData.length).toFixed(1);
  }, [chartData]);

  const avgUtilization = useMemo(() => {
    const sum = chartData.reduce((sum, d) => sum + d.utilizationRate, 0);
    return (sum / chartData.length).toFixed(1);
  }, [chartData]);

  const equipmentStats = useMemo(() => {
    return equipments.map(eq => {
      const faults = faultOrders.filter(f => f.equipmentId === eq.id);
      const completedFaults = faults.filter(f => f.status === 'completed');
      const totalCost = completedFaults.reduce((sum, f) => sum + (f.cost || 0), 0);
      const availability = eq.status === 'running' ? 98.5 : eq.status === 'maintenance' ? 0 : 95;
      return {
        ...eq,
        faultCount: faults.length,
        completedCount: completedFaults.length,
        totalCost,
        availability,
      };
    }).sort((a, b) => b.availability - a.availability);
  }, [equipments, faultOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-800">绩效统计</h1>
          <p className="text-sm text-industrial-500 mt-1">设备完好率、利用率与成本分析</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-industrial-100 rounded-industrial p-0.5">
            {(['6m', '1y'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-industrial transition-all ${
                  timeRange === range
                    ? 'bg-white text-primary-900 shadow-sm font-medium'
                    : 'text-industrial-500 hover:text-industrial-700'
                }`}
              >
                {range === '6m' ? '近6个月' : '近1年'}
              </button>
            ))}
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="平均完好率"
          value={`${avgAvailability}%`}
          icon={CheckCircle}
          color="green"
          trend={1.2}
          trendLabel="环比"
        />
        <StatCard
          title="平均利用率"
          value={`${avgUtilization}%`}
          icon={TrendingUp}
          color="blue"
          trend={2.8}
          trendLabel="环比"
        />
        <StatCard
          title="总运维成本"
          value={`¥${(totalCost / 10000).toFixed(1)}万`}
          icon={DollarSign}
          color="orange"
          trend={-5.3}
          trendLabel="环比"
        />
        <StatCard
          title="设备故障率"
          value={`${latestData.failureRate}%`}
          icon={AlertTriangle}
          color="purple"
          trend={-0.3}
          trendLabel="环比"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-industrial-800 mb-4">完好率与利用率趋势</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="完好率"
                  fill="#16C79A"
                  fillOpacity={0.2}
                  stroke="#16C79A"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="利用率"
                  stroke="#0F3460"
                  strokeWidth={2}
                  dot={{ fill: '#0F3460' }}
                />
                <Line
                  type="monotone"
                  dataKey="故障率"
                  stroke="#E94560"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#E94560' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-industrial-800 mb-4">运维成本对比</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => `¥${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="维修成本" fill="#0F3460" radius={[4, 4, 0, 0]} />
                <Bar dataKey="油料成本" fill="#16C79A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="轮胎成本" fill="#E94560" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-industrial-800 mb-4">设备绩效排行</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>设备名称</th>
                <th>设备类型</th>
                <th>完好率</th>
                <th>累计运行</th>
                <th>故障次数</th>
                <th>维修成本</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {equipmentStats.map((eq, idx) => (
                <tr key={eq.id}>
                  <td>
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-industrial-50 text-industrial-600'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="font-medium text-industrial-800">{eq.name}</td>
                  <td>{eq.type === 'quay-crane' ? '岸桥' : eq.type === 'yard-crane' ? '场桥' : eq.type === 'tractor' ? '牵引车' : '输送线'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-industrial-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            eq.availability >= 95 ? 'bg-accent-teal' :
                            eq.availability >= 80 ? 'bg-amber-500' : 'bg-accent-orange'
                          }`}
                          style={{ width: `${eq.availability}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{eq.availability}%</span>
                    </div>
                  </td>
                  <td>{eq.totalHours.toLocaleString()} h</td>
                  <td>{eq.faultCount} 次</td>
                  <td>¥{eq.totalCost.toLocaleString()}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                      eq.status === 'running'
                        ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/30'
                        : eq.status === 'maintenance'
                        ? 'bg-accent-orange/10 text-accent-orange border-accent-orange/30'
                        : 'bg-industrial-100 text-industrial-600 border-industrial-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        eq.status === 'running' ? 'bg-accent-teal' :
                        eq.status === 'maintenance' ? 'bg-accent-orange' : 'bg-industrial-400'
                      }`} />
                      {eq.status === 'running' ? '运行中' : eq.status === 'maintenance' ? '维修中' : '停机'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-base font-semibold text-industrial-800 mb-4">成本构成分析</h3>
          <div className="space-y-4">
            {[
              { label: '维修成本', value: performanceData.reduce((s, d) => s + d.maintenanceCost, 0), color: 'bg-primary-900' },
              { label: '油料成本', value: performanceData.reduce((s, d) => s + d.oilCost, 0), color: 'bg-accent-teal' },
              { label: '轮胎成本', value: performanceData.reduce((s, d) => s + d.tireCost, 0), color: 'bg-accent-orange' },
            ].map(item => {
              const total = performanceData.reduce((s, d) => s + d.maintenanceCost + d.oilCost + d.tireCost, 0);
              const percent = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-industrial-600">{item.label}</span>
                    <span className="text-sm font-medium">¥{item.value.toLocaleString()} ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-industrial-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card md:col-span-2">
          <h3 className="text-base font-semibold text-industrial-800 mb-4">关键指标说明</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-primary-50 rounded-industrial">
              <p className="text-sm font-medium text-primary-900 mb-1">设备完好率</p>
              <p className="text-xs text-industrial-600">指设备处于完好技术状态的时间占总时间的比例，反映设备的可靠性。</p>
            </div>
            <div className="p-3 bg-accent-teal/10 rounded-industrial">
              <p className="text-sm font-medium text-accent-teal mb-1">设备利用率</p>
              <p className="text-xs text-industrial-600">指设备实际运行时间占可用时间的比例，反映设备的使用效率。</p>
            </div>
            <div className="p-3 bg-accent-orange/10 rounded-industrial">
              <p className="text-sm font-medium text-accent-orange mb-1">故障率</p>
              <p className="text-xs text-industrial-600">指设备发生故障的频率，单位时间内故障发生的次数比例。</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-industrial">
              <p className="text-sm font-medium text-purple-700 mb-1">运维成本</p>
              <p className="text-xs text-industrial-600">包括维修费用、油料消耗、轮胎更换等所有设备维护相关的费用。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
