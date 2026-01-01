# FMCG Analytics Backend API

Python FastAPI backend for FMCG promotion effectiveness and supply chain risk analytics.

## Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

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

## Data

Mock data is automatically generated on first run and saved to `app/data/mock_data.json`.

