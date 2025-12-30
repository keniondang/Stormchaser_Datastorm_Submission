from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict
from app.services.data_loader import DataLoader
from app.services.analytics import PromotionAnalytics
from app.models.promotion import PromotionRecommendation, PromotionDetail

router = APIRouter()

# Initialize data loader
_data_loader = None

def get_data_loader():
    global _data_loader
    if _data_loader is None:
        _data_loader = DataLoader()
    return _data_loader


@router.get("/list", response_model=List[PromotionRecommendation])
async def get_promotion_list(
    status: Optional[str] = None,
    channel: Optional[str] = None,
    limit: int = 100
) -> List[Dict]:
    """Get list of promotion recommendations"""
    try:
        data_loader = get_data_loader()
        df = data_loader.load_data()
        
        promo_analytics = PromotionAnalytics(df)
        recommendations = promo_analytics.get_promotion_recommendations()
        
        # Apply filters
        if status:
            recommendations = [r for r in recommendations if r['promo_decision'] == status.upper()]
        
        if channel:
            recommendations = [r for r in recommendations if r['channel'] == channel]
        
        # Limit results
        recommendations = recommendations[:limit]
        
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching promotions: {str(e)}")


@router.get("/{promotion_id}", response_model=PromotionDetail)
async def get_promotion_detail(promotion_id: str) -> Dict:
    """Get detailed promotion analytics"""
    try:
        data_loader = get_data_loader()
        df = data_loader.load_data()
        
        promo_analytics = PromotionAnalytics(df)
        recommendations = promo_analytics.get_promotion_recommendations()
        
        # Find promotion by ID
        promotion = None
        for rec in recommendations:
            if rec['id'] == promotion_id:
                promotion = rec
                break
        
        if not promotion:
            raise HTTPException(status_code=404, detail="Promotion not found")
        
        # Generate decision reasons
        reasons = []
        if promotion['incremental_margin'] <= 0:
            reasons.append("Incremental margin is negative or zero")
        if promotion['price_elasticity'] is not None and promotion['price_elasticity'] <= 1:
            reasons.append("Price elasticity is too low (customers not price-sensitive)")
        if not promotion['stock_feasible']:
            reasons.append("Insufficient stock on hand to support promotion")
        if promotion['channel'] not in ['MT', 'EC']:
            reasons.append("Channel is not in high-response list")
        
        if promotion['promo_decision'] == 'APPROVE':
            reasons = ["All promotion criteria met"]
        
        # Calculate margin per unit
        margin_per_unit = promotion['list_price'] * (df[df['sku_id'] == promotion['sku_id']]['margin_pct'].iloc[0] if len(df[df['sku_id'] == promotion['sku_id']]) > 0 else 0.3)
        
        detail = {
            "promotion": promotion,
            "baseline_units_pred": promotion['baseline_units_pred'],
            "predicted_units": promotion['predicted_units'],
            "incremental_units": promotion['incremental_units'],
            "price_elasticity": promotion['price_elasticity'],
            "incremental_margin": promotion['incremental_margin'],
            "margin_per_unit": margin_per_unit,
            "promo_decision": promotion['promo_decision'],
            "decision_reasons": reasons,
            "historical_performance": None  # Could add historical comparison
        }
        
        return detail
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching promotion detail: {str(e)}")


@router.get("/stats/summary")
async def get_promotion_stats() -> Dict:
    """Get promotion statistics summary"""
    try:
        data_loader = get_data_loader()
        df = data_loader.load_data()
        
        promo_analytics = PromotionAnalytics(df)
        recommendations = promo_analytics.get_promotion_recommendations()
        
        total = len(recommendations)
        approved = len([r for r in recommendations if r['promo_decision'] == 'APPROVE'])
        rejected = total - approved
        
        total_incremental_margin = sum(r['incremental_margin'] for r in recommendations if r['promo_decision'] == 'APPROVE')
        avg_elasticity = sum(r['price_elasticity'] for r in recommendations if r['price_elasticity'] is not None) / max(1, len([r for r in recommendations if r['price_elasticity'] is not None]))
        
        return {
            "total_promotions": total,
            "approved": approved,
            "rejected": rejected,
            "approval_rate": (approved / total * 100) if total > 0 else 0,
            "total_incremental_margin": round(total_incremental_margin, 2),
            "average_elasticity": round(avg_elasticity, 2) if avg_elasticity else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching promotion stats: {str(e)}")

