// Mock data for development without Django backend
import type { EquipmentRecord, DataSummary, UploadHistory } from '@/types/equipment';

export const generateMockRecords = (count: number = 50): EquipmentRecord[] => {
  const types = ['Pump', 'Motor', 'Compressor', 'Generator', 'Conveyor', 'Valve'];
  const manufacturers = ['Siemens', 'ABB', 'GE', 'Caterpillar', 'Bosch', 'Schneider'];
  const statuses: EquipmentRecord['status'][] = ['operational', 'maintenance', 'faulty', 'retired'];
  const locations = ['Building A', 'Building B', 'Warehouse 1', 'Plant Floor', 'Utility Room'];

  return Array.from({ length: count }, (_, i) => ({
    id: `EQ-${String(i + 1).padStart(4, '0')}`,
    equipment_id: `EQ-${String(i + 1).padStart(4, '0')}`,
    equipment_type: types[Math.floor(Math.random() * types.length)],
    manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
    model: `Model-${Math.floor(Math.random() * 100)}`,
    installation_date: new Date(2018 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    last_maintenance: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    cost: Math.floor(Math.random() * 50000) + 5000,
    efficiency_rating: Math.round((Math.random() * 30 + 70) * 10) / 10,
    runtime_hours: Math.floor(Math.random() * 15000) + 1000,
  }));
};

export const calculateSummary = (records: EquipmentRecord[]): DataSummary => {
  const typeDistribution: Record<string, number> = {};
  const statusDistribution: Record<string, number> = {};
  const manufacturerDistribution: Record<string, number> = {};

  let totalCost = 0;
  let totalEfficiency = 0;
  let totalRuntime = 0;

  records.forEach((record) => {
    typeDistribution[record.equipment_type] = (typeDistribution[record.equipment_type] || 0) + 1;
    statusDistribution[record.status] = (statusDistribution[record.status] || 0) + 1;
    manufacturerDistribution[record.manufacturer] = (manufacturerDistribution[record.manufacturer] || 0) + 1;
    totalCost += record.cost;
    totalEfficiency += record.efficiency_rating;
    totalRuntime += record.runtime_hours;
  });

  return {
    total_count: records.length,
    averages: {
      cost: Math.round(totalCost / records.length),
      efficiency_rating: Math.round((totalEfficiency / records.length) * 10) / 10,
      runtime_hours: Math.round(totalRuntime / records.length),
    },
    equipment_type_distribution: typeDistribution,
    status_distribution: statusDistribution,
    manufacturer_distribution: manufacturerDistribution,
  };
};

export const generateMockHistory = (): UploadHistory[] => {
  const filenames = [
    'q1_equipment_data.csv',
    'maintenance_report_jan.csv',
    'factory_a_inventory.csv',
    'annual_equipment_audit.csv',
    'equipment_updates_dec.csv',
  ];

  return filenames.slice(0, 5).map((filename, i) => {
    const records = generateMockRecords(Math.floor(Math.random() * 100) + 30);
    return {
      id: `upload-${i + 1}`,
      filename,
      uploaded_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000 * (Math.random() * 5 + 1)).toISOString(),
      record_count: records.length,
      summary: calculateSummary(records),
    };
  });
};
