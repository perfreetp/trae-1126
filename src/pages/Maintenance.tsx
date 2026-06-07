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
  X,
  Edit3,
  Save,
  UserCheck,
  Truck,
  FileText,
  DollarSign,
  TrendingDown,
  History,
  Send,
  CheckSquare,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Monitor,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '../store';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  FaultLevelLabels,
  ExternalTrackStatusLabels,
  AcceptanceResultLabels,
  ApprovalStatusLabels,
  type FaultLevel,
  type FaultStatus,
  type FaultOrder,
  type ExternalTrackStatus,
  type AcceptanceResult,
  type ApprovalStatus,
} from '../types';

const APPROVAL_THRESHOLD = 5000;

export default function Maintenance() {
  const {
    faultOrders,
    equipments,
    addFaultOrder,
    updateFaultOrder,
    addTrackRecord,
    approveFaultOrder,
    rejectFaultOrder,
    getEquipmentNameById,
  } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<FaultStatus | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<FaultLevel | 'all'>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [repairTypeFilter, setRepairTypeFilter] = useState<'all' | 'internal' | 'external'>('all');
  const [analysisView, setAnalysisView] = useState<'equipment' | 'repairType'>('equipment');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<FaultOrder | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<FaultOrder | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<FaultOrder | null>(null);
  const [showTrackModal, setShowTrackModal] = useState<FaultOrder | null>(null);
  const [showSettleModal, setShowSettleModal] = useState<FaultOrder | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<FaultOrder | null>(null);
  const [approvalForm, setApprovalForm] = useState({ remark: '', approver: '' });
  const [newFault, setNewFault] = useState({
    equipmentId: '',
    title: '',
    description: '',
    level: 'normal' as FaultLevel,
    reporter: '',
    repairType: 'internal' as 'internal' | 'external',
  });
  const [assignForm, setAssignForm] = useState({
    assignee: '',
    repairType: 'internal' as 'internal' | 'external',
    externalVendor: '',
    externalContact: '',
    externalArrivalTime: '',
    externalStatus: 'contacted' as ExternalTrackStatus,
  });
  const [completeForm, setCompleteForm] = useState({
    downtime: '',
    cost: '',
    accidentRelated: '',
    repairRemark: '',
  });
  const [trackForm, setTrackForm] = useState({
    status: 'contacted' as ExternalTrackStatus,
    remark: '',
    operator: '',
    quoteAmount: '',
    estimatedCompletion: '',
    attachmentNote: '',
  });
  const [settleForm, setSettleForm] = useState({
    downtime: '',
    cost: '',
    accidentRelated: '',
    repairRemark: '',
    acceptanceResult: 'passed' as AcceptanceResult,
    acceptanceRemark: '',
  });

  const stats = useMemo(() => {
    const total = faultOrders.length;
    const pending = faultOrders.filter(f => f.status === 'pending').length;
    const processing = faultOrders.filter(f => f.status === 'processing').length;
    const completed = faultOrders.filter(f => f.status === 'completed').length;
    const totalCost = faultOrders.reduce((sum, f) => sum + (f.cost || 0), 0);
    const pendingApproval = faultOrders.filter(f => f.approvalStatus === 'pending').length;
    return { total, pending, processing, completed, totalCost, pendingApproval };
  }, [faultOrders]);

  const impactAnalysisByEquipment = useMemo(() => {
    const byEquipment: Record<string, {
      name: string;
      downtime: number;
      cost: number;
      count: number;
      externalCount: number;
      pendingCount: number;
      externalRate: string;
    }> = {};

    faultOrders.forEach(f => {
      const key = f.equipmentId;
      if (!byEquipment[key]) {
        byEquipment[key] = {
          name: getEquipmentNameById(key),
          downtime: 0,
          cost: 0,
          count: 0,
          externalCount: 0,
          pendingCount: 0,
          externalRate: '0',
        };
      }
      byEquipment[key].downtime += f.downtime || 0;
      byEquipment[key].cost += f.cost || 0;
      byEquipment[key].count += 1;
      if (f.repairType === 'external') byEquipment[key].externalCount += 1;
      if (f.status === 'pending') byEquipment[key].pendingCount += 1;
    });

    return Object.values(byEquipment).sort((a, b) => b.downtime - a.downtime).map(item => ({
      ...item,
      externalRate: item.count > 0 ? ((item.externalCount / item.count) * 100).toFixed(1) : '0',
    }));
  }, [faultOrders, getEquipmentNameById]);

  const impactAnalysisByRepairType = useMemo(() => {
    const types: ('internal' | 'external')[] = ['internal', 'external'];
    return types.map(type => {
      const filtered = faultOrders.filter(f => f.repairType === type);
      const downtime = filtered.reduce((sum, f) => sum + (f.downtime || 0), 0);
      const cost = filtered.reduce((sum, f) => sum + (f.cost || 0), 0);
      const pendingCount = filtered.filter(f => f.status === 'pending').length;
      const externalCount = type === 'external' ? filtered.length : 0;
      return {
        name: type === 'internal' ? '内部维修' : '外协维修',
        type,
        downtime,
        cost,
        count: filtered.length,
        externalCount,
        pendingCount,
        externalRate: type === 'external' ? '100.0' : '0.0',
      };
    }).sort((a, b) => b.downtime - a.downtime);
  }, [faultOrders]);

  const currentAnalysisData = analysisView === 'equipment' ? impactAnalysisByEquipment : impactAnalysisByRepairType;

  const filteredFaults = useMemo(() => {
    return faultOrders.filter(f => {
      const matchStatus = statusFilter === 'all' || f.status === statusFilter;
      const matchLevel = levelFilter === 'all' || f.level === levelFilter;
      const matchEquipment = equipmentFilter === 'all' || f.equipmentId === equipmentFilter;
      const matchRepairType = repairTypeFilter === 'all' || f.repairType === repairTypeFilter;
      return matchStatus && matchLevel && matchEquipment && matchRepairType;
    }).sort((a, b) => b.reportTime.localeCompare(a.reportTime));
  }, [faultOrders, statusFilter, levelFilter, equipmentFilter, repairTypeFilter]);

  const handleAddFault = () => {
    if (!newFault.equipmentId || !newFault.title || !newFault.description || !newFault.reporter) return;
    addFaultOrder({
      ...newFault,
      status: 'pending',
      reportTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      trackRecords: [],
      approvalStatus: 'none',
    });
    setShowAddModal(false);
    setNewFault({ equipmentId: '', title: '', description: '', level: 'normal', reporter: '', repairType: 'internal' });
  };

  const handleAssign = () => {
    if (!showAssignModal || !assignForm.assignee) return;
    const updates: Partial<FaultOrder> = {
      assignee: assignForm.assignee,
      repairType: assignForm.repairType,
      status: 'processing',
    };
    if (assignForm.repairType === 'external') {
      updates.externalVendor = assignForm.externalVendor;
      updates.externalContact = assignForm.externalContact;
      updates.externalArrivalTime = assignForm.externalArrivalTime;
      updates.externalStatus = assignForm.externalStatus;
      updates.trackRecords = [];
      updates.lastFollowTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
    }
    updateFaultOrder(showAssignModal.id, updates);
    setShowAssignModal(null);
    setAssignForm({ assignee: '', repairType: 'internal', externalVendor: '', externalContact: '', externalArrivalTime: '', externalStatus: 'contacted' });
  };

  const handleComplete = () => {
    if (!showCompleteModal) return;
    const cost = completeForm.cost ? parseFloat(completeForm.cost) : 0;
    const needsApproval = cost >= APPROVAL_THRESHOLD;
    const updates: Partial<FaultOrder> = {
      status: 'completed',
    };
    if (completeForm.downtime) updates.downtime = parseFloat(completeForm.downtime);
    if (completeForm.cost) updates.cost = cost;
    if (completeForm.accidentRelated) updates.accidentRelated = completeForm.accidentRelated;
    if (completeForm.repairRemark) updates.repairRemark = completeForm.repairRemark;
    if (needsApproval) {
      updates.approvalStatus = 'pending';
    } else {
      updates.approvalStatus = 'none';
    }
    updateFaultOrder(showCompleteModal.id, updates);
    setShowCompleteModal(null);
    setCompleteForm({ downtime: '', cost: '', accidentRelated: '', repairRemark: '' });
  };

  const handleAddTrack = () => {
    if (!showTrackModal || !trackForm.remark || !trackForm.operator) return;
    addTrackRecord(showTrackModal.id, {
      status: trackForm.status,
      remark: trackForm.remark,
      operator: trackForm.operator,
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      quoteAmount: trackForm.quoteAmount ? parseFloat(trackForm.quoteAmount) : undefined,
      estimatedCompletion: trackForm.estimatedCompletion || undefined,
      attachmentNote: trackForm.attachmentNote || undefined,
    });
    setShowTrackModal(null);
    setTrackForm({ status: 'contacted', remark: '', operator: '', quoteAmount: '', estimatedCompletion: '', attachmentNote: '' });
  };

  const handleSettle = () => {
    if (!showSettleModal) return;
    const cost = settleForm.cost ? parseFloat(settleForm.cost) : 0;
    const needsApproval = cost >= APPROVAL_THRESHOLD;
    const updates: Partial<FaultOrder> = {};
    if (settleForm.downtime) updates.downtime = parseFloat(settleForm.downtime);
    if (settleForm.cost) updates.cost = cost;
    if (settleForm.accidentRelated) updates.accidentRelated = settleForm.accidentRelated;
    if (settleForm.repairRemark) updates.repairRemark = settleForm.repairRemark;
    updates.acceptanceResult = settleForm.acceptanceResult;
    if (settleForm.acceptanceRemark) updates.acceptanceRemark = settleForm.acceptanceRemark;
    
    const currentOrder = faultOrders.find(f => f.id === showSettleModal.id);
    const wasApproved = currentOrder?.approvalStatus === 'approved';
    
    if (needsApproval && !wasApproved) {
      updates.approvalStatus = 'pending';
    }
    
    updateFaultOrder(showSettleModal.id, updates);
    setShowSettleModal(null);
    setSettleForm({ downtime: '', cost: '', accidentRelated: '', repairRemark: '', acceptanceResult: 'passed', acceptanceRemark: '' });
  };

  const handleApprove = () => {
    if (!showApprovalModal || !approvalForm.approver) return;
    approveFaultOrder(showApprovalModal.id, approvalForm.approver, approvalForm.remark);
    setShowApprovalModal(null);
    setApprovalForm({ remark: '', approver: '' });
  };

  const handleReject = () => {
    if (!showApprovalModal || !approvalForm.approver || !approvalForm.remark) return;
    rejectFaultOrder(showApprovalModal.id, approvalForm.approver, approvalForm.remark);
    setShowApprovalModal(null);
    setApprovalForm({ remark: '', approver: '' });
  };

  const handleEquipmentClick = (equipmentId: string) => {
    setEquipmentFilter(equipmentId);
  };

  const handleRepairTypeClick = (type: 'internal' | 'external') => {
    setRepairTypeFilter(type);
  };

  const clearAllFilters = () => {
    setEquipmentFilter('all');
    setRepairTypeFilter('all');
  };

  const openSettleModal = (fault: FaultOrder) => {
    setShowSettleModal(fault);
    setSettleForm({
      downtime: fault.downtime?.toString() || '',
      cost: fault.cost?.toString() || '',
      accidentRelated: fault.accidentRelated || '',
      repairRemark: fault.repairRemark || '',
      acceptanceResult: fault.acceptanceResult || 'passed',
      acceptanceRemark: fault.acceptanceRemark || '',
    });
  };

  const openApprovalModal = (fault: FaultOrder) => {
    setShowApprovalModal(fault);
    setApprovalForm({ remark: '', approver: '' });
  };

  const openAssignModal = (fault: FaultOrder) => {
    setShowAssignModal(fault);
    setAssignForm({
      assignee: fault.assignee || '',
      repairType: fault.repairType || 'internal',
      externalVendor: fault.externalVendor || '',
      externalContact: fault.externalContact || '',
      externalArrivalTime: fault.externalArrivalTime || '',
      externalStatus: fault.externalStatus || 'contacted',
    });
  };

  const getApprovalBadgeColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-800">故障维修</h1>
          <p className="text-sm text-industrial-500 mt-1">故障工单管理、维修派单、外协跟踪与费用审批</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增故障
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard title="总工单" value={stats.total} icon={Wrench} color="blue" />
        <StatCard title="待派单" value={stats.pending} icon={Clock} color="orange" />
        <StatCard title="处理中" value={stats.processing} icon={AlertTriangle} color="purple" />
        <StatCard title="已完成" value={stats.completed} icon={CheckCircle} color="green" />
        <StatCard title="待审批" value={stats.pendingApproval} icon={Clock} color="blue" />
        <StatCard title="维修成本" value={`¥${stats.totalCost.toLocaleString()}`} icon={DollarSign} color="orange" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-industrial-800">故障影响分析</h2>
          <div className="flex items-center gap-4">
            <div className="flex bg-industrial-100 rounded-lg p-1">
              <button
                onClick={() => setAnalysisView('equipment')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                  analysisView === 'equipment'
                    ? 'bg-white text-primary-900 shadow-sm'
                    : 'text-industrial-600 hover:text-industrial-800'
                }`}
              >
                <Monitor className="w-4 h-4" />
                按设备
              </button>
              <button
                onClick={() => setAnalysisView('repairType')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                  analysisView === 'repairType'
                    ? 'bg-white text-primary-900 shadow-sm'
                    : 'text-industrial-600 hover:text-industrial-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                按维修类型
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-industrial-500">
              <TrendingDown className="w-4 h-4" />
              点击卡片可筛选对应工单
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="downtime" name="停机小时" fill="#E94560" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {currentAnalysisData.map((item, idx) => {
              const isEquipmentView = analysisView === 'equipment';
              const eqId = isEquipmentView
                ? equipments.find(e => getEquipmentNameById(e.id) === item.name)?.id || 'all'
                : 'all';
              const isSelected = isEquipmentView
                ? equipmentFilter === eqId
                : repairTypeFilter === (item as any).type;
              return (
                <div
                  key={item.name}
                  onClick={() => isEquipmentView ? handleEquipmentClick(eqId) : handleRepairTypeClick((item as any).type)}
                  className={`p-3 rounded-industrial cursor-pointer transition-all ${
                    isSelected ? 'bg-primary-50 border border-primary-200' : 'bg-industrial-50 hover:bg-industrial-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-900 text-white text-xs flex items-center justify-center font-medium">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-industrial-800">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-accent-orange">{item.downtime}h</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                    <div className="text-center">
                      <p className="text-industrial-500">故障数</p>
                      <p className="font-medium text-industrial-800">{item.count}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-industrial-500">成本</p>
                      <p className="font-medium text-industrial-800">¥{(item.cost / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="text-center">
                      <p className="text-industrial-500">外协占比</p>
                      <p className="font-medium text-industrial-800">{item.externalRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-industrial-500">待派单</p>
                      <p className="font-medium text-accent-orange">{item.pendingCount}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <input type="text" placeholder="搜索工单标题、设备..." className="input-field pl-10" />
          </div>
          <div className="flex gap-3 flex-wrap">
            {(equipmentFilter !== 'all' || repairTypeFilter !== 'all') && (
              <button
                onClick={clearAllFilters}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <X className="w-3.5 h-3.5" />
                清除筛选
              </button>
            )}
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
            <select
              className="input-field w-36"
              value={repairTypeFilter}
              onChange={(e) => setRepairTypeFilter(e.target.value as 'all' | 'internal' | 'external')}
            >
              <option value="all">全部类型</option>
              <option value="internal">内部维修</option>
              <option value="external">外协维修</option>
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
                <th>审批状态</th>
                <th>处理人</th>
                <th>维修类型</th>
                <th>外协状态</th>
                <th>最近跟进</th>
                <th>报价金额</th>
                <th>停机时间</th>
                <th>维修成本</th>
                <th>关联事故</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaults.map(fault => (
                <tr key={fault.id} className="cursor-pointer" onClick={() => setShowDetailModal(fault)}>
                  <td className="font-mono text-sm text-primary-700">{fault.id.toUpperCase()}</td>
                  <td className="font-medium text-industrial-800">{fault.title}</td>
                  <td>{getEquipmentNameById(fault.equipmentId)}</td>
                  <td><StatusBadge status={fault.level} type="fault-level" /></td>
                  <td><StatusBadge status={fault.status} type="fault-status" /></td>
                  <td>
                    {fault.approvalStatus && fault.approvalStatus !== 'none' ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getApprovalBadgeColor(fault.approvalStatus)}`}>
                        {ApprovalStatusLabels[fault.approvalStatus]}
                      </span>
                    ) : (
                      <span className="text-industrial-300 text-xs">-</span>
                    )}
                  </td>
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
                  <td>
                    <span className={fault.repairType === 'external' ? 'text-purple-600 text-xs' : 'text-primary-600 text-xs'}>
                      {fault.repairType === 'internal' ? '内部维修' : '外协维修'}
                    </span>
                  </td>
                  <td>
                    {fault.repairType === 'external' && fault.externalStatus ? (
                      <span className="text-xs text-industrial-600 font-medium">
                        {ExternalTrackStatusLabels[fault.externalStatus]}
                      </span>
                    ) : (
                      <span className="text-industrial-300 text-xs">-</span>
                    )}
                  </td>
                  <td>
                    {fault.lastFollowTime ? (
                      <span className="text-xs text-industrial-500">{fault.lastFollowTime.slice(5, 16)}</span>
                    ) : (
                      <span className="text-industrial-300 text-xs">-</span>
                    )}
                  </td>
                  <td>
                    {fault.latestQuoteAmount ? (
                      <span className="text-xs font-medium text-accent-teal">¥{fault.latestQuoteAmount.toLocaleString()}</span>
                    ) : (
                      <span className="text-industrial-300 text-xs">-</span>
                    )}
                  </td>
                  <td>
                    {fault.downtime ? (
                      <span className="text-sm font-medium text-accent-orange">{fault.downtime}h</span>
                    ) : (
                      <span className="text-industrial-300 text-sm">-</span>
                    )}
                  </td>
                  <td>
                    {fault.cost ? (
                      <span className="text-sm font-medium text-accent-teal">¥{fault.cost.toLocaleString()}</span>
                    ) : (
                      <span className="text-industrial-300 text-sm">-</span>
                    )}
                  </td>
                  <td>
                    {fault.accidentRelated ? (
                      <span className="text-xs text-accent-orange truncate max-w-24 block">{fault.accidentRelated}</span>
                    ) : (
                      <span className="text-industrial-300 text-sm">-</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {fault.status === 'pending' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openAssignModal(fault); }}
                          className="p-1.5 text-accent-teal hover:bg-accent-teal/10 rounded transition-colors"
                          title="派单"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      {fault.status === 'processing' && fault.repairType === 'external' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowTrackModal(fault); }}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="外协跟踪"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      )}
                      {fault.status === 'processing' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowCompleteModal(fault); }}
                          className="p-1.5 text-accent-teal hover:bg-accent-teal/10 rounded transition-colors"
                          title="完成维修"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {fault.status === 'completed' && fault.approvalStatus === 'pending' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openApprovalModal(fault); }}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                          title="费用审批"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {fault.status === 'completed' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openSettleModal(fault); }}
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="维修结算"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDetailModal(fault); }}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="查看详情"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
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
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="form-label">维修类型</label>
                  <select
                    className="input-field"
                    value={newFault.repairType}
                    onChange={(e) => setNewFault(prev => ({ ...prev, repairType: e.target.value as 'internal' | 'external' }))}
                  >
                    <option value="internal">内部维修</option>
                    <option value="external">外协维修</option>
                  </select>
                </div>
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
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">取消</button>
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

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">维修派单</h3>
              <button
                onClick={() => setShowAssignModal(null)}
                className="p-1 hover:bg-industrial-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-primary-50 rounded-industrial">
                <p className="text-sm text-primary-700">
                  <span className="font-medium">{showAssignModal.title}</span>
                  <span className="mx-2">·</span>
                  {getEquipmentNameById(showAssignModal.equipmentId)}
                </p>
              </div>
              <div>
                <label className="form-label">处理人</label>
                <select
                  className="input-field"
                  value={assignForm.assignee}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, assignee: e.target.value }))}
                >
                  <option value="">请选择处理人</option>
                  <option value="张工">张工（机械）</option>
                  <option value="李工">李工（电气）</option>
                  <option value="王工">王工（液压）</option>
                  <option value="赵工">赵工（综合）</option>
                </select>
              </div>
              <div>
                <label className="form-label">维修类型</label>
                <div className="flex gap-3">
                  {(['internal', 'external'] as const).map(type => (
                    <label key={type} className="flex-1">
                      <input
                        type="radio"
                        name="repairType"
                        value={type}
                        checked={assignForm.repairType === type}
                        onChange={(e) => setAssignForm(prev => ({ ...prev, repairType: e.target.value as 'internal' | 'external' }))}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-industrial border-2 cursor-pointer transition-all text-center ${
                        assignForm.repairType === type
                          ? 'border-primary-900 bg-primary-50 text-primary-900'
                          : 'border-industrial-200 hover:border-primary-300'
                      }`}>
                        {type === 'internal' ? '内部维修' : '外协维修'}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {assignForm.repairType === 'external' && (
                <>
                  <div>
                    <label className="form-label">外协单位</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="请输入外协单位名称"
                      value={assignForm.externalVendor}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, externalVendor: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">联系人</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="联系人姓名及电话"
                      value={assignForm.externalContact}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, externalContact: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">预计到场时间</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={assignForm.externalArrivalTime}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, externalArrivalTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">当前进度</label>
                    <select
                      className="input-field"
                      value={assignForm.externalStatus}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, externalStatus: e.target.value as ExternalTrackStatus }))}
                    >
                      {Object.entries(ExternalTrackStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button onClick={() => setShowAssignModal(null)} className="btn-secondary">取消</button>
              <button
                onClick={handleAssign}
                className="btn-primary flex items-center gap-2"
                disabled={!assignForm.assignee}
              >
                <Save className="w-4 h-4" />
                确认派单
              </button>
            </div>
          </div>
        </div>
      )}

      {showTrackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">外协进度跟踪</h3>
              <button
                onClick={() => setShowTrackModal(null)}
                className="p-1 hover:bg-industrial-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-purple-50 rounded-industrial">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">{showTrackModal.title}</span>
                  <span className="mx-2">·</span>
                  外协单位：{showTrackModal.externalVendor}
                </p>
              </div>
              <div>
                <label className="form-label">当前进度</label>
                <select
                  className="input-field"
                  value={trackForm.status}
                  onChange={(e) => setTrackForm(prev => ({ ...prev, status: e.target.value as ExternalTrackStatus }))}
                >
                  {Object.entries(ExternalTrackStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">报价金额 (元)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    placeholder="选填"
                    value={trackForm.quoteAmount}
                    onChange={(e) => setTrackForm(prev => ({ ...prev, quoteAmount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">预计完工时间</label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={trackForm.estimatedCompletion}
                    onChange={(e) => setTrackForm(prev => ({ ...prev, estimatedCompletion: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">进度说明</label>
                <textarea
                  className="input-field h-20 resize-none"
                  placeholder="请描述当前进展情况..."
                  value={trackForm.remark}
                  onChange={(e) => setTrackForm(prev => ({ ...prev, remark: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">附件说明 (选填)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="相关文件或照片说明"
                  value={trackForm.attachmentNote}
                  onChange={(e) => setTrackForm(prev => ({ ...prev, attachmentNote: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">记录人</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="您的姓名"
                  value={trackForm.operator}
                  onChange={(e) => setTrackForm(prev => ({ ...prev, operator: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button onClick={() => setShowTrackModal(null)} className="btn-secondary">取消</button>
              <button
                onClick={handleAddTrack}
                className="btn-primary flex items-center gap-2"
                disabled={!trackForm.remark || !trackForm.operator}
              >
                <Send className="w-4 h-4" />
                记录进度
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">完成维修</h3>
              <button
                onClick={() => setShowCompleteModal(null)}
                className="p-1 hover:bg-industrial-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-accent-teal/10 rounded-industrial">
                <p className="text-sm text-accent-teal">
                  <span className="font-medium">{showCompleteModal.title}</span>
                  <span className="mx-2">·</span>
                  处理人：{showCompleteModal.assignee}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-industrial">
                <p className="text-xs text-yellow-700">
                  <span className="font-medium">提示：</span>维修成本 ≥ ¥{APPROVAL_THRESHOLD.toLocaleString()} 将自动进入待审批状态
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">停机小时</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="input-field"
                    placeholder="例如：4.5"
                    value={completeForm.downtime}
                    onChange={(e) => setCompleteForm(prev => ({ ...prev, downtime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">维修成本 (元)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    placeholder="例如：1500"
                    value={completeForm.cost}
                    onChange={(e) => setCompleteForm(prev => ({ ...prev, cost: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">关联事故 (选填)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="如有，请输入事故编号或说明"
                  value={completeForm.accidentRelated}
                  onChange={(e) => setCompleteForm(prev => ({ ...prev, accidentRelated: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">维修说明 (选填)</label>
                <textarea
                  className="input-field h-20 resize-none"
                  placeholder="维修过程说明..."
                  value={completeForm.repairRemark}
                  onChange={(e) => setCompleteForm(prev => ({ ...prev, repairRemark: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button onClick={() => setShowCompleteModal(null)} className="btn-secondary">取消</button>
              <button onClick={handleComplete} className="btn-primary flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">维修结算</h3>
              <button
                onClick={() => setShowSettleModal(null)}
                className="p-1 hover:bg-industrial-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-primary-50 rounded-industrial">
                <p className="text-sm text-primary-700">
                  <span className="font-medium">{showSettleModal.title}</span>
                  <span className="mx-2">·</span>
                  {getEquipmentNameById(showSettleModal.equipmentId)}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-industrial">
                <p className="text-xs text-yellow-700">
                  <span className="font-medium">提示：</span>维修成本 ≥ ¥{APPROVAL_THRESHOLD.toLocaleString()} 将自动进入待审批状态
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">停机小时</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="input-field"
                    value={settleForm.downtime}
                    onChange={(e) => setSettleForm(prev => ({ ...prev, downtime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">维修成本 (元)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={settleForm.cost}
                    onChange={(e) => setSettleForm(prev => ({ ...prev, cost: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">关联事故</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="如有，请输入事故编号或说明"
                  value={settleForm.accidentRelated}
                  onChange={(e) => setSettleForm(prev => ({ ...prev, accidentRelated: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">维修说明</label>
                <textarea
                  className="input-field h-20 resize-none"
                  placeholder="维修过程说明..."
                  value={settleForm.repairRemark}
                  onChange={(e) => setSettleForm(prev => ({ ...prev, repairRemark: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">验收结果</label>
                <div className="flex gap-3">
                  {(['passed', 'failed', 'pending'] as const).map(result => (
                    <label key={result} className="flex-1">
                      <input
                        type="radio"
                        name="acceptance"
                        value={result}
                        checked={settleForm.acceptanceResult === result}
                        onChange={(e) => setSettleForm(prev => ({ ...prev, acceptanceResult: e.target.value as AcceptanceResult }))}
                        className="sr-only"
                      />
                      <div className={`p-2 rounded-industrial border-2 cursor-pointer transition-all text-center text-sm ${
                        settleForm.acceptanceResult === result
                          ? result === 'passed'
                            ? 'border-accent-teal bg-accent-teal/10 text-accent-teal'
                            : result === 'failed'
                            ? 'border-accent-orange bg-accent-orange/10 text-accent-orange'
                            : 'border-industrial-400 bg-industrial-50 text-industrial-700'
                          : 'border-industrial-200 hover:border-primary-300'
                      }`}>
                        {AcceptanceResultLabels[result]}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">验收备注</label>
                <textarea
                  className="input-field h-16 resize-none"
                  placeholder="验收意见..."
                  value={settleForm.acceptanceRemark}
                  onChange={(e) => setSettleForm(prev => ({ ...prev, acceptanceRemark: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button onClick={() => setShowSettleModal(null)} className="btn-secondary">取消</button>
              <button onClick={handleSettle} className="btn-primary flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                保存结算
              </button>
            </div>
          </div>
        </div>
      )}

      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">费用审批</h3>
              <button
                onClick={() => setShowApprovalModal(null)}
                className="p-1 hover:bg-industrial-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-yellow-50 rounded-industrial space-y-2">
                <p className="text-sm text-yellow-800 font-medium">{showApprovalModal.title}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-yellow-600">设备：</span>
                    <span className="text-yellow-800">{getEquipmentNameById(showApprovalModal.equipmentId)}</span>
                  </div>
                  <div>
                    <span className="text-yellow-600">维修成本：</span>
                    <span className="text-yellow-800 font-medium">¥{showApprovalModal.cost?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-yellow-600">停机小时：</span>
                    <span className="text-yellow-800">{showApprovalModal.downtime}h</span>
                  </div>
                  <div>
                    <span className="text-yellow-600">处理人：</span>
                    <span className="text-yellow-800">{showApprovalModal.assignee}</span>
                  </div>
                </div>
                {showApprovalModal.accidentRelated && (
                  <div className="text-sm">
                    <span className="text-yellow-600">关联事故：</span>
                    <span className="text-yellow-800">{showApprovalModal.accidentRelated}</span>
                  </div>
                )}
              </div>
              {showApprovalModal.trackRecords && showApprovalModal.trackRecords.length > 0 && (
                <div className="p-3 bg-purple-50 rounded-industrial">
                  <p className="text-sm text-purple-700 font-medium mb-2">外协记录</p>
                  {showApprovalModal.trackRecords.slice().reverse().slice(0, 3).map(record => (
                    <div key={record.id} className="text-xs text-purple-600 mb-1">
                      <span className="font-medium">{ExternalTrackStatusLabels[record.status]}</span>
                      <span className="mx-1">·</span>
                      {record.remark}
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="form-label">审批人</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="您的姓名"
                  value={approvalForm.approver}
                  onChange={(e) => setApprovalForm(prev => ({ ...prev, approver: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">审批意见</label>
                <textarea
                  className="input-field h-20 resize-none"
                  placeholder="请填写审批意见（退回时必填）"
                  value={approvalForm.remark}
                  onChange={(e) => setApprovalForm(prev => ({ ...prev, remark: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-between p-6 border-t border-industrial-100 bg-industrial-50">
              <button
                onClick={handleReject}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                disabled={!approvalForm.approver || !approvalForm.remark}
              >
                <ThumbsDown className="w-4 h-4" />
                退回
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                disabled={!approvalForm.approver}
              >
                <ThumbsUp className="w-4 h-4" />
                通过
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
                {showDetailModal.approvalStatus && showDetailModal.approvalStatus !== 'none' && (
                  <div>
                    <p className="text-sm text-industrial-500">审批状态</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getApprovalBadgeColor(showDetailModal.approvalStatus)}`}>
                      {ApprovalStatusLabels[showDetailModal.approvalStatus]}
                    </span>
                  </div>
                )}
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
                {showDetailModal.repairType === 'external' && (
                  <>
                    <div>
                      <p className="text-sm text-industrial-500">外协单位</p>
                      <p className="font-medium text-industrial-800">{showDetailModal.externalVendor || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-industrial-500">联系人</p>
                      <p className="font-medium text-industrial-800">{showDetailModal.externalContact || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-industrial-500">预计到场</p>
                      <p className="font-medium text-industrial-800">{showDetailModal.externalArrivalTime || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-industrial-500">外协进度</p>
                      <p className="font-medium text-purple-600">
                        {showDetailModal.externalStatus ? ExternalTrackStatusLabels[showDetailModal.externalStatus] : '-'}
                      </p>
                    </div>
                    {showDetailModal.lastFollowTime && (
                      <div>
                        <p className="text-sm text-industrial-500">最近跟进时间</p>
                        <p className="font-medium text-industrial-800">{showDetailModal.lastFollowTime}</p>
                      </div>
                    )}
                    {showDetailModal.latestQuoteAmount && (
                      <div>
                        <p className="text-sm text-industrial-500">最新报价</p>
                        <p className="font-medium text-accent-teal">¥{showDetailModal.latestQuoteAmount.toLocaleString()}</p>
                      </div>
                    )}
                  </>
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
                    <p className="font-medium text-accent-orange">{showDetailModal.accidentRelated}</p>
                  </div>
                )}
                {showDetailModal.acceptanceResult && (
                  <div>
                    <p className="text-sm text-industrial-500">验收结果</p>
                    <p className={`font-medium ${
                      showDetailModal.acceptanceResult === 'passed' ? 'text-accent-teal' :
                      showDetailModal.acceptanceResult === 'failed' ? 'text-accent-orange' : 'text-industrial-600'
                    }`}>
                      {AcceptanceResultLabels[showDetailModal.acceptanceResult]}
                    </p>
                  </div>
                )}
                {showDetailModal.approver && (
                  <div>
                    <p className="text-sm text-industrial-500">审批人</p>
                    <p className="font-medium text-industrial-800">{showDetailModal.approver}</p>
                  </div>
                )}
                {showDetailModal.approvalTime && (
                  <div>
                    <p className="text-sm text-industrial-500">审批时间</p>
                    <p className="font-medium text-industrial-800">{showDetailModal.approvalTime}</p>
                  </div>
                )}
              </div>

              {showDetailModal.repairRemark && (
                <div>
                  <p className="text-sm text-industrial-500 mb-1">维修说明</p>
                  <div className="p-3 bg-industrial-50 rounded-industrial">
                    <p className="text-sm text-industrial-700">{showDetailModal.repairRemark}</p>
                  </div>
                </div>
              )}

              {showDetailModal.acceptanceRemark && (
                <div>
                  <p className="text-sm text-industrial-500 mb-1">验收备注</p>
                  <div className="p-3 bg-industrial-50 rounded-industrial">
                    <p className="text-sm text-industrial-700">{showDetailModal.acceptanceRemark}</p>
                  </div>
                </div>
              )}

              {showDetailModal.approvalRemark && (
                <div>
                  <p className="text-sm text-industrial-500 mb-1">审批意见</p>
                  <div className="p-3 bg-industrial-50 rounded-industrial">
                    <p className="text-sm text-industrial-700">{showDetailModal.approvalRemark}</p>
                  </div>
                </div>
              )}

              {showDetailModal.trackRecords && showDetailModal.trackRecords.length > 0 && (
                <div>
                  <p className="text-sm text-industrial-500 mb-3 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    外协跟踪记录
                  </p>
                  <div className="space-y-3">
                    {showDetailModal.trackRecords.slice().reverse().map((record, idx) => (
                      <div key={record.id} className="relative pl-6 pb-3 border-l-2 border-purple-200 last:border-0">
                        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-purple-500" />
                        <div className="bg-purple-50 p-3 rounded-industrial">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-purple-700">
                              {ExternalTrackStatusLabels[record.status]}
                            </span>
                            <span className="text-xs text-industrial-500">{record.time}</span>
                          </div>
                          <p className="text-sm text-industrial-700">{record.remark}</p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs">
                            {record.quoteAmount && (
                              <span className="text-accent-teal font-medium">报价：¥{record.quoteAmount.toLocaleString()}</span>
                            )}
                            {record.estimatedCompletion && (
                              <span className="text-industrial-600">预计完工：{record.estimatedCompletion}</span>
                            )}
                            {record.attachmentNote && (
                              <span className="text-industrial-600">附件：{record.attachmentNote}</span>
                            )}
                          </div>
                          <p className="text-xs text-industrial-500 mt-1">记录人：{record.operator}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between p-6 border-t border-industrial-100 bg-industrial-50">
              <div className="flex gap-2 flex-wrap">
                {showDetailModal.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(null);
                      openAssignModal(showDetailModal);
                    }}
                    className="btn-primary"
                  >
                    派单处理
                  </button>
                )}
                {showDetailModal.status === 'processing' && showDetailModal.repairType === 'external' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(null);
                      setShowTrackModal(showDetailModal);
                    }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    外协跟踪
                  </button>
                )}
                {showDetailModal.status === 'processing' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(null);
                      setShowCompleteModal(showDetailModal);
                    }}
                    className="btn-primary"
                  >
                    完成维修
                  </button>
                )}
                {showDetailModal.status === 'completed' && showDetailModal.approvalStatus === 'pending' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(null);
                      openApprovalModal(showDetailModal);
                    }}
                    className="btn-secondary flex items-center gap-2 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                  >
                    <Clock className="w-4 h-4" />
                    费用审批
                  </button>
                )}
                {showDetailModal.status === 'completed' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(null);
                      openSettleModal(showDetailModal);
                    }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    维修结算
                  </button>
                )}
              </div>
              <button onClick={() => setShowDetailModal(null)} className="btn-secondary">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}