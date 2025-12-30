from fastapi import APIRouter, HTTPException
from typing import Dict, List
import pandas as pd
from app.services.data_loader import DataLoader
from app.services.analytics import PromotionAnalytics, SupplyChainAnalytics

router = APIRouter()

# Initialize data loader (singleton pattern)
_data_loader = None

def get_data_loader():
    global _data_loader
    if _data_loader is None:
        _data_loader = DataLoader()
    return _data_loader


@router.get("/summary")
async def get_dashboard_summary() -> Dict:
    """Get overall dashboard KPIs and metrics"""
    try:
        data_loader = get_data_loader()
        df = data_loader.load_data()
        
        # Calculate KPIs
        total_sales = float(df['net_sales'].sum())
        total_units = int(df['units_sold'].sum())
        
        # Promotion metrics
        promo_df = df[df['promo_flag'] == 1]
        promo_count = len(promo_df)
        promo_sales = float(promo_df['net_sales'].sum()) if len(promo_df) > 0 else 0
        
        # Calculate promotion ROI (simplified)
        promo_analytics = PromotionAnalytics(df)
        promo_recs = promo_analytics.get_promotion_recommendations()
        approved_promos = [r for r in promo_recs if r['promo_decision'] == 'APPROVE']
        total_incremental_margin = sum(r['incremental_margin'] for r in approved_promos)
        promotion_roi = (total_incremental_margin / promo_sales * 100) if promo_sales > 0 else 0
        
        # Stockout metrics
        stockout_count = int(df['stock_out_flag'].sum())
        stockout_rate = (stockout_count / len(df) * 100) if len(df) > 0 else 0
        
        # Supplier reliability
        supply_analytics = SupplyChainAnalytics(df)
        suppliers = supply_analytics.get_supplier_reliability()
        avg_reliability = sum(s['reliability_index'] for s in suppliers) / len(suppliers) if suppliers else 0
        reliable_suppliers = len([s for s in suppliers if s['risk_class'] == 'Reliable'])
        
        # Recent alerts
        alerts = supply_analytics.get_stockout_alerts(threshold=0.6)
        high_priority_alerts = len([a for a in alerts if a['priority'] == 'HIGH'])
        
        return {
            "kpis": {
                "total_sales": total_sales,
                "total_units": total_units,
                "promotion_roi": round(promotion_roi, 2),
                "stockout_rate": round(stockout_rate, 2),
                "supplier_reliability_index": round(avg_reliability, 2),
                "reliable_suppliers": reliable_suppliers,
                "total_suppliers": len(suppliers),
                "high_priority_alerts": high_priority_alerts
            },
            "promotion_summary": {
                "total_promotions": promo_count,
                "approved_promotions": len(approved_promos),
                "rejected_promotions": promo_count - len(approved_promos),
                "total_incremental_margin": round(total_incremental_margin, 2)
            },
            "supply_chain_summary": {
                "stockout_incidents": stockout_count,
                "stockout_rate": round(stockout_rate, 2),
                "total_alerts": len(alerts),
                "high_priority_alerts": high_priority_alerts
            },
            "recent_alerts": alerts[:5]  # Top 5 alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating dashboard summary: {str(e)}")


@router.get("/sales-trend")
async def get_sales_trend(days: int = 30) -> Dict:
    """Get sales trend over time"""
    try:
        data_loader = get_data_loader()
        df = data_loader.load_data()
        
        # Filter recent data
        df['date'] = pd.to_datetime(df['date'])
        recent_date = df['date'].max() - pd.Timedelta(days=days)
        df_recent = df[df['date'] >= recent_date].copy()
        
        # Aggregate by date
        daily_sales = df_recent.groupby('date').agg({
            'net_sales': 'sum',
            'units_sold': 'sum',
            'promo_flag': 'sum'
        }).reset_index()
        
        return {
            "dates": [str(d) for d in daily_sales['date']],
            "sales": [float(s) for s in daily_sales['net_sales']],
            "units": [int(u) for u in daily_sales['units_sold']],
            "promotions": [int(p) for p in daily_sales['promo_flag']]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating sales trend: {str(e)}")


@router.get("/promotion-effectiveness")
async def get_promotion_effectiveness() -> Dict:
    """Get promotion effectiveness metrics"""
    try:
        data_loader = get_data_loader()
        df = data_loader.load_data()
        
        promo_analytics = PromotionAnalytics(df)
        promo_recs = promo_analytics.get_promotion_recommendations()
        
        # Aggregate by channel
        channel_stats = {}
        for rec in promo_recs:
            channel = rec['channel']
            if channel not in channel_stats:
                channel_stats[channel] = {
                    'total': 0,
                    'approved': 0,
                    'total_lift': 0,
                    'total_margin': 0
                }
            
            channel_stats[channel]['total'] += 1
            if rec['promo_decision'] == 'APPROVE':
                channel_stats[channel]['approved'] += 1
                channel_stats[channel]['total_lift'] += rec['incremental_units']
                channel_stats[channel]['total_margin'] += rec['incremental_margin']
        
        return {
            "by_channel": channel_stats,
            "total_recommendations": len(promo_recs),
            "approval_rate": len([r for r in promo_recs if r['promo_decision'] == 'APPROVE']) / len(promo_recs) * 100 if promo_recs else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating promotion effectiveness: {str(e)}")

