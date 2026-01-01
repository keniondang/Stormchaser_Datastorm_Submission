from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class PromotionRecommendation(BaseModel):
    id: str
    date: str
    sku_id: str
    sku_name: str
    channel: str
    country: str
    city: str
    baseline_units_pred: float
    predicted_units: float
    incremental_units: float
    price_elasticity: Optional[float]
    incremental_margin: float
    promo_decision: str  # "APPROVE" or "REJECT"
    discount_pct: float
    list_price: float
    effective_price: float
    stock_on_hand: float
    stock_feasible: bool

class PromotionDetail(BaseModel):
    promotion: PromotionRecommendation
    baseline_units_pred: float
    predicted_units: float
    incremental_units: float
    price_elasticity: Optional[float]
    incremental_margin: float
    margin_per_unit: float
    promo_decision: str
    decision_reasons: List[str]
    historical_performance: Optional[dict] = None

