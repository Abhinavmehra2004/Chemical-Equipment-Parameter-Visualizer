// API Service - Configure your Django backend URL here
import type { EquipmentRecord, DataSummary, UploadHistory } from '@/types/equipment';

// ============================================
// CONFIGURATION - Update this for your Django backend
// ============================================
const API_CONFIG = {
  // Change this to your Django backend URL
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  
  endpoints: {
    upload: '/datasets/',
    summary: '/datasets/latest/',
    history: '/datasets/history/',
    dataset_detail: '/datasets/', // For fetching the DataSet object itself
    records: '/datasets/', // Base for records endpoint
  },
};

// A simple function to get the token
// In a real app, you would get this from localStorage or a state management store
const getToken = () => {
    return localStorage.getItem('token');
}

// ============================================
// API Functions
// ============================================

export async function uploadCSV(file: File): Promise<{ id: string; summary: DataSummary }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.upload}`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchDataSummary(datasetId?: string): Promise<DataSummary> {
  const url = datasetId 
    ? `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.dataset_detail}${datasetId}/`
    : `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.summary}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();
  return data.summary;
}

export async function fetchUploadHistory(): Promise<UploadHistory[]> {
  const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.history}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchDatasetRecords(datasetId: string): Promise<EquipmentRecord[]> {
  const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.records}${datasetId}/records/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch records: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// Mock Data Functions - For development without backend
// ============================================

export function useMockMode(): boolean {
  return !import.meta.env.VITE_API_URL;
}

export { API_CONFIG };