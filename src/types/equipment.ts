// Equipment data types for the analytics dashboard

export interface EquipmentRecord {
  id: string;
  equipment_id: string;
  equipment_type: string;
  manufacturer: string;
  model: string;
  installation_date: string;
  last_maintenance: string;
  status: 'operational' | 'maintenance' | 'faulty' | 'retired';
  location: string;
  cost: number;
  efficiency_rating: number;
  runtime_hours: number;
  [key: string]: string | number; // Allow dynamic fields from CSV
}

export interface DataSummary {
  total_count: number;
  averages: {
    cost: number;
    efficiency_rating: number;
    runtime_hours: number;
  };
  equipment_type_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
  manufacturer_distribution: Record<string, number>;
}

export interface UploadHistory {
  id: string;
  filename: string;
  uploaded_at: string;
  record_count: number;
  summary: DataSummary;
}

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    upload: string;
    summary: string;
    history: string;
    download: string;
  };
}

export interface ChartDataset {
  labels: string[];
  data: number[];
  backgroundColor?: string[];
  borderColor?: string[];
}
