import json
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path

class DataLoader:
    """Load and manage FMCG analytics data"""
    
    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or os.path.join(
            Path(__file__).parent.parent, "data", "mock_data.json"
        )
        self._data_cache: Optional[pd.DataFrame] = None
    
    def load_data(self) -> pd.DataFrame:
        """Load data from file or generate if not exists"""
        if self._data_cache is not None:
            return self._data_cache
        
        if os.path.exists(self.data_path):
            with open(self.data_path, 'r') as f:
                data = json.load(f)
            df = pd.DataFrame(data)
        else:
            # Generate mock data if file doesn't exist
            df = self._generate_mock_data()
            self._save_mock_data(df)
        
        # Convert date strings to datetime
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
        
        self._data_cache = df
        return df
    
    def _generate_mock_data(self) -> pd.DataFrame:
        """Generate realistic mock FMCG data"""
        np.random.seed(42)
        
        # Date range: 3 years of daily data
        start_date = datetime(2021, 1, 1)
        end_date = datetime(2023, 12, 31)
        dates = pd.date_range(start_date, end_date, freq='D')
        
        # Configuration
        n_stores = 50
        n_skus = 200
        n_suppliers = 30
        countries = ['USA', 'UK', 'Germany', 'France', 'Spain']
        cities = ['New York', 'London', 'Berlin', 'Paris', 'Madrid', 
                  'Chicago', 'Manchester', 'Munich', 'Lyon', 'Barcelona']
        channels = ['MT', 'EC', 'GT', 'HM']
        categories = ['Beverages', 'Snacks', 'Dairy', 'Frozen', 'Personal Care']
        brands = ['BrandA', 'BrandB', 'BrandC', 'BrandD', 'BrandE']
        
        records = []
        
        for date in dates[:365]:  # Generate 1 year of data for performance
            for store_idx in range(n_stores):
                country = np.random.choice(countries)
                city = np.random.choice(cities)
                channel = np.random.choice(channels)
                
                # Select subset of SKUs per store
                sku_indices = np.random.choice(n_skus, size=min(20, n_skus), replace=False)
                
                for sku_idx in sku_indices:
                    # Base demand
                    base_demand = np.random.lognormal(3, 1)
                    
                    # Seasonal adjustment
                    month = date.month
                    seasonal_factor = 1 + 0.2 * np.sin(2 * np.pi * month / 12)
                    
                    # Weekend effect
                    is_weekend = date.weekday() >= 5
                    weekend_factor = 1.3 if is_weekend else 1.0
                    
                    # Promotion
                    promo_flag = np.random.choice([0, 1], p=[0.85, 0.15])
                    discount_pct = np.random.uniform(0.1, 0.4) if promo_flag else 0.0
                    
                    # Price
                    list_price = np.random.uniform(5, 50)
                    effective_price = list_price * (1 - discount_pct)
                    
                    # Demand with promotion effect
                    if promo_flag:
                        promo_lift = 1 + discount_pct * 2  # Elasticity effect
                        units_sold = base_demand * seasonal_factor * weekend_factor * promo_lift
                    else:
                        units_sold = base_demand * seasonal_factor * weekend_factor
                    
                    units_sold = max(0, int(units_sold + np.random.normal(0, units_sold * 0.1)))
                    
                    # Inventory
                    supplier_id = np.random.randint(1, n_suppliers + 1)
                    avg_lead_time = np.random.uniform(3, 10)
                    lead_time_std = np.random.uniform(0.5, 2)
                    lead_time_days = max(1, int(np.random.normal(avg_lead_time, lead_time_std)))
                    
                    stock_on_hand = np.random.uniform(0, units_sold * 10)
                    stock_out_flag = 1 if stock_on_hand < units_sold * 0.5 else 0
                    
                    # Financial
                    purchase_cost = list_price * 0.6
                    margin_pct = np.random.uniform(0.2, 0.4)
                    gross_sales = units_sold * list_price
                    net_sales = units_sold * effective_price
                    
                    record = {
                        'date': date.strftime('%Y-%m-%d'),
                        'year': date.year,
                        'month': date.month,
                        'day': date.day,
                        'weekofyear': date.isocalendar()[1],
                        'weekday': date.weekday(),
                        'is_weekend': 1 if is_weekend else 0,
                        'is_holiday': 0,  # Simplified
                        'temperature': np.random.uniform(10, 30),
                        'rain_mm': np.random.exponential(2),
                        'store_id': f'STORE_{store_idx:03d}',
                        'country': country,
                        'city': city,
                        'channel': channel,
                        'latitude': np.random.uniform(40, 50),
                        'longitude': np.random.uniform(-10, 10),
                        'sku_id': f'SKU_{sku_idx:03d}',
                        'sku_name': f'Product {sku_idx}',
                        'category': np.random.choice(categories),
                        'subcategory': f'SubCat_{np.random.randint(1, 5)}',
                        'brand': np.random.choice(brands),
                        'units_sold': units_sold,
                        'list_price': round(list_price, 2),
                        'discount_pct': round(discount_pct, 3),
                        'promo_flag': promo_flag,
                        'gross_sales': round(gross_sales, 2),
                        'net_sales': round(net_sales, 2),
                        'stock_on_hand': round(stock_on_hand, 2),
                        'stock_out_flag': stock_out_flag,
                        'lead_time_days': lead_time_days,
                        'supplier_id': f'SUPPLIER_{supplier_id:02d}',
                        'purchase_cost': round(purchase_cost, 2),
                        'margin_pct': round(margin_pct, 3),
                    }
                    
                    records.append(record)
        
        return pd.DataFrame(records)
    
    def _save_mock_data(self, df: pd.DataFrame):
        """Save generated data to JSON file"""
        os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
        
        # Convert to dict for JSON serialization
        data_dict = df.to_dict('records')
        
        with open(self.data_path, 'w') as f:
            json.dump(data_dict, f, default=str)
    
    def get_promotion_data(self) -> pd.DataFrame:
        """Get data filtered for promotion analysis"""
        df = self.load_data()
        return df.copy()
    
    def get_supply_chain_data(self) -> pd.DataFrame:
        """Get data filtered for supply chain analysis"""
        df = self.load_data()
        return df.copy()
    
    def clear_cache(self):
        """Clear data cache"""
        self._data_cache = None

