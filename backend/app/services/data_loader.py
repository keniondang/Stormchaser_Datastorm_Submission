import json
import os
import zipfile
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path

class DataLoader:
    """Load and manage FMCG analytics data"""
    
    def __init__(self, data_path: Optional[str] = None):
        # Try to find the CSV file in the project root
        project_root = Path(__file__).parent.parent.parent

        # source mode can be controlled via env var DATA_SOURCE: 'auto' (default), 'csv', 'mock'
        source_mode = os.getenv("DATA_SOURCE", "auto").lower()
        # explicit path to CSV/ZIP/JSON
        env_data_path = os.getenv('DATA_PATH')

        if data_path is None:
            # If user provided explicit DATA_PATH env var, use it if exists
            if env_data_path:
                candidate = Path(env_data_path)
                if candidate.exists():
                    self.data_path = str(candidate)
                    self.is_zip = str(candidate).endswith('.zip')
                    return
                else:
                    print(f"DATA_PATH is set to {env_data_path} but file was not found")

            # Look for modeling_ready_data.csv or modeling_ready_data.csv.zip
            csv_path = project_root / "modeling_ready_data.csv"
            zip_path = project_root / "modeling_ready_data.csv.zip"

            if source_mode == 'mock':
                # Force mock
                self.data_path = os.path.join(
                    Path(__file__).parent.parent, "data", "mock_data.json"
                )
                self.is_zip = False
            elif source_mode == 'csv':
                # Prefer CSV; if missing fall back to mock (per user request)
                if csv_path.exists():
                    self.data_path = str(csv_path)
                    self.is_zip = False
                elif zip_path.exists():
                    self.data_path = str(zip_path)
                    self.is_zip = True
                else:
                    print("DATA_SOURCE=csv but no CSV/ZIP found in project root — falling back to mock data")
                    self.data_path = os.path.join(
                        Path(__file__).parent.parent, "data", "mock_data.json"
                    )
                    self.is_zip = False
            else:
                # 'auto' behaviour: prefer CSV/ZIP, else try to find any CSV/ZIP in repository, else mock
                if csv_path.exists():
                    self.data_path = str(csv_path)
                    self.is_zip = False
                elif zip_path.exists():
                    self.data_path = str(zip_path)
                    self.is_zip = True
                else:
                    # attempt to find any CSV/ZIP under project root (first match)
                    found_csv = None
                    for p in project_root.rglob('*.csv'):
                        # skip files in .git or __pycache__
                        if '.git' in str(p) or '__pycache__' in str(p):
                            continue
                        found_csv = p
                        break

                    found_zip = None
                    if not found_csv:
                        for p in project_root.rglob('*.zip'):
                            if '.git' in str(p) or '__pycache__' in str(p):
                                continue
                            found_zip = p
                            break

                    if found_csv:
                        print(f"Auto-detected CSV at {found_csv}")
                        self.data_path = str(found_csv)
                        self.is_zip = False
                    elif found_zip:
                        print(f"Auto-detected ZIP at {found_zip}")
                        self.data_path = str(found_zip)
                        self.is_zip = True
                    else:
                        # Fallback to mock data location
                        self.data_path = os.path.join(
                            Path(__file__).parent.parent, "data", "mock_data.json"
                        )
                        self.is_zip = False
        else:
            self.data_path = data_path
            self.is_zip = data_path.endswith('.zip')
        
        self._data_cache: Optional[pd.DataFrame] = None
    
    def load_data(self) -> pd.DataFrame:
        """Load data from CSV, zip, or JSON file"""
        if self._data_cache is not None:
            return self._data_cache
        # CSV-first policy: attempt to read CSV/ZIP/JSON but prefer CSV.
        # If CSV is present but can't be parsed into the expected shape, only then fall back to mock data.
        df = None
        try:
            if self.is_zip:
                # Load from zip file (prefer CSV inside)
                df = self._load_from_zip()
            elif self.data_path.endswith('.csv'):
                # Load from CSV
                df = pd.read_csv(self.data_path, low_memory=False)
            elif self.data_path.endswith('.json'):
                # Load from JSON
                with open(self.data_path, 'r') as f:
                    data = json.load(f)
                df = pd.DataFrame(data)
            else:
                # Unknown extension: try CSV first, then JSON
                if os.path.exists(self.data_path):
                    try:
                        df = pd.read_csv(self.data_path, low_memory=False)
                    except Exception:
                        # Try JSON
                        with open(self.data_path, 'r') as f:
                            data = json.load(f)
                        df = pd.DataFrame(data)
                else:
                    df = None

            # If we loaded something, run preprocessing and validate critical columns
            if df is not None:
                df = self._preprocess_data(df)

                # Validate: require at minimum a date and a units_sold (or equivalent) column
                if 'date' not in df.columns or 'units_sold' not in df.columns:
                    raise ValueError("CSV/JSON loaded but missing critical columns after preprocessing")

        except Exception as e:
            # If anything fails while reading or normalizing CSV/JSON, fall back to mock data.
            print(f"Error loading/validating data from {self.data_path}: {str(e)}")
            print("Falling back to generated mock data...")
            df = self._generate_mock_data()
            # Save mock data to the configured data path so subsequent runs can use it
            try:
                self._save_mock_data(df)
            except Exception:
                # not critical if saving fails
                pass

        self._data_cache = df
        return df
    
    def _load_from_zip(self) -> pd.DataFrame:
        """Load CSV from zip file"""
        with zipfile.ZipFile(self.data_path, 'r') as zip_ref:
            # Get the first CSV file in the zip
            csv_files = [f for f in zip_ref.namelist() if f.endswith('.csv')]
            if not csv_files:
                raise ValueError("No CSV file found in zip archive")
            
            # Read the first CSV file
            with zip_ref.open(csv_files[0]) as f:
                df = pd.read_csv(f, low_memory=False)
        
        return df
    
    def _preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Preprocess and clean the data"""
        df = df.copy()

        # -- Flexible column mapping --
        # Some CSVs may use different column names. Map common alternatives to our canonical names.
        alt_map = {
            'date': ['date', 'Date', 'DATE', 'timestamp', 'ts', 'datetime'],
            'units_sold': ['units_sold', 'units', 'quantity', 'qty', 'sales_units', 'sales_qty'],
            'list_price': ['list_price', 'price', 'unit_price', 'price_per_unit'],
            'discount_pct': ['discount_pct', 'discount', 'discount_rate', 'disc_pct'],
            'promo_flag': ['promo_flag', 'is_promo', 'promotion', 'on_promo'],
            'stock_on_hand': ['stock_on_hand', 'inventory', 'stock', 'on_hand'],
            'stock_out_flag': ['stock_out_flag', 'out_of_stock', 'stockout'],
            'effective_price': ['effective_price', 'price_after_discount', 'net_price']
        }

        # Normalize column names: if an alternative exists, create the canonical column
        for canon, alts in alt_map.items():
            for alt in alts:
                if alt in df.columns and canon not in df.columns:
                    df[canon] = df[alt]
                    break

        # Convert date column if it exists (after mapping)
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'], errors='coerce')
        
        # Ensure date column exists (after mapping/normalization)
        if 'date' not in df.columns or df['date'].isna().all():
            print("Warning: No date column found or all dates invalid. Creating dummy date column.")
            df['date'] = pd.date_range(start='2021-01-01', periods=len(df), freq='D')
        
        # Extract date features if not present
        if 'year' not in df.columns:
            df['year'] = df['date'].dt.year
        if 'month' not in df.columns:
            df['month'] = df['date'].dt.month
        if 'weekday' not in df.columns:
            df['weekday'] = df['date'].dt.weekday
        if 'weekofyear' not in df.columns:
            df['weekofyear'] = df['date'].dt.isocalendar().week
        if 'is_weekend' not in df.columns:
            df['is_weekend'] = (df['weekday'] >= 5).astype(int)
        
        # Ensure numeric columns are numeric
        numeric_columns = ['units_sold', 'list_price', 'discount_pct', 'stock_on_hand', 
                          'lead_time_days', 'margin_pct', 'temperature', 'rain_mm']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Fill missing values for critical columns
        if 'promo_flag' in df.columns:
            df['promo_flag'] = df['promo_flag'].fillna(0).astype(int)
        if 'stock_out_flag' in df.columns:
            df['stock_out_flag'] = df['stock_out_flag'].fillna(0).astype(int)
        if 'discount_pct' in df.columns:
            df['discount_pct'] = df['discount_pct'].fillna(0)
        
        # Calculate effective_price if not present
        if 'effective_price' not in df.columns and 'list_price' in df.columns and 'discount_pct' in df.columns:
            df['effective_price'] = df['list_price'] * (1 - df['discount_pct'])
        # If units_sold missing but we have net_sales and list_price, infer units_sold
        if 'units_sold' not in df.columns or df['units_sold'].isna().all():
            if 'net_sales' in df.columns and 'list_price' in df.columns:
                with np.errstate(divide='ignore', invalid='ignore'):
                    inferred = (pd.to_numeric(df['net_sales'], errors='coerce') / pd.to_numeric(df['list_price'], errors='coerce')).fillna(0)
                    df['units_sold'] = inferred.astype(int)
        
        # Sort by date for time-series operations
        df = df.sort_values('date').reset_index(drop=True)
        
        return df
    
    def clear_cache(self):
        """Clear data cache"""
        self._data_cache = None
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

