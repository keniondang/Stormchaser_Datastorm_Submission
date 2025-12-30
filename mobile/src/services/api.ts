import axios from 'axios';
import { Platform } from 'react-native';
import {
  DashboardSummary,
  SalesTrend,
  PromotionRecommendation,
  PromotionDetail,
  StockoutAlert,
  SupplierReliability,
  SupplierDetail,
  StockoutRiskPrediction,
} from '../types';

// Determine API URL based on platform and environment
const getApiBaseUrl = (): string => {
  if (!__DEV__) {
    return 'http://your-production-api.com'; // Production
  }

  // Development URLs
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    return 'http://10.0.2.2:8000';
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:8000';
  }
  
  // Default fallback
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      error.message = `Cannot connect to backend API at ${API_BASE_URL}. Make sure the backend server is running.`;
    } else if (error.response) {
      // Server responded with error status
      error.message = error.response.data?.detail || error.message || 'Server error';
    } else if (error.request) {
      // Request made but no response
      error.message = 'No response from server. Check your network connection.';
    }
    console.error('[API] Response error:', error.message);
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/api/dashboard/summary');
    return response.data;
  },

  getSalesTrend: async (days: number = 30): Promise<SalesTrend> => {
    const response = await api.get('/api/dashboard/sales-trend', {
      params: { days },
    });
    return response.data;
  },

  getPromotionEffectiveness: async () => {
    const response = await api.get('/api/dashboard/promotion-effectiveness');
    return response.data;
  },
};

// Promotions API
export const promotionsApi = {
  getList: async (
    status?: 'APPROVE' | 'REJECT',
    channel?: string,
    limit: number = 100
  ): Promise<PromotionRecommendation[]> => {
    const response = await api.get('/api/promotions/list', {
      params: { status, channel, limit },
    });
    return response.data;
  },

  getDetail: async (promotionId: string): Promise<PromotionDetail> => {
    const response = await api.get(`/api/promotions/${promotionId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/promotions/stats/summary');
    return response.data;
  },
};

// Supply Chain API
export const supplyChainApi = {
  getAlerts: async (
    priority?: 'HIGH' | 'MEDIUM' | 'LOW',
    limit: number = 50
  ): Promise<StockoutAlert[]> => {
    const response = await api.get('/api/supply-chain/alerts', {
      params: { priority, limit },
    });
    return response.data;
  },

  getSuppliers: async (
    riskClass?: string,
    limit: number = 100
  ): Promise<SupplierReliability[]> => {
    const response = await api.get('/api/supply-chain/suppliers', {
      params: { risk_class: riskClass, limit },
    });
    return response.data;
  },

  getSupplierDetail: async (supplierId: string): Promise<SupplierDetail> => {
    const response = await api.get(`/api/supply-chain/supplier/${supplierId}`);
    return response.data;
  },

  getStockoutRisk: async (
    threshold: number = 0.5,
    limit: number = 50
  ): Promise<StockoutRiskPrediction[]> => {
    const response = await api.get('/api/supply-chain/stockout-risk', {
      params: { threshold, limit },
    });
    return response.data;
  },

  getSafetyStockRecommendations: async () => {
    const response = await api.get('/api/supply-chain/safety-stock/recommendations');
    return response.data;
  },
};

export default api;

