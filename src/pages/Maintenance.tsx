import { useState, useMemo } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  X,
  Edit3,
} from 'lucide-react';
import { useAppStore } from '../store';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { FaultLevelLabels, type FaultLevel, type FaultStatus, type FaultOrder } from '../types';

export default function Maintenance() {
  const { faultOrders, equipments, addFaultOrder, updateFaultOrder, getEquipmentNameById } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<FaultStatus | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<FaultLevel | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<FaultOrder | null>(null);
  const [newFault, setNewFault] = useState({
    equipmentId: '',
    title: '',
    description: '',
    level: 'normal' as FaultLevel,
    reporter: '',
  });

  const stats = useMemo(() => {
    const total = faultOrders.length;
    const pending = faultOrders.filter(f => f.status === 'pending').length;
    const processing = faultOrders.filter(f => f.status === 'processing').length;
    const completed = faultOrders.filter(f => f.status === 'completed').length;
    const totalCost = faultOrders.reduce((sum, f) => sum + (f.cost || 0), 0);
    return { total, pending, processing, completed, totalCost };
  }, [faultOrders]);

  const filteredFaults = useMemo(() => {
    return faultOrders.filter(f => {
      const matchStatus = statusFilter === 'all' || f.status === statusFilter;
      const matchLevel = levelFilter === 'all' || f.level === levelFilter;
      return matchStatus && matchLevel;
    }).sort((a, b) => b.reportTime.localeCompare(a.reportTime));
  }, [faultOrders, statusFilter, levelFilter]);

  const handleAddFault = () => {
    if (!newFault.equipmentId || !newFault.title || !newFault.description || !newFault.reporter) return;
    addFaultOrder({
      ...newFault,
      status: 'pending',
      reportTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      repairType: 'internal',
    });
    setShowAddModal(false);
    setNewFault({ equipmentId: '', title: '', description: '', level: 'normal', reporter: '' });
  };

  const handleUpdateStatus = (id: string, status: FaultStatus) => {
    updateFaultOrder(id, { status });
    if (showDetailModal?.id === id) {
      setShowDetailModal({ ...showDetailModal, status });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-800">故障维修</h1>
          <p className="text-sm text-industrial-500 mt-1">故障工单管理与维修派单</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增故障
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="总工单"
          value={stats.total}
          icon={Wrench}
          color="blue"
        />
        <StatCard
          title="待派单"
          value={stats.pending}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="处理中"
          value={stats.processing}
          icon={AlertTriangle}
          color="purple"
        />
        <StatCard
          title="已完成"
          value={stats.completed}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="维修成本"
          value={`¥${stats.totalCost.toLocaleString()}`}
          icon={Wrench}
          color="blue"
        />
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <input
              type="text"
              placeholder="搜索工单标题、设备..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select
              className="input-field w-36"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FaultStatus | 'all')}
            >
              <option value="all">全部状态</option>
              <option value="pending">待派单</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
            </select>
            <select
              className="input-field w-36"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as FaultLevel | 'all')}
            >
              <option value="all">全部级别</option>
              <option value="normal">一般</option>
              <option value="serious">严重</option>
              <option value="urgent">紧急</option>
            </select>
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>工单编号</th>
                <th>故障标题</th>
                <th>设备</th>
                <th>级别</th>
                <th>状态</th>
                <th>报告人</th>
                <th>报告时间</th>
                <th>处理人</th>
                <th>停机时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaults.map(fault => (
                <tr key={fault.id} className="cursor-pointer" onClick={() => setShowDetailModal(fault)}>
                  <td className="font-mono text-sm text-primary-700">{fault.id.toUpperCase()}</td>
                  <td className="font-medium text-industrial-800">{fault.title}</td>
                  <td>{getEquipmentNameById(fault.equipmentId)}</td>
                  <td>
                    <StatusBadge status={fault.level} type="fault-level" />
                  </td>
                  <td>
                    <StatusBadge status={fault.status} type="fault-status" />
                  </td>
                  <td>{fault.reporter}</td>
                  <td className="text-industrial-600">{fault.reportTime}</td>
                  <td>
                    {fault.assignee ? (
                      <span className="flex items-center gap-1 text-sm">
                        <User className="w-3.5 h-3.5" />
                        {fault.assignee}
                      </span>
                    ) : (
                      <span className="text-industrial-400 text-sm">未指派</span>
                    )}
                  </td>
                  <td>{fault.downtime ? `${fault.downtime}h` : '-'}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetailModal(fault);
                      }}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">新增故障工单</h3>
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
                  value={newFault.equipmentId}
                  onChange={(e) => setNewFault(prev => ({ ...prev, equipmentId: e.target.value }))}
                >
                  <option value="">请选择设备</option>
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">故障标题</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="简要描述故障"
                  value={newFault.title}
                  onChange={(e) => setNewFault(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">故障级别</label>
                <select
                  className="input-field"
                  value={newFault.level}
                  onChange={(e) => setNewFault(prev => ({ ...prev, level: e.target.value as FaultLevel }))}
                >
                  {Object.entries(FaultLevelLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">故障详情</label>
                <textarea
                  className="input-field h-24 resize-none"
                  placeholder="详细描述故障现象..."
                  value={newFault.description}
                  onChange={(e) => setNewFault(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">报告人</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="您的姓名"
                  value={newFault.reporter}
                  onChange={(e) => setNewFault(prev => ({ ...prev, reporter: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAddFault}
                className="btn-primary"
                disabled={!newFault.equipmentId || !newFault.title || !newFault.description || !newFault.reporter}
              >
                提交工单
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">工单详情</h3>
              <button
                onClick={() => setShowDetailModal(null)}
                className="p-1 hover:bg-industrial-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-industrial-500">工单编号</p>
                  <p className="font-mono font-medium text-primary-700">{showDetailModal.id.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-industrial-500">故障级别</p>
                  <StatusBadge status={showDetailModal.level} type="fault-level" />
                </div>
                <div>
                  <p className="text-sm text-industrial-500">设备名称</p>
                  <p className="font-medium text-industrial-800">{getEquipmentNameById(showDetailModal.equipmentId)}</p>
                </div>
                <div>
                  <p className="text-sm text-industrial-500">工单状态</p>
                  <StatusBadge status={showDetailModal.status} type="fault-status" />
                </div>
                <div>
                  <p className="text-sm text-industrial-500">报告人</p>
                  <p className="font-medium text-industrial-800">{showDetailModal.reporter}</p>
                </div>
                <div>
                  <p className="text-sm text-industrial-500">报告时间</p>
                  <p className="font-medium text-industrial-800">{showDetailModal.reportTime}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-industrial-500 mb-1">故障标题</p>
                <p className="font-medium text-industrial-800">{showDetailModal.title}</p>
              </div>

              <div>
                <p className="text-sm text-industrial-500 mb-1">故障描述</p>
                <div className="p-4 bg-industrial-50 rounded-industrial">
                  <p className="text-sm text-industrial-700">{showDetailModal.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-industrial-500">处理人</p>
                  <p className="font-medium text-industrial-800">{showDetailModal.assignee || '未指派'}</p>
                </div>
                <div>
                  <p className="text-sm text-industrial-500">维修类型</p>
                  <p className="font-medium text-industrial-800">
                    {showDetailModal.repairType === 'internal' ? '内部维修' : '外协维修'}
                  </p>
                </div>
                {showDetailModal.externalVendor && (
                  <div>
                    <p className="text-sm text-industrial-500">外协单位</p>
                    <p className="font-medium text-industrial-800">{showDetailModal.externalVendor}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-industrial-500">停机时间</p>
                  <p className="font-medium text-industrial-800">{showDetailModal.downtime ? `${showDetailModal.downtime} 小时` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-industrial-500">维修成本</p>
                  <p className="font-medium text-industrial-800">{showDetailModal.cost ? `¥${showDetailModal.cost.toLocaleString()}` : '-'}</p>
                </div>
                {showDetailModal.accidentRelated && (
                  <div>
                    <p className="text-sm text-industrial-500">关联事故</p>
                    <p className="font-medium text-industrial-800">{showDetailModal.accidentRelated}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between p-6 border-t border-industrial-100 bg-industrial-50">
              <div className="flex gap-2">
                {showDetailModal.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(showDetailModal.id, 'processing')}
                    className="btn-primary"
                  >
                    开始处理
                  </button>
                )}
                {showDetailModal.status === 'processing' && (
                  <button
                    onClick={() => handleUpdateStatus(showDetailModal.id, 'completed')}
                    className="btn-primary"
                  >
                    完成维修
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowDetailModal(null)}
                className="btn-secondary"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
