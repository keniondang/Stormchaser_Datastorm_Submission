// API Response Types
export interface DashboardSummary {
  kpis: {
    total_sales: number;
    total_units: number;
    promotion_roi: number;
    stockout_rate: number;
    supplier_reliability_index: number;
    reliable_suppliers: number;
    total_suppliers: number;
    high_priority_alerts: number;
  };
  promotion_summary: {
    total_promotions: number;
    approved_promotions: number;
    rejected_promotions: number;
    total_incremental_margin: number;
  };
  supply_chain_summary: {
    stockout_incidents: number;
    stockout_rate: number;
    total_alerts: number;
    high_priority_alerts: number;
  };
  recent_alerts: StockoutAlert[];
}

export interface SalesTrend {
  dates: string[];
  sales: number[];
  units: number[];
  promotions: number[];
}

export interface PromotionRecommendation {
  id: string;
  date: string;
  sku_id: string;
  sku_name: string;
  channel: string;
  country: string;
  city: string;
  baseline_units_pred: number;
  predicted_units: number;
  incremental_units: number;
  price_elasticity: number | null;
  incremental_margin: number;
  promo_decision: 'APPROVE' | 'REJECT';
  discount_pct: number;
  list_price: number;
  effective_price: number;
  stock_on_hand: number;
  stock_feasible: boolean;
}

export interface PromotionDetail {
  promotion: PromotionRecommendation;
  baseline_units_pred: number;
  predicted_units: number;
  incremental_units: number;
  price_elasticity: number | null;
  incremental_margin: number;
  margin_per_unit: number;
  promo_decision: string;
  decision_reasons: string[];
  historical_performance: any;
}

export interface StockoutAlert {
  id: string;
  date: string;
  sku_id: string;
  sku_name: string;
  supplier_id: string;
  store_id: string;
  country: string;
  city: string;
  stockout_risk_score: number;
  inventory_coverage_days: number;
  lead_time_risk: number;
  predicted_lead_time: number;
  current_stock: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SupplierReliability {
  supplier_id: string;
  avg_lead_time: number;
  lead_time_std: number;
  coefficient_of_variation: number;
  reliability_index: number;
  risk_class: 'Reliable' | 'Slow but stable' | 'Unreliable' | 'High-risk';
  stockout_rate: number;
  avg_stockout_risk: number;
  total_orders: number;
}

export interface SupplierDetail {
  supplier: SupplierReliability;
  lead_time_history: Array<{
    date: string;
    lead_time_days: number;
  }>;
  stockout_incidents: number;
  performance_trend: 'Improving' | 'Stable' | 'Declining';
  recommendations: string[];
}

export interface StockoutRiskPrediction {
  sku_id: string;
  sku_name: string;
  supplier_id: string;
  store_id: string;
  stockout_probability: number;
  inventory_coverage_days: number;
  lead_time_risk: number;
  demand_stability: number;
  recommended_action: string;
}

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  PromotionDetail: { promotionId: string };
  SupplierDetail: { supplierId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Promotions: undefined;
  SupplyChain: undefined;
};

