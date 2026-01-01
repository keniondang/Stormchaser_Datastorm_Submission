from pydantic import BaseModel
from typing import Optional, List

class StockoutAlert(BaseModel):
    id: str
    date: str
    sku_id: str
    sku_name: str
    supplier_id: str
    store_id: str
    country: str
    city: str
    stockout_risk_score: float
    inventory_coverage_days: float
    lead_time_risk: float
    predicted_lead_time: float
    current_stock: float
    priority: str  # "HIGH", "MEDIUM", "LOW"

class SupplierReliability(BaseModel):
    supplier_id: str
    avg_lead_time: float
    lead_time_std: float
    coefficient_of_variation: float
    reliability_index: float
    risk_class: str  # "Reliable", "Slow but stable", "Unreliable", "High-risk"
    stockout_rate: float
    avg_stockout_risk: float
    total_orders: int

class SupplierDetail(BaseModel):
    supplier: SupplierReliability
    lead_time_history: List[dict]
    stockout_incidents: int
    performance_trend: str  # "Improving", "Stable", "Declining"
    recommendations: List[str]

class StockoutRiskPrediction(BaseModel):
    sku_id: str
    sku_name: str
    supplier_id: str
    store_id: str
    stockout_probability: float
    inventory_coverage_days: float
    lead_time_risk: float
    demand_stability: float
    recommended_action: str

