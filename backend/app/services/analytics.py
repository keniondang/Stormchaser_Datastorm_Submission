import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, roc_auc_score
import warnings
warnings.filterwarnings('ignore')

class PromotionAnalytics:
    """Analytics for promotion effectiveness"""
    
    def __init__(self, data: pd.DataFrame):
        self.data = data.copy()
        self._baseline_model = None
        self._promo_model = None
        self._elasticity_cache = {}
    
    def calculate_baseline_demand(self) -> pd.DataFrame:
        """Calculate baseline demand predictions"""
        df = self.data.copy()
        
        # Filter baseline data (no promo, no stockout)
        baseline_df = df[
            (df['promo_flag'] == 0) & 
            (df['stock_out_flag'] == 0)
        ].copy()
        
        if len(baseline_df) == 0:
            # Fallback: use simple average if no baseline data
            df['baseline_units_pred'] = df.groupby(['sku_id', 'store_id'])['units_sold'].transform('mean')
            return df
        
        # Features for baseline model
        baseline_features = [
            'year', 'month', 'weekofyear', 'weekday', 'is_weekend', 'is_holiday',
            'temperature', 'rain_mm',
            'list_price'
        ]
        
        # Encode categoricals
        categorical_cols = ['store_id', 'city', 'country', 'channel', 
                          'sku_id', 'category', 'subcategory', 'brand']
        
        for col in categorical_cols:
            if col in baseline_df.columns:
                baseline_df[col + '_encoded'] = pd.Categorical(baseline_df[col]).codes
        
        # Add encoded features
        encoded_features = [col + '_encoded' for col in categorical_cols if col in baseline_df.columns]
        all_features = baseline_features + encoded_features
        
        # Prepare training data
        X = baseline_df[all_features].fillna(0)
        y = baseline_df['units_sold']
        
        if len(X) > 100:
            # Train model
            X_train, X_val, y_train, y_val = train_test_split(
                X, y, test_size=0.2, shuffle=False, random_state=42
            )
            
            self._baseline_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            self._baseline_model.fit(X_train, y_train)
            
            # Predict for all data
            df_encoded = df.copy()
            for col in categorical_cols:
                if col in df_encoded.columns:
                    df_encoded[col + '_encoded'] = pd.Categorical(
                        df_encoded[col], 
                        categories=baseline_df[col].cat.categories if hasattr(baseline_df[col], 'cat') 
                        else pd.Categorical(baseline_df[col]).categories
                    ).codes
            
            X_all = df_encoded[all_features].fillna(0)
            df['baseline_units_pred'] = self._baseline_model.predict(X_all)
        else:
            # Simple fallback
            df['baseline_units_pred'] = df.groupby(['sku_id', 'store_id'])['units_sold'].transform('mean')
        
        df['baseline_units_pred'] = df['baseline_units_pred'].clip(lower=0)
        return df
    
    def calculate_promotion_effect(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate promotion effect and incremental lift"""
        df = df.copy()
        
        # Calculate effective price
        df['effective_price'] = df['list_price'] * (1 - df['discount_pct'])
        
        # Features for promotion model
        promo_features = [
            'promo_flag', 'discount_pct', 'effective_price',
            'baseline_units_pred',
            'year', 'month', 'weekofyear', 'weekday', 'is_weekend', 'is_holiday',
            'temperature', 'rain_mm',
            'stock_on_hand', 'lead_time_days'
        ]
        
        categorical_cols = ['store_id', 'city', 'country', 'channel', 
                          'sku_id', 'category', 'subcategory', 'brand']
        
        df_encoded = df.copy()
        for col in categorical_cols:
            if col in df_encoded.columns:
                df_encoded[col + '_encoded'] = pd.Categorical(df_encoded[col]).codes
        
        encoded_features = [col + '_encoded' for col in categorical_cols if col in df_encoded.columns]
        all_features = promo_features + encoded_features
        
        # Prepare training data
        X = df_encoded[all_features].fillna(0)
        y = df_encoded['units_sold']
        
        if len(X) > 100:
            X_train, X_val, y_train, y_val = train_test_split(
                X, y, test_size=0.2, shuffle=False, random_state=42
            )
            
            self._promo_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            self._promo_model.fit(X_train, y_train)
            
            df['predicted_units'] = self._promo_model.predict(X)
        else:
            df['predicted_units'] = df['units_sold']
        
        df['predicted_units'] = df['predicted_units'].clip(lower=0)
        df['lift'] = df['predicted_units'] - df['baseline_units_pred']
        df['incremental_units'] = df['lift'].clip(lower=0)
        
        return df
    
    def calculate_price_elasticity(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate price elasticity by SKU-channel"""
        df = df.copy()
        
        # Calculate elasticity for promo periods only
        promo_df = df[df['promo_flag'] == 1].copy()
        
        if len(promo_df) == 0:
            df['price_elasticity'] = np.nan
            return df
        
        elasticity_results = []
        
        for (sku_id, channel), group in promo_df.groupby(['sku_id', 'channel']):
            if len(group) < 3 or group['effective_price'].nunique() < 2:
                continue
            
            try:
                # Log-log regression
                X = np.log(group['effective_price'] + 1)
                y = np.log(group['units_sold'] + 1)
                
                if len(X) > 2 and np.std(X) > 0:
                    # Simple linear regression
                    coeff = np.corrcoef(X, y)[0, 1] * (np.std(y) / np.std(X))
                    elasticity_results.append({
                        'sku_id': sku_id,
                        'channel': channel,
                        'price_elasticity': coeff
                    })
            except:
                continue
        
        if elasticity_results:
            elasticity_df = pd.DataFrame(elasticity_results)
            df = df.merge(elasticity_df, on=['sku_id', 'channel'], how='left')
        else:
            df['price_elasticity'] = np.nan
        
        return df
    
    def calculate_margins(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate incremental margins"""
        df = df.copy()
        df['margin_per_unit'] = df['list_price'] * df['margin_pct']
        df['incremental_margin'] = df['incremental_units'] * df['margin_per_unit']
        return df
    
    def make_promotion_decisions(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply promotion decision rules"""
        df = df.copy()
        
        # High response channels (example)
        high_response_channels = ['MT', 'EC']
        
        # Decision rules
        df['stock_feasible'] = df['stock_on_hand'] >= df['incremental_units']
        
        df['promo_decision'] = df.apply(
            lambda row: 'APPROVE' if (
                row['promo_flag'] == 1 and
                row['incremental_margin'] > 0 and
                (pd.isna(row['price_elasticity']) or row['price_elasticity'] > 1) and
                row['stock_feasible'] and
                row['channel'] in high_response_channels
            ) else 'REJECT',
            axis=1
        )
        
        return df
    
    def get_promotion_recommendations(self) -> List[Dict]:
        """Get all promotion recommendations"""
        df = self.data.copy()
        
        # Run analytics pipeline
        df = self.calculate_baseline_demand()
        df = self.calculate_promotion_effect(df)
        df = self.calculate_price_elasticity(df)
        df = self.calculate_margins(df)
        df = self.make_promotion_decisions(df)
        
        # Filter to promotions only
        promo_df = df[df['promo_flag'] == 1].copy()
        
        recommendations = []
        for idx, row in promo_df.iterrows():
            rec = {
                'id': f"PROMO_{idx}",
                'date': str(row['date']),
                'sku_id': row['sku_id'],
                'sku_name': row.get('sku_name', row['sku_id']),
                'channel': row['channel'],
                'country': row['country'],
                'city': row['city'],
                'baseline_units_pred': float(row['baseline_units_pred']),
                'predicted_units': float(row['predicted_units']),
                'incremental_units': float(row['incremental_units']),
                'price_elasticity': float(row['price_elasticity']) if not pd.isna(row['price_elasticity']) else None,
                'incremental_margin': float(row['incremental_margin']),
                'promo_decision': row['promo_decision'],
                'discount_pct': float(row['discount_pct']),
                'list_price': float(row['list_price']),
                'effective_price': float(row.get('effective_price', row['list_price'])),
                'stock_on_hand': float(row['stock_on_hand']),
                'stock_feasible': bool(row['stock_feasible'])
            }
            recommendations.append(rec)
        
        return recommendations


class SupplyChainAnalytics:
    """Analytics for supply chain risk"""
    
    def __init__(self, data: pd.DataFrame):
        self.data = data.copy()
        self._lead_time_model = None
        self._stockout_model = None
    
    def calculate_demand_features(self) -> pd.DataFrame:
        """Calculate demand stability features"""
        df = self.data.copy()
        
        # Rolling demand statistics
        df['avg_daily_demand_7d'] = (
            df.groupby(['sku_id', 'store_id'])['units_sold']
            .transform(lambda x: x.rolling(7, min_periods=3).mean())
        )
        
        df['demand_std_7d'] = (
            df.groupby(['sku_id', 'store_id'])['units_sold']
            .transform(lambda x: x.rolling(7, min_periods=3).std())
        )
        
        df['inventory_coverage_days'] = (
            df['stock_on_hand'] / (df['avg_daily_demand_7d'] + 1e-5)
        )
        
        return df
    
    def calculate_supplier_features(self) -> pd.DataFrame:
        """Calculate supplier reliability features"""
        df = self.data.copy()
        
        # Supplier statistics
        df['supplier_lt_mean'] = (
            df.groupby('supplier_id')['lead_time_days']
            .transform('mean')
        )
        
        df['supplier_lt_std'] = (
            df.groupby('supplier_id')['lead_time_days']
            .transform('std')
        )
        
        df['supplier_cv'] = (
            df['supplier_lt_std'] / (df['supplier_lt_mean'] + 1e-5)
        )
        
        df['lead_time_lag_1'] = (
            df.groupby('supplier_id')['lead_time_days']
            .shift(1)
        )
        
        return df
    
    def calculate_lead_time_risk(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate lead time risk scores"""
        df = df.copy()
        
        # Features for lead time prediction
        lt_features = [
            'supplier_lt_mean', 'supplier_lt_std', 'supplier_cv',
            'lead_time_lag_1', 'month', 'weekday', 'temperature', 'rain_mm'
        ]
        
        categorical_cols = ['supplier_id', 'country', 'city']
        df_encoded = df.copy()
        
        for col in categorical_cols:
            if col in df_encoded.columns:
                df_encoded[col + '_encoded'] = pd.Categorical(df_encoded[col]).codes
        
        encoded_features = [col + '_encoded' for col in categorical_cols if col in df_encoded.columns]
        all_features = lt_features + encoded_features
        
        # Prepare data
        train_df = df_encoded.dropna(subset=all_features + ['lead_time_days'])
        
        if len(train_df) > 100:
            X = train_df[all_features].fillna(0)
            y = train_df['lead_time_days']
            
            X_train, X_val, y_train, y_val = train_test_split(
                X, y, test_size=0.2, shuffle=False, random_state=42
            )
            
            self._lead_time_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            self._lead_time_model.fit(X_train, y_train)
            
            # Predict for all
            X_all = df_encoded[all_features].fillna(0)
            df['predicted_lead_time'] = self._lead_time_model.predict(X_all)
        else:
            df['predicted_lead_time'] = df['supplier_lt_mean']
        
        # Calculate risk score
        df['lead_time_risk'] = df['predicted_lead_time'] * df['supplier_cv']
        
        return df
    
    def calculate_stockout_risk(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate stockout risk probabilities"""
        df = df.copy()
        
        # Features for stockout prediction
        so_features = [
            'inventory_coverage_days',
            'avg_daily_demand_7d',
            'demand_std_7d',
            'supplier_cv',
            'lead_time_risk',
            'lead_time_days',
            'month',
            'weekday',
            'is_holiday'
        ]
        
        # Prepare data
        train_df = df.dropna(subset=so_features + ['stock_out_flag'])
        
        if len(train_df) > 100:
            X = train_df[so_features].fillna(0)
            y = train_df['stock_out_flag']
            
            X_train, X_val, y_train, y_val = train_test_split(
                X, y, test_size=0.2, shuffle=False, random_state=42
            )
            
            self._stockout_model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                class_weight='balanced',
                random_state=42,
                n_jobs=-1
            )
            self._stockout_model.fit(X_train, y_train)
            
            # Predict probabilities for all
            X_all = df[so_features].fillna(0)
            df['stockout_risk_score'] = self._stockout_model.predict_proba(X_all)[:, 1]
        else:
            # Simple heuristic
            df['stockout_risk_score'] = np.where(
                df['inventory_coverage_days'] < 3,
                0.7,
                np.where(df['inventory_coverage_days'] < 5, 0.4, 0.1)
            )
        
        return df
    
    def get_stockout_alerts(self, threshold: float = 0.7) -> List[Dict]:
        """Get high-priority stockout alerts"""
        df = self.data.copy()
        
        # Run analytics pipeline
        df = self.calculate_demand_features()
        df = self.calculate_supplier_features()
        df = self.calculate_lead_time_risk(df)
        df = self.calculate_stockout_risk(df)
        
        # Filter high-risk alerts
        alerts_df = df[
            (df['stockout_risk_score'] > threshold) &
            (df['inventory_coverage_days'] < 3)
        ].copy()
        
        alerts = []
        for idx, row in alerts_df.iterrows():
            priority = 'HIGH' if row['stockout_risk_score'] > 0.8 else 'MEDIUM'
            
            alert = {
                'id': f"ALERT_{idx}",
                'date': str(row['date']),
                'sku_id': row['sku_id'],
                'sku_name': row.get('sku_name', row['sku_id']),
                'supplier_id': row['supplier_id'],
                'store_id': row['store_id'],
                'country': row['country'],
                'city': row['city'],
                'stockout_risk_score': float(row['stockout_risk_score']),
                'inventory_coverage_days': float(row['inventory_coverage_days']),
                'lead_time_risk': float(row['lead_time_risk']),
                'predicted_lead_time': float(row.get('predicted_lead_time', row['lead_time_days'])),
                'current_stock': float(row['stock_on_hand']),
                'priority': priority
            }
            alerts.append(alert)
        
        return sorted(alerts, key=lambda x: x['stockout_risk_score'], reverse=True)
    
    def get_supplier_reliability(self) -> List[Dict]:
        """Get supplier reliability rankings"""
        df = self.data.copy()
        
        # Calculate features
        df = self.calculate_supplier_features()
        df = self.calculate_lead_time_risk(df)
        df = self.calculate_stockout_risk(df)
        
        # Aggregate by supplier
        supplier_stats = df.groupby('supplier_id').agg({
            'lead_time_days': ['mean', 'std', 'count'],
            'stock_out_flag': 'mean',
            'stockout_risk_score': 'mean',
            'supplier_lt_mean': 'first',
            'supplier_lt_std': 'first',
            'supplier_cv': 'first'
        }).reset_index()
        
        supplier_stats.columns = [
            'supplier_id', 'avg_lead_time', 'lead_time_std', 'total_orders',
            'stockout_rate', 'avg_stockout_risk', 'lt_mean', 'lt_std', 'cv'
        ]
        
        # Calculate reliability index (lower is better)
        supplier_stats['reliability_index'] = (
            supplier_stats['avg_lead_time'] * 0.4 +
            supplier_stats['lead_time_std'] * 0.3 +
            supplier_stats['stockout_rate'] * 100 * 0.3
        )
        
        # Classify suppliers
        def classify_supplier(row):
            if row['lt_mean'] < 5 and row['lt_std'] < 2:
                return 'Reliable'
            elif row['lt_mean'] >= 5 and row['lt_std'] < 2:
                return 'Slow but stable'
            elif row['lt_mean'] < 5 and row['lt_std'] >= 2:
                return 'Unreliable'
            else:
                return 'High-risk'
        
        supplier_stats['risk_class'] = supplier_stats.apply(classify_supplier, axis=1)
        
        suppliers = []
        for _, row in supplier_stats.iterrows():
            supplier = {
                'supplier_id': row['supplier_id'],
                'avg_lead_time': float(row['avg_lead_time']),
                'lead_time_std': float(row['lead_time_std']),
                'coefficient_of_variation': float(row['cv']),
                'reliability_index': float(row['reliability_index']),
                'risk_class': row['risk_class'],
                'stockout_rate': float(row['stockout_rate']),
                'avg_stockout_risk': float(row['avg_stockout_risk']),
                'total_orders': int(row['total_orders'])
            }
            suppliers.append(supplier)
        
        return sorted(suppliers, key=lambda x: x['reliability_index'])

