import { useState, useMemo } from 'react';
import {
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  Search,
  Plus,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useAppStore } from '../store';
import { StatCard } from '../components/StatCard';
import { EquipmentTypeLabels, ShiftTypeLabels, type ShiftType } from '../types';

export default function RunningHours() {
  const { equipments, runningRecords, addRunningRecord, updateEquipment, getEquipmentById, getEquipmentNameById } = useAppStore();
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    equipmentId: '',
    date: new Date().toISOString().split('T')[0],
    shift: 'day' as ShiftType,
    driver: '',
    hours: '',
    volume: '',
  });

  const handleSubmit = () => {
    if (!newRecord.equipmentId || !newRecord.driver || !newRecord.hours || !newRecord.volume) return;
    const hours = parseFloat(newRecord.hours);
    addRunningRecord({
      equipmentId: newRecord.equipmentId,
      date: newRecord.date,
      shift: newRecord.shift,
      driver: newRecord.driver,
      hours: hours,
      volume: parseInt(newRecord.volume),
    });
    const equipment = getEquipmentById(newRecord.equipmentId);
    if (equipment) {
      updateEquipment(newRecord.equipmentId, {
        totalHours: equipment.totalHours + hours,
      });
    }
    setShowAddModal(false);
    setNewRecord({
      equipmentId: '',
      date: new Date().toISOString().split('T')[0],
      shift: 'day',
      driver: '',
      hours: '',
      volume: '',
    });
  };

  const totalHours = useMemo(() => {
    return runningRecords.reduce((sum, r) => sum + r.hours, 0);
  }, [runningRecords]);

  const totalVolume = useMemo(() => {
    return runningRecords.reduce((sum, r) => sum + r.volume, 0);
  }, [runningRecords]);

  const avgHoursPerDay = useMemo(() => {
    const days = [...new Set(runningRecords.map(r => r.date))].length;
    return days > 0 ? (totalHours / days).toFixed(1) : 0;
  }, [runningRecords, totalHours]);

  const chartData = useMemo(() => {
    const grouped: Record<string, { date: string; hours: number; volume: number }> = {};
    runningRecords.forEach(r => {
      if (!grouped[r.date]) {
        grouped[r.date] = { date: r.date, hours: 0, volume: 0 };
      }
      grouped[r.date].hours += r.hours;
      grouped[r.date].volume += r.volume;
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [runningRecords]);

  const equipmentStats = useMemo(() => {
    const stats: Record<string, { name: string; type: string; hours: number; volume: number }> = {};
    runningRecords.forEach(r => {
      if (!stats[r.equipmentId]) {
        const eq = equipments.find(e => e.id === r.equipmentId);
        stats[r.equipmentId] = {
          name: eq?.name || '未知',
          type: eq ? EquipmentTypeLabels[eq.type] : '',
          hours: 0,
          volume: 0,
        };
      }
      stats[r.equipmentId].hours += r.hours;
      stats[r.equipmentId].volume += r.volume;
    });
    return Object.values(stats);
  }, [runningRecords, equipments]);

  const filteredRecords = useMemo(() => {
    return runningRecords
      .filter(r => equipmentFilter === 'all' || r.equipmentId === equipmentFilter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [runningRecords, equipmentFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-800">运行小时</h1>
          <p className="text-sm text-industrial-500 mt-1">设备运行时长统计与分析</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-industrial-100 rounded-industrial p-0.5">
            {(['day', 'week', 'month'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-industrial transition-all ${
                  timeRange === range
                    ? 'bg-white text-primary-900 shadow-sm font-medium'
                    : 'text-industrial-500 hover:text-industrial-700'
                }`}
              >
                {range === 'day' ? '日' : range === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            录入班次
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="总运行小时"
          value={`${totalHours}h`}
          icon={Clock}
          color="blue"
          trend={3.2}
          trendLabel="较上周"
        />
        <StatCard
          title="日均运行小时"
          value={`${avgHoursPerDay}h`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="总作业量"
          value={`${totalVolume.toLocaleString()} TEU`}
          icon={BarChart3}
          color="purple"
          trend={5.8}
          trendLabel="较上周"
        />
        <StatCard
          title="在线设备"
          value={equipments.filter(e => e.status === 'running').length}
          icon={Calendar}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-industrial-800 mb-4">运行时长趋势</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="hours" name="运行小时" fill="#0F3460" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-industrial-800 mb-4">作业量趋势</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="volume"
                  name="作业量"
                  stroke="#16C79A"
                  strokeWidth={2}
                  dot={{ fill: '#16C79A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-industrial-800">设备运行统计</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <select
              className="input-field pl-10 w-64"
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
            >
              <option value="all">全部设备</option>
              {equipments.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="data-table">
            <thead>
              <tr>
                <th>设备名称</th>
                <th>设备类型</th>
                <th>累计运行小时</th>
                <th>累计作业量</th>
                <th>平均日运行</th>
              </tr>
            </thead>
            <tbody>
              {equipmentStats.map(stat => (
                <tr key={stat.name}>
                  <td className="font-medium text-industrial-800">{stat.name}</td>
                  <td>{stat.type}</td>
                  <td>{stat.hours.toFixed(1)} h</td>
                  <td>{stat.volume.toLocaleString()} TEU</td>
                  <td>{(stat.hours / 5).toFixed(1)} h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold text-industrial-800 mb-4">详细运行记录</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>班次</th>
                <th>设备</th>
                <th>司机</th>
                <th>运行小时</th>
                <th>作业量</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      record.shift === 'day'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {ShiftTypeLabels[record.shift]}
                    </span>
                  </td>
                  <td>{getEquipmentNameById(record.equipmentId)}</td>
                  <td>{record.driver}</td>
                  <td>{record.hours} h</td>
                  <td>{record.volume.toLocaleString()} TEU</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">录入作业班次</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-industrial-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="form-label">设备</label>
                <select
                  className="input-field"
                  value={newRecord.equipmentId}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, equipmentId: e.target.value }))}
                >
                  <option value="">请选择设备</option>
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">日期</label>
                <input
                  type="date"
                  className="input-field"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">班次</label>
                <div className="flex gap-3">
                  {(['day', 'night'] as const).map(shift => (
                    <label key={shift} className="flex-1">
                      <input
                        type="radio"
                        name="shift"
                        value={shift}
                        checked={newRecord.shift === shift}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, shift: e.target.value as ShiftType }))}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-industrial border-2 cursor-pointer transition-all text-center ${
                        newRecord.shift === shift
                          ? shift === 'day'
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-industrial-200 hover:border-primary-300'
                      }`}>
                        {ShiftTypeLabels[shift]}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">当班司机</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="司机姓名"
                  value={newRecord.driver}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, driver: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">运行小时</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="input-field"
                    placeholder="8.0"
                    value={newRecord.hours}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, hours: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">作业量 (TEU)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    placeholder="120"
                    value={newRecord.volume}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, volume: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">取消</button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={!newRecord.equipmentId || !newRecord.driver || !newRecord.hours || !newRecord.volume}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
