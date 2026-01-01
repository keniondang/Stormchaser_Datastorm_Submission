from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict
import numpy as np
from app.services.data_loader import DataLoader
from app.services.analytics import SupplyChainAnalytics
from app.models.supply_chain import StockoutAlert, SupplierReliability, SupplierDetail, StockoutRiskPrediction

router = APIRouter()

# Initialize data loader
_data_loader = None

def get_data_loader():
    global _data_loader
    if _data_loader is None:
        _data_loader = DataLoader()
    return _data_loader


@router.get("/alerts", response_model=List[StockoutAlert])
async def get_stockout_alerts(
    request: Request,
    priority: Optional[str] = None,
    limit: int = 50
) -> List[Dict]:
    """Get stockout risk alerts"""
    try:
        data_loader = get_data_loader()
        model_loader = get_model_loader(request)
        df = data_loader.load_data()
        
        supply_analytics = SupplyChainAnalytics(df, model_loader)
        alerts = supply_analytics.get_stockout_alerts(threshold=0.6)
        
        # Filter by priority if specified
        if priority:
            alerts = [a for a in alerts if a['priority'] == priority.upper()]
        
        # Limit results
        alerts = alerts[:limit]
        
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")


@router.get("/suppliers", response_model=List[SupplierReliability])
async def get_suppliers(
    request: Request,
    risk_class: Optional[str] = None,
    limit: int = 100
) -> List[Dict]:
    """Get supplier reliability rankings"""
    try:
        data_loader = get_data_loader()
        model_loader = get_model_loader(request)
        df = data_loader.load_data()
        
        supply_analytics = SupplyChainAnalytics(df, model_loader)
        suppliers = supply_analytics.get_supplier_reliability()
        
        # Filter by risk class if specified
        if risk_class:
            suppliers = [s for s in suppliers if s['risk_class'] == risk_class]
        
        # Limit results
        suppliers = suppliers[:limit]
        
        return suppliers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching suppliers: {str(e)}")


@router.get("/supplier/{supplier_id}", response_model=SupplierDetail)
async def get_supplier_detail(request: Request, supplier_id: str) -> Dict:
    """Get detailed supplier analytics"""
    try:
        data_loader = get_data_loader()
        model_loader = get_model_loader(request)
        df = data_loader.load_data()
        
        supply_analytics = SupplyChainAnalytics(df, model_loader)
        suppliers = supply_analytics.get_supplier_reliability()
        
        # Find supplier
        supplier = None
        for s in suppliers:
            if s['supplier_id'] == supplier_id:
                supplier = s
                break
        
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        # Get supplier data
        supplier_df = df[df['supplier_id'] == supplier_id].copy()
        
        # Lead time history (sample)
        lead_time_history = []
        for _, row in supplier_df.head(30).iterrows():
            lead_time_history.append({
                'date': str(row['date']),
                'lead_time_days': float(row['lead_time_days'])
            })
        
        # Stockout incidents
        stockout_incidents = int(supplier_df['stock_out_flag'].sum())
        
        # Performance trend (simplified)
        if len(supplier_df) > 10:
            recent_lt = supplier_df.tail(10)['lead_time_days'].mean()
            earlier_lt = supplier_df.head(10)['lead_time_days'].mean()
            if recent_lt < earlier_lt * 0.9:
                trend = "Improving"
            elif recent_lt > earlier_lt * 1.1:
                trend = "Declining"
            else:
                trend = "Stable"
        else:
            trend = "Stable"
        
        # Recommendations
        recommendations = []
        if supplier['risk_class'] == 'High-risk':
            recommendations.append("Consider finding alternative suppliers")
            recommendations.append("Increase safety stock for this supplier")
        elif supplier['risk_class'] == 'Unreliable':
            recommendations.append("Monitor lead times closely")
            recommendations.append("Implement buffer stock")
        elif supplier['risk_class'] == 'Slow but stable':
            recommendations.append("Plan for longer lead times in inventory management")
        else:
            recommendations.append("Maintain current relationship")
        
        detail = {
            "supplier": supplier,
            "lead_time_history": lead_time_history,
            "stockout_incidents": stockout_incidents,
            "performance_trend": trend,
            "recommendations": recommendations
        }
        
        return detail
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching supplier detail: {str(e)}")


@router.get("/stockout-risk", response_model=List[StockoutRiskPrediction])
async def get_stockout_risk_predictions(
    request: Request,
    threshold: float = 0.5,
    limit: int = 50
) -> List[Dict]:
    """Get stockout risk predictions"""
    try:
        data_loader = get_data_loader()
        model_loader = get_model_loader(request)
        df = data_loader.load_data()
        
        supply_analytics = SupplyChainAnalytics(df, model_loader)
        
        # Calculate features
        df = supply_analytics.calculate_demand_features()
        df = supply_analytics.calculate_supplier_features()
        df = supply_analytics.calculate_lead_time_risk(df)
        df = supply_analytics.calculate_stockout_risk(df)
        
        # Filter high-risk predictions
        risk_df = df[df['stockout_risk_score'] > threshold].copy()
        
        predictions = []
        for idx, row in risk_df.head(limit).iterrows():
            # Determine recommended action
            if row['stockout_risk_score'] > 0.8:
                action = "Expedite replenishment immediately"
            elif row['inventory_coverage_days'] < 2:
                action = "Increase safety stock and reorder"
            else:
                action = "Monitor closely and prepare for reorder"
            
            prediction = {
                'sku_id': row['sku_id'],
                'sku_name': row.get('sku_name', row['sku_id']),
                'supplier_id': row['supplier_id'],
                'store_id': row['store_id'],
                'stockout_probability': float(row['stockout_risk_score']),
                'inventory_coverage_days': float(row['inventory_coverage_days']),
                'lead_time_risk': float(row['lead_time_risk']),
                'demand_stability': float(1 / (row['demand_std_7d'] + 1e-5)) if 'demand_std_7d' in row else 1.0,
                'recommended_action': action
            }
            predictions.append(prediction)
        
        return sorted(predictions, key=lambda x: x['stockout_probability'], reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stockout risk predictions: {str(e)}")


@router.get("/safety-stock/recommendations")
async def get_safety_stock_recommendations(request: Request) -> Dict:
    """Get dynamic safety stock recommendations"""
    try:
        data_loader = get_data_loader()
        model_loader = get_model_loader(request)
        df = data_loader.load_data()
        
        supply_analytics = SupplyChainAnalytics(df, model_loader)
        
        # Calculate features
        df = supply_analytics.calculate_demand_features()
        df = supply_analytics.calculate_supplier_features()
        
        # Calculate safety stock using formula: Z * σ_LT * √D
        Z = 1.65  # 95% service level
        df['dynamic_safety_stock'] = (
            Z * df['supplier_lt_std'] * np.sqrt(df['avg_daily_demand_7d'] + 1e-5)
        )
        
        # Aggregate by SKU-supplier
        safety_stock_recs = df.groupby(['sku_id', 'supplier_id']).agg({
            'dynamic_safety_stock': 'mean',
            'stock_on_hand': 'mean',
            'avg_daily_demand_7d': 'mean',
            'supplier_lt_std': 'mean'
        }).reset_index()
        
        safety_stock_recs['safety_stock_gap'] = (
            safety_stock_recs['dynamic_safety_stock'] - safety_stock_recs['stock_on_hand']
        )
        
        # Get recommendations
        recommendations = []
        for _, row in safety_stock_recs.iterrows():
            if row['safety_stock_gap'] > 0:
                recommendations.append({
                    'sku_id': row['sku_id'],
                    'supplier_id': row['supplier_id'],
                    'current_stock': round(float(row['stock_on_hand']), 2),
                    'recommended_safety_stock': round(float(row['dynamic_safety_stock']), 2),
                    'gap': round(float(row['safety_stock_gap']), 2),
                    'priority': 'HIGH' if row['safety_stock_gap'] > row['avg_daily_demand_7d'] * 5 else 'MEDIUM'
                })
        
        return {
            "recommendations": sorted(recommendations, key=lambda x: x['gap'], reverse=True)[:50],
            "total_skus_analyzed": len(safety_stock_recs),
            "skus_needing_increase": len(recommendations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating safety stock recommendations: {str(e)}")

