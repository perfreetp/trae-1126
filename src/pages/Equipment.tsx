import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeftRight,
  X,
} from 'lucide-react';
import { useAppStore } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { EquipmentTypeLabels, type EquipmentType, type Equipment } from '../types';

export default function Equipment() {
  const { equipments, equipmentTransfers, addEquipmentTransfer, getEquipmentById } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<EquipmentType | 'all'>('all');
  const [showDetail, setShowDetail] = useState<Equipment | null>(null);
  const [showTransfer, setShowTransfer] = useState<Equipment | null>(null);
  const [transferForm, setTransferForm] = useState({ toBerth: '', reason: '' });

  const filteredEquipments = equipments.filter(eq => {
    const matchSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.berth.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'all' || eq.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleTransfer = () => {
    if (!showTransfer || !transferForm.toBerth || !transferForm.reason) return;
    addEquipmentTransfer({
      equipmentId: showTransfer.id,
      fromBerth: showTransfer.berth,
      toBerth: transferForm.toBerth,
      applicant: '管理员',
      applyTime: new Date().toISOString(),
      status: 'pending',
      reason: transferForm.reason,
    });
    setShowTransfer(null);
    setTransferForm({ toBerth: '', reason: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-800">设备台账</h1>
          <p className="text-sm text-industrial-500 mt-1">管理所有装卸设备的基础信息</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增设备
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <input
              type="text"
              placeholder="搜索设备名称、型号、泊位..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="input-field w-40"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as EquipmentType | 'all')}
            >
              <option value="all">全部类型</option>
              {Object.entries(EquipmentTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="w-4 h-4" />
              更多筛选
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>设备名称</th>
                <th>设备类型</th>
                <th>型号</th>
                <th>所在泊位</th>
                <th>累计运行</th>
                <th>状态</th>
                <th>购置日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipments.map(eq => (
                <tr key={eq.id}>
                  <td>
                    <span className="font-medium text-industrial-800">{eq.name}</span>
                  </td>
                  <td>{EquipmentTypeLabels[eq.type]}</td>
                  <td className="text-industrial-600">{eq.model}</td>
                  <td>{eq.berth}</td>
                  <td>{eq.totalHours.toLocaleString()} h</td>
                  <td>
                    <StatusBadge status={eq.status} type="equipment" />
                  </td>
                  <td className="text-industrial-600">{eq.purchaseDate}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowDetail(eq)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowTransfer(eq)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="设备调拨"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-industrial-500 hover:bg-industrial-100 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-industrial-100">
          <p className="text-sm text-industrial-500">共 {filteredEquipments.length} 条记录</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm border border-industrial-200 rounded-industrial hover:bg-industrial-50">上一页</button>
            <button className="px-3 py-1 text-sm bg-primary-900 text-white rounded-industrial">1</button>
            <button className="px-3 py-1 text-sm border border-industrial-200 rounded-industrial hover:bg-industrial-50">下一页</button>
          </div>
        </div>
      </div>

      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">设备详情</h3>
              <button
                onClick={() => setShowDetail(null)}
                className="p-1 hover:bg-industrial-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-industrial-500">设备名称</p>
                  <p className="font-medium text-industrial-800">{showDetail.name}</p>
                </div>
                <div>
                  <p className="text-sm text-industrial-500">设备类型</p>
                  <p className="font-medium text-industrial-800">{EquipmentTypeLabels[showDetail.type]}</p>
                </div>
                <div>
                  <p className="text-sm text-industrial-500">设备型号</p>
                  <p className="font-medium text-industrial-800">{showDetail.model}</p>
                </div>
                <div>
                  <p className="text-sm text-industrial-500">所在泊位</p>
                  <p className="font-medium text-industrial-800">{showDetail.berth}</p>
                </div>
                <div>
                  <p className="text-sm text-industrial-500">累计运行</p>
                  <p className="font-medium text-industrial-800">{showDetail.totalHours.toLocaleString()} 小时</p>
                </div>
                <div>
                  <p className="text-sm text-industrial-500">当前状态</p>
                  <StatusBadge status={showDetail.status} type="equipment" />
                </div>
                <div>
                  <p className="text-sm text-industrial-500">购置日期</p>
                  <p className="font-medium text-industrial-800">{showDetail.purchaseDate}</p>
                </div>
                <div>
                  <p className="text-sm text-industrial-500">所在区域</p>
                  <p className="font-medium text-industrial-800">{showDetail.location}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-industrial-700 mb-3">技术参数</h4>
                <div className="grid grid-cols-2 gap-3 bg-industrial-50 p-4 rounded-industrial">
                  {Object.entries(showDetail.specs).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-industrial-500">{key}</p>
                      <p className="text-sm font-medium text-industrial-800">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-industrial-700 mb-3">调拨记录</h4>
                <div className="space-y-2">
                  {equipmentTransfers
                    .filter(t => t.equipmentId === showDetail.id)
                    .map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-industrial-50 rounded-industrial">
                        <div>
                          <p className="text-sm text-industrial-800">{t.fromBerth} → {t.toBerth}</p>
                          <p className="text-xs text-industrial-500">{t.applyTime.split('T')[0]} · {t.applicant}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          t.status === 'completed' ? 'bg-accent-teal/10 text-accent-teal' :
                          t.status === 'approved' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {t.status === 'completed' ? '已完成' : t.status === 'approved' ? '已批准' : '待审批'}
                        </span>
                      </div>
                    ))}
                  {equipmentTransfers.filter(t => t.equipmentId === showDetail.id).length === 0 && (
                    <p className="text-sm text-industrial-400 text-center py-4">暂无调拨记录</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button
                onClick={() => setShowDetail(null)}
                className="btn-secondary"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">设备调拨</h3>
              <button
                onClick={() => setShowTransfer(null)}
                className="p-1 hover:bg-industrial-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-industrial-500">设备名称</p>
                <p className="font-medium text-industrial-800">{showTransfer.name}</p>
              </div>
              <div>
                <p className="text-sm text-industrial-500">当前泊位</p>
                <p className="font-medium text-industrial-800">{showTransfer.berth}</p>
              </div>
              <div>
                <label className="form-label">调至泊位</label>
                <select
                  className="input-field"
                  value={transferForm.toBerth}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, toBerth: e.target.value }))}
                >
                  <option value="">请选择</option>
                  {['1号泊位', '2号泊位', '3号泊位', '4号泊位', '堆场A1', '堆场A2', '堆场B1', '堆场B2', '全场区'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">调拨原因</label>
                <textarea
                  className="input-field h-24 resize-none"
                  placeholder="请输入调拨原因..."
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button
                onClick={() => setShowTransfer(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleTransfer}
                className="btn-primary"
                disabled={!transferForm.toBerth || !transferForm.reason}
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
