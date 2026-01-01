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

// Mock data generators that match real API structure exactly

const generateMockDashboardSummary = (): DashboardSummary => {
  const totalSales = 12500000 + Math.random() * 5000000;
  const totalUnits = 450000 + Math.floor(Math.random() * 100000);
  const promotionROI = 15.5 + (Math.random() * 10 - 5);
  const stockoutRate = 3.2 + (Math.random() * 2 - 1);
  
  return {
    kpis: {
      total_sales: totalSales,
      total_units: totalUnits,
      promotion_roi: promotionROI,
      stockout_rate: stockoutRate,
      supplier_reliability_index: 2.8 + (Math.random() * 1 - 0.5),
      reliable_suppliers: 18,
      total_suppliers: 30,
      high_priority_alerts: 5,
    },
    promotion_summary: {
      total_promotions: 245,
      approved_promotions: 187,
      rejected_promotions: 58,
      total_incremental_margin: 125000 + Math.random() * 50000,
    },
    supply_chain_summary: {
      stockout_incidents: 1250,
      stockout_rate: stockoutRate,
      total_alerts: 23,
      high_priority_alerts: 5,
    },
    recent_alerts: generateMockAlerts(5),
  };
};

const generateMockSalesTrend = (days: number = 30): SalesTrend => {
  const dates: string[] = [];
  const sales: number[] = [];
  const units: number[] = [];
  const promotions: number[] = [];
  
  const today = new Date();
  const baseSales = 400000;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
    
    // Add some variation and trend
    const dayOfWeek = date.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
    const trend = 1 + (days - i) / days * 0.1; // Slight upward trend
    
    const dailySales = baseSales * weekendMultiplier * trend * (0.8 + Math.random() * 0.4);
    sales.push(Math.round(dailySales));
    units.push(Math.round(dailySales / 25));
    promotions.push(Math.random() > 0.7 ? 1 : 0);
  }
  
  return { dates, sales, units, promotions };
};

const generateMockPromotions = (count: number = 100): PromotionRecommendation[] => {
  const promotions: PromotionRecommendation[] = [];
  const skus = ['SKU_001', 'SKU_002', 'SKU_003', 'SKU_004', 'SKU_005'];
  const skuNames = ['Premium Coffee', 'Organic Tea', 'Energy Drink', 'Protein Bar', 'Vitamin Pack'];
  const channels = ['MT', 'EC', 'GT', 'HM'];
  const countries = ['USA', 'UK', 'Germany', 'France'];
  const cities = ['New York', 'London', 'Berlin', 'Paris'];
  
  for (let i = 0; i < count; i++) {
    const skuIdx = i % skus.length;
    const isApproved = Math.random() > 0.3;
    const baselineUnits = 50 + Math.random() * 100;
    const incrementalUnits = isApproved ? 20 + Math.random() * 50 : Math.random() * 10;
    const predictedUnits = baselineUnits + incrementalUnits;
    const discountPct = 0.1 + Math.random() * 0.3;
    const listPrice = 10 + Math.random() * 40;
    const effectivePrice = listPrice * (1 - discountPct);
    const marginPct = 0.25 + Math.random() * 0.15;
    const incrementalMargin = incrementalUnits * listPrice * marginPct;
    const elasticity = 1.2 + Math.random() * 0.8;
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    promotions.push({
      id: `PROMO_${i}`,
      date: date.toISOString().split('T')[0],
      sku_id: skus[skuIdx],
      sku_name: skuNames[skuIdx],
      channel: channels[Math.floor(Math.random() * channels.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      baseline_units_pred: baselineUnits,
      predicted_units: predictedUnits,
      incremental_units: incrementalUnits,
      price_elasticity: elasticity,
      incremental_margin: incrementalMargin,
      promo_decision: isApproved ? 'APPROVE' : 'REJECT',
      discount_pct: discountPct,
      list_price: listPrice,
      effective_price: effectivePrice,
      stock_on_hand: 100 + Math.random() * 200,
      stock_feasible: incrementalUnits < 150,
    });
  }
  
  return promotions;
};

const generateMockAlerts = (count: number = 10): StockoutAlert[] => {
  const alerts: StockoutAlert[] = [];
  const skus = ['SKU_001', 'SKU_002', 'SKU_003', 'SKU_004', 'SKU_005'];
  const skuNames = ['Premium Coffee', 'Organic Tea', 'Energy Drink', 'Protein Bar', 'Vitamin Pack'];
  const suppliers = ['SUPPLIER_01', 'SUPPLIER_02', 'SUPPLIER_03', 'SUPPLIER_04'];
  const stores = ['STORE_001', 'STORE_002', 'STORE_003'];
  const countries = ['USA', 'UK', 'Germany'];
  const cities = ['New York', 'London', 'Berlin'];
  
  for (let i = 0; i < count; i++) {
    const riskScore = 0.6 + Math.random() * 0.3;
    const priority = riskScore > 0.8 ? 'HIGH' : riskScore > 0.7 ? 'MEDIUM' : 'LOW';
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7));
    
    alerts.push({
      id: `ALERT_${i}`,
      date: date.toISOString().split('T')[0],
      sku_id: skus[i % skus.length],
      sku_name: skuNames[i % skuNames.length],
      supplier_id: suppliers[Math.floor(Math.random() * suppliers.length)],
      store_id: stores[Math.floor(Math.random() * stores.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      stockout_risk_score: riskScore,
      inventory_coverage_days: 1 + Math.random() * 3,
      lead_time_risk: 5 + Math.random() * 5,
      predicted_lead_time: 7 + Math.random() * 5,
      current_stock: Math.random() * 50,
      priority: priority as 'HIGH' | 'MEDIUM' | 'LOW',
    });
  }
  
  return alerts.sort((a, b) => b.stockout_risk_score - a.stockout_risk_score);
};

const generateMockSuppliers = (count: number = 20): SupplierReliability[] => {
  const suppliers: SupplierReliability[] = [];
  const riskClasses: Array<'Reliable' | 'Slow but stable' | 'Unreliable' | 'High-risk'> = 
    ['Reliable', 'Slow but stable', 'Unreliable', 'High-risk'];
  
  for (let i = 1; i <= count; i++) {
    const avgLeadTime = 3 + Math.random() * 8;
    const leadTimeStd = 0.5 + Math.random() * 3;
    const cv = leadTimeStd / (avgLeadTime + 0.1);
    const stockoutRate = Math.random() * 0.1;
    const avgStockoutRisk = 0.2 + Math.random() * 0.4;
    
    let riskClass: 'Reliable' | 'Slow but stable' | 'Unreliable' | 'High-risk';
    if (avgLeadTime < 5 && leadTimeStd < 2) {
      riskClass = 'Reliable';
    } else if (avgLeadTime >= 5 && leadTimeStd < 2) {
      riskClass = 'Slow but stable';
    } else if (avgLeadTime < 5 && leadTimeStd >= 2) {
      riskClass = 'Unreliable';
    } else {
      riskClass = 'High-risk';
    }
    
    const reliabilityIndex = avgLeadTime * 0.4 + leadTimeStd * 0.3 + stockoutRate * 100 * 0.3;
    
    suppliers.push({
      supplier_id: `SUPPLIER_${i.toString().padStart(2, '0')}`,
      avg_lead_time: avgLeadTime,
      lead_time_std: leadTimeStd,
      coefficient_of_variation: cv,
      reliability_index: reliabilityIndex,
      risk_class: riskClass,
      stockout_rate: stockoutRate,
      avg_stockout_risk: avgStockoutRisk,
      total_orders: 100 + Math.floor(Math.random() * 500),
    });
  }
  
  return suppliers.sort((a, b) => a.reliability_index - b.reliability_index);
};

// Mock API that matches real API structure exactly
export const mockDashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateMockDashboardSummary();
  },

  getSalesTrend: async (days: number = 30): Promise<SalesTrend> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return generateMockSalesTrend(days);
  },

  getPromotionEffectiveness: async () => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return {
      by_channel: {
        MT: { total: 120, approved: 95, total_lift: 2500, total_margin: 45000 },
        EC: { total: 80, approved: 65, total_lift: 1800, total_margin: 32000 },
        GT: { total: 30, approved: 20, total_lift: 600, total_margin: 12000 },
        HM: { total: 15, approved: 7, total_lift: 200, total_margin: 4000 },
      },
      total_recommendations: 245,
      approval_rate: 76.3,
    };
  },
};

export const mockPromotionsApi = {
  getList: async (
    status?: 'APPROVE' | 'REJECT',
    channel?: string,
    limit: number = 100
  ): Promise<PromotionRecommendation[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    let promotions = generateMockPromotions(limit);
    
    if (status) {
      promotions = promotions.filter(p => p.promo_decision === status);
    }
    
    if (channel) {
      promotions = promotions.filter(p => p.channel === channel);
    }
    
    return promotions.slice(0, limit);
  },

  getDetail: async (promotionId: string): Promise<PromotionDetail> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const promotions = generateMockPromotions(1);
    const promotion = promotions[0];
    promotion.id = promotionId;
    
    const reasons = promotion.promo_decision === 'APPROVE'
      ? ['All promotion criteria met']
      : [
          'Incremental margin is negative or zero',
          'Price elasticity is too low',
          'Insufficient stock on hand',
        ];
    
    return {
      promotion,
      baseline_units_pred: promotion.baseline_units_pred,
      predicted_units: promotion.predicted_units,
      incremental_units: promotion.incremental_units,
      price_elasticity: promotion.price_elasticity,
      incremental_margin: promotion.incremental_margin,
      margin_per_unit: promotion.list_price * 0.3,
      promo_decision: promotion.promo_decision,
      decision_reasons: reasons,
      historical_performance: null,
    };
  },

  getStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const promotions = generateMockPromotions(245);
    const approved = promotions.filter(p => p.promo_decision === 'APPROVE');
    const totalMargin = approved.reduce((sum, p) => sum + p.incremental_margin, 0);
    const avgElasticity = promotions
      .filter(p => p.price_elasticity !== null)
      .reduce((sum, p) => sum + (p.price_elasticity || 0), 0) / promotions.length;
    
    return {
      total_promotions: promotions.length,
      approved: approved.length,
      rejected: promotions.length - approved.length,
      approval_rate: (approved.length / promotions.length) * 100,
      total_incremental_margin: totalMargin,
      average_elasticity: avgElasticity,
    };
  },
};

export const mockSupplyChainApi = {
  getAlerts: async (
    priority?: 'HIGH' | 'MEDIUM' | 'LOW',
    limit: number = 50
  ): Promise<StockoutAlert[]> => {
    await new Promise(resolve => setTimeout(resolve, 350));
    let alerts = generateMockAlerts(limit);
    
    if (priority) {
      alerts = alerts.filter(a => a.priority === priority);
    }
    
    return alerts.slice(0, limit);
  },

  getSuppliers: async (
    riskClass?: string,
    limit: number = 100
  ): Promise<SupplierReliability[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let suppliers = generateMockSuppliers(limit);
    
    if (riskClass) {
      suppliers = suppliers.filter(s => s.risk_class === riskClass);
    }
    
    return suppliers.slice(0, limit);
  },

  getSupplierDetail: async (supplierId: string): Promise<SupplierDetail> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const suppliers = generateMockSuppliers(1);
    const supplier = suppliers[0];
    supplier.supplier_id = supplierId;
    
    // Generate lead time history
    const leadTimeHistory = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      leadTimeHistory.push({
        date: date.toISOString().split('T')[0],
        lead_time_days: supplier.avg_lead_time + (Math.random() * 2 - 1) * supplier.lead_time_std,
      });
    }
    
    // Determine trend
    const recent = leadTimeHistory.slice(-10).reduce((sum, h) => sum + h.lead_time_days, 0) / 10;
    const earlier = leadTimeHistory.slice(0, 10).reduce((sum, h) => sum + h.lead_time_days, 0) / 10;
    let trend: 'Improving' | 'Stable' | 'Declining';
    if (recent < earlier * 0.9) {
      trend = 'Improving';
    } else if (recent > earlier * 1.1) {
      trend = 'Declining';
    } else {
      trend = 'Stable';
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (supplier.risk_class === 'High-risk') {
      recommendations.push('Consider finding alternative suppliers');
      recommendations.push('Increase safety stock for this supplier');
    } else if (supplier.risk_class === 'Unreliable') {
      recommendations.push('Monitor lead times closely');
      recommendations.push('Implement buffer stock');
    } else if (supplier.risk_class === 'Slow but stable') {
      recommendations.push('Plan for longer lead times in inventory management');
    } else {
      recommendations.push('Maintain current relationship');
    }
    
    return {
      supplier,
      lead_time_history: leadTimeHistory,
      stockout_incidents: Math.floor(supplier.stockout_rate * supplier.total_orders),
      performance_trend: trend,
      recommendations,
    };
  },

  getStockoutRisk: async (
    threshold: number = 0.5,
    limit: number = 50
  ): Promise<StockoutRiskPrediction[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const predictions: StockoutRiskPrediction[] = [];
    const skus = ['SKU_001', 'SKU_002', 'SKU_003', 'SKU_004', 'SKU_005'];
    const skuNames = ['Premium Coffee', 'Organic Tea', 'Energy Drink', 'Protein Bar', 'Vitamin Pack'];
    
    for (let i = 0; i < limit; i++) {
      const probability = threshold + Math.random() * (1 - threshold);
      const coverageDays = 1 + Math.random() * 4;
      
      let action: string;
      if (probability > 0.8) {
        action = 'Expedite replenishment immediately';
      } else if (coverageDays < 2) {
        action = 'Increase safety stock and reorder';
      } else {
        action = 'Monitor closely and prepare for reorder';
      }
      
      predictions.push({
        sku_id: skus[i % skus.length],
        sku_name: skuNames[i % skuNames.length],
        supplier_id: `SUPPLIER_${(i % 20 + 1).toString().padStart(2, '0')}`,
        store_id: `STORE_${(i % 10 + 1).toString().padStart(3, '0')}`,
        stockout_probability: probability,
        inventory_coverage_days: coverageDays,
        lead_time_risk: 5 + Math.random() * 5,
        demand_stability: 0.5 + Math.random() * 0.5,
        recommended_action: action,
      });
    }
    
    return predictions
      .filter(p => p.stockout_probability > threshold)
      .sort((a, b) => b.stockout_probability - a.stockout_probability)
      .slice(0, limit);
  },

  getSafetyStockRecommendations: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const recommendations = [];
    const skus = ['SKU_001', 'SKU_002', 'SKU_003', 'SKU_004', 'SKU_005'];
    
    for (let i = 0; i < 20; i++) {
      const currentStock = 50 + Math.random() * 100;
      const recommendedStock = currentStock + 20 + Math.random() * 50;
      const gap = recommendedStock - currentStock;
      
      recommendations.push({
        sku_id: skus[i % skus.length],
        supplier_id: `SUPPLIER_${(i % 20 + 1).toString().padStart(2, '0')}`,
        current_stock: Math.round(currentStock),
        recommended_safety_stock: Math.round(recommendedStock),
        gap: Math.round(gap),
        priority: gap > 50 ? 'HIGH' : 'MEDIUM',
      });
    }
    
    return {
      recommendations: recommendations.sort((a, b) => b.gap - a.gap),
      total_skus_analyzed: 200,
      skus_needing_increase: recommendations.length,
    };
  },
};


