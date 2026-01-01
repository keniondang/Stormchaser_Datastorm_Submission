# 📦 FMCG Demand & Supply Chain Analytics  
**Promotion Effectiveness & Supply Chain Risk Modeling**

---

## 📌 Project Summary

This repository presents a **business-driven analytics solution** for two critical FMCG challenges:

1. **Blind Promotion Trap** – Promotions executed without understanding true demand impact  
2. **Supply Chain Disconnect** – Stockouts caused by supplier lead time instability despite accurate demand forecasts  

The project demonstrates how **advanced analytics, causal thinking, and risk-based modeling** can be used to improve profitability, service levels, and supply chain stability.

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
├── docs/
│ ├── problem_statement_01_blind_promotion.md
│ ├── data_preprocessing_guidelines.md
│ ├── eda_guidelines.md
│ ├── feature_engineering_plan.md
│ ├── modeling_plan.md
│ │
│ ├── problem_statement_02_supply_chain_disconnect.md
│ ├── eda_supply_chain_disconnect.md
│ ├── feature_engineering_plan_supply_chain_disconnect.md
│ └── modeling_plan_supply_chain_disconnect.md
│
├── notebooks/
│ ├── 01_promotion_effect_model.ipynb
│ └── 02_supply_chain_disconnect.ipynb
│
├── backend/                    # Python FastAPI Backend
│ ├── app/
│ │   ├── main.py
│ │   ├── models/
│ │   ├── routers/
│ │   ├── services/
│ │   └── data/
│ ├── requirements.txt
│ └── README.md
│
├── mobile/                     # React Native Mobile App
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
├── requirements.txt
└── README.md
```


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

## 🧠 Analytics & Modeling Philosophy

- Business-first modeling (not metric-driven)
- Separation of demand and supply uncertainty
- Risk-based decision making
- Time-aware validation (no leakage)
- Interpretability for operations teams

---

## 📈 Business Impact

This solution enables organizations to:

- Reduce wasteful discounting
- Increase promotional ROI
- Prevent stockouts before they happen
- Stabilize supply chain operations
- Improve service levels on high-value SKUs
- Align Demand Planning and S&OP processes

## 📱 Mobile Application

The React Native mobile app provides:

- **Real-time Dashboard**: KPIs, sales trends, and alerts
- **Promotion Management**: View, filter, and analyze promotion recommendations
- **Supply Chain Monitoring**: Stockout alerts and supplier reliability tracking
- **Decision Support**: Clear approve/reject recommendations with detailed analytics

## 🔌 Backend API

The Python FastAPI backend provides:

- **RESTful API**: Comprehensive endpoints for all analytics
- **Analytics Engine**: Promotion effectiveness and supply chain risk calculations
- **Mock Data Generation**: Automatic sample data generation for testing
- **OpenAPI Documentation**: Interactive API documentation at `/docs`

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
│  Analytics      │  ML Models & Calculations
│   Services      │
└─────────────────┘
```

---

## ⚙️ Setup & Installation

### Analytics Notebooks

Clone the repository and install dependencies:

```bash
git clone <https://github.com/keniondang/Stormchaser_Datastorm_Submission>
cd <Stormchaser_Datastorm_Submission>
pip install -r requirements.txt
```

### Backend API

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

See [backend/README.md](backend/README.md) for detailed API documentation.

### Mobile App

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npm start
```

4. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

**Important:** Update the API base URL in `mobile/src/services/api.ts` to match your backend server address.

See [mobile/README.md](mobile/README.md) for detailed mobile app documentation.

---

## 🚀 Quick Start (Full Stack)

1. **Start Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

2. **Start Mobile App (in a new terminal):**
```bash
cd mobile
npm install
npm start
```

3. **Access:**
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Mobile App: Use Expo Go or simulator
