# Model Setup Guide

## Adding Your Joblib Models

Once your teammate provides the joblib model files, follow these steps:

### 1. Create Models Directory

Create a `models` directory in the project root (same level as `backend`):

```bash
mkdir models
```

### 2. Place Model Files

Place your joblib model files in the `models` directory with these naming conventions:

- **Baseline demand model**: `baseline_model.joblib` or `baseline.joblib`
- **Promotion effect model**: `promo_model.joblib` or `promo.joblib`
- **Stockout risk model**: `stockout_model.joblib` or `stockout.joblib`
- **Lead time model**: `lead_time_model.joblib` or `lead_time.joblib`

### 3. Model Requirements

Your models should:
- Be saved using `joblib.dump(model, 'model_name.joblib')`
- Have `feature_names_in_` attribute (if using scikit-learn) for automatic feature matching
- Accept the same features as defined in the analytics service

### 4. Feature Names

The system will automatically try to match features. If your model has `feature_names_in_`, it will use those. Otherwise, it will try common feature names.

**Common features expected:**
- Baseline model: `year`, `month`, `weekday`, `is_weekend`, `list_price`, `temperature`, `rain_mm`, plus encoded categoricals
- Promotion model: All baseline features plus `promo_flag`, `discount_pct`, `effective_price`, `baseline_units_pred`
- Stockout model: `inventory_coverage_days`, `avg_daily_demand_7d`, `demand_std_7d`, `supplier_cv`, `lead_time_risk`, etc.
- Lead time model: `supplier_lt_mean`, `supplier_lt_std`, `supplier_cv`, `lead_time_lag_1`, `month`, `weekday`, etc.

### 5. Verify Models Load

When you start the backend, check the console output. You should see:

```
Loading models from /path/to/models...
Successfully loaded model: baseline from /path/to/models/baseline_model.joblib
Successfully loaded model: promo from /path/to/models/promo_model.joblib
```

If models fail to load, the system will automatically fall back to training models on-the-fly using the data.

### 6. Testing

Test the API endpoints to verify models are working:

```bash
curl http://localhost:8000/api/dashboard/summary
curl http://localhost:8000/api/promotions/list
```

### 7. Custom Model Paths

If your models are in a different location, you can specify paths in `backend/app/main.py`:

```python
model_config = {
    'baseline': '/path/to/your/baseline_model.joblib',
    'promo': '/path/to/your/promo_model.joblib',
    'stockout': '/path/to/your/stockout_model.joblib',
    'lead_time': '/path/to/your/lead_time_model.joblib',
}
model_loader.load_all_models(model_config)
```

## Troubleshooting

- **Model not found**: Check file paths and naming conventions
- **Feature mismatch**: Ensure your model was trained with compatible features
- **Prediction errors**: Check that all required features are present in the data
- **Performance issues**: Models are cached after first load, but first prediction may be slow

