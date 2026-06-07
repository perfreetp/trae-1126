import { useState, useMemo } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Clock,
  X,
  Send,
} from 'lucide-react';
import { useAppStore } from '../store';
import { StatCard } from '../components/StatCard';
import { type FeedbackType, type FeedbackStatus, type DriverFeedback } from '../types';

export default function DriverFeedbackPage() {
  const { driverFeedbacks, equipments, addDriverFeedback, updateDriverFeedback, getEquipmentNameById } = useAppStore();
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHandleModal, setShowHandleModal] = useState<DriverFeedback | null>(null);
  const [newFeedback, setNewFeedback] = useState({
    equipmentId: '',
    driver: '',
    type: 'abnormal' as FeedbackType,
    content: '',
  });
  const [handleResult, setHandleResult] = useState('');

  const stats = useMemo(() => {
    const total = driverFeedbacks.length;
    const abnormal = driverFeedbacks.filter(f => f.type === 'abnormal').length;
    const suggestion = driverFeedbacks.filter(f => f.type === 'suggestion').length;
    const pending = driverFeedbacks.filter(f => f.status === 'pending').length;
    return { total, abnormal, suggestion, pending };
  }, [driverFeedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return driverFeedbacks.filter(f => {
      const matchType = typeFilter === 'all' || f.type === typeFilter;
      const matchStatus = statusFilter === 'all' || f.status === statusFilter;
      return matchType && matchStatus;
    }).sort((a, b) => b.time.localeCompare(a.time));
  }, [driverFeedbacks, typeFilter, statusFilter]);

  const handleSubmit = () => {
    if (!newFeedback.equipmentId || !newFeedback.driver || !newFeedback.content) return;
    addDriverFeedback({
      ...newFeedback,
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'pending',
    });
    setShowAddModal(false);
    setNewFeedback({ equipmentId: '', driver: '', type: 'abnormal', content: '' });
  };

  const handleProcess = () => {
    if (!showHandleModal || !handleResult) return;
    updateDriverFeedback(showHandleModal.id, {
      status: 'completed',
      handler: '管理员',
      handleResult,
      handleTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    setShowHandleModal(null);
    setHandleResult('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-800">司机反馈</h1>
          <p className="text-sm text-industrial-500 mt-1">司机异常提交与意见建议管理</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          提交反馈
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="反馈总数"
          value={stats.total}
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title="设备异常"
          value={stats.abnormal}
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="意见建议"
          value={stats.suggestion}
          icon={Lightbulb}
          color="purple"
        />
        <StatCard
          title="待处理"
          value={stats.pending}
          icon={Clock}
          color="orange"
        />
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <input
              type="text"
              placeholder="搜索反馈内容..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select
              className="input-field w-36"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FeedbackType | 'all')}
            >
              <option value="all">全部类型</option>
              <option value="abnormal">设备异常</option>
              <option value="suggestion">意见建议</option>
            </select>
            <select
              className="input-field w-36"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | 'all')}
            >
              <option value="all">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredFeedbacks.map(feedback => (
            <div
              key={feedback.id}
              className={`p-4 rounded-industrial border transition-all ${
                feedback.status === 'pending'
                  ? 'border-amber-200 bg-amber-50/30'
                  : feedback.status === 'processing'
                  ? 'border-blue-200 bg-blue-50/30'
                  : 'border-industrial-200 bg-white hover:shadow-industrial'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {feedback.type === 'abnormal' ? (
                    <div className="w-10 h-10 bg-accent-orange/10 rounded-industrial flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-accent-orange" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-purple-100 rounded-industrial flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-industrial-800">{feedback.driver}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        feedback.type === 'abnormal'
                          ? 'bg-accent-orange/10 text-accent-orange'
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {feedback.type === 'abnormal' ? '设备异常' : '意见建议'}
                      </span>
                    </div>
                    <p className="text-xs text-industrial-500 mt-0.5">
                      {getEquipmentNameById(feedback.equipmentId)} · {feedback.time}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                  feedback.status === 'completed'
                    ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/30'
                    : feedback.status === 'processing'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    feedback.status === 'completed' ? 'bg-accent-teal' :
                    feedback.status === 'processing' ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                  {feedback.status === 'completed' ? '已完成' : feedback.status === 'processing' ? '处理中' : '待处理'}
                </span>
              </div>

              <p className="text-sm text-industrial-700 mb-3">{feedback.content}</p>

              {feedback.handleResult && (
                <div className="p-3 bg-white rounded-industrial border border-industrial-100">
                  <p className="text-xs text-industrial-500 mb-1">处理结果 ({feedback.handler} · {feedback.handleTime})</p>
                  <p className="text-sm text-industrial-700">{feedback.handleResult}</p>
                </div>
              )}

              {feedback.status === 'pending' && (
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => setShowHandleModal(feedback)}
                    className="text-sm text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                    处理反馈
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredFeedbacks.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-industrial-300 mx-auto mb-3" />
              <p className="text-industrial-500">暂无反馈记录</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">提交反馈</h3>
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
                  value={newFeedback.equipmentId}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, equipmentId: e.target.value }))}
                >
                  <option value="">请选择设备</option>
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">司机姓名</label>
                <input
                  type="text"
                  className="input-field"
                  value={newFeedback.driver}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, driver: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">反馈类型</label>
                <div className="flex gap-3">
                  {(['abnormal', 'suggestion'] as const).map(type => (
                    <label key={type} className="flex-1">
                      <input
                        type="radio"
                        name="feedbackType"
                        value={type}
                        checked={newFeedback.type === type}
                        onChange={(e) => setNewFeedback(prev => ({ ...prev, type: e.target.value as FeedbackType }))}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-industrial border-2 cursor-pointer transition-all text-center ${
                        newFeedback.type === type
                          ? type === 'abnormal'
                            ? 'border-accent-orange bg-accent-orange/5 text-accent-orange'
                            : 'border-purple-500 bg-purple-50 text-purple-600'
                          : 'border-industrial-200 hover:border-primary-300'
                      }`}>
                        {type === 'abnormal' ? '设备异常' : '意见建议'}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">反馈内容</label>
                <textarea
                  className="input-field h-32 resize-none"
                  placeholder="请详细描述..."
                  value={newFeedback.content}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">取消</button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={!newFeedback.equipmentId || !newFeedback.driver || !newFeedback.content}
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}

      {showHandleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-industrial shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-industrial-100">
              <h3 className="text-lg font-semibold text-industrial-800">处理反馈</h3>
              <button
                onClick={() => setShowHandleModal(null)}
                className="p-1 hover:bg-industrial-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-industrial-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-industrial-50 rounded-industrial">
                <p className="text-sm text-industrial-700">{showHandleModal.content}</p>
                <p className="text-xs text-industrial-500 mt-2">
                  {showHandleModal.driver} · {getEquipmentNameById(showHandleModal.equipmentId)}
                </p>
              </div>
              <div>
                <label className="form-label">处理结果</label>
                <textarea
                  className="input-field h-28 resize-none"
                  placeholder="请输入处理结果..."
                  value={handleResult}
                  onChange={(e) => setHandleResult(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-industrial-100">
              <button onClick={() => setShowHandleModal(null)} className="btn-secondary">取消</button>
              <button
                onClick={handleProcess}
                className="btn-primary"
                disabled={!handleResult}
              >
                确认处理
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
