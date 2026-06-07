export type EquipmentType = 'quay-crane' | 'yard-crane' | 'tractor' | 'conveyor';
export type EquipmentStatus = 'running' | 'stopped' | 'maintenance';
export type FaultLevel = 'normal' | 'serious' | 'urgent';
export type FaultStatus = 'pending' | 'processing' | 'completed';
export type ExternalTrackStatus = 'contacted' | 'arrived' | 'quoting' | 'repairing' | 'accepting' | 'completed';
export type MaintenanceType = 'level1' | 'level2' | 'level3';
export type MaintenanceStatus = 'pending' | 'in-progress' | 'completed';
export type OilType = 'diesel' | 'engine' | 'hydraulic';
export type FeedbackType = 'abnormal' | 'suggestion';
export type FeedbackStatus = 'pending' | 'processing' | 'completed';
export type ShiftType = 'day' | 'night';
export type AcceptanceResult = 'passed' | 'failed' | 'pending';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'none';

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  model: string;
  berth: string;
  status: EquipmentStatus;
  totalHours: number;
  purchaseDate: string;
  location: string;
  specs: Record<string, string>;
}

export interface RunningRecord {
  id: string;
  equipmentId: string;
  date: string;
  shift: ShiftType;
  hours: number;
  volume: number;
  driver: string;
}

export interface ExternalTrackRecord {
  id: string;
  status: ExternalTrackStatus;
  remark: string;
  operator: string;
  time: string;
  quoteAmount?: number;
  estimatedCompletion?: string;
  attachmentNote?: string;
}

export interface FaultOrder {
  id: string;
  equipmentId: string;
  title: string;
  description: string;
  level: FaultLevel;
  status: FaultStatus;
  reporter: string;
  reportTime: string;
  assignee?: string;
  downtime?: number;
  repairType: 'internal' | 'external';
  cost?: number;
  accidentRelated?: string;
  externalVendor?: string;
  externalContact?: string;
  externalArrivalTime?: string;
  externalStatus?: ExternalTrackStatus;
  trackRecords?: ExternalTrackRecord[];
  repairRemark?: string;
  acceptanceResult?: AcceptanceResult;
  acceptanceRemark?: string;
  approvalStatus?: ApprovalStatus;
  approvalRemark?: string;
  approver?: string;
  approvalTime?: string;
  lastFollowTime?: string;
  latestQuoteAmount?: number;
}

export interface MaintenancePlan {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  planDate: string;
  window: string;
  status: MaintenanceStatus;
  items: string[];
  executor?: string;
  completedDate?: string;
  remarks?: string;
}

export interface SafetyCheckItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  remark?: string;
}

export interface OilRecord {
  id: string;
  equipmentId: string;
  date: string;
  type: OilType;
  quantity: number;
  cost: number;
  operator: string;
}

export interface TireRecord {
  id: string;
  equipmentId: string;
  replaceDate: string;
  position: string;
  brand: string;
  cost: number;
  beforeMileage: number;
}

export interface SparePart {
  id: string;
  name: string;
  model: string;
  stock: number;
  price: number;
  supplier: string;
}

export interface SparePartRequest {
  id: string;
  partId: string;
  partName: string;
  quantity: number;
  applicant: string;
  applyTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'received';
  purpose: string;
}

export interface DriverFeedback {
  id: string;
  equipmentId: string;
  driver: string;
  time: string;
  type: FeedbackType;
  content: string;
  status: FeedbackStatus;
  handler?: string;
  handleResult?: string;
  handleTime?: string;
}

export interface EquipmentTransfer {
  id: string;
  equipmentId: string;
  fromBerth: string;
  toBerth: string;
  applicant: string;
  applyTime: string;
  approver?: string;
  approveTime?: string;
  status: 'pending' | 'approved' | 'completed';
  reason: string;
}

export interface BerthInfo {
  id: string;
  name: string;
  equipments: Equipment[];
}

export interface PerformanceData {
  date: string;
  availabilityRate: number;
  utilizationRate: number;
  failureRate: number;
  maintenanceCost: number;
  oilCost: number;
  tireCost: number;
}

export const EquipmentTypeLabels: Record<EquipmentType, string> = {
  'quay-crane': '岸桥',
  'yard-crane': '场桥',
  'tractor': '牵引车',
  'conveyor': '输送线',
};

export const EquipmentStatusLabels: Record<EquipmentStatus, string> = {
  'running': '运行中',
  'stopped': '停机',
  'maintenance': '维修中',
};

export const EquipmentStatusColors: Record<EquipmentStatus, string> = {
  'running': 'bg-accent-teal',
  'stopped': 'bg-industrial-400',
  'maintenance': 'bg-accent-orange',
};

export const FaultLevelLabels: Record<FaultLevel, string> = {
  'normal': '一般',
  'serious': '严重',
  'urgent': '紧急',
};

export const FaultStatusLabels: Record<FaultStatus, string> = {
  'pending': '待派单',
  'processing': '处理中',
  'completed': '已完成',
};

export const MaintenanceTypeLabels: Record<MaintenanceType, string> = {
  'level1': '一级保养',
  'level2': '二级保养',
  'level3': '三级保养',
};

export const OilTypeLabels: Record<OilType, string> = {
  'diesel': '柴油',
  'engine': '机油',
  'hydraulic': '液压油',
};

export const ShiftTypeLabels: Record<ShiftType, string> = {
  'day': '白班',
  'night': '夜班',
};

export const ExternalTrackStatusLabels: Record<ExternalTrackStatus, string> = {
  'contacted': '已联系',
  'arrived': '已到场',
  'quoting': '报价中',
  'repairing': '维修中',
  'accepting': '待验收',
  'completed': '已完成',
};

export const AcceptanceResultLabels: Record<AcceptanceResult, string> = {
  'passed': '验收通过',
  'failed': '验收未过',
  'pending': '待验收',
};

export const ApprovalStatusLabels: Record<ApprovalStatus, string> = {
  'pending': '待审批',
  'approved': '已通过',
  'rejected': '已退回',
  'none': '无需审批',
};
