from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import dashboard, promotions, supply_chain
from app.routers import admin
from app.services.model_loader import ModelLoader
import os

app = FastAPI(
    title="FMCG Analytics API",
    description="API for Promotion Effectiveness and Supply Chain Risk Analytics",
    version="1.0.0"
)

# Initialize model loader on startup
model_loader = ModelLoader()
app.state.model_loader = model_loader

# Try to load models if they exist
@app.on_event("startup")
async def load_models():
    """Load ML models on application startup"""
    models_dir = os.path.join(os.path.dirname(__file__).replace('app', ''), 'models')
    if os.path.exists(models_dir):
        print(f"Loading models from {models_dir}...")
        model_loader.models_dir = models_dir
        model_loader.load_all_models()
    else:
        print(f"Models directory not found at {models_dir}. Models will be trained on-the-fly.")

# Configure CORS for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(promotions.router, prefix="/api/promotions", tags=["promotions"])
app.include_router(supply_chain.router, prefix="/api/supply-chain", tags=["supply-chain"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/")
async def root():
    return {"message": "FMCG Analytics API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

