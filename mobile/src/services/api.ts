import axios, { AxiosError } from 'axios';
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
import {
  mockDashboardApi,
  mockPromotionsApi,
  mockSupplyChainApi,
} from './mockApi';
import { DEFAULT_USE_MOCK_API } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  timeout: 5000, // Shorter timeout for faster fallback
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we should use mock (for testing or when API is down)
const MOCK_KEY = 'USE_MOCK_API';

let useMockApi = DEFAULT_USE_MOCK_API;

// Export function to check if using mock
export const isUsingMockApi = (): boolean => useMockApi;

// Allow runtime toggling from the app (e.g., developer settings)
export const setUseMockApi = async (value: boolean) => {
  useMockApi = value;
  try {
    await AsyncStorage.setItem(MOCK_KEY, value ? 'true' : 'false');
  } catch (e) {
    console.warn('[API] Failed to persist mock setting', e);
  }
  console.log(`[API] setUseMockApi -> ${value}`);
};

export const enableMockApi = () => setUseMockApi(true);
export const disableMockApi = () => setUseMockApi(false);

// Check if API is available
const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

// Initialize API availability check only if not forced by DEFAULT_USE_MOCK_API
// Initialize from persisted setting (if any), then check API availability
AsyncStorage.getItem(MOCK_KEY)
  .then(saved => {
    if (saved !== null) {
      useMockApi = saved === 'true';
      console.log('[API] Loaded persisted mock setting ->', useMockApi);
    } else {
      useMockApi = DEFAULT_USE_MOCK_API;
      console.log('[API] No persisted mock setting, DEFAULT_USE_MOCK_API ->', useMockApi);
    }

    // Now check backend availability and possibly switch (but don't override an explicit persisted choice)
    return checkApiAvailability();
  })
  .then(available => {
    // Only auto-switch if there was no persisted setting (i.e., we used DEFAULT_USE_MOCK_API)
    AsyncStorage.getItem(MOCK_KEY).then(saved => {
      const hasPersisted = saved !== null;
      if (!hasPersisted) {
        if (DEFAULT_USE_MOCK_API) {
          if (available) {
            useMockApi = false;
            console.log('[API] Backend available, switching to real API (overriding DEFAULT_USE_MOCK_API)');
          } else {
            useMockApi = true;
            console.log('[API] Backend not available, staying on mock API');
          }
        } else {
          useMockApi = !available;
          if (useMockApi) {
            console.log('[API] Backend not available, using mock API');
          } else {
            console.log('[API] Backend available, using real API');
          }
        }
      } else {
        console.log('[API] Persisted mock setting present, not auto-switching based on availability');
      }
    });
  })
  .catch(err => {
    console.warn('[API] Error initializing mock setting or checking availability', err);
  });

// Helper to try real API, fallback to mock
const withFallback = async <T>(
  realApiCall: () => Promise<T>,
  mockApiCall: () => Promise<T>
): Promise<T> => {
  if (useMockApi) {
    console.log('[API] Using mock API (fallback mode)');
    return mockApiCall();
  }

  try {
    return await realApiCall();
  } catch (error) {
    const axiosError = error as AxiosError;
    
    // Check if it's a network error
    if (
      axiosError.code === 'ECONNREFUSED' ||
      axiosError.code === 'ETIMEDOUT' ||
      axiosError.code === 'ENOTFOUND' ||
      axiosError.message?.includes('Network Error') ||
      !axiosError.response
    ) {
      console.log('[API] Network error detected, switching to mock API');
      useMockApi = true; // Switch to mock for subsequent calls
      return mockApiCall();
    }
    
    // Re-throw other errors (like 404, 500, etc.)
    throw error;
  }
};

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (!useMockApi) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
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
      error.message = `Cannot connect to backend API. Using mock data.`;
    } else if (error.response) {
      error.message = error.response.data?.detail || error.message || 'Server error';
    } else if (error.request) {
      error.message = 'No response from server. Using mock data.';
    }
    console.error('[API] Response error:', error.message);
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    return withFallback(
      async () => {
        const response = await api.get('/api/dashboard/summary');
        return response.data;
      },
      () => mockDashboardApi.getSummary()
    );
  },

  getSalesTrend: async (days: number = 30): Promise<SalesTrend> => {
    return withFallback(
      async () => {
        const response = await api.get('/api/dashboard/sales-trend', {
          params: { days },
        });
        return response.data;
      },
      () => mockDashboardApi.getSalesTrend(days)
    );
  },

  getPromotionEffectiveness: async () => {
    return withFallback(
      async () => {
        const response = await api.get('/api/dashboard/promotion-effectiveness');
        return response.data;
      },
      () => mockDashboardApi.getPromotionEffectiveness()
    );
  },
};

// Promotions API
export const promotionsApi = {
  getList: async (
    status?: 'APPROVE' | 'REJECT',
    channel?: string,
    limit: number = 100
  ): Promise<PromotionRecommendation[]> => {
    return withFallback(
      async () => {
        const response = await api.get('/api/promotions/list', {
          params: { status, channel, limit },
        });
        return response.data;
      },
      () => mockPromotionsApi.getList(status, channel, limit)
    );
  },

  getDetail: async (promotionId: string): Promise<PromotionDetail> => {
    return withFallback(
      async () => {
        const response = await api.get(`/api/promotions/${promotionId}`);
        return response.data;
      },
      () => mockPromotionsApi.getDetail(promotionId)
    );
  },

  getStats: async () => {
    return withFallback(
      async () => {
        const response = await api.get('/api/promotions/stats/summary');
        return response.data;
      },
      () => mockPromotionsApi.getStats()
    );
  },
};

// Supply Chain API
export const supplyChainApi = {
  getAlerts: async (
    priority?: 'HIGH' | 'MEDIUM' | 'LOW',
    limit: number = 50
  ): Promise<StockoutAlert[]> => {
    return withFallback(
      async () => {
        const response = await api.get('/api/supply-chain/alerts', {
          params: { priority, limit },
        });
        return response.data;
      },
      () => mockSupplyChainApi.getAlerts(priority, limit)
    );
  },

  getSuppliers: async (
    riskClass?: string,
    limit: number = 100
  ): Promise<SupplierReliability[]> => {
    return withFallback(
      async () => {
        const response = await api.get('/api/supply-chain/suppliers', {
          params: { risk_class: riskClass, limit },
        });
        return response.data;
      },
      () => mockSupplyChainApi.getSuppliers(riskClass, limit)
    );
  },

  getSupplierDetail: async (supplierId: string): Promise<SupplierDetail> => {
    return withFallback(
      async () => {
        const response = await api.get(`/api/supply-chain/supplier/${supplierId}`);
        return response.data;
      },
      () => mockSupplyChainApi.getSupplierDetail(supplierId)
    );
  },

  getStockoutRisk: async (
    threshold: number = 0.5,
    limit: number = 50
  ): Promise<StockoutRiskPrediction[]> => {
    return withFallback(
      async () => {
        const response = await api.get('/api/supply-chain/stockout-risk', {
          params: { threshold, limit },
        });
        return response.data;
      },
      () => mockSupplyChainApi.getStockoutRisk(threshold, limit)
    );
  },

  getSafetyStockRecommendations: async () => {
    return withFallback(
      async () => {
        const response = await api.get('/api/supply-chain/safety-stock/recommendations');
        return response.data;
      },
      () => mockSupplyChainApi.getSafetyStockRecommendations()
    );
  },
};

export default api;

