import { useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Wrench,
} from 'lucide-react';
import { useAppStore } from '../store';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { EquipmentTypeLabels } from '../types';
import { berths } from '../data/mockData';

export default function Dashboard() {
  const { equipments, faultOrders, currentShift } = useAppStore();

  const stats = useMemo(() => {
    const total = equipments.length;
    const running = equipments.filter(e => e.status === 'running').length;
    const maintenance = equipments.filter(e => e.status === 'maintenance').length;
    const stopped = equipments.filter(e => e.status === 'stopped').length;
    const pendingFaults = faultOrders.filter(f => f.status === 'pending').length;
    const urgentFaults = faultOrders.filter(f => f.level === 'urgent' && f.status !== 'completed').length;
    const avgHours = Math.round(equipments.reduce((sum, e) => sum + e.totalHours, 0) / total);

    return { total, running, maintenance, stopped, pendingFaults, urgentFaults, avgHours };
  }, [equipments, faultOrders]);

  const berthEquipments = useMemo(() => {
    const map: Record<string, typeof equipments> = {};
    berths.forEach(b => {
      map[b.name] = equipments.filter(e => e.berth === b.name || (e.berth === '全场区' && b.name === '1号泊位'));
    });
    return map;
  }, [equipments]);

  const activeFaults = faultOrders
    .filter(f => f.status !== 'completed')
    .sort((a, b) => {
      const levelOrder = { urgent: 0, serious: 1, normal: 2 };
      return levelOrder[a.level] - levelOrder[b.level];
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-800">作业看板</h1>
          <p className="text-sm text-industrial-500 mt-1">实时监控设备运行状态</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-industrial-500">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="设备总数"
          value={stats.total}
          icon={Gauge}
          color="blue"
        />
        <StatCard
          title="运行中"
          value={stats.running}
          icon={Activity}
          color="green"
          trend={2.5}
          trendLabel="较昨日"
        />
        <StatCard
          title="维修中"
          value={stats.maintenance}
          icon={Wrench}
          color="orange"
        />
        <StatCard
          title="待处理故障"
          value={stats.pendingFaults}
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="紧急故障"
          value={stats.urgentFaults}
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="平均运行小时"
          value={`${stats.avgHours}h`}
          icon={Clock}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-industrial-800">泊位设备分布</h2>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-accent-teal" />
                  <span className="text-industrial-600">运行中</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-industrial-400" />
                  <span className="text-industrial-600">停机</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-accent-orange" />
                  <span className="text-industrial-600">维修中</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {berths.map(berth => (
                <div
                  key={berth.id}
                  className="p-3 bg-industrial-50 rounded-industrial border border-industrial-200 hover:border-primary-300 transition-colors"
                >
                  <p className="text-sm font-medium text-industrial-700 mb-2">{berth.name}</p>
                  <div className="space-y-1.5">
                    {berthEquipments[berth.name]?.slice(0, 3).map(eq => (
                      <div
                        key={eq.id}
                        className="flex items-center justify-between text-xs bg-white p-1.5 rounded"
                      >
                        <span className="text-industrial-600 truncate">{eq.name}</span>
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            eq.status === 'running'
                              ? 'bg-accent-teal'
                              : eq.status === 'maintenance'
                              ? 'bg-accent-orange animate-pulse-slow'
                              : 'bg-industrial-400'
                          }`}
                        />
                      </div>
                    ))}
                    {berthEquipments[berth.name]?.length === 0 && (
                      <p className="text-xs text-industrial-400 text-center py-2">暂无设备</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-industrial-800 mb-4">设备状态概览</h2>
            <div className="space-y-3">
              {equipments.slice(0, 5).map(eq => (
                <div
                  key={eq.id}
                  className="flex items-center justify-between p-2 hover:bg-industrial-50 rounded-industrial transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-industrial flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-industrial-800">{eq.name}</p>
                      <p className="text-xs text-industrial-500">{EquipmentTypeLabels[eq.type]}</p>
                    </div>
                  </div>
                  <StatusBadge status={eq.status} type="equipment" />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-industrial-800">最新故障</h2>
              <span className="text-xs text-primary-700 cursor-pointer hover:underline">查看全部</span>
            </div>
            <div className="space-y-3">
              {activeFaults.map(fault => (
                <div
                  key={fault.id}
                  className="p-3 bg-industrial-50 rounded-industrial border-l-4 border-accent-orange"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-industrial-800">{fault.title}</p>
                      <p className="text-xs text-industrial-500 mt-0.5">
                        {useAppStore.getState().getEquipmentNameById(fault.equipmentId)} · {fault.reporter}
                      </p>
                    </div>
                    <StatusBadge status={fault.level} type="fault-level" />
                  </div>
                </div>
              ))}
              {activeFaults.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 text-accent-teal mx-auto mb-2" />
                  <p className="text-sm text-industrial-500">暂无待处理故障</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
