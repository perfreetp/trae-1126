import { create } from 'zustand';
import type {
  Equipment,
  RunningRecord,
  FaultOrder,
  MaintenancePlan,
  OilRecord,
  TireRecord,
  SparePart,
  SparePartRequest,
  DriverFeedback,
  EquipmentTransfer,
  PerformanceData,
  SafetyCheckItem,
  ShiftType,
} from '../types';
import {
  equipments as initialEquipments,
  runningRecords as initialRunningRecords,
  faultOrders as initialFaultOrders,
  maintenancePlans as initialMaintenancePlans,
  oilRecords as initialOilRecords,
  tireRecords as initialTireRecords,
  spareParts as initialSpareParts,
  sparePartRequests as initialSparePartRequests,
  driverFeedbacks as initialDriverFeedbacks,
  equipmentTransfers as initialEquipmentTransfers,
  performanceData as initialPerformanceData,
  safetyCheckItems as initialSafetyCheckItems,
} from '../data/mockData';

interface AppState {
  currentShift: ShiftType;
  equipments: Equipment[];
  runningRecords: RunningRecord[];
  faultOrders: FaultOrder[];
  maintenancePlans: MaintenancePlan[];
  oilRecords: OilRecord[];
  tireRecords: TireRecord[];
  spareParts: SparePart[];
  sparePartRequests: SparePartRequest[];
  driverFeedbacks: DriverFeedback[];
  equipmentTransfers: EquipmentTransfer[];
  performanceData: PerformanceData[];
  safetyCheckItems: SafetyCheckItem[];
  selectedEquipmentId: string | null;
  sidebarCollapsed: boolean;
  
  setCurrentShift: (shift: ShiftType) => void;
  setSelectedEquipmentId: (id: string | null) => void;
  toggleSidebar: () => void;
  addFaultOrder: (order: Omit<FaultOrder, 'id'>) => void;
  updateFaultOrder: (id: string, updates: Partial<FaultOrder>) => void;
  addDriverFeedback: (feedback: Omit<DriverFeedback, 'id'>) => void;
  updateDriverFeedback: (id: string, updates: Partial<DriverFeedback>) => void;
  addOilRecord: (record: Omit<OilRecord, 'id'>) => void;
  addTireRecord: (record: Omit<TireRecord, 'id'>) => void;
  addRunningRecord: (record: Omit<RunningRecord, 'id'>) => void;
  updateMaintenancePlan: (id: string, updates: Partial<MaintenancePlan>) => void;
  addEquipmentTransfer: (transfer: Omit<EquipmentTransfer, 'id'>) => void;
  addSparePartRequest: (request: Omit<SparePartRequest, 'id'>) => void;
  getEquipmentById: (id: string) => Equipment | undefined;
  getEquipmentNameById: (id: string) => string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAppStore = create<AppState>((set, get) => ({
  currentShift: 'day',
  equipments: initialEquipments,
  runningRecords: initialRunningRecords,
  faultOrders: initialFaultOrders,
  maintenancePlans: initialMaintenancePlans,
  oilRecords: initialOilRecords,
  tireRecords: initialTireRecords,
  spareParts: initialSpareParts,
  sparePartRequests: initialSparePartRequests,
  driverFeedbacks: initialDriverFeedbacks,
  equipmentTransfers: initialEquipmentTransfers,
  performanceData: initialPerformanceData,
  safetyCheckItems: initialSafetyCheckItems,
  selectedEquipmentId: null,
  sidebarCollapsed: false,

  setCurrentShift: (shift) => set({ currentShift: shift }),
  setSelectedEquipmentId: (id) => set({ selectedEquipmentId: id }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  addFaultOrder: (order) => set((state) => ({
    faultOrders: [...state.faultOrders, { ...order, id: generateId() }],
  })),

  updateFaultOrder: (id, updates) => set((state) => ({
    faultOrders: state.faultOrders.map((o) =>
      o.id === id ? { ...o, ...updates } : o
    ),
  })),

  addDriverFeedback: (feedback) => set((state) => ({
    driverFeedbacks: [...state.driverFeedbacks, { ...feedback, id: generateId() }],
  })),

  updateDriverFeedback: (id, updates) => set((state) => ({
    driverFeedbacks: state.driverFeedbacks.map((f) =>
      f.id === id ? { ...f, ...updates } : f
    ),
  })),

  addOilRecord: (record) => set((state) => ({
    oilRecords: [...state.oilRecords, { ...record, id: generateId() }],
  })),

  addTireRecord: (record) => set((state) => ({
    tireRecords: [...state.tireRecords, { ...record, id: generateId() }],
  })),

  addRunningRecord: (record) => set((state) => ({
    runningRecords: [...state.runningRecords, { ...record, id: generateId() }],
  })),

  updateMaintenancePlan: (id, updates) => set((state) => ({
    maintenancePlans: state.maintenancePlans.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    ),
  })),

  addEquipmentTransfer: (transfer) => set((state) => ({
    equipmentTransfers: [...state.equipmentTransfers, { ...transfer, id: generateId() }],
  })),

  addSparePartRequest: (request) => set((state) => ({
    sparePartRequests: [...state.sparePartRequests, { ...request, id: generateId() }],
  })),

  getEquipmentById: (id) => get().equipments.find((e) => e.id === id),
  getEquipmentNameById: (id) => get().equipments.find((e) => e.id === id)?.name || '未知设备',
}));
