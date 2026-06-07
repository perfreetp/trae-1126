import { useState, useMemo } from 'react';
import {
  Fuel,
  Circle,
  Plus,
  Search,
  Filter,
  Package,
  FileText,
  TrendingUp,
  DollarSign,
  X,
} from 'lucide-react';
import { useAppStore } from '../store';
import { StatCard } from '../components/StatCard';
import { OilTypeLabels, type OilType } from '../types';

export default function OilTire() {
  const {
    oilRecords,
    tireRecords,
    spareParts,
    sparePartRequests,
    equipments,
    addOilRecord,
    addTireRecord,
    addSparePartRequest,
    getEquipmentNameById,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'oil' | 'tire' | 'spare'>('oil');
  const [showAddOil, setShowAddOil] = useState(false);
  const [showAddTire, setShowAddTire] = useState(false);
  const [showAddSpare, setShowAddSpare] = useState(false);

  const [oilForm, setOilForm] = useState({
    equipmentId: '',
    type: 'diesel' as OilType,
    quantity: '',
    cost: '',
    operator: '',
  });

  const [tireForm, setTireForm] = useState({
    equipmentId: '',
    position: '',
    brand: '',
    cost: '',
    beforeMileage: '',
  });

  const [spareForm, setSpareForm] = useState({
    partId: '',
    partName: '',
    quantity: '',
    purpose: '',
    applicant: '',
  });

  const oilStats = useMemo(() => {
    const totalQuantity = oilRecords.reduce((sum, r) => sum + r.quantity, 0);
    const totalCost = oilRecords.reduce((sum, r) => sum + r.cost, 0);
    const dieselQty = oilRecords.filter(r => r.type === 'diesel').reduce((sum, r) => sum + r.quantity, 0);
    return { totalQuantity, totalCost, dieselQty };
  }, [oilRecords]);

  const tireStats = useMemo(() => {
    const totalCost = tireRecords.reduce((sum, r) => sum + r.cost, 0);
    const count = tireRecords.length;
    return { totalCost, count };
  }, [tireRecords]);

  const handleAddOil = () => {
    if (!oilForm.equipmentId || !oilForm.quantity || !oilForm.cost || !oilForm.operator) return;
    addOilRecord({
      equipmentId: oilForm.equipmentId,
      date: new Date().toISOString().split('T')[0],
      type: oilForm.type,
      quantity: Number(oilForm.quantity),
      cost: Number(oilForm.cost),
      operator: oilForm.operator,
    });
    setShowAddOil(false);
    setOilForm({ equipmentId: '', type: 'diesel', quantity: '', cost: '', operator: '' });
  };

  const handleAddTire = () => {
    if (!tireForm.equipmentId || !tireForm.position || !tireForm.brand || !tireForm.cost || !tireForm.beforeMileage) return;
    addTireRecord({
      equipmentId: tireForm.equipmentId,
      replaceDate: new Date().toISOString().split('T')[0],
      position: tireForm.position,
      brand: tireForm.brand,
      cost: Number(tireForm.cost),
      beforeMileage: Number(tireForm.beforeMileage),
    });
    setShowAddTire(false);
    setTireForm({ equipmentId: '', position: '', brand: '', cost: '', beforeMileage: '' });
  };

  const handleAddSpare = () => {
    if (!spareForm.partId || !spareForm.quantity || !spareForm.purpose || !spareForm.applicant) return;
    addSparePartRequest({
      partId: spareForm.partId,
      partName: spareForm.partName,
      quantity: Number(spareForm.quantity),
      applicant: spareForm.applicant,
      applyTime: new Date().toISOString(),
      status: 'pending',
      purpose: spareForm.purpose,
    });
    setShowAddSpare(false);
    setSpareForm({ partId: '', partName: '', quantity: '', purpose: '', applicant: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-800">油料轮胎</h1>
          <p className="text-sm text-industrial-500 mt-1">油料消耗、轮胎更换与备件管理</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['oil', 'tire', 'spare'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-industrial transition-all ${
              activeTab === tab
                ? 'bg-primary-900 text-white'
                : 'bg-white text-industrial-600 hover:bg-industrial-50 border border-industrial-200'
            }`}
          >
            {tab === 'oil' && <Fuel className="w-4 h-4" />}
            {tab === 'tire' && <Circle className="w-4 h-4" />}
            {tab === 'spare' && <Package className="w-4 h-4" />}
            {tab === 'oil' ? '油料管理' : tab === 'tire' ? '轮胎管理' : '备件申请'}
          </button>
        ))}
      </div>

      {activeTab === 'oil' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="总加油量"
              value={`${oilStats.totalQuantity} L`}
              icon={Fuel}
              color="blue"
            />
            <StatCard
              title="柴油用量"
              value={`${oilStats.dieselQty} L`}
              icon={Fuel}
              color="orange"
            />
            <StatCard
              title="油料总费用"
              value={`¥${oilStats.totalCost.toLocaleString()}`}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="加油记录数"
              value={oilRecords.length}
              icon={FileText}
              color="purple"
            />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-industrial-800">油料消耗记录</h2>
              <button
                onClick={() => setShowAddOil(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                录入加油
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>设备</th>
                    <th>油料类型</th>
                    <th>数量(L)</th>
                    <th>费用(元)</th>
                    <th>操作员</th>
                  </tr>
                </thead>
                <tbody>
                  {oilRecords.map(record => (
                    <tr key={record.id}>
                      <td>{record.date}</td>
                      <td>{getEquipmentNameById(record.equipmentId)}</td>
                      <td>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600">
                          {OilTypeLabels[record.type]}
                        </span>
                      </td>
                      <td>{record.quantity}</td>
                      <td>¥{record.cost.toLocaleString()}</td>
                      <td>{record.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'tire' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="轮胎更换次数"
              value={tireStats.count}
              icon={Circle}
              color="blue"
            />
            <StatCard
              title="轮胎总费用"
              value={`¥${tireStats.totalCost.toLocaleString()}`}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="平均单次费用"
              value={tireStats.count > 0 ? `¥${Math.round(tireStats.totalCost / tireStats.count).toLocaleString()}` : '-'}
              icon={TrendingUp}
              color="purple"
            />
            <StatCard
              title="在库设备"
              value={equipments.filter(e => e.type === 'tractor').length}
              icon={Circle}
              color="orange"
            />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-industrial-800">轮胎更换记录</h2>
              <button
                onClick={() => setShowAddTire(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                记录更换
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>更换日期</th>
                    <th>设备</th>
                    <th>位置</th>
                    <th>品牌</th>
                    <th>更换前里程</th>
                    <th>费用(元)</th>
                  </tr>
                </thead>
                <tbody>
                  {tireRecords.map(record => (
                    <tr key={record.id}>
                      <td>{record.replaceDate}</td>
                      <td>{getEquipmentNameById(record.equipmentId)}</td>
                      <td>{record.position}</td>
                      <td>{record.brand}</td>
                      <td>{record.beforeMileage.toLocaleString()} km</td>
                      <td>¥{record.cost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'spare' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-industrial-800">备件库存</h2>
              </div>
              <div className="space-y-3">
                {spareParts.map(part => (
                  <div key={part.id} className="flex items-center justify-between p-3 bg-industrial-50 rounded-industrial">
                    <div>
                      <p className="font-medium text-industrial-800">{part.name}</p>
                      <p className="text-xs text-industrial-500">{part.model} · {part.supplier}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${part.stock <= 3 ? 'text-accent-orange' : 'text-accent-teal'}`}>
                        库存 {part.stock}
                      </p>
                      <p className="text-xs text-industrial-500">¥{part.price.toLocaleString()}/件</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-industrial-800">备件申请</h2>
                <button
                  onClick={() => setShowAddSpare(true)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  申请
                </button>
              </div>
              <div className="space-y-3">
                {sparePartRequests.map(req => (
                  <div key={req.id} className="p-3 bg-industrial-50 rounded-industrial border-l-4 border-primary-500">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-industrial-800">{req.partName} × {req.quantity}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        req.status === 'approved' ? 'bg-accent-teal/10 text-accent-teal' :
                        req.status === 'rejected' ? 'bg-red-50 text-red-600' :
                        req.status === 'received' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {req.status === 'approved' ? '已批准' :
                         req.status === 'rejected' ? '已拒绝' :
                         req.status === 'received' ? '已领用' : '待审批'}
                      </span>
                    </div>
                    <p className="text-xs text-industrial-500">
                      {req.applicant} · {req.applyTime.split('T')[0]} · {req.purpose}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {showAddOil && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">录入加油记录</h3>
              <button onClick={() => setShowAddOil(false)} className="p-1 hover:bg-industrial-100 rounded">
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="form-label">设备</label>
                <select
                  className="input-field"
                  value={oilForm.equipmentId}
                  onChange={(e) => setOilForm(prev => ({ ...prev, equipmentId: e.target.value }))}
                >
                  <option value="">请选择设备</option>
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">油料类型</label>
                <select
                  className="input-field"
                  value={oilForm.type}
                  onChange={(e) => setOilForm(prev => ({ ...prev, type: e.target.value as OilType }))}
                >
                  {Object.entries(OilTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">数量(L)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={oilForm.quantity}
                    onChange={(e) => setOilForm(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">费用(元)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={oilForm.cost}
                    onChange={(e) => setOilForm(prev => ({ ...prev, cost: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">操作员</label>
                <input
                  type="text"
                  className="input-field"
                  value={oilForm.operator}
                  onChange={(e) => setOilForm(prev => ({ ...prev, operator: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button onClick={() => setShowAddOil(false)} className="btn-secondary">取消</button>
              <button onClick={handleAddOil} className="btn-primary">确认录入</button>
            </div>
          </div>
        </div>
      )}

      {showAddTire && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">记录轮胎更换</h3>
              <button onClick={() => setShowAddTire(false)} className="p-1 hover:bg-industrial-100 rounded">
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="form-label">设备</label>
                <select
                  className="input-field"
                  value={tireForm.equipmentId}
                  onChange={(e) => setTireForm(prev => ({ ...prev, equipmentId: e.target.value }))}
                >
                  <option value="">请选择设备</option>
                  {equipments.filter(e => e.type === 'tractor').map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">轮胎位置</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="如：前轮左、后轮右"
                  value={tireForm.position}
                  onChange={(e) => setTireForm(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">品牌</label>
                <input
                  type="text"
                  className="input-field"
                  value={tireForm.brand}
                  onChange={(e) => setTireForm(prev => ({ ...prev, brand: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">更换前里程(km)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={tireForm.beforeMileage}
                    onChange={(e) => setTireForm(prev => ({ ...prev, beforeMileage: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">费用(元)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={tireForm.cost}
                    onChange={(e) => setTireForm(prev => ({ ...prev, cost: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button onClick={() => setShowAddTire(false)} className="btn-secondary">取消</button>
              <button onClick={handleAddTire} className="btn-primary">确认记录</button>
            </div>
          </div>
        </div>
      )}

      {showAddSpare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">备件申请</h3>
              <button onClick={() => setShowAddSpare(false)} className="p-1 hover:bg-industrial-100 rounded">
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="form-label">备件</label>
                <select
                  className="input-field"
                  value={spareForm.partId}
                  onChange={(e) => {
                    const part = spareParts.find(p => p.id === e.target.value);
                    setSpareForm(prev => ({
                      ...prev,
                      partId: e.target.value,
                      partName: part?.name || '',
                    }));
                  }}
                >
                  <option value="">请选择备件</option>
                  {spareParts.map(part => (
                    <option key={part.id} value={part.id}>{part.name} ({part.model})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">申请数量</label>
                <input
                  type="number"
                  className="input-field"
                  value={spareForm.quantity}
                  onChange={(e) => setSpareForm(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">用途说明</label>
                <input
                  type="text"
                  className="input-field"
                  value={spareForm.purpose}
                  onChange={(e) => setSpareForm(prev => ({ ...prev, purpose: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">申请人</label>
                <input
                  type="text"
                  className="input-field"
                  value={spareForm.applicant}
                  onChange={(e) => setSpareForm(prev => ({ ...prev, applicant: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button onClick={() => setShowAddSpare(false)} className="btn-secondary">取消</button>
              <button onClick={handleAddSpare} className="btn-primary">提交申请</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
