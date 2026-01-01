# 📦 FMCG Demand & Supply Chain Analytics  
**Promotion Effectiveness & Supply Chain Risk Modeling**

---

## 📌 Project Summary

This repository presents a **business-driven analytics solution** for two critical FMCG challenges:

1. **Blind Promotion Trap** – Promotions executed without understanding true demand impact  
2. **Supply Chain Disconnect** – Stockouts caused by supplier lead time instability despite accurate demand forecasts  

The project demonstrates how **advanced analytics, causal thinking, and risk-based modeling** can be used to improve profitability, service levels, and supply chain stability.

**Now includes a complete React Native mobile app and Python FastAPI backend!**

---

## 🎯 Business Objectives

- Optimize promotion strategy using **incremental lift and elasticity**
- Prevent margin erosion caused by over-promotion
- Detect supply chain fragility early
- Reduce stockouts through **supplier risk modeling**
- Improve collaboration between demand planning and supply chain teams

---

## 🧩 Problem Statements

### **Problem 01 – Blind Promotion Trap**
Promotions are applied broadly without evaluating:
- Baseline demand
- Incremental sales
- Price sensitivity
- Inventory readiness
- Profitability

This leads to:
- Artificial demand spikes
- Margin destruction
- Forecast distortion
- Unnecessary supply chain stress

📌 **Goal:** Identify when promotions create real value vs. when they waste margin.

---

### **Problem 02 – Supply Chain Disconnect**
Even with stable demand forecasts:
- Lead times are volatile
- Safety stock is underestimated
- Stockouts still occur

📌 **Goal:** Model supplier uncertainty and predict stockout risk proactively.

---

## 📁 Repository Structure
```bash
├── docs/                          # Project documentation
│ ├── problem_statement_01_blind_promotion.md
│ ├── data_preprocessing_guidelines.md
│ ├── eda_guidelines.md
│ ├── feature_engineering_plan.md
│ ├── modeling_plan.md
│ ├── problem_statement_02_supply_chain_disconnect.md
│ ├── eda_supply_chain_disconnect.md
│ ├── feature_engineering_plan_supply_chain_disconnect.md
│ └── modeling_plan_supply_chain_disconnect.md
│
├── notebooks/                     # Analytics notebooks
│ ├── 01_promotion_effect_model.ipynb
│ └── 02_supply_chain_disconnect.ipynb
│
├── backend/                       # Python FastAPI Backend
│ ├── app/
│ │   ├── main.py
│ │   ├── models/
│ │   ├── routers/
│ │   ├── services/
│ │   └── data/
│ ├── requirements.txt
│ ├── README.md
│ └── MODEL_SETUP.md
│
├── mobile/                        # React Native Mobile App
│ ├── src/
│ │   ├── screens/
│ │   ├── components/
│ │   ├── services/
│ │   ├── navigation/
│ │   ├── types/
│ │   └── utils/
│ ├── App.tsx
│ ├── package.json
│ └── README.md
│
├── models/                        # ML Models (add your joblib files here)
│
├── modeling_ready_data.csv       # Your data file (or .zip)
├── requirements.txt
└── README.md
```

---

## ⚙️ Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Place your data file in project root
# modeling_ready_data.csv or modeling_ready_data.csv.zip

# (Optional) Add ML models to models/ directory
# See backend/MODEL_SETUP.md for details

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### 2. Mobile App Setup

```bash
cd mobile
npm install
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Or scan QR code with Expo Go app

**Important:** Update API URL in `mobile/src/services/api.ts` if needed (automatically configured for simulators).

### 3. Add Your Models (Optional)

1. Create `models/` directory in project root
2. Place joblib model files:
   - `baseline_model.joblib` - Baseline demand model
   - `promo_model.joblib` - Promotion effect model
   - `stockout_model.joblib` - Stockout risk model
   - `lead_time_model.joblib` - Lead time prediction model

See `backend/MODEL_SETUP.md` for detailed instructions.

---

## 📱 Mobile Application Features

- **Real-time Dashboard**: KPIs, sales trends, and alerts
- **Promotion Management**: View, filter, and analyze promotion recommendations
- **Supply Chain Monitoring**: Stockout alerts and supplier reliability tracking
- **Decision Support**: Clear approve/reject recommendations with detailed analytics

---

## 🔌 Backend API Features

- **RESTful API**: Comprehensive endpoints for all analytics
- **ML Model Integration**: Automatic loading of joblib models
- **Data Processing**: Automatic CSV loading and preprocessing
- **Fallback Training**: Trains models on-the-fly if pre-trained models not available
- **OpenAPI Documentation**: Interactive API docs at `/docs`

---

## 🏗️ Architecture

```
┌─────────────────┐
│  React Native   │  Mobile App (iOS/Android)
│   Mobile App    │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  Python FastAPI │  Backend API
│    Backend      │
└────────┬────────┘
         │
┌────────▼────────┐
│  ML Models      │  Joblib Models (Optional)
│  + Analytics    │  + On-the-fly Training
└────────┬────────┘
         │
┌────────▼────────┐
│  CSV Data       │  modeling_ready_data.csv
└─────────────────┘
```

---

## 📈 Business Impact

This solution enables organizations to:

- Reduce wasteful discounting
- Increase promotional ROI
- Prevent stockouts before they happen
- Stabilize supply chain operations
- Improve service levels on high-value SKUs
- Align Demand Planning and S&OP processes

---

## 🧠 Analytics & Modeling Philosophy

- Business-first modeling (not metric-driven)
- Separation of demand and supply uncertainty
- Risk-based decision making
- Time-aware validation (no leakage)
- Interpretability for operations teams

---

## 📓 Notebooks Overview

### **01_promotion_effect_model.ipynb**
**Focus:**
- Baseline demand estimation
- Incremental lift calculation
- Price elasticity analysis
- Promotion ROI evaluation

**Outputs:**
- Over-promotion detection
- SKU-level promotion recommendations
- Channel-specific promo effectiveness

---

### **02_supply_chain_disconnect.ipynb**
**Focus:**
- Supplier lead time uncertainty modeling
- Stockout risk prediction
- Dynamic safety stock logic
- Early warning system

**Outputs:**
- Supplier risk rankings
- Stockout probability scores
- Actionable inventory alerts

---

## 🚀 Next Steps

1. **Add Your Data**: Place `modeling_ready_data.csv` in project root
2. **Add Your Models**: Place joblib files in `models/` directory (see `backend/MODEL_SETUP.md`)
3. **Start Backend**: `cd backend && uvicorn app.main:app --reload`
4. **Start Mobile**: `cd mobile && npm start`
5. **Test**: Visit `http://localhost:8000/docs` and test the mobile app

---

## 📚 Documentation

- **Backend API**: See `backend/README.md`
- **Mobile App**: See `mobile/README.md`
- **Model Setup**: See `backend/MODEL_SETUP.md`
- **Troubleshooting**: See `mobile/SETUP.md`

---

## 🎉 Project Status

✅ Complete React Native mobile app  
✅ Complete Python FastAPI backend  
✅ CSV data loading with automatic preprocessing  
✅ ML model integration (joblib support)  
✅ Fallback model training  
✅ Real-time analytics and predictions  
✅ Production-ready codebase  

**Ready for your data and models!**
