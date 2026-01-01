# FMCG Analytics Backend API

Python FastAPI backend for FMCG promotion effectiveness and supply chain risk analytics.

## Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Place your data file:
   - Place `modeling_ready_data.csv` or `modeling_ready_data.csv.zip` in the project root
   - Or the system will generate mock data automatically

3. (Optional) Add ML models:
   - Create a `models` directory in project root
   - Place joblib model files (see `MODEL_SETUP.md` for details)

4. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Data Loading

The system automatically:
- Looks for `modeling_ready_data.csv` or `modeling_ready_data.csv.zip` in project root
- Falls back to mock data generation if CSV not found
- Preprocesses data automatically (date parsing, feature engineering)

## Model Integration

- Models are automatically loaded from `models/` directory on startup
- Supports joblib format models
- Falls back to on-the-fly training if models not found
- See `MODEL_SETUP.md` for detailed model setup instructions

## Endpoints

### Dashboard
- `GET /api/dashboard/summary` - Overall KPIs and metrics
- `GET /api/dashboard/sales-trend?days=30` - Sales trend over time
- `GET /api/dashboard/promotion-effectiveness` - Promotion effectiveness metrics

### Promotions
- `GET /api/promotions/list?status=APPROVE&channel=MT&limit=100` - List promotion recommendations
- `GET /api/promotions/{id}` - Get promotion detail
- `GET /api/promotions/stats/summary` - Promotion statistics

### Supply Chain
- `GET /api/supply-chain/alerts?priority=HIGH&limit=50` - Stockout risk alerts
- `GET /api/supply-chain/suppliers?risk_class=High-risk&limit=100` - Supplier reliability rankings
- `GET /api/supply-chain/supplier/{id}` - Get supplier detail
- `GET /api/supply-chain/stockout-risk?threshold=0.5&limit=50` - Stockout risk predictions
- `GET /api/supply-chain/safety-stock/recommendations` - Safety stock recommendations

## Performance

- Data is cached after first load
- Models are loaded once on startup
- Predictions are optimized for batch processing
- Automatic feature matching for loaded models

## Troubleshooting

- **Data not loading**: Check file path and format
- **Models not found**: System will train models automatically
- **Feature errors**: Check model feature requirements in `MODEL_SETUP.md`
