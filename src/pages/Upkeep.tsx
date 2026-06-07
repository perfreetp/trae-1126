import { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  X,
  Check,
  Save,
} from 'lucide-react';
import { useAppStore } from '../store';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { MaintenanceTypeLabels, type MaintenancePlan, type MaintenanceStatus, type MaintenanceType } from '../types';

const defaultMaintenanceItems: Record<MaintenanceType, string[]> = {
  'level1': ['设备外观清洁', '紧固件检查', '润滑油位检查', '安全装置检查'],
  'level2': ['一级保养全部项目', '液压系统检查', '电气系统检测', '制动器调整'],
  'level3': ['二级保养全部项目', '整机性能检测', '易损件更换', '结构件探伤'],
};

export default function Upkeep() {
  const { maintenancePlans, safetyCheckItems, equipments, getEquipmentNameById, updateMaintenancePlan, addMaintenancePlan } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all');
  const [showDetail, setShowDetail] = useState<MaintenancePlan | null>(null);
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localCheckItems, setLocalCheckItems] = useState(safetyCheckItems);
  const [newPlan, setNewPlan] = useState({
    equipmentId: '',
    type: 'level1' as MaintenanceType,
    planDate: new Date().toISOString().split('T')[0],
    window: '08:00-10:00',
    items: defaultMaintenanceItems['level1'],
    executor: '',
  });

  const handleTypeChange = (type: MaintenanceType) => {
    setNewPlan(prev => ({
      ...prev,
      type,
      items: defaultMaintenanceItems[type],
    }));
  };

  const handleAddPlan = () => {
    if (!newPlan.equipmentId || !newPlan.planDate || !newPlan.window) return;
    addMaintenancePlan({
      equipmentId: newPlan.equipmentId,
      type: newPlan.type,
      planDate: newPlan.planDate,
      window: newPlan.window,
      status: 'pending',
      items: newPlan.items,
      executor: newPlan.executor || undefined,
    });
    setShowAddModal(false);
    setNewPlan({
      equipmentId: '',
      type: 'level1',
      planDate: new Date().toISOString().split('T')[0],
      window: '08:00-10:00',
      items: defaultMaintenanceItems['level1'],
      executor: '',
    });
  };

  const stats = useMemo(() => {
    const total = maintenancePlans.length;
    const pending = maintenancePlans.filter(p => p.status === 'pending').length;
    const inProgress = maintenancePlans.filter(p => p.status === 'in-progress').length;
    const completed = maintenancePlans.filter(p => p.status === 'completed').length;
    return { total, pending, inProgress, completed };
  }, [maintenancePlans]);

  const filteredPlans = useMemo(() => {
    return maintenancePlans
      .filter(p => statusFilter === 'all' || p.status === statusFilter)
      .sort((a, b) => a.planDate.localeCompare(b.planDate));
  }, [maintenancePlans, statusFilter]);

  const handleToggleCheck = (id: string) => {
    setLocalCheckItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleStartMaintenance = (plan: MaintenancePlan) => {
    setShowDetail(plan);
    setShowSafetyCheck(true);
    setLocalCheckItems(safetyCheckItems.map(i => ({ ...i, checked: false })));
  };

  const handleCompleteMaintenance = () => {
    if (!showDetail) return;
    updateMaintenancePlan(showDetail.id, {
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0],
    });
    setShowSafetyCheck(false);
    setShowDetail(null);
  };

  const allChecked = localCheckItems.every(item => item.checked);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-800">保养排程</h1>
          <p className="text-sm text-industrial-500 mt-1">设备保养计划与执行管理</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增保养计划
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="保养计划总数"
          value={stats.total}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="待执行"
          value={stats.pending}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="进行中"
          value={stats.inProgress}
          icon={AlertCircle}
          color="purple"
        />
        <StatCard
          title="已完成"
          value={stats.completed}
          icon={CheckCircle}
          color="green"
        />
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <input
              type="text"
              placeholder="搜索保养计划..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select
              className="input-field w-36"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MaintenanceStatus | 'all')}
            >
              <option value="all">全部状态</option>
              <option value="pending">待执行</option>
              <option value="in-progress">进行中</option>
              <option value="completed">已完成</option>
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
                <th>计划编号</th>
                <th>设备</th>
                <th>保养类型</th>
                <th>计划日期</th>
                <th>保养窗口</th>
                <th>状态</th>
                <th>执行人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map(plan => (
                <tr key={plan.id}>
                  <td className="font-mono text-sm text-primary-700">{plan.id.toUpperCase()}</td>
                  <td className="font-medium text-industrial-800">{getEquipmentNameById(plan.equipmentId)}</td>
                  <td>{MaintenanceTypeLabels[plan.type]}</td>
                  <td>{plan.planDate}</td>
                  <td>{plan.window}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                      plan.status === 'completed'
                        ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/30'
                        : plan.status === 'in-progress'
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        plan.status === 'completed' ? 'bg-accent-teal' :
                        plan.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'
                      }`} />
                      {plan.status === 'completed' ? '已完成' : plan.status === 'in-progress' ? '进行中' : '待执行'}
                    </span>
                  </td>
                  <td>{plan.executor || '-'}</td>
                  <td>
                    {plan.status === 'pending' && (
                      <button
                        onClick={() => handleStartMaintenance(plan)}
                        className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        开始保养
                      </button>
                    )}
                    {plan.status === 'in-progress' && (
                      <button
                        onClick={() => {
                          setShowDetail(plan);
                          setShowSafetyCheck(true);
                          setLocalCheckItems(safetyCheckItems.map(i => ({ ...i, checked: false })));
                        }}
                        className="text-sm text-accent-teal hover:underline"
                      >
                        继续执行
                      </button>
                    )}
                    {plan.status === 'completed' && (
                      <span className="text-sm text-industrial-400">{plan.completedDate}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">新增保养计划</h3>
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
                  value={newPlan.equipmentId}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, equipmentId: e.target.value }))}
                >
                  <option value="">请选择设备</option>
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">保养类型</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(MaintenanceTypeLabels) as MaintenanceType[]).map(type => (
                    <label key={type}>
                      <input
                        type="radio"
                        name="maintenanceType"
                        value={type}
                        checked={newPlan.type === type}
                        onChange={() => handleTypeChange(type)}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-industrial border-2 cursor-pointer transition-all text-center ${
                        newPlan.type === type
                          ? 'border-primary-900 bg-primary-50 text-primary-900'
                          : 'border-industrial-200 hover:border-primary-300'
                      }`}>
                        <p className="text-sm font-medium">{MaintenanceTypeLabels[type]}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">计划日期</label>
                  <input
                    type="date"
                    className="input-field"
                    value={newPlan.planDate}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, planDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">保养窗口</label>
                  <select
                    className="input-field"
                    value={newPlan.window}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, window: e.target.value }))}
                  >
                    <option value="08:00-10:00">08:00-10:00</option>
                    <option value="10:00-12:00">10:00-12:00</option>
                    <option value="14:00-16:00">14:00-16:00</option>
                    <option value="16:00-18:00">16:00-18:00</option>
                    <option value="20:00-22:00">20:00-22:00</option>
                    <option value="22:00-24:00">22:00-24:00</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">执行人 (选填)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="请输入执行人姓名"
                  value={newPlan.executor}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, executor: e.target.value }))}
                />
              </div>
              <div>
                <p className="form-label">保养项目</p>
                <div className="p-3 bg-industrial-50 rounded-industrial">
                  <ul className="space-y-2">
                    {newPlan.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-industrial-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">取消</button>
              <button
                onClick={handleAddPlan}
                className="btn-primary flex items-center gap-2"
                disabled={!newPlan.equipmentId || !newPlan.planDate || !newPlan.window}
              >
                <Save className="w-4 h-4" />
                创建计划
              </button>
            </div>
          </div>
        </div>
      )}

      {showSafetyCheck && showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary-700" />
                <h3 className="text-lg font-semibold text-industrial-800">安全检查确认</h3>
              </div>
              <button
                onClick={() => { setShowSafetyCheck(false); setShowDetail(null); }}
                className="p-1 hover:bg-industrial-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-primary-50 p-4 rounded-industrial">
                <p className="text-sm text-primary-700">
                  设备：<span className="font-medium">{getEquipmentNameById(showDetail.equipmentId)}</span>
                  <span className="mx-2">|</span>
                  保养类型：<span className="font-medium">{MaintenanceTypeLabels[showDetail.type]}</span>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-industrial-700 mb-3">请确认以下安全检查项</h4>
                <div className="space-y-2">
                  {Object.entries(
                    localCheckItems.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    }, {} as Record<string, typeof localCheckItems>)
                  ).map(([category, items]) => (
                    <div key={category} className="mb-4">
                      <p className="text-xs font-medium text-industrial-500 mb-2 uppercase">{category}</p>
                      <div className="space-y-2">
                        {items.map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleToggleCheck(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-industrial border transition-all ${
                              item.checked
                                ? 'border-accent-teal bg-accent-teal/5'
                                : 'border-industrial-200 hover:border-primary-300 bg-white'
                            }`}
                          >
                            <span className={`text-sm ${item.checked ? 'text-accent-teal font-medium' : 'text-industrial-700'}`}>
                              {item.name}
                            </span>
                            {item.checked ? (
                              <Check className="w-5 h-5 text-accent-teal" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-industrial-300 rounded" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-industrial-50 p-4 rounded-industrial">
                <h4 className="text-sm font-semibold text-industrial-700 mb-2">保养项目</h4>
                <ul className="space-y-1">
                  {showDetail.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-industrial-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-between p-6 border-t border-industrial-100 bg-industrial-50">
              <button
                onClick={() => { setShowSafetyCheck(false); setShowDetail(null); }}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleCompleteMaintenance}
                className="btn-primary"
                disabled={!allChecked}
              >
                {allChecked ? '确认并完成保养' : '请完成所有安全检查'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
