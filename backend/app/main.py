from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import dashboard, promotions, supply_chain

app = FastAPI(
    title="FMCG Analytics API",
    description="API for Promotion Effectiveness and Supply Chain Risk Analytics",
    version="1.0.0"
)

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


@app.get("/")
async def root():
    return {"message": "FMCG Analytics API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

